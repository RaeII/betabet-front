# Implementation Plan: Group UX Redesign

**Branch**: `005-group-ux-redesign` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-group-ux-redesign/spec.md`

## Summary

Redesenho completo do contexto "dentro de um grupo": retomada automática do último grupo
acessado, troca/criação de grupos via modal (reusando o wizard do onboarding), header minimalista
com menu de engrenagem (Detalhes / Sair), sidebar esquerda persistente com Home / Jogos /
Palpites / Ranking / Membros / Configurações (Configurações apenas para admin), home com
day-strip horizontal de matchdays e barra de progresso de palpites, cards de partida modernos
com input de placar inline e exibição do resultado + pontos ganhos após o jogo. Tudo seguindo o
design system Brasil Essencial (`doc/ui.md`) e funcionando em mobile.

O redesign organiza o app em duas zonas: **zona "fora de grupo"** (autenticação, onboarding,
estado sem grupos) sem sidebar/header de grupo; e **zona "dentro de grupo"** (home, jogos,
palpites, ranking, membros, configurações, detalhe de partida) com sidebar persistente em
desktop e bottom-nav reposicionada em mobile, header minimalista do grupo no topo. A persistência
do "último grupo acessado" é feita no `localStorage` (per-device, por user id) com fallback
seguro para o primeiro grupo disponível.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19

**Primary Dependencies**:
- Vite 6 + `@vitejs/plugin-react` (build, dev-proxy)
- Tailwind CSS v4 + `tailwind-merge` + `clsx` (styling — tokens de `src/styles/tokens.css`)
- TanStack Query v5 — `useQuery`, `useMutation`, `useQueryClient` (cache, invalidação)
- React Router DOM v7 — lazy routes, `useNavigate`, `useParams`, `Outlet`, layout routes
- Framer Motion 12 — transições do day-strip, modal e cards
- Radix UI — `@radix-ui/react-dialog` (modal "Grupos" e confirmação de saída),
  `@radix-ui/react-tabs` se necessário
- Zod 3 — validação de schemas
- Lucide React — ícones

**Storage**:
- `localStorage` para chave `betabet:last-group:<userId>` (string `groupId`); leitura/escrita
  encapsuladas em um service dedicado para permitir mock em testes
- TanStack Query continua sendo o cache server-state

**Testing**: Vitest + `@testing-library/react` + `msw`. Comandos:
- `bun run test` — unit + integration headless
- `bun run typecheck` — TypeScript check
- `bun run lint` — ESLint

**Target Platform**:
- Mobile-first PWA web (mesma plataforma do app principal)
- Breakpoints: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px (defaults Tailwind)
- Sidebar persistente a partir de `lg:` (≥1024px); abaixo disso, bottom-nav + drawer
- Suporte tema claro e escuro via `data-theme` no `<html>`

**Performance Goals**:
- `useUserGroups` reaproveita cache existente (sem re-fetch ao trocar de grupo)
- Mudança de dia no day-strip < 100ms (sem re-fetch — paginação por filtro local)
- `usePlaceBet` faz update otimista do card antes da resposta do servidor (FR-023)
- Progresso (`useBettingProgress`) é selector memoizado em cima de `useGroupMatches` —
  sem fetch extra
- Modal "Grupos" pré-carrega a lista (cache existente) e abre em < 100ms

**Constraints**:
- Arquivos MUST NOT exceder 300 linhas (Constituição IV)
- Sem novos pacotes — usar Radix Dialog, Framer Motion, Lucide e Tailwind já presentes
- Tokens exclusivamente de `src/styles/tokens.css` — proibido hard-coded pixels
- Sem gradientes, sem azul como cor principal, verde apenas como cor de ação
  (cf. `doc/ui.md` §5.4)
- Pattern de fundo deve continuar atrás do conteúdo (`z-index: 0` + overlay neutro)
- Sidebar e header minimalista NÃO podem aparecer em rotas fora do contexto de grupo
- A criação de grupo dentro do modal MUST reusar `GroupIdentityStep` e `ScoringConfigStep`
  do `pages/groups/components/` sem duplicar lógica (DRY — Constituição I)
- `localStorage` reads MUST tolerar erro (browser bloqueando, modo privado) — fallback
  silencioso para "primeiro grupo"

**Scale/Scope**:
- ~12 novos componentes UI page-specific + 3 globais
- 1 novo route layout (`GroupShell`) substituindo o conteúdo agregado do `GroupDetailPage`
- 1 novo endpoint backend: `POST /api/groups/:groupId/leave` (sair do grupo)
- 1 ampliação de endpoint: `GET /api/groups/:groupId/matches` retornando matches do grupo
  com `userBet` embutido (evita N+1 do lado do cliente)

## Constitution Check

| Princípio | Gate | Status |
|-----------|------|--------|
| I. DRY & Simplicity | Wizard de criação de grupo no modal reusa `GroupIdentityStep` + `ScoringConfigStep` existentes; `useLastAccessedGroup` é hook único; lógica de "matchday de hoje ou próximo" extraída para `groupMatchesByDay()` em `src/lib/matchday.utils.ts` (registrada em `global-functions.md`); `MatchCard` ganha modo `inline-bet` em vez de duplicar componente | ✅ PASS |
| II. Type Safety | Novos tipos (`SidebarDestination`, `MatchdayGroup`, `BettingProgress`, `LeaveGroupResult`) ficam em `src/types/group.types.ts` e `src/types/match.types.ts`; `BettingGroup.emoji` já existe; nenhum tipo inline em componente | ✅ PASS |
| III. Test-First | Testes definidos para: `useLastAccessedGroup` (resolução + fallback), `groupMatchesByDay` (today / closest upcoming / só passados), `GroupSidebar` (admin vs membro), `GroupsModal` (lista + criação inline), `DayStrip`, `InlineBetCard`, `LeaveGroupConfirm`, `useBettingProgress`. Escritos antes da implementação | ✅ PASS |
| IV. File Organization | Componentes page-specific co-locados em `pages/groups/components/` e `pages/home/components/`; `GroupShell` (layout) em `components/layout/` (reusado por todas as rotas de grupo); `Modal` global em `components/ui/` (Radix wrapper). Nenhum arquivo > 300 linhas — `GroupSidebar` ~120 linhas, `GroupsModal` ~180 linhas (split em `GroupsList` e `GroupCreateInline` se exceder) | ✅ PASS |
| V. Performance & Data Freshness | Após `usePlaceBet`, invalidação do `groupMatchesKeys` + update otimista no card; `useLastAccessedGroup` faz leitura síncrona do `localStorage` (sem efeito assíncrono); progresso é selector memoizado (`useMemo`) — não dispara fetch | ✅ PASS |
| VI. Layout Consistency | Toda a UI segue `doc/ui.md`: cores via tokens, radius `--radius-xl` para cards, `--radius-pill` para botões, espaçamento 8px grid, tipografia Plus Jakarta Sans, pattern de fundo aplicado apenas no `AppShell` (não dentro de modais críticos — cf. §9.5), foco visível via `--support` em todos os controles, contraste WCAG ≥ 4.5:1 | ✅ PASS |

**Todos os gates passam. Sem violações. Prosseguindo para Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/005-group-ux-redesign/
├── plan.md              # Este arquivo (/speckit-plan)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit-plan)
├── data-model.md        # Phase 1 output (/speckit-plan)
├── quickstart.md        # Phase 1 output (/speckit-plan)
├── contracts/
│   └── api.md           # Delta: POST /api/groups/:id/leave + GET /api/groups/:id/matches
├── checklists/
│   └── requirements.md  # Quality checklist (já existe)
└── tasks.md             # Phase 2 output (/speckit-tasks — NÃO criado aqui)
```

### Source Code (novos arquivos)

```text
src/
├── components/
│   ├── layout/
│   │   ├── GroupShell.tsx               # Novo layout route: header minimalista + sidebar + outlet
│   │   ├── GroupSidebar.tsx             # Sidebar esquerda (desktop), navegação por NavLink
│   │   ├── GroupMobileNav.tsx           # Bottom-nav reposicionada com as 5/6 destinations do grupo
│   │   ├── GroupHeader.tsx              # Header minimalista (avatar + nome + gear)
│   │   └── GroupGearMenu.tsx            # Dropdown "Detalhes" / "Sair" (Radix DropdownMenu)
│   │
│   └── ui/
│       └── modal.tsx                    # Wrapper Radix Dialog seguindo doc/ui.md (radius-xl, sem pattern)
│
├── pages/
│   ├── groups/
│   │   ├── components/
│   │   │   ├── GroupsModal.tsx          # Modal "Grupos": lista + creation inline
│   │   │   ├── GroupsModalList.tsx      # Lista de grupos no modal (reusa GroupAvatar)
│   │   │   ├── GroupsModalCreate.tsx    # Wrapper que renderiza Steps 1+2 do create wizard
│   │   │   └── LeaveGroupConfirm.tsx    # Modal de confirmação de saída
│   │   └── GroupDetailsPage.tsx         # Página "Detalhes" (substitui o cabeçalho agregado anterior)
│   │
│   └── home/
│       ├── HomePage.tsx                 # Overhaul: progress bar + day-strip + inline cards
│       └── components/
│           ├── BettingProgressBar.tsx   # Barra de progresso acima do day-strip
│           ├── DayStrip.tsx             # Strip horizontal de matchdays (scroll, foco visual)
│           ├── DayStripPill.tsx         # Pill individual de um dia (selecionado / com matches / vazio)
│           ├── DayMatchList.tsx         # Lista de cards do dia selecionado
│           ├── InlineBetCard.tsx        # Card moderno com input de placar inline
│           └── FinishedMatchCard.tsx    # Variante: resultado + bet + pontos ganhos
│
├── hooks/
│   ├── useLastAccessedGroup.ts          # Resolução + persistência do último grupo
│   ├── useActiveGroup.ts                # Combina param da URL + last accessed + fallback
│   ├── useGroupMatches.ts               # GET /api/groups/:id/matches (com userBet)
│   ├── useLeaveGroup.ts                 # Mutation: POST /api/groups/:id/leave
│   └── useBettingProgress.ts            # Selector memoizado: pct + (bets, total) sobre matches navegáveis
│
├── services/
│   ├── last-group.service.ts            # Wrapper sobre localStorage (get/set/clear)
│   └── groups.service.ts                # + leaveGroup(groupId), getGroupMatches(groupId)
│
├── lib/
│   └── matchday.utils.ts                # groupMatchesByDay(), findDefaultMatchday(), isPastDay()
│
└── types/
    ├── group.types.ts                   # + SidebarDestination, LeaveGroupResult
    └── match.types.ts                   # + MatchdayGroup, BettingProgress, MatchWithUserBet (refinado)

tests/
├── unit/
│   ├── hooks/
│   │   ├── useLastAccessedGroup.test.ts
│   │   ├── useActiveGroup.test.ts
│   │   └── useBettingProgress.test.ts
│   ├── lib/
│   │   └── matchday.utils.test.ts
│   └── components/
│       ├── DayStrip.test.tsx
│       ├── InlineBetCard.test.tsx
│       └── FinishedMatchCard.test.tsx
└── integration/
    ├── layout/
    │   ├── GroupShell.test.tsx          # sidebar visível só em rota de grupo
    │   ├── GroupSidebar.test.tsx        # admin vê 6, membro vê 5
    │   └── GroupGearMenu.test.tsx       # Detalhes navega; Sair abre confirm
    └── pages/
        ├── HomePage.test.tsx            # day-strip default + progresso atualiza
        ├── GroupsModal.test.tsx         # lista + creation inline + retorno ao último grupo
        └── LeaveGroupFlow.test.tsx      # confirma → clear last group → fallback
```

### Arquivos modificados

```text
src/router/index.tsx
  - Adicionar layout `GroupShell` para rotas de grupo (`/groups/:groupId/*`)
  - Adicionar rota `index` raiz que decide via `useLastAccessedGroup` e faz Navigate
  - Rotas de grupo passam a ser: `/groups/:id` (home), `/groups/:id/jogos`,
    `/groups/:id/palpites`, `/groups/:id/ranking`, `/groups/:id/membros`,
    `/groups/:id/configuracoes` (admin), `/groups/:id/detalhes`,
    `/groups/:id/matches/:matchId`

src/components/layout/AppShell.tsx
  - Continua envolvendo rotas FORA de grupo (onboarding, account)
  - Pattern background fica neste shell; sidebar/header do grupo NÃO aparecem aqui

src/services/groups.service.ts
  - + getGroupMatches(groupId): Promise<{ matchdays: MatchdayGroup[] }>
  - + leaveGroup(groupId): Promise<LeaveGroupResult>

src/hooks/useGroups.ts
  - + useGroupMatches(groupId), useLeaveGroup(groupId)
  - groupKeys.matches(id) adicionado ao keyspace

src/types/group.types.ts
  - + SidebarDestination = 'home' | 'jogos' | 'palpites' | 'ranking' | 'membros' | 'configuracoes'
  - + LeaveGroupResult = { ok: boolean }

src/types/match.types.ts
  - + MatchdayGroup = { date: string (ISO yyyy-mm-dd); label: string; matches: MatchWithUserBet[] }
  - + BettingProgress = { betted: number; total: number; pct: number; isComplete: boolean }
  - Confirmar `MatchWithUserBet.userBet` é populado por `getGroupMatches`

src/pages/groups/GroupDetailPage.tsx
  - Conteúdo agregado (membros, ranking completo, settings inline) é distribuído nas
    novas páginas `/membros`, `/ranking`, `/configuracoes` e `/detalhes`
  - `GroupDetailPage` torna-se um redirect implícito para `/home` (ou removido se o
    layout `GroupShell` cuidar do index)

src/pages/groups/CreateGroupPage.tsx
  - Permanece para o caminho `/groups/new` (entrada via onboarding sem grupos);
    o modal apenas reusa os Steps internamente, sem replicar o `useNavigate` final
    — em vez disso, o modal chama `setActiveGroup(newGroup.id)` e fecha

src/router/guards/OnboardingGuard.tsx
  - Sem mudança no comportamento; continua redirecionando para `/onboarding` se sem grupos

CLAUDE.md
  - Atualizar bloco SPECKIT para apontar para `specs/005-group-ux-redesign/plan.md`

.specify/memory/global-functions.md
  - Registrar: `groupMatchesByDay`, `findDefaultMatchday`, `lastAccessedGroup.get/set/clear`
```

**Structure Decision**: SPA única com **dois layouts paralelos** no router:
- `AppShell` para rotas fora de grupo (onboarding, auth, account) — mantém pattern
  background e header geral simples
- `GroupShell` (novo) para rotas dentro de um grupo — adiciona sidebar persistente
  em desktop, bottom-nav reposicionada em mobile, header minimalista do grupo com
  menu gear, e omite o pattern background dentro de modais densos (§9.5 do `doc/ui.md`).

A rota raiz `/` deixa de ser a `HomePage` global de partidas e passa a ser um
**resolver de "último grupo acessado"** que faz `Navigate replace` para
`/groups/:lastId` (ou `/onboarding` se não houver grupos). A `HomePage` redesenhada
vive em `/groups/:groupId` (index do `GroupShell`).

## Component Architecture

### Routing tree

```text
/
 ├── /auth/{login,register}                  ← <AuthGuard> (sem layout)
 ├── /onboarding                             ← <AppShell> (pattern + bottom-nav antigo)
 ├── /onboarding/join
 ├── /groups/new                             ← create flow externo (entrada para usuários sem grupos)
 ├── /                                       ← resolver: <Navigate to={`/groups/${lastId}`}> ou /onboarding
 ├── /profile                                ← <AppShell>
 │
 └── /groups/:groupId                        ← <GroupShell> (sidebar + header minimalista)
       ├── index                             → <GroupHomePage> (day-strip + progresso + inline bets)
       ├── jogos                             → <GroupJogosPage> (lista completa de partidas — reusa GroupStageGrid)
       ├── palpites                          → <GroupPalpitesPage> (palpites do usuário neste grupo)
       ├── ranking                           → <GroupRankingPage> (ranking completo)
       ├── membros                           → <GroupMembersPage> (MemberList atual)
       ├── configuracoes                     → <GroupSettingsPage> (admin-only via guard)
       ├── detalhes                          → <GroupDetailsPage> (avatar, descrição, convite, scoring)
       └── matches/:matchId                  → <MatchDetailPage> (já existe)
```

### GroupShell layout

```text
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────────────────────────────────┐ │
│ │              │ │ GroupHeader: [avatar] Nome do Grupo  [⚙] │ │
│ │ GroupSidebar │ ├──────────────────────────────────────────┤ │
│ │ (lg+)        │ │                                          │ │
│ │              │ │           <Outlet /> (página ativa)      │ │
│ │ • Home       │ │                                          │ │
│ │ • Jogos      │ │                                          │ │
│ │ • Palpites   │ │                                          │ │
│ │ • Ranking    │ │                                          │ │
│ │ • Membros    │ │                                          │ │
│ │ • Config.    │ │                                          │ │
│ │  (admin)     │ │                                          │ │
│ │              │ │                                          │ │
│ │ ──────       │ │                                          │ │
│ │ [+ Grupos]   │ │                                          │ │
│ │ [tema] [user]│ │                                          │ │
│ └──────────────┘ └──────────────────────────────────────────┘ │
│ Mobile (<lg): sidebar oculto → bottom-nav com mesmas entries   │
└──────────────────────────────────────────────────────────────┘
```

**Regras visuais (§10 doc/ui.md):**
- Sidebar: `bg-[var(--surface)]`, `border-r border-[var(--border)]`, largura `18rem`,
  itens com radius `--radius-pill` no estado ativo (`bg-[var(--surface-soft)]` + ícone
  em `var(--brand)`)
- Header: altura `64px`, padding lateral `24px`, fundo translúcido com `backdrop-blur(16px)`,
  borda inferior `1px solid var(--border)`
- Gear icon: botão circular `h-9 w-9`, abre dropdown alinhado à direita
- Mobile bottom-nav: idêntico ao atual em estrutura, conteúdo trocado para destinations
  do grupo; o botão "Grupos" aparece como item dedicado abrindo o `GroupsModal`

### GroupsModal (substitui `/groups` como página)

```text
┌──────────────────────────────────────────┐
│  Seus grupos                       [×]   │
│                                          │
│  ▸ [🏆] Bolão da Família  · 8 membros   │ ← ativo destacado
│  ▸ [⚽] Amigos do trabalho · 5 membros   │
│  ▸ [🎯] Família Silva     · 12 membros   │
│                                          │
│  ─── ou ───                              │
│  [+] Criar novo grupo                    │
│                                          │
└──────────────────────────────────────────┘

Após clicar "Criar novo grupo", o conteúdo do modal troca para:

┌──────────────────────────────────────────┐
│  ← Voltar                          [×]   │
│  Passo 1 de 2 — Identidade               │
│                                          │
│   <GroupIdentityStep />  (reusado)       │
│                                          │
│  [Próximo →]                             │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  ← Voltar                          [×]   │
│  Passo 2 de 2 — Pontuação                │
│                                          │
│   <ScoringConfigStep />  (reusado)       │
│                                          │
│  [Criar grupo]                           │
└──────────────────────────────────────────┘
       │
       ▼  onSuccess → setActiveGroup + close modal
       ▼  navega para `/groups/<newId>`
```

Regras:
- Modal usa Radix Dialog com `radius-xl`, `bg-[var(--surface)]`, sem pattern de fundo
  por cima (§9.5 — modais críticos removem o pattern)
- Fechamento via `×`, ESC, ou clique no overlay
- Estado interno do wizard isolado por `useState`; não persiste se o usuário fechar
- Sem navegação de rota — toda a transição é interna

### GroupGearMenu

```text
┌─ <gear icon> ─┐
│   Detalhes    │ ← navega para /groups/:id/detalhes
│   Sair        │ ← abre <LeaveGroupConfirm>
└───────────────┘
```

Implementado com Radix DropdownMenu (já listamos `@radix-ui/react-dialog`; adicionar
`@radix-ui/react-dropdown-menu` se não existir — verificar antes de prosseguir).

### LeaveGroupConfirm

Modal de confirmação:
- Título: "Sair do grupo X?"
- Texto: "Você perderá acesso ao ranking, palpites e configurações deste grupo. Esta
  ação pode ser desfeita aceitando um novo convite."
- Botões: `[Cancelar]` (secundário) + `[Sair]` (destrutivo — `variant="destructive"`)
- Em sucesso: chama `clearLastAccessedGroup()` se este era o último; invalida
  `groupKeys.lists()`; redireciona para `/` (resolver fará fallback)

### Home redesign (`/groups/:groupId`)

```text
┌──────────────────────────────────────────┐
│ [GroupHeader (já no shell)]              │
├──────────────────────────────────────────┤
│                                          │
│  Olá, Israel — 4 de 7 palpites           │ ← greeting + progress label
│  ▓▓▓▓▓▓░░░  57%                          │ ← BettingProgressBar
│                                          │
│  [seg 24] [ter 25] [qua 26] [qui 27]…    │ ← DayStrip (horizontal scroll)
│   ───       ───      ▼ ATIVO     ───      │
│                                          │
│  ┌────────────────────────────────┐      │
│  │ 16:00 · Estádio                │      │
│  │ 🇧🇷 Brasil    [_] × [_]  🇫🇷 França│ ← InlineBetCard (em apostas abertas)
│  │   [Salvar palpite]              │      │
│  └────────────────────────────────┘      │
│                                          │
│  ┌────────────────────────────────┐      │
│  │ FINISHED · 18:00               │      │
│  │ 🇦🇷 Argentina  2 × 1  🇨🇴 Colômbia │      │
│  │ Seu palpite: 2 × 0 — 1 ponto    │      │ ← FinishedMatchCard
│  └────────────────────────────────┘      │
└──────────────────────────────────────────┘
```

Comportamento:
- `DayStrip` é populado a partir de `groupMatchesByDay(matches)` — array de
  `MatchdayGroup` ordenado cronologicamente
- Default selecionado: `findDefaultMatchday(groups)` retorna o índice do dia que
  contém matches de hoje (fuso local), senão o índice do próximo dia upcoming.
  Por padrão exclui dias com apenas matches passados; usuário pode "rolar para
  trás" e a seleção dispara renderização das partidas daquele dia
- `BettingProgressBar` lê `useBettingProgress(matchdays)` — denominador é o número
  total de matches presentes nos `matchdays` navegáveis (cf. assumption do spec)
- `InlineBetCard` usa `usePlaceBet`/`useEditBet`; em sucesso, optimistic update
  pinta o card com badge "Palpite salvo" e a `BettingProgressBar` avança
- `FinishedMatchCard` calcula pontos via `calcPoints(bet, match, group)` (já em
  `bet.utils.ts`)

## Service Layer

### Endpoints novos / atualizados

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/api/groups/:groupId/matches` | Retorna matches do grupo com `userBet` embutido (substitui o cast atual `userBet: null`) |
| `POST` | `/api/groups/:groupId/leave` | Membro sai do grupo. Admin único recebe 409 (precisa transferir admin antes — fora do escopo desta feature; UI bloqueia o gear "Sair" se `role==='admin' && memberCount > 1`) |

Detalhes completos em `contracts/api.md`.

### last-group.service.ts

```ts
// src/services/last-group.service.ts
const KEY = (userId: string) => `betabet:last-group:${userId}`

export function getLastAccessedGroup(userId: string): string | null {
  try { return localStorage.getItem(KEY(userId)) } catch { return null }
}

export function setLastAccessedGroup(userId: string, groupId: string): void {
  try { localStorage.setItem(KEY(userId), groupId) } catch { /* ignore */ }
}

export function clearLastAccessedGroup(userId: string): void {
  try { localStorage.removeItem(KEY(userId)) } catch { /* ignore */ }
}
```

### Hooks (TanStack Query)

```ts
// useLastAccessedGroup — pure resolver (no fetching)
function useLastAccessedGroup(): {
  resolvedGroupId: string | null
  isReady: boolean
}
// regras:
//   - se user não autenticado → null, isReady=false
//   - se groups.length === 0 → null, isReady=true (callsite redireciona /onboarding)
//   - se groups.length === 1 → groups[0].id (ignora localStorage — FR-002)
//   - senão → localStorage[lastId] if id ∈ groups, else groups[0].id

// useActiveGroup — leitura da URL + persistência
function useActiveGroup(): {
  groupId: string | null
  group: BettingGroup | null
  role: GroupRole | null
  isAdmin: boolean
}
// efeito colateral: ao mudar de groupId via URL, chama setLastAccessedGroup()

// useGroupMatches
function useGroupMatches(groupId: string): UseQueryResult<{ matchdays: MatchdayGroup[] }>
// queryKey: groupKeys.matches(groupId), staleTime: 30s

// useBettingProgress
function useBettingProgress(matchdays: MatchdayGroup[]): BettingProgress
// pure selector via useMemo — não dispara fetch

// useLeaveGroup
function useLeaveGroup(groupId: string): UseMutationResult<LeaveGroupResult, ApiError, void>
// onSuccess: clearLastAccessedGroup(userId); invalidate groupKeys.lists()
```

### matchday.utils.ts

```ts
// src/lib/matchday.utils.ts
import type { MatchWithUserBet, MatchdayGroup } from '@/types/match.types'

export function groupMatchesByDay(
  matches: MatchWithUserBet[],
  options?: { includePast?: boolean },
): MatchdayGroup[]
// agrupa por yyyy-mm-dd em fuso local; ordena cronologicamente; opcionalmente
// remove dias 100% passados

export function findDefaultMatchday(matchdays: MatchdayGroup[]): number
// retorna índice do dia "today" (se houver matches hoje) ou do próximo dia upcoming;
// fallback: 0

export function isPastDay(matchday: MatchdayGroup, now?: Date): boolean
// true se todos os matches do dia já estão finished ou no passado
```

Cada função tem teste unitário com casos: matches hoje, matches só amanhã, só passados,
fuso horário (utilizar `Date` local — JS já interpreta no fuso do navegador).

## Open Questions Resolved Inline

Itens marcados como **Assumptions** no `spec.md` resolvidos abaixo (mais detalhes em `research.md`):

1. **Last accessed group — onde persistir?**
   → `localStorage` por user id. Sincronização cross-device é fora de escopo;
   spec aceita "sensible default per device" (edge case explícito).

2. **Group home URL?**
   → `/groups/:groupId` (index do `GroupShell`). Rota antiga `/` torna-se resolver.

3. **Configurações fica visível para admin como rota ou tab?**
   → Rota dedicada `/groups/:groupId/configuracoes`, protegida por um guard local
   que checa `role === 'admin'`. Item da sidebar é renderizado condicionalmente
   pelo `GroupSidebar`.

4. **Como o usuário acessa "Grupos" no mobile?**
   → Item dedicado no bottom-nav (substitui o "Perfil" atual? Não — perfil vai
   para o gear menu se possível, ou continua via shell externo). Decisão final em
   `research.md` §3.

5. **Endpoint de Sair?**
   → Novo: `POST /api/groups/:groupId/leave`. Sem replicação de UI no
   `GroupSettingsPage` (consolidado no gear menu apenas).

6. **Como `getGroupMatches` lida com matches que ainda não foram associados a
   matchdays oficiais?**
   → Reusa o mesmo `Match.scheduledAt` para agrupamento por dia local; o conceito
   `Match.matchday` (1-3 do group stage) é diferente e mantido para a página
   `/jogos`. Em outras palavras, o **day-strip** trabalha por **data local**, não
   por `matchday` do torneio.

## Complexity Tracking

> Nenhuma violação de constituição. Seção não aplicável.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
