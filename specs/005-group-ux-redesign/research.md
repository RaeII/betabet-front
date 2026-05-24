# Research: Group UX Redesign

**Phase**: 0 — Outline & Research
**Date**: 2026-05-24
**Feature**: `005-group-ux-redesign`

Este documento resolve os pontos não óbvios e as escolhas de arquitetura que orientam a
fase de design. Cada decisão segue o formato: **Decision · Rationale · Alternatives**.

---

## 1. Persistência do "último grupo acessado"

**Decision**: `localStorage` por usuário, chave `betabet:last-group:<userId>`, encapsulado em
`src/services/last-group.service.ts` com try/catch silencioso.

**Rationale**:
- O spec aceita explicitamente "sensible default per device" (edge case #9). Storage
  per-device é a interpretação literal e a mais barata.
- Não há campo de preferência do usuário no backend (`User` em
  `src/types/auth.types.ts` não tem `lastGroupId`). Adicionar requer migration server-side,
  fora do escopo desta feature (assumption explícita: "the data ... is already available or
  in scope of the broader product and is not redefined by this feature").
- Leitura síncrona não dispara fetch — alinhado a Constituição V (Performance).
- O try/catch protege Safari modo privado (que pode lançar em quota).

**Alternatives considered**:
- **Cookie**: descarta — leitura no navegador via `document.cookie` exige parsing e o
  cookie sobe em toda request HTTP, desperdiçando bytes para algo puramente client-side.
- **`sessionStorage`**: descarta — perde a memória ao fechar a aba, contrariando FR-001
  ("on next application entry, restore that group").
- **Campo no backend (`User.lastGroupId`)**: descarta — exige endpoint novo + migration,
  expande o escopo da feature. Pode ser revisitado em uma feature futura para sincronização
  cross-device, alinhado ao edge case #9 do spec.

---

## 2. Onde reside a "home redesenhada"?

**Decision**: A home redesenhada é o **index do `GroupShell`** em `/groups/:groupId`. A
rota raiz `/` torna-se um **resolver** que faz `<Navigate replace to={`/groups/${lastId}`}>`
(ou para `/onboarding` se o usuário não tem grupos).

**Rationale**:
- Cada home é por natureza no contexto de um grupo; ter uma "home global" sem grupo
  ativo cria estado ambíguo e duplica navegação.
- O resolver na raiz preserva URLs antigas que apontem para `/` (links de email,
  bookmarks) e faz redirect imediato, sem flash de UI vazia.
- A rota `/groups/:groupId` já existe — apenas troca a página renderizada para a nova
  home redesenhada (`GroupHomePage`).

**Alternatives considered**:
- **Manter `/` como home global**: descarta — sem grupo ativo, "minhas partidas" não
  faz sentido (contraria FR-001).
- **Rota `/home`**: descarta — duplica `/groups/:groupId` sem benefício.

---

## 3. Bottom-nav no mobile: o que mostrar?

**Decision**: No mobile, o bottom-nav exibe **as mesmas 5/6 destinations da sidebar**
(Home, Jogos, Palpites, Ranking, Membros, [Configurações]), com **rolagem horizontal**
se exceder 5 itens (admin vê 6). Os controles globais (tema, perfil/logout) movem para
o **gear menu do grupo** ou um menu "Conta" acessível por avatar do usuário no header
minimalista.

**Rationale**:
- FR-016: "an equivalent mobile navigation surface that exposes the same destinations
  and the same admin-only visibility rules for Configurações". Bottom-nav é a forma
  mais nativa de mobile e já existe no projeto.
- O bottom-nav atual (`BottomNav.tsx`) tem 4 itens; ampliar para 5/6 com scroll
  horizontal segue o padrão de muitos apps mobile (Spotify, Instagram tabs).
- Manter "Grupos" como botão flutuante no header minimalista (à esquerda do avatar)
  expõe o modal sem competir com a navegação principal.

**Alternatives considered**:
- **Hamburger menu**: descarta — o spec é explícito sobre uma "sidebar/equivalente
  mobile" para navegação primária; esconder atrás de um hamburger reduz descoberta.
- **Drawer lateral mobile**: descarta — drawer obriga gesto extra e é menos descobrível
  do que bottom-nav. Pode ser adotado se o teste de usabilidade indicar problema com
  6 itens.

---

## 4. Reuso do wizard de criação dentro do modal

**Decision**: O modal "Grupos" instancia diretamente `<GroupIdentityStep>` e
`<ScoringConfigStep>` (já existentes em `src/pages/groups/components/`) dentro de um
novo wrapper `GroupsModalCreate.tsx` que gerencia o estado local idêntico ao da página
`CreateGroupPage`. A diferença é o callback final: em vez de `navigate(...)`, chama
`setActiveGroup(newId)` + fecha o modal + dispara `setLastAccessedGroup`.

**Rationale**:
- Constituição I (DRY): zero duplicação. Os componentes de step ficam intactos.
- O wizard atual já é state-driven (`step: 1 | 2`); extrair o estado em um wrapper é
  trivial.
- `CreateGroupPage` mantém-se como entry point externo (para usuários sem grupos
  chegando via `/onboarding`); o modal é o entry point interno.

**Alternatives considered**:
- **Renderizar `CreateGroupPage` dentro do modal**: descarta — `CreateGroupPage` usa
  `OnboardingShell` que adiciona header próprio, pattern background, e `useNavigate`
  no submit; conflita com o contexto do modal.
- **Extrair um hook `useCreateGroupWizard()` e renderizar steps via JSX puro**:
  considerar como melhoria futura, mas para esta feature o wrapper simples basta.

---

## 5. Endpoint para "Sair do grupo"

**Decision**: Novo endpoint `POST /api/groups/:groupId/leave`. Sem corpo; resposta
`200 { ok: true }`. Erro `409` se o usuário é o último admin e há outros membros (a UI
preventivamente desabilita o item "Sair" do gear menu nesse caso). Documentado em
`contracts/api.md`.

**Rationale**:
- A semântica de "membro deixa o grupo voluntariamente" é distinta de "admin remove
  membro" (`DELETE /api/groups/:id/members/:userId` — já existe e exige ser admin).
  Endpoints separados deixam a autorização clara e evitam comportamento polimórfico
  do mesmo endpoint.
- O 409 protege contra "grupo órfão"; transferência de admin é fora de escopo desta
  feature (não está no spec).

**Alternatives considered**:
- **`DELETE /api/groups/:groupId/members/me`**: rejeitado — sobrecarrega um endpoint
  que hoje requer `role === 'admin'` para o caller; mudar a semântica gera regressão
  para admins.
- **Suportar transferência de admin nesta feature**: fora do escopo do spec; manter
  isolado.

---

## 6. Endpoint de matches do grupo com `userBet` embutido

**Decision**: Novo endpoint `GET /api/groups/:groupId/matches` que retorna matches do
torneio com o `userBet` do usuário pré-juntado (`MatchWithUserBet[]` agrupado em
`MatchdayGroup[]` pelo cliente via `groupMatchesByDay`).

**Rationale**:
- Hoje `getAllMatches()` retorna `Match[]` sem `userBet`, e o cliente faz um
  `cast` para `MatchWithUserBet` com `userBet: null` (visível em
  `HomePage.tsx:35` com comentário `// Until individual match endpoints return userBet`).
  Esse débito impede a UI de mostrar o palpite no card e a barra de progresso.
- Buscar bet por match no client (N+1) é inaceitável para 64 partidas.
- O JOIN é trivial no backend (já há `bets` por user+match+group).

**Alternatives considered**:
- **Aumentar `GET /api/matches`**: descarta — esse endpoint não é grupo-cientes;
  `userBet` é por grupo+user+match. Aumentar exigiria query param `?groupId=` e mais
  branches.
- **Cliente combina dois fetches (`matches` + `bets`)**: descarta — exige um endpoint
  novo de "todas as bets do usuário neste grupo" e dobra o número de requests.

---

## 7. "Today's matchday or closest upcoming"

**Decision**: A função `findDefaultMatchday(matchdays)`:
1. Encontra o índice do primeiro `MatchdayGroup` cujo `date` é igual ao dia local de
   `new Date()` (formato `yyyy-mm-dd` em fuso do navegador).
2. Se não houver, encontra o primeiro `MatchdayGroup` cuja `date` > hoje.
3. Se também não houver, retorna `0` (lista exibe a "primeira" data disponível,
   tipicamente a mais recente passada — UI deve então mostrar empty state).

**Rationale**:
- O spec usa "today's matchday" no sentido de "hoje, hora local" (assumption 4 do spec).
- Fuso local do navegador resolve a maior parte dos casos sem servidor reportar fuso;
  copa do mundo em horários internacionais já é convertida pela API existente
  (`scheduledAt` é ISO 8601 UTC, `formatMatchDate` usa `toLocaleString`).

**Alternatives considered**:
- **Usar `Match.matchday` (1–3 do group stage)**: descarta — é semântica do torneio,
  não data civil. Conflita com a UX de "day-strip".
- **Servidor calcular o índice e retornar `defaultMatchdayIndex`**: considerar como
  otimização futura se o cálculo client diverge entre dispositivos.

---

## 8. Atualização otimista da barra de progresso

**Decision**: `usePlaceBet` faz `setQueryData` no cache `groupKeys.matches(groupId)`,
inserindo o novo bet no match correspondente. `useBettingProgress` recomputa
automaticamente via `useMemo` dependente do dado do cache. Após resposta do servidor,
`invalidateQueries` confirma os pontos.

**Rationale**:
- Constituição V: "After any mutation … the local state or cache MUST be updated
  optimistically or invalidated immediately".
- Barra de progresso e card-state precisam reagir < 100ms (FR-023).

**Alternatives considered**:
- **Refetch direto após bet**: descarta — latência percebida ruim no mobile.
- **Estado local separado**: descarta — duplica estado já presente no cache.

---

## 9. Dropdown menu vs. menu simples no gear

**Decision**: Usar `@radix-ui/react-dropdown-menu` (se não presente, adicionar — é o
único pacote novo permitido por estar no mesmo ecossistema Radix já no projeto).
Verificar `package.json` antes da implementação.

**Rationale**:
- Acessibilidade nativa (foco, ESC, ARIA roles), alinhada ao §13 do `doc/ui.md`.
- Padrão visual igual a Dialog já consumido.

**Alternatives considered**:
- **Menu custom**: descarta — re-implementaria gerenciamento de foco e portal,
  duplicando o Radix.
- **`<details><summary>`**: descarta — sem foco visível, sem teclado adequado.

**Action**: Confirmar disponibilidade em `package.json`; se ausente, instalar
`@radix-ui/react-dropdown-menu` (≈14 KB gzipped).

---

## 10. Pattern de fundo nas novas surfaces

**Decision**:
- `AppShell` (zona fora de grupo) — mantém pattern.
- `GroupShell` (zona dentro de grupo) — pattern em opacidade reduzida (`0.06` claro /
  `0.09` escuro) por estar atrás de mais conteúdo denso.
- `GroupsModal`, `LeaveGroupConfirm` — **sem pattern por trás**: o overlay do Radix
  já cobre o fundo (§9.5 — "modais críticos").
- `InlineBetCard` em estado de input — pattern não interfere; manter normal.

**Rationale**:
- §9.4–9.5 do `doc/ui.md` estipula reduzir/remover o pattern quando o conteúdo é denso
  ou crítico (formulário, modal).
- A sidebar + header criam mais ruído visual; reduzir o pattern preserva contraste.

---

## 11. Acessibilidade da sidebar e do gear menu

**Decision**:
- Sidebar: `<nav aria-label="Navegação do grupo">`, items `<NavLink>` com
  `aria-current="page"` quando ativos.
- Gear: `<button aria-haspopup="menu" aria-expanded={open} aria-label="Ações do grupo">`.
- Foco visível via `--support` (`outline: 2px solid var(--support); outline-offset: 3px;`)
  conforme §13.2.

**Rationale**: Cumprir §13 do `doc/ui.md` e Constituição VI (Layout Consistency).

---

## 12. Telas de "Jogos", "Palpites", "Ranking", "Membros" como rotas separadas

**Decision**: Criar páginas dedicadas para cada destination da sidebar, reusando
componentes já existentes:
- `GroupJogosPage` → `<PhaseSelector>` + `<GroupStageGrid>` + `<KnockoutBracket>` já
  em `src/pages/matches/components/` (sem duplicar)
- `GroupPalpitesPage` → nova: lista os palpites do usuário neste grupo (consome
  `getGroupMatches` filtrado por `userBet !== null`)
- `GroupRankingPage` → reusa `<GroupRanking>` (componente existente)
- `GroupMembersPage` → reusa `<MemberList>` + `<InvitePanel>` (componentes existentes)
- `GroupSettingsPage` → reusa `<GroupSettings>` (já existe; apenas adiciona
  `<RoleGuard>` na rota)
- `GroupDetailsPage` → nova: identidade do grupo (avatar grande, nome, descrição,
  convite, pontuação) — agregado do `GroupHomeHero` atual

**Rationale**:
- DRY: componentes existentes são página-agnósticos e podem ser hospedados em rotas
  diferentes.
- Cada rota representa uma intent única do usuário, alinhada à Constituição IV
  ("Each file MUST have a single, clear reason to change").
- O `GroupDetailPage` atual é uma página agregada — ela é dissolvida nessas rotas;
  o componente é removido (ou reduzido a um redirect para `/home`).

---

## 13. Como o admin é determinado em runtime

**Decision**: `useActiveGroup()` retorna `role` da resposta de `GET /api/groups/:id`
(já existente — retorna `{ group, role }`). O `GroupSidebar` lê `useActiveGroup().isAdmin`
e renderiza a entrada "Configurações" condicionalmente. A página
`/groups/:id/configuracoes` tem um guard local:
```tsx
if (!isAdmin) return <Navigate to={`/groups/${groupId}`} replace />
```

**Rationale**:
- Assumption do spec: "A user's administrator role for the active group can be
  determined synchronously at render time and is stable for the duration of a screen".
- O cache do `getGroup(groupId)` já alimenta o role; sem re-fetch extra.
- Edge case #3 do spec ("admin demoted mid-session") fica coberto porque o `invalidateQueries`
  no servidor (ou em qualquer mutation que toque role) força refetch ao navegar.

---

## 14. Resumo de dependências NPM

| Pacote | Já presente? | Ação |
|--------|--------------|------|
| `@radix-ui/react-dialog` | ✅ Sim (`^1.1.14`) | Reusar (modal, leave confirm) |
| `@radix-ui/react-dropdown-menu` | ❓ Verificar | Instalar se ausente (uso: gear menu) |
| `framer-motion` | ✅ Sim (`^12.15.0`) | Reusar (transições) |
| `lucide-react` | ✅ Sim (`^0.511.0`) | Reusar (ícones: `Home`, `Trophy`, `MessageSquare`, `Award`, `Users`, `Settings`, `MoreVertical` (gear)) |
| `@tanstack/react-query` | ✅ Sim (`^5.80.5`) | Reusar |
| `react-router-dom` | ✅ Sim (`^7.6.0`) | Reusar (layout routes) |

---

## 15. Resumo das decisões críticas

1. **Last group** → `localStorage` per user, encapsulado em service.
2. **URL da home** → `/groups/:groupId`; rota `/` vira resolver.
3. **Layout do grupo** → novo `GroupShell` paralelo ao `AppShell`.
4. **Modal de grupos** → Radix Dialog; reutiliza Steps do create wizard.
5. **Sair do grupo** → `POST /api/groups/:id/leave`, item no gear menu.
6. **Matches com bets** → `GET /api/groups/:id/matches` (novo endpoint).
7. **Day-strip default** → today (local) ou próximo upcoming; passados ocultos.
8. **Progresso** → selector memoizado em cima do cache de matches.
9. **Gear menu** → Radix DropdownMenu (verificar/instalar).
10. **Pattern** → reduzido no `GroupShell`, removido em modais.

Todas as questões marcadas como *Assumptions* no `spec.md` agora têm decisão técnica.
Nenhum `NEEDS CLARIFICATION` remanescente.
