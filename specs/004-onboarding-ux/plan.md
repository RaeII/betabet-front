# Implementation Plan: Onboarding UX & Grupos

**Branch**: `004-onboarding-ux` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-onboarding-ux/spec.md`

## Summary

Tela de boas-vindas para novos usuários (sem grupos) com duas opções: entrar via código/link ou
criar um grupo. A criação de grupo torna-se um wizard de 2 passos (identidade visual + configuração
de pontuação com exemplo ao vivo Brasil x França). A entrada via código usa o fluxo de resolução de
convite já existente no backend, adicionando uma UX direta dentro do app. Um `OnboardingGuard`
detecta ausência de grupos e redireciona automaticamente.

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19

**Primary Dependencies**:
- Vite 6 + `@vitejs/plugin-react` (build, dev-proxy)
- Tailwind CSS v4 + `tailwind-merge` + `clsx` (styling — tokens de `styles/tokens.css`)
- TanStack Query v5 — `useQuery`, `useMutation`, `useQueryClient`
- React Router DOM v7 — lazy routes, `useNavigate`, `Outlet`
- Framer Motion — já no projeto; animar transições entre steps
- Zod — validação de schemas
- Lucide React — ícones

**Storage**: N/A — estado via TanStack Query; sem persistência local nova

**Testing**: Vitest + `@testing-library/react` + `msw`. Comando: `bun run test`

**Target Platform**: Mobile-first PWA (mesma plataforma do app principal)

**Performance Goals**:
- Resolução de código de convite em < 1s após confirmar
- Transição entre steps do wizard < 100ms (Framer Motion)
- `useUserGroups` não é re-fetched se já em cache válido (staleTime existente: 30s)

**Constraints**:
- Arquivos MUST NOT exceder 300 linhas (Constituição IV)
- Sem novos pacotes — reusar Framer Motion, Radix, Lucide já presentes
- Tokens de espaçamento/cor exclusivamente de `styles/tokens.css`
- Sem hard-coded pixels
- O `OnboardingGuard` não deve disparar fetch duplo de groups

**Scale/Scope**: Fluxo de entrada único por usuário (one-time); wizard de 2 steps

## Constitution Check

| Princípio | Gate | Status |
|-----------|------|--------|
| I. DRY & Simplicity | `ScoringExample` é componente único reutilizado em `ScoringConfigStep`; `joinByCode` extraído para `useJoinByCode` hook; zero duplicação com fluxo existente em `InvitePage` | ✅ PASS |
| II. Type Safety | Novos campos `emoji` em `group.types.ts`; schema `GroupCreateSchema` atualizado antes da implementação | ✅ PASS |
| III. Test-First | Testes para `OnboardingGuard`, `useJoinByCode`, `ScoringExample` e wizard steps escritos antes da implementação | ✅ PASS |
| IV. File Organization | `OnboardingPage` e `JoinGroupPage` ficam em `pages/onboarding/`; componentes page-specific em `pages/onboarding/components/` e `pages/groups/components/`; `ScoringExample` é global (reutilizável) → `components/scoring/` | ✅ PASS |
| V. Performance & Data Freshness | `OnboardingGuard` usa o mesmo cache de `useUserGroups` — sem fetch extra; após criar/entrar em grupo, `groupKeys.lists()` é invalidado | ✅ PASS |
| VI. Layout Consistency | Telas de onboarding seguem design system Brasil Essencial; sem px hardcoded | ✅ PASS |

**Todos os gates passam. Sem violações. Prosseguindo para Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/004-onboarding-ux/
├── plan.md              # Este arquivo
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Contrato delta (campos novos no POST /api/groups)
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (novos arquivos)

```text
src/
├── router/
│   └── guards/
│       └── OnboardingGuard.tsx            # Redireciona para /onboarding se groups=[]
│
├── pages/
│   ├── onboarding/
│   │   ├── OnboardingPage.tsx             # Tela de boas-vindas (2 opções)
│   │   ├── JoinGroupPage.tsx              # Digitar código ou colar link → auto-join
│   │   └── components/
│   │       └── OnboardingCard.tsx         # Card clicável com ícone + título + descrição
│   │
│   └── groups/
│       └── components/
│           ├── GroupIdentityStep.tsx      # Step 1: nome + emoji ou upload de imagem
│           └── ScoringConfigStep.tsx      # Step 2: pontos + preview ao vivo
│
└── components/
    └── scoring/
        └── ScoringExample.tsx             # Componente global: simulação Brasil x França

tests/
├── unit/
│   ├── guards/
│   │   └── OnboardingGuard.test.tsx
│   └── components/
│       └── ScoringExample.test.tsx
└── integration/
    └── pages/
        ├── OnboardingPage.test.tsx
        ├── JoinGroupPage.test.tsx
        └── CreateGroupPage.test.tsx
```

### Arquivos modificados

```text
src/router/index.tsx                  # Adicionar OnboardingGuard + rotas /onboarding e /onboarding/join
src/types/group.types.ts              # Adicionar emoji?: string em CreateGroupData e BettingGroup
src/lib/schemas/index.ts              # Atualizar GroupCreateSchema com emoji
src/hooks/useGroups.ts                # Adicionar useJoinByCode mutation
src/pages/groups/CreateGroupPage.tsx  # Overhaul completo → wizard 2 passos
```

**Structure Decision**: SPA única; novos guards e páginas seguem o mesmo padrão de lazy-load
do router existente. `ScoringExample` fica em `components/scoring/` pois será reutilizável
(ex.: futuras telas de configuração de grupo).

## Component Design

### OnboardingGuard

```
OnboardingGuard
 ├── usa useUserGroups() — mesmo cache, sem fetch extra se stale < 30s
 ├── isLoading → null (spinner já tratado pelo AppShell)
 ├── groups.length === 0 && !pathname.startsWith('/onboarding')
 │     → <Navigate to="/onboarding" replace />
 └── caso contrário → <Outlet />
```

### OnboardingPage layout

```
┌─────────────────────────────────────┐
│  🏆  betabet                        │ ← logo/marca
│  Bem-vindo ao bolão da Copa!        │ ← headline
│  Aposte nos jogos, dispute pontos   │
│  com amigos em grupos privados.     │ ← descrição curta
│                                     │
│  ┌────────────────────────────┐     │
│  │  👥  Entrar em um grupo    │ ←── OnboardingCard
│  │  Tenho um código ou link   │
│  └────────────────────────────┘     │
│                                     │
│  ┌────────────────────────────┐     │
│  │  ✨  Criar um grupo        │ ←── OnboardingCard
│  │  Eu quero criar o meu      │
│  └────────────────────────────┘     │
└─────────────────────────────────────┘
```

### JoinGroupPage layout

```
┌─────────────────────────────────────┐
│  ← Voltar                           │
│  Entrar em um grupo                 │
│                                     │
│  [Input: Cole o link ou código ]    │ ← aceita URL completa ou só o código
│                                     │
│  [Continuar]                        │
│                                     │
│  ── Preview (após resolver código) ─│
│  🏆 Bolão dos Amigos  · 5 membros   │
│  [Entrar no grupo]                  │
└─────────────────────────────────────┘
```

- Input detecta automaticamente se é URL (extrai o código) ou código puro
- Preview aparece após `resolveInviteCode` responder (TanStack Query enabled=!!code)
- "Entrar no grupo" → `joinGroup` → invalidate `groupKeys.lists()` → navigate(`/groups/:id`)

### CreateGroupPage (wizard overhaul)

```
Step 1 — Identidade do grupo
┌─────────────────────────────────────┐
│  ← Voltar        Passo 1 de 2       │
│  Como vai chamar o grupo?           │
│                                     │
│  [Input: Nome do grupo]             │
│                                     │
│  Escolha um emoji ou imagem:        │
│  [😄][🏆][⚽][🎯][🔥][+mais]       │ ← grade de emojis populares
│  [📷 Upload de imagem]              │ ← abre file input (JPEG/PNG ≤ 5MB)
│                                     │
│  Prévia: [🏆] Bolão dos Amigos      │ ← live preview
│                                     │
│  [Próximo →]                        │
└─────────────────────────────────────┘

Step 2 — Configuração de pontuação
┌─────────────────────────────────────┐
│  ← Voltar        Passo 2 de 2       │
│  Quanto vale cada aposta?           │
│                                     │
│  Acertar o vencedor:  [1] pontos    │ ← number input
│  Acertar o placar:    [3] pontos    │ ← number input
│                                     │
│  ── Exemplo: Brasil x França ──     │
│  Resultado real: 🇧🇷 2 × 1 🇫🇷       │
│                                     │
│  Apostou 2×1 → placar exato         │
│  → você ganha [3] pontos ✅          │
│                                     │
│  Apostou 1×0 → acertou o vencedor   │
│  → você ganha [1] ponto  ✅          │
│                                     │
│  Apostou 1×1 → errou tudo           │
│  → você ganha 0 pontos  ❌           │
│                                     │
│  [Criar grupo]                      │
└─────────────────────────────────────┘
```

### ScoringExample (componente global)

Props: `{ resultPoints: number; exactScorePoints: number }`

Renderiza 3 cenários fixos com Brasil 2 × 1 França:
- Cenário "Placar exato" (apostou 2×1) → `exactScorePoints` pts
- Cenário "Acertou vencedor" (apostou ex: 1×0) → `resultPoints` pts
- Cenário "Errou" (apostou ex: 1×1) → 0 pts

Atualiza em tempo real conforme o usuário altera os inputs — sem debounce necessário.

## Service Layer

Sem novos endpoints. Reutiliza:
- `getUserGroups()` — já existe
- `resolveInviteCode(code)` — já existe
- `joinGroup(groupId, code)` — já existe
- `createGroup(data)` — já existe; aceita `emoji?: string` com contrato atualizado

### useJoinByCode (novo hook)

```ts
// src/hooks/useGroups.ts (adição)
export function useJoinByCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const { group } = await resolveInviteCode(code)
      return joinGroup(group.id, code)
        .then(result => ({ ...result, groupId: group.id }))
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: groupKeys.lists() }),
  })
}
```

### Roteamento — delta no router/index.tsx

```ts
// Dentro do AuthGuard, antes do AppShell:
{
  path: '/onboarding',
  lazy: async () => { ... OnboardingPage },
},
{
  path: '/onboarding/join',
  lazy: async () => { ... JoinGroupPage },
},
{
  element: <OnboardingGuard />,
  children: [
    {
      element: <AppShell />,
      children: [ /* rotas existentes */ ],
    },
  ],
},
```

## Complexity Tracking

> Nenhuma violação de constituição. Seção não aplicável.
