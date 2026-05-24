# Quickstart: Group UX Redesign

**Feature**: `005-group-ux-redesign`
**Branch**: `005-group-ux-redesign`
**Date**: 2026-05-24

Este quickstart é o guia operacional para reviewers e novos contribuidores entenderem
o que muda, como rodar localmente, e quais cenários validar manualmente.

---

## 1. Pré-requisitos

```bash
# Bun (recomendado pelo projeto)
bun install

# Variáveis de ambiente — copiar e ajustar
cp .env.example .env.local
```

Variáveis relevantes (`.env.local`):
- `VITE_API_URL` — backend de dev (proxy passa por `/api`).
- Sessão usa cookie `HttpOnly`; o frontend só precisa do proxy.

Mocks de teste (MSW) já cobrem os endpoints novos descritos em
[`contracts/api.md`](./contracts/api.md). Se você está rodando contra o backend real,
garanta que `POST /api/groups/:id/leave` e `GET /api/groups/:id/matches` estão
implementados na branch do backend correspondente.

---

## 2. Comandos do dia-a-dia

```bash
bun run dev         # vite dev — http://localhost:5173
bun run typecheck   # tsc --noEmit
bun run lint        # eslint src
bun run test        # vitest run (unit + integration)
bun run test:watch  # vitest watch
```

Antes de abrir PR, **todos** os três precisam passar (`typecheck`, `lint`, `test`).

---

## 3. Walkthrough do redesign

### 3.1 Entrada (`/`)

1. Usuário autenticado abre `/`.
2. O novo **root resolver route** chama `useLastAccessedGroup()`:
   - 0 grupos → `<Navigate to="/onboarding" replace />`
   - 1 grupo → `<Navigate to="/groups/<id>" replace />` (ignora storage)
   - 2+ grupos → resolve via `localStorage` ou fallback ao primeiro grupo.
3. Não há flash de UI intermediária; o redirect é síncrono pós-`isReady`.

### 3.2 Dentro do grupo (`/groups/:groupId`)

Layout: `GroupShell` envolve todas as rotas filhas.

```
┌─ GroupSidebar (lg+) ─┬──────────────────────────────────┐
│ Home                 │ GroupHeader [avatar Nome ⚙]      │
│ Jogos                ├──────────────────────────────────┤
│ Palpites             │                                  │
│ Ranking              │   <Outlet /> (página ativa)      │
│ Membros              │                                  │
│ Configurações*       │                                  │
│ ──                   │                                  │
│ [+ Grupos]           │                                  │
│ [tema] [user]        │                                  │
└──────────────────────┴──────────────────────────────────┘
* admin only
```

Mobile (<lg): sidebar oculto, bottom-nav exibe as mesmas entradas (scroll horizontal
se admin → 6 itens). Botão "Grupos" no header minimalista abre o modal.

### 3.3 Home redesenhada (`/groups/:groupId` index)

- Greeting + progresso (`BettingProgressBar` ≥ 1 jogo upcoming).
- `DayStrip` mostra dias futuros (default: hoje ou o próximo upcoming).
- `InlineBetCard` para upcoming/live → palpite inline com input numérico.
- `FinishedMatchCard` para `status === 'finished'` → mostra placar oficial + palpite
  do usuário + pontos ganhos (via `calcPoints`).
- Empty states cobrem: grupo sem matches; estado todo passado; sem upcoming.

### 3.4 Modal "Grupos"

- Acionado pelo botão "+ Grupos" na sidebar OU pelo item dedicado no bottom-nav.
- Lista grupos do usuário; selecionar troca o contexto sem perder o stack.
- "Criar novo grupo" muda o conteúdo do modal para o wizard de 2 steps existente
  (`GroupIdentityStep` + `ScoringConfigStep`) — sem mudar de rota.
- Em sucesso, fecha modal e navega para `/groups/<novoId>`.

### 3.5 Gear menu (header)

- "Detalhes" → `/groups/:id/detalhes`.
- "Sair" → abre `LeaveGroupConfirm`. Confirmar dispara `useLeaveGroup`, limpa o
  `lastAccessedGroup`, e redireciona para `/`.

---

## 4. Cenários manuais de validação

Cada cenário corresponde a uma User Story do spec. Cobertura mínima antes do merge:

### US1 — Auto-resume

- [ ] Usuário com 2+ grupos abre `/` → vai direto para o último grupo usado.
- [ ] Usuário com 1 grupo só → entra direto nele mesmo se localStorage tiver outro id.
- [ ] Usuário sem grupos → `/onboarding`.
- [ ] localStorage corrompido (string aleatória) → fallback ao primeiro grupo.

### US2 — Modal de grupos

- [ ] Abrir modal mantém o contexto atual visível atrás (overlay com blur).
- [ ] Selecionar outro grupo no modal → fecha modal, navega para o grupo.
- [ ] Iniciar criação dentro do modal → wizard renderiza em 2 steps; cancelar volta
      à lista; concluir cria grupo, fecha modal, navega para o novo grupo.
- [ ] Pressionar ESC ou clicar no overlay fecha o modal sem efeitos colaterais.

### US3 — Header minimalista + gear menu

- [ ] Header mostra apenas avatar + nome + gear (sem badges nem subtítulo).
- [ ] Gear menu lista "Detalhes" e "Sair".
- [ ] "Detalhes" abre `/groups/:id/detalhes`.
- [ ] "Sair" abre confirmação; cancelar mantém estado; confirmar leva ao próximo
      grupo disponível ou `/onboarding`.
- [ ] Último admin com outros membros → item "Sair" desabilitado (tooltip explicando).

### US4 — Sidebar

- [ ] Membro vê 5 itens (Home, Jogos, Palpites, Ranking, Membros).
- [ ] Admin vê 6 itens (+ Configurações).
- [ ] Rota ativa destacada (`aria-current="page"`).
- [ ] Sidebar invisível em `/auth`, `/onboarding`, `/profile`, `/groups/new`.
- [ ] Mobile (<lg): bottom-nav substitui sidebar com as mesmas regras.

### US5 — Day-strip + inline bet

- [ ] Strip abre no dia de hoje se houver matches hoje.
- [ ] Senão abre no próximo dia upcoming.
- [ ] Dias 100% passados não aparecem por padrão.
- [ ] Trocar de dia mostra os matches sem reload.
- [ ] Digitar placar e salvar → card mostra "Palpite salvo" sem leave da home.
- [ ] Grupo sem matches futuros → empty state polido.

### US6 — Finished cards

- [ ] Match `finished` com bet → mostra placar oficial, bet do usuário, pontos.
- [ ] Match `finished` sem bet → mensagem "Você não palpitou" + placar.
- [ ] Match `finished` sem resultado oficial → "Resultado pendente", não zera pontos.

### US7 — Progress bar

- [ ] Barra acima do day-strip mostra `X de Y palpites`.
- [ ] Salvar bet → barra avança imediatamente (optimistic).
- [ ] Bet em todos os matches → barra 100% + estado de "concluído".
- [ ] Sem upcoming → barra escondida ou substituída por mensagem.

### US8 — Mobile

- [ ] Todas as 7 stories funcionam em 320px sem horizontal scroll.
- [ ] Day-strip rolável com touch; pill selecionado fica visível.
- [ ] Modal e confirmação ocupam viewport com botões acessíveis ao polegar.

---

## 5. Smoke test rápido

```bash
# 1. Lint + types + unit/integration
bun run typecheck && bun run lint && bun run test

# 2. Dev server, abrir em mobile-first
bun run dev
# Visitar http://localhost:5173 e seguir o roteiro:
#   a. Login com usuário que tem 2+ grupos
#   b. Verificar redirect imediato para /groups/<lastId>
#   c. Abrir modal Grupos, trocar de grupo
#   d. Criar grupo via modal
#   e. Abrir gear menu → Detalhes → voltar
#   f. Gear menu → Sair → cancelar → confirmar
#   g. Day-strip: trocar de dia, palpitar, ver progress bar avançar
#   h. Toggle tema claro/escuro — verificar contraste em todos os componentes novos
```

---

## 6. Pontos de atenção para o reviewer

- **Constituição I (DRY)**: `GroupsModalCreate` deve usar `GroupIdentityStep` e
  `ScoringConfigStep` **sem copiar lógica**; o teste de integração
  `GroupsModal.test.tsx` valida que o submit chama `createGroup` (não `navigate`).
- **Constituição II (Types)**: nenhum tipo inline em componente novo.
  `SidebarDestination`, `MatchdayGroup`, `BettingProgress`, `LeaveGroupResult` ficam
  em `src/types/`.
- **Constituição III (Tests-first)**: a ordem do `tasks.md` (gerado por
  `/speckit-tasks`) coloca os testes antes dos componentes correspondentes.
- **Constituição IV (Arquivos < 300 linhas)**: se `GroupsModal` aproximar do limite,
  split em `GroupsModalList` + `GroupsModalCreate` (já previsto na estrutura).
- **Constituição V (Performance)**: nenhuma rota nova faz fetch redundante;
  `useBettingProgress` é `useMemo` (não query); `usePlaceBet` faz optimistic update
  no `groupKeys.matches`.
- **Constituição VI (Layout)**: zero hard-coded pixel; todas as cores via tokens
  CSS; cards com `--radius-xl`; botões pill (`--radius-pill`); foco visível em
  `--support`; pattern reduzido em `GroupShell` e removido em modais (`doc/ui.md`
  §9.5).

---

## 7. Referências cruzadas

- [Spec](./spec.md) — user stories, FRs, success criteria.
- [Plan](./plan.md) — decisões de arquitetura.
- [Data model](./data-model.md) — tipos e state transitions.
- [API contract delta](./contracts/api.md) — endpoints novos e modificados.
- [Design system](../../doc/ui.md) — Brasil Essencial: cores, tipografia, spacing.
- [Constitution](../../.specify/memory/constitution.md) — princípios não-negociáveis.
- [Global functions](../../.specify/memory/global-functions.md) — atualizar com
  `groupMatchesByDay`, `findDefaultMatchday`, `lastAccessedGroup.*` ao fim da feature.
