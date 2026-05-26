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

### [ui.md](./ui.md)

Documenta a direção visual e as regras de UI do frontend.

Principais temas:

- tokens de cor, superfícies, tipografia e espaçamento;
- padrões de componentes e layouts;
- estados de foco, erro e feedback;
- responsividade e consistência visual.
