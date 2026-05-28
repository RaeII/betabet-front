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
com placar/status. Estados visuais:

| Estado     | Botão                              | Auxiliar                        |
|------------|------------------------------------|---------------------------------|
| `idle`     | `+ Cadastrar` (variant `primary`)  | —                               |
| `loading`  | `⟳ Cadastrando…` (disabled)        | —                               |
| `done`     | `✓ Cadastrada` (variant `secondary`, disabled) | `Match ID <id>` mono abaixo |
| `error`    | `+ Cadastrar` (clicável novamente) | mensagem em vermelho (10px)     |

O estado é **local ao componente** (não usa React Query mutate) — basta um
`useState` de `RegState`. O motivo é simplicidade: a página é uma ferramenta
interna, não precisa de cache global de "fixtures já cadastrados", e cada
linha é independente. Recarregar a página reseta o botão para `idle`.

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

Tudo dentro do componente `FixtureRow` em
`src/pages/admin/AdminApiFootballExplorerPage.tsx`. Não criamos arquivo
novo — o botão é específico do explorer e o resto do `FixtureRow` permanece
inalterado.

A página não tem aba nova nem entrada de menu nova: o cadastro é uma ação
contextual dentro do explorer existente. O explorer já mostra IDs de liga,
time e fixture, então o admin já tem o contexto que precisa para decidir
"vou cadastrar essa para testar".

---

## Service

`src/services/apiFootballExplorer.service.ts` ganhou um wrapper único:

```ts
registerFriendlyMatch(apiFixtureId: number): Promise<RegisterFriendlyMatchResponse>
```

`RegisterFriendlyMatchResponse` é uma projeção dos campos que a UI usa
(`match.id`, `match.scheduledAt`, etc. + `league` para contexto). O backend
retorna mais campos, que são ignorados (mesmo padrão de `ApiFootballLeague`
e `ApiFootballFixture`).

Usa `apiPost` de `src/services/api.ts`, que injeta `credentials: 'include'`
para enviar o cookie `admin_token` e mapeia erros para `ApiRequestError`.

---

## Arquivos relevantes no frontend

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/admin/AdminApiFootballExplorerPage.tsx` | Botão **Cadastrar** + estados locais por `FixtureRow` |
| `src/services/apiFootballExplorer.service.ts` | `registerFriendlyMatch(apiFixtureId)` + tipo `RegisterFriendlyMatchResponse` |
| `src/services/api.ts` | `apiPost`, `ApiRequestError` (reusados sem alteração) |
| `src/components/ui/button.tsx` | variants `primary` / `secondary`, size `sm` (reusado) |

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

- **Indicador "Já cadastrada" persistente** — hoje o estado é só
  `useState` local. Para mostrar o badge mesmo após reload, seria preciso
  um `GET /admin/friendly-matches?league=...` que devolvesse os
  `apiFixtureId` já gravados (similar ao `preview` da Copa).
- **Link "Ver na lista de partidas"** após `done`, levando o admin direto
  para `/admin/matches?id=<matchId>` para conferir.
- **Botão "Remover"** alinhado a um eventual `DELETE
  /admin/friendly-matches/:id` (ver doc do backend).
- **Indicador de progresso** em cadastro de múltiplos fixtures consecutivos
  (fila com retry automático no caso de rate-limit upstream).
