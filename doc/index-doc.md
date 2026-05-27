# Índice da documentação

Este índice referencia os documentos manuais do frontend. Sempre que um novo arquivo for criado em `doc/`, adicione uma entrada aqui com o objetivo do documento e os principais temas cobertos.

## Documentos

### [001-referral.md](./001-referral.md)

Documenta como o frontend lida com referral, links de indicação e recursos bloqueados por indicação.

Principais temas:

- dados de referral vindos do auth e de `GET /api/referral`, incluindo o crédito inicial de 1 indicação;
- normalização da resposta em `src/services/referral.service.ts`;
- link pessoal de indicação (`/?ref=<referralCode>`);
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

### [003-bet-replication.md](./003-bet-replication.md)

Documenta o toggle de replicação em cada card de partida e como ele controla a replicação do palpite para os demais grupos do usuário.

Principais temas:

- toggle por card de grupo, no canto inferior esquerdo, com estado vindo de `userBet.replicate` (default ligado);
- comportamento de ligado (replica) vs desligado (opt-out, só este grupo);
- decisão entre `usePlaceBet` (POST) e `useEditBet` (PUT) e o envio do flag;
- campo `replicate` em `Bet` e a aposta otimista em `useBets`;
- arquivos do frontend envolvidos e pontos de atenção (estado vem do servidor, opt-out exige salvar).

### [ui.md](./ui.md)

Documenta a direção visual e as regras de UI do frontend.

Principais temas:

- tokens de cor, superfícies, tipografia e espaçamento;
- padrões de componentes e layouts;
- estados de foco, erro e feedback;
- responsividade e consistência visual.
