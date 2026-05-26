# 002 - Solicitações de membros no frontend

## Objetivo

Este documento registra como o frontend exibe, notifica e processa solicitações de entrada em grupos.

O backend continua sendo a fonte de verdade para permissões. O frontend apenas consulta solicitações pendentes, mostra indicadores visuais para admins e envia a ação de aprovação ou recusa.

## Endpoints usados

### Listar solicitações pendentes

```txt
GET /api/groups/:groupId/requests
```

Usado por admins para carregar os pedidos pendentes do grupo ativo.

Resposta esperada:

```ts
{
  requests: JoinRequest[]
}
```

Cada `JoinRequest` contém:

- `id`: identificador da solicitação.
- `groupId`: grupo da solicitação.
- `userId`: usuário solicitante.
- `user`: dados básicos do usuário (`id`, `name`, `avatarUrl`).
- `createdAt`: data da solicitação.

### Aprovar ou recusar

```txt
PUT /api/groups/:groupId/requests/:requestId
Body: { action: "approve" | "reject" }
```

Ao aprovar, o backend adiciona o usuário como membro e remove a solicitação pendente.
Ao recusar, o backend apenas remove a solicitação pendente.

## Hooks

Os hooks ficam em:

```txt
src/hooks/useGroups.ts
```

### `useJoinRequests(groupId, isAdmin)`

Busca solicitações pendentes do grupo.

Regras:

- só executa quando existe `groupId` e `isAdmin=true`;
- atualiza automaticamente a cada 30 segundos para admins;
- usa a query key `groupKeys.requests(groupId)`.

### `useHandleJoinRequest(groupId)`

Envia aprovação ou recusa.

Depois de uma ação bem-sucedida, invalida:

- `groupKeys.requests(groupId)`: remove a solicitação processada da UI;
- `groupKeys.members(groupId)`: atualiza a lista de membros após aprovação.

## Reconhecimento de admin

O hook central fica em:

```txt
src/hooks/useActiveGroup.ts
```

O frontend considera o usuário admin quando:

- o backend retorna `role: "admin"` em `GET /api/groups/:groupId`; ou
- o usuário autenticado é o criador/admin do grupo (`group.adminId === user.id`).

Esse fallback evita esconder controles de admin quando o grupo já carregou mas o campo `role` ainda não está disponível.

## Página de membros

A página fica em:

```txt
src/pages/groups/GroupMembersPage.tsx
```

Ela contém:

- seção de convite com o link do grupo;
- aba `Membros`;
- aba `Solicitações` para admins;
- lista de solicitações pendentes;
- botões `Aprovar` e `Recusar`.

A aba pode ser aberta diretamente pela query string:

```txt
/groups/:groupId/membros?tab=requests
```

Esse formato é usado pelos badges de notificação para levar o admin direto à lista de solicitações pendentes.

Se o grupo ainda não carregou, a página mostra `Carregando membros…`.
Se o grupo carregou mas o papel do usuário ainda não foi resolvido, a página renderiza como membro comum até o admin ser identificado.

## Notificação na navegação

A notificação aparece no item `Membros` quando existem solicitações pendentes.

Arquivos:

```txt
src/components/layout/GroupSidebar.tsx
src/components/layout/GroupMobileNav.tsx
```

Comportamento:

- só consulta solicitações para admins;
- usa a quantidade de `requests.length`;
- mostra badge vermelho usando `--danger`;
- usa formato redondo (`rounded-full`) com dimensão fixa;
- limita texto visual em `99+` quando houver mais de 99 solicitações.
- quando há solicitações pendentes, o link de `Membros` aponta para `/groups/:groupId/membros?tab=requests`.

No desktop, o badge aparece à direita do item `Membros`.
No mobile, o badge aparece sobre o ícone de `Membros`.
Ao clicar no item com badge, o admin entra diretamente na aba `Solicitações`.

## Painel de convite

O painel de convite fica em:

```txt
src/pages/group-detail/components/InvitePanel.tsx
```

Ele mostra apenas o link de convite e a ação de copiar.

As solicitações pendentes não ficam mais nesse painel para evitar duplicidade. O fluxo de aprovação pertence à aba `Solicitações` da página de membros.

## Testes relacionados

Arquivos:

```txt
tests/integration/pages/GroupMembersPage.test.tsx
tests/integration/layout/GroupSidebar.test.tsx
tests/integration/layout/GroupMobileNav.test.tsx
tests/unit/hooks/useActiveGroup.test.ts
```

Cobertura principal:

- admin vê a aba `Solicitações`;
- query `?tab=requests` abre a aba `Solicitações` diretamente;
- membro comum não vê a aba;
- aprovação chama `useHandleJoinRequest` com `{ action: "approve" }`;
- a página não fica em branco quando `role` ainda está ausente;
- sidebar desktop e nav mobile mostram badge e linkam para `?tab=requests` quando há solicitações;
- `useActiveGroup` deriva admin via `role` e via `group.adminId`.

## Cuidados

- Não duplicar a lista de solicitações fora da aba `Solicitações`.
- Não buscar `GET /requests` para membros comuns.
- Não decidir permissão final no frontend; o backend deve bloquear ações não autorizadas.
- Ao mudar a regra de admin no backend, revisar `useActiveGroup`.
- Ao mudar o estilo de notificação, manter badge legível em tema claro e escuro.
