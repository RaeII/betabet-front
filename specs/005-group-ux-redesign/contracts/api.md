# API Contract Delta: Group UX Redesign

**Feature**: `005-group-ux-redesign` | **Date**: 2026-05-24
**Base**: [`specs/001-betabet-front/contracts/api.md`](../../001-betabet-front/contracts/api.md)

Este documento registra apenas as **alterações** em relação ao contrato base. Todos os
outros endpoints permanecem inalterados.

---

## Novos endpoints

### POST `/api/groups/:groupId/leave`

Membro autenticado deixa o grupo voluntariamente.

**Auth**: sessão válida; o caller MUST ser membro do grupo.

**Request body**: vazio.

**Response 200**:
```json
{ "ok": true }
```

**Errors**:

| Status | code             | Quando |
|-------:|------------------|--------|
| `401`  | `UNAUTHENTICATED` | Sessão inválida ou expirada |
| `403`  | `NOT_MEMBER`     | Usuário não pertence ao grupo |
| `404`  | `GROUP_NOT_FOUND`| `groupId` não existe |
| `409`  | `LAST_ADMIN`     | Usuário é o único admin e ainda há outros membros (precisa transferir admin antes — fora do escopo desta feature; UI desabilita o item preventivamente) |
| `500`  | `INTERNAL`       | Erro inesperado |

**Side-effects esperados no backend**:
- Remove a `GroupMembership` correspondente.
- Mantém `Bet` históricos do usuário no grupo (auditoria).
- Decrementa `BettingGroup.memberCount`.
- Não invalida `inviteCode` do grupo.

**Side-effects no client (`useLeaveGroup`)**:
- Em sucesso, chama `clearLastAccessedGroup(userId)` se este era o último grupo.
- Invalida `groupKeys.lists()` e `groupKeys.detail(groupId)`.
- Faz `navigate('/', { replace: true })` para o resolver decidir o próximo destino
  (próximo grupo disponível ou `/onboarding`).

---

### GET `/api/groups/:groupId/matches`

Retorna a lista completa de matches do torneio com o `userBet` do usuário no grupo
embutido. Substitui o workaround atual (`userBet: null` injetado no client).

**Auth**: sessão válida; o caller MUST ser membro do grupo.

**Query params**: nenhum.

**Response 200**:
```json
{
  "matches": [
    {
      "id": "string",
      "homeTeam": "Team",
      "awayTeam": "Team",
      "stadium": "Stadium",
      "scheduledAt": "string (ISO 8601 UTC)",
      "status": "'upcoming' | 'live' | 'finished' | 'cancelled'",
      "phase": "'group' | 'r16' | 'qf' | 'sf' | 'final'",
      "groupName": "string | null",
      "matchday": "number | null",
      "homeScore": "number | null",
      "awayScore": "number | null",
      "userBet": "Bet | null"
    }
  ]
}
```

Onde `Bet` segue exatamente o tipo `Bet` em `src/types/bet.types.ts`:

```json
{
  "id": "string",
  "matchId": "string",
  "userId": "string",
  "groupId": "string",
  "homeScore": "number",
  "awayScore": "number",
  "resultPoints": "number | null",
  "exactScorePoints": "number | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Errors**:

| Status | code             | Quando |
|-------:|------------------|--------|
| `401`  | `UNAUTHENTICATED` | Sessão inválida |
| `403`  | `NOT_MEMBER`     | Usuário não pertence ao grupo |
| `404`  | `GROUP_NOT_FOUND`| `groupId` não existe |
| `500`  | `INTERNAL`       | Erro inesperado |

**Cache hints** (cliente):
- `staleTime: 30_000` ms (mesma cadência do ranking)
- Invalida em: `usePlaceBet`, `useEditBet`, `useLeaveGroup`, `useJoinByCode`
  (este último só se passar a fazer parte do grupo)

---

## Endpoints reutilizados sem alteração

| Endpoint | Uso na feature |
|----------|----------------|
| `GET /api/groups` | `useUserGroups` — fonte do "Seus grupos" do modal, lista de membros, e validação do `lastAccessedGroup` |
| `GET /api/groups/:id` | `useGroup` → fornece `role` para mostrar/ocultar Configurações na sidebar |
| `POST /api/groups` | `GroupsModalCreate` reusa para criar grupo dentro do modal (campos: `name`, `emoji`, `coverUrl`, `resultPoints`, `exactScorePoints`, `joinMode`, `showBetsBeforeKickoff`) |
| `POST /api/bets` | `InlineBetCard` envia palpite (`matchId`, `groupId`, `homeScore`, `awayScore`, `replicateToAllGroups: false`) |
| `PUT /api/bets/:betId` | `InlineBetCard` em modo edição |
| `GET /api/groups/:id/ranking` | `GroupRankingPage` |
| `GET /api/groups/:id/members` | `GroupMembersPage` |
| `GET /api/groups/invite/:code` | (sem mudança) |
| `POST /api/groups/:id/join` | (sem mudança) |

---

## Endpoints NÃO usados nesta feature

- `DELETE /api/groups/:id/members/:userId` — continua disponível para admins removerem
  membros (página `/membros`), **NÃO** é o caminho de "Sair do grupo".

---

## Resumo

- **2 endpoints novos**: `POST /api/groups/:id/leave`, `GET /api/groups/:id/matches`.
- **0 endpoints removidos**.
- **0 endpoints com breaking change** — `GET /api/matches` continua existindo para
  páginas globais (`/jogos` reusa as estruturas atuais; o novo `getGroupMatches`
  cobre apenas o contexto de grupo).
