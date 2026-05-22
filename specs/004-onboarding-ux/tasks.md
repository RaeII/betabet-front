# Tasks: Onboarding UX & Grupos

**Input**: Design documents from `specs/004-onboarding-ux/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Testes obrigatórios conforme Constituição Princípio III (Test-First). Escrever e
verificar falha antes da implementação.

**Organization**: Tarefas agrupadas por User Story para implementação e testes independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: User story à qual a tarefa pertence (US1–US4, conforme spec.md)

---

## Phase 1: Setup

**Purpose**: Verificar baseline e confirmar que nada foi quebrado antes de iniciar.

- [x] T001 Rodar `bun run test` e `bun run typecheck` para confirmar que todos os testes existentes passam antes de qualquer mudança

---

## Phase 2: Foundational (Bloqueante para todas as US)

**Purpose**: Alterações de tipos, schemas, hooks e roteamento que todas as user stories dependem.

**⚠️ CRÍTICO**: Nenhuma user story pode ser iniciada antes desta fase estar completa.

- [x] T002 Adicionar campo `emoji: string | null` em `BettingGroup` e `emoji?: string` em `CreateGroupData` em `src/types/group.types.ts`
- [x] T003 Adicionar campo `emoji: z.string().emoji().optional()` ao `GroupCreateSchema` e exportar tipo `GroupCreateInput` atualizado em `src/lib/schemas/index.ts`
- [x] T004 [P] Adicionar hook `useJoinByCode` (mutation que chama `resolveInviteCode` → `joinGroup` → invalida `groupKeys.lists()`) em `src/hooks/useGroups.ts`
- [x] T005 Criar `src/router/guards/OnboardingGuard.tsx` — usa `useUserGroups()`, se `groups.length === 0` redireciona para `/onboarding` com `<Navigate replace />`
- [x] T006 Atualizar `src/router/index.tsx` — adicionar rotas lazy `/onboarding` e `/onboarding/join` dentro do `AuthGuard`; envolver as rotas do `AppShell` com `OnboardingGuard`

**Checkpoint**: Tipos compilam (`bun run typecheck`), rotas existentes funcionam, guard presente no bundle. ✅

---

## Phase 3: User Story 1 — Tela de Boas-Vindas no Primeiro Login (P1) 🎯 MVP

**Goal**: Usuário sem grupos vê tela de boas-vindas com duas opções ao fazer login.

**Independent Test**: Criar conta nova → fazer login → confirmar redirect para `/onboarding`
com apenas as opções "Entrar em um grupo" e "Criar um grupo" visíveis.

### Testes para User Story 1

- [x] T007 [P] [US1] Escrever testes do `OnboardingGuard` em `tests/unit/guards/OnboardingGuard.test.tsx`: (a) redireciona para `/onboarding` quando `groups=[]`; (b) renderiza `<Outlet />` quando `groups.length > 0`; (c) exibe `null` enquanto loading
- [x] T008 [P] [US1] Escrever testes de integração do `OnboardingPage` em `tests/integration/pages/OnboardingPage.test.tsx`: (a) renderiza headline e descrição do app; (b) exibe card "Entrar em um grupo" com link para `/onboarding/join`; (c) exibe card "Criar um grupo" com link para `/groups/new`; (d) não renderiza bottom nav nem header

### Implementação para User Story 1

- [x] T009 [US1] Criar `src/pages/onboarding/components/OnboardingCard.tsx`
- [x] T010 [US1] Criar `src/pages/onboarding/OnboardingPage.tsx`

**Checkpoint**: ✅ 4/4 testes passando

---

## Phase 4: User Story 2 — Entrar em Grupo via Código ou Link (P1)

**Goal**: Usuário digita código ou cola link, vê preview do grupo e entra automaticamente.

**Independent Test**: Usar código/link de grupo existente → preview aparece → clicar "Entrar"
→ redirect direto para `/groups/:id` sem etapas extras.

### Testes para User Story 2

- [x] T011 [P] [US2] Escrever testes unitários de `useJoinByCode` em `tests/unit/hooks/useJoinByCode.test.ts` via MSW
- [x] T012 [P] [US2] Escrever testes de integração do `JoinGroupPage` em `tests/integration/pages/JoinGroupPage.test.tsx`

### Implementação para User Story 2

- [x] T013 [US2] Criar `src/pages/onboarding/JoinGroupPage.tsx`

**Checkpoint**: ✅ 7/7 testes passando

---

## Phase 5: User Story 3 — Criar um Novo Grupo (P2)

**Goal**: Wizard de 2 passos: (1) nome + emoji/imagem; (2) pontuação + exemplo ao vivo.

**Independent Test**: Criar grupo do zero → nome + emoji → pontos padrão → grupo criado →
redirect para `/groups/:id` como admin.

### Testes para User Story 3

- [x] T014 [P] [US3] Escrever testes de integração do `CreateGroupPage` em `tests/integration/pages/CreateGroupPage.test.tsx`

### Implementação para User Story 3

- [x] T015 [P] [US3] Criar `src/pages/groups/components/GroupIdentityStep.tsx`
- [x] T016 [US3] Reescrever `src/pages/groups/CreateGroupPage.tsx` como wizard 2 passos

**Checkpoint**: ✅ 5/5 testes passando

---

## Phase 6: User Story 4 — Exemplo Visual de Pontuação Brasil x França (P2)

**Goal**: Simulador ao vivo no Step 2 do wizard que mostra impacto dos pontos configurados.

**Independent Test**: Ajustar "Pontos por vencedor" de 1 para 5 → linha "Acertou o vencedor"
no exemplo atualiza instantaneamente para "5 pontos".

### Testes para User Story 4

- [x] T017 [P] [US4] Escrever testes unitários do `ScoringExample` em `tests/unit/components/ScoringExample.test.tsx`

### Implementação para User Story 4

- [x] T018 [P] [US4] Criar `src/components/scoring/ScoringExample.tsx`
- [x] T019 [P] [US4] Criar `src/pages/groups/components/ScoringConfigStep.tsx`
- [x] T020 [US4] Atualizar `src/pages/groups/CreateGroupPage.tsx` para integrar `ScoringConfigStep` como Step 2

**Checkpoint**: ✅ 5/5 testes passando

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T021 [P] Auditar todos os novos arquivos: confirmar que nenhum excede 300 linhas (Constituição IV); nenhum px hardcoded (Constituição VI)
- [x] T022 Rodar `bun run test`, `bun run typecheck` — 89 testes passando, 0 erros de tipo

---

## Dependencies & Execution Order

### Dependências entre Phases

- **Phase 1** (Setup): Sem dependências — iniciar imediatamente
- **Phase 2** (Foundational): Depende de Phase 1 — BLOQUEIA todas as user stories
- **Phase 3** (US1): Depende de Phase 2 — sem dependência de outras US
- **Phase 4** (US2): Depende de Phase 2 — sem dependência de outras US (pode iniciar em paralelo com US1)
- **Phase 5** (US3): Depende de Phase 2 — sem dependência de US1/US2
- **Phase 6** (US4): Depende de Phase 5 — `ScoringConfigStep` precisa do wizard do US3
- **Phase 7** (Polish): Depende de todas as US desejadas estarem completas

---

## Notes

- Todas as 22 tarefas concluídas ✅
- 89 testes passando (0 falhas)
- Typecheck limpo
- Nenhum arquivo excede 300 linhas
- Sem px hardcoded — todos os tokens de `styles/tokens.css`
