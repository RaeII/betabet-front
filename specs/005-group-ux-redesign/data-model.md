# Data Model: Group UX Redesign

**Phase**: 1 — Design
**Date**: 2026-05-24
**Feature**: `005-group-ux-redesign`
**Base**: [`specs/001-betabet-front/data-model.md`](../001-betabet-front/data-model.md)

Este documento registra apenas as **adições / refinamentos** sobre o modelo base.
Todos os tipos vivem em `src/types/` (Constituição II — sem inline em components).

---

## `src/types/group.types.ts` (delta)

```typescript
// ─── Adições ──────────────────────────────────────────────────────────

/** Destinos da sidebar/bottom-nav do grupo. */
export type SidebarDestination =
  | 'home'
  | 'jogos'
  | 'palpites'
  | 'ranking'
  | 'membros'
  | 'configuracoes'   // visível apenas para admins (FR-013)

/** Resposta padrão do endpoint POST /api/groups/:id/leave. */
export interface LeaveGroupResult {
  ok: boolean
}

/** Item descritor para renderização da sidebar/bottom-nav. */
export interface SidebarItem {
  id: SidebarDestination
  label: string                  // ex.: "Home", "Jogos"
  to: string                     // path relativo: "/groups/:groupId" + suffix
  iconName: string               // identificador lucide (resolvido no componente)
  adminOnly: boolean
}
```

`BettingGroup`, `GroupMembership`, `RankingEntry` e `JoinRequest` permanecem
inalterados (já incluem `emoji` introduzido na feature 004).

---

## `src/types/match.types.ts` (delta)

```typescript
// ─── Refinamentos ─────────────────────────────────────────────────────

/**
 * Refinamento: `userBet` agora é populado pelo endpoint
 * GET /api/groups/:groupId/matches (substitui o cast atual `userBet: null`).
 */
export interface MatchWithUserBet extends Match {
  userBet: Bet | null
}

// ─── Adições ──────────────────────────────────────────────────────────

/**
 * Agrupamento de matches por dia local (yyyy-mm-dd).
 * Produzido por groupMatchesByDay() em src/lib/matchday.utils.ts.
 */
export interface MatchdayGroup {
  /** Data local no formato yyyy-mm-dd (chave estável de agrupamento). */
  date: string
  /** Label pré-formatado para o pill da day-strip. Ex.: "Sáb, 14 Jun". */
  label: string
  /** Matches ordenados cronologicamente dentro do dia. */
  matches: MatchWithUserBet[]
  /** true se todos os matches deste dia já terminaram ou estão no passado. */
  isPast: boolean
  /** true se este é o dia local atual (`new Date().toDateString()`). */
  isToday: boolean
}

/**
 * Sumário de progresso de palpites do usuário nas partidas navegáveis.
 * Produzido por useBettingProgress() — selector memoizado.
 */
export interface BettingProgress {
  /** Quantidade de matches do escopo que já têm userBet. */
  betted: number
  /** Total de matches no escopo. */
  total: number
  /** Percentual 0–100, inteiro. */
  pct: number
  /** true quando `betted === total && total > 0`. */
  isComplete: boolean
}

/** Resposta do endpoint GET /api/groups/:groupId/matches. */
export interface GroupMatchesResponse {
  /** Já vem agrupado por dia local pelo servidor, ou agrupado no client se preferir. */
  matches: MatchWithUserBet[]
}
```

---

## `src/types/last-group.types.ts` (novo)

```typescript
/** Resultado da resolução de "último grupo acessado" — usado pelo router. */
export interface LastAccessedGroupResolution {
  /**
   * groupId resolvido ou null se o usuário não tem grupos.
   * Regras (FR-001 → FR-003):
   *   - 0 grupos        → null (callsite redireciona para /onboarding)
   *   - 1 grupo         → groups[0].id (ignora localStorage)
   *   - 2+ grupos       → lastId se ∈ groups, senão groups[0].id
   */
  groupId: string | null

  /** Indica se a resolução foi concluída (deps prontas). */
  isReady: boolean

  /**
   * Motivo da escolha — útil para testes e telemetria.
   *   - 'single'    : usuário tem exatamente 1 grupo
   *   - 'stored'    : localStorage retornou um id válido
   *   - 'fallback'  : storage inválido ou ausente, usado o primeiro grupo
   *   - 'none'      : sem grupos
   */
  reason: 'single' | 'stored' | 'fallback' | 'none'
}
```

---

## React Query keys (delta em `useGroups.ts` e novos)

```typescript
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  detail: (id: string) => [...groupKeys.all, 'detail', id] as const,
  members: (id: string) => [...groupKeys.all, 'members', id] as const,
  requests: (id: string) => [...groupKeys.all, 'requests', id] as const,
  // ─── Adições ───
  matches: (id: string) => [...groupKeys.all, 'matches', id] as const,
}
```

---

## State transitions

### Active group resolution

```
mount → useUserGroups()
  isLoading                      → { groupId: null, isReady: false, reason: 'none' }
  error / groups.length === 0    → { groupId: null, isReady: true,  reason: 'none' }
  groups.length === 1            → { groupId: groups[0].id, isReady: true, reason: 'single' }
  lastId ∈ groups                → { groupId: lastId, isReady: true, reason: 'stored' }
  lastId ∉ groups (ou null)      → { groupId: groups[0].id, isReady: true, reason: 'fallback' }
```

### Leave group flow

```
gear menu "Sair"
  └─ onClick → open LeaveGroupConfirm modal
       ├─ Cancelar → fecha modal, sem mudanças (FR-010)
       └─ Confirmar → mutation: POST /api/groups/:id/leave
             ├─ onSuccess → clearLastAccessedGroup(userId)
             │              → invalidate groupKeys.lists()
             │              → navigate('/', replace) [resolver decide próximo destino]
             └─ onError    → toast de erro; modal permanece aberto para retry
```

### Day-strip selection

```
mount → matches loaded
  matchdays = groupMatchesByDay(matches, { includePast: false })
  selectedIndex = findDefaultMatchday(matchdays)

user clicks DayStripPill[i]
  selectedIndex = i (state local)
  current matchday = matchdays[i]
  matches do dia → renderiza InlineBetCard ou FinishedMatchCard

user opta por ver passado
  expand: matchdays_all = groupMatchesByDay(matches, { includePast: true })
  // estado interno do DayStrip; não persiste entre sessões
```

### Inline bet placement (optimistic update)

```
user types score → InlineBetCard local state
user clicks "Salvar palpite"
  ├─ placeBet.mutate({...})
  ├─ optimistic: setQueryData(groupKeys.matches(groupId), draft => {
  │     match.userBet = { ...placeholder bet }
  │   })
  ├─ BettingProgressBar recomputa via useMemo → +1 betted
  └─ onSuccess: invalidateQueries(groupKeys.matches(groupId))  // confirma com server data
   onError: rollback (restoredQueryData) + toast
```

---

## Validation rules

| Schema | Local | Regras |
|--------|-------|--------|
| (existente) `BetFormSchema` | `src/lib/schemas/index.ts` | `homeScore: 0..20`, `awayScore: 0..20` |
| (existente) `GroupCreateSchema` | `src/lib/schemas/index.ts` | reusado dentro do modal — sem alteração |
| (sem novo) | | Nenhum novo schema necessário; o endpoint `leave` não recebe body |

---

## Componentes consumidores de cada tipo

| Tipo | Componentes |
|------|-------------|
| `MatchdayGroup` | `DayStrip`, `DayStripPill`, `DayMatchList`, `useBettingProgress` |
| `BettingProgress` | `BettingProgressBar` |
| `LastAccessedGroupResolution` | `useLastAccessedGroup`, root resolver route, `useActiveGroup` |
| `SidebarDestination` / `SidebarItem` | `GroupSidebar`, `GroupMobileNav` |
| `LeaveGroupResult` | `useLeaveGroup`, `LeaveGroupConfirm` |
| `MatchWithUserBet` | `InlineBetCard`, `FinishedMatchCard`, `DayMatchList` |
