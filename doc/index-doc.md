# Índice da documentação

Este índice referencia os documentos manuais do frontend. Sempre que um novo arquivo for criado em `doc/`, adicione uma entrada aqui com o objetivo do documento e os principais temas cobertos.

## Documentos

### [001-referral.md](./001-referral.md)

Documenta como o frontend lida com referral, links de indicação e recursos bloqueados por indicação.

Principais temas:

- dados de referral vindos do auth e de `GET /api/referral`;
- normalização da resposta em `src/services/referral.service.ts`;
- link pessoal de indicação (`/auth/register?ref=<referralCode>`);
- link de convite do grupo com indicação (`/invite/<inviteCode>?ref=<referralCode>`);
- preservação de `ref` e `invite` no fluxo de cadastro;
- uso do componente reutilizável `ReferralUnlockPanel`;
- arquivos do frontend envolvidos no modal de palpites e em outros recursos bloqueados.

### [002-group-member-requests.md](./002-group-member-requests.md)

Documenta como o frontend exibe solicitações de entrada em grupos, notifica admins e processa aprovação ou recusa.

Principais temas:

- endpoints `GET /api/groups/:groupId/requests` e `PUT /api/groups/:groupId/requests/:requestId`;
- hooks `useJoinRequests` e `useHandleJoinRequest`;
- reconhecimento de admin via `role` e `group.adminId`;
- aba `Solicitações` em `GroupMembersPage`;
- badge vermelho no menu `Membros` da sidebar desktop e navegação mobile;
- invalidação de queries de solicitações e membros após aprovação ou recusa;
- testes relacionados ao fluxo de solicitações.

### [ui.md](./ui.md)

Documenta a direção visual e as regras de UI do frontend.

Principais temas:

- tokens de cor, superfícies, tipografia e espaçamento;
- padrões de componentes e layouts;
- estados de foco, erro e feedback;
- responsividade e consistência visual.
