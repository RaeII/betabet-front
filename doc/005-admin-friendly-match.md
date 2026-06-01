# 005 - Admin · Cadastrar Partida de Outra Liga

## Objetivo

Documenta o botão **Cadastrar** que aparece em cada `FixtureRow` da página
`/admin/explorer` (`AdminApiFootballExplorerPage`). Esse botão chama o
backend para gravar a partida (de qualquer liga, exceto Copa) na tabela
`match` local — permitindo testar a infra de jogos ao vivo, palpites e
cálculo de pontos antes do início da Copa, reaproveitando todo o pipeline
do módulo `match`.

A regra de negócio e o endpoint estão documentados em
[`betabet/Doc/005-admin-friendly-match.md`](../../betabet/Doc/005-admin-friendly-match.md).

---

## Comportamento

O botão fica na coluna da direita de cada `FixtureRow`, alinhado verticalmente
com placar/status. Clicar abre um **modal de seleção de grupos** (`Modal`):
um checklist de todos os grupos (via `GET /admin/groups`, carregado quando o
modal abre) com o texto *"Nenhum selecionado = aparece em todos os grupos"*.
Confirmar dispara o `POST` com os `groupIds` escolhidos. Estados do botão:

| Estado     | Botão                              | Auxiliar                        |
|------------|------------------------------------|---------------------------------|
| `idle`     | `+ Cadastrar` (variant `primary`) → abre o modal | —                 |
| `loading`  | `⟳ Cadastrando…` (disabled)        | —                               |
| `done`     | `✓ Cadastrada` (variant `secondary`, disabled) | `Match ID <id>` mono abaixo |
| `error`    | `+ Cadastrar` (clicável novamente) | mensagem em vermelho (10px)     |

O estado é **local ao componente** (não usa React Query mutate) — basta um
`useState` de `RegState` + `pickerOpen`/`selectedGroups`. A página é uma
ferramenta interna; recarregar reseta o botão para `idle`.

### Tratamento de erros

| Backend            | UI                                   |
|--------------------|--------------------------------------|
| `409` (duplicada)  | mensagem "Já cadastrada"             |
| `422` (é da Copa)  | repassa `error.message`              |
| `404` (não existe) | repassa `error.message`              |
| outro              | "Falha ao cadastrar"                 |

A discriminação de status usa `ApiRequestError` exportado de
`@/services/api`.

---

## Onde a UI vive

O **cadastro** (botão + modal de grupos) fica dentro do `FixtureRow` em
`src/pages/admin/AdminApiFootballExplorerPage.tsx` — ação contextual no
explorer existente.

O **gerenciamento** (ver lista + excluir) tem página própria:
`src/pages/admin/AdminTestMatchesPage.tsx`, em `/admin/test-matches`, com
item **"Partidas de teste"** (ícone `FlaskConical`) no `adminNav` do
`AdminShell`. Lista cada partida de teste com times, data, status, placar,
nº de palpites e chips dos grupos-alvo ("Todos os grupos" quando vazio). O
botão de lixeira abre `ConfirmDialog` → `deleteMatch(id)` (mesmo
`DELETE /admin/matches/:id` da página de Partidas) → invalida as queries
`['admin','test-matches']` e `['admin','matches']` + toast.

---

## Service

`src/services/apiFootballExplorer.service.ts`:

```ts
registerFriendlyMatch(apiFixtureId: number, groupIds?: string[]): Promise<RegisterFriendlyMatchResponse>
```

`groupIds` vazio = global; com grupos = restrita. A response inclui
`targetGroupIds`.

`src/services/admin.service.ts` ganhou:

```ts
listAdminGroups(): Promise<{ groups: AdminGroup[] }>     // GET /api/admin/groups
getTestMatches(): Promise<{ matches: TestMatch[] }>      // GET /api/admin/friendly-matches
deleteMatch(matchId): Promise<void>                      // (já existia) DELETE /api/admin/matches/:id
```

Tudo usa `apiGet`/`apiPost`/`apiDelete` de `src/services/api.ts`
(`credentials: 'include'` + `ApiRequestError`).

---

## Arquivos relevantes no frontend

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/admin/AdminApiFootballExplorerPage.tsx` | Botão **Cadastrar** + modal de seleção de grupos por `FixtureRow` |
| `src/pages/admin/AdminTestMatchesPage.tsx` | Página "Partidas de teste": lista + excluir |
| `src/pages/admin/AdminShell.tsx` · `src/router/index.tsx` | Item de menu + rota `/admin/test-matches` |
| `src/services/apiFootballExplorer.service.ts` | `registerFriendlyMatch(apiFixtureId, groupIds)` + `RegisterFriendlyMatchResponse` |
| `src/services/admin.service.ts` | `listAdminGroups`, `getTestMatches`, `deleteMatch` |
| `src/components/ui/{modal,confirm-dialog,button}.tsx` | `Modal`, `ConfirmDialog`, `Button` (reusados) |

---

## Pontos de atenção

- **Não é "Importar Partidas"** (esse fluxo é da Copa, em
  `AdminImportMatchesPage`). O botão aqui chama um endpoint diferente que
  rejeita o ID da liga da Copa com 422.
- **Sessão admin obrigatória.** Sem `admin_token`, o `POST` volta 401 — o
  `AdminGuard` já garante a sessão antes do componente montar.
- **Sem invalidação de query.** Os matches cadastrados aparecem em
  `GET /matches` (página de palpites), mas a página de explorer não exibe
  essa lista — não há cache para invalidar aqui. Se o admin abrir outra aba
  com a lista de partidas, ela se atualiza pelo `staleTime` normal.
- **Estado se perde no `re-render` da lista.** Se o admin trocar a liga
  selecionada e voltar, a `FixtureRow` é remontada e o estado volta a
  `idle` — mas o backend mantém a partida (e o próximo clique vai retornar
  409 → "Já cadastrada").

---

## Pontos de alteração futura

- **Indicador "Já cadastrada" persistente** — hoje o estado é só `useState`
  local; cruzar os `apiFixtureId` já gravados (via `GET /admin/friendly-matches`)
  marcaria o botão mesmo após reload.
- **Editar grupos-alvo** na página "Partidas de teste" — hoje é só ver +
  excluir; os grupos são definidos só no cadastro.
- **Indicador de progresso** em cadastro de múltiplos fixtures consecutivos
  (fila com retry automático no caso de rate-limit upstream).
