# 001 - Referral no frontend

## Objetivo

Este documento registra como o frontend do Betabet monta e exibe links de indicação, especialmente nos recursos bloqueados por indicação.

A regra funcional vem do backend: o usuário libera recursos premium quando atinge 3 indicações aceitas. No frontend, essa regra aparece como:

```txt
referralCount >= 3
chartUnlocked = true
```

O frontend não decide se o usuário pode ver palpites de outras pessoas. Ele respeita o `canView` retornado por `GET /api/groups/:groupId/matches/:matchId/bets`.

## Dados usados

O usuário autenticado já recebe estes campos no auth:

- `user.referralCode`: código próprio de indicação.
- `user.referralCount`: total de indicações aceitas.
- `user.chartUnlocked`: `true` quando o usuário já atingiu 3 indicações.

O endpoint `GET /api/referral` também retorna dados do programa. O backend responde no formato:

```json
{
  "referral": {
    "referralCode": "ABC12345",
    "referralCount": 2,
    "chartUnlocked": false,
    "referredUsers": []
  }
}
```

O frontend normaliza isso em `src/services/referral.service.ts` para:

```ts
{
  code: string
  link: string
  count: number
  isUnlocked: boolean
  referredUsers: ReferredUser[]
}
```

## Links de indicação

### Link pessoal

O link pessoal usa somente o código do usuário:

```txt
/?ref=<referralCode>
```

Esse link não abre a página de cadastro diretamente. Se a pessoa já estiver logada,
o app mostra um modal informando que a indicação não pode ser aplicada em conta
existente. Se não estiver logada, ela cai no login com o `ref` preservado e pode
criar uma nova conta pelo link de cadastro.

### Link do grupo com indicação

O convite de grupo vem de `group.inviteCode`. Para convidar alguém para um grupo e atribuir a indicação ao usuário atual, o frontend monta:

```txt
/invite/<inviteCode>?ref=<referralCode>
```

Esse formato preserva as duas intenções:

- `inviteCode`: identifica o grupo que a pessoa deve entrar.
- `referralCode`: identifica quem indicou a pessoa.

Quando o visitante não autenticado abre `/invite/:code?ref=<referralCode>`, a página de convite envia para:

```txt
/auth/login?ref=<referralCode>&invite=<inviteCode>
```

Depois que a conta é criada, `RegisterPage` redireciona de volta para:

```txt
/invite/<inviteCode>
```

Assim o usuário cadastrado consegue concluir a entrada no grupo.

## Componente reutilizável

Recursos bloqueados por indicação devem usar:

```txt
src/components/referral/ReferralUnlockPanel.tsx
```

O componente mostra:

- número atual de indicações;
- barra de progresso até 3 indicações;
- texto com quantas indicações faltam;
- link pessoal de indicação;
- link do grupo com `?ref=<referralCode>`, quando `groupInviteCode` for informado.

Exemplo de uso:

```tsx
<ReferralUnlockPanel
  featureName="a visualização de palpites"
  referralCount={referralCount}
  referralCode={referralCode}
  groupInviteCode={groupInviteCode}
/>
```

## Arquivos principais

- `src/components/referral/ReferralUnlockPanel.tsx`
  - Painel reutilizável para recursos bloqueados por indicação.

- `src/pages/home/components/MatchBetsModal.tsx`
  - Usa o painel quando `canView=false` no modal de palpites.

- `src/pages/match-detail/components/BetsGrid.tsx`
  - Usa o mesmo painel na página de detalhe da partida quando a lista de apostas está bloqueada.

- `src/services/referral.service.ts`
  - Normaliza a resposta de `GET /api/referral`.
  - Envia `POST /api/referral/apply` com `{ referralCode }`, formato esperado pelo backend.

- `src/hooks/useReferral.ts`
  - Expõe `useReferralInfo(enabled)` para buscar dados de referral sob demanda.

- `src/pages/invite/InvitePage.tsx`
  - Preserva `?ref=<referralCode>` quando envia um visitante não autenticado para login.
  - Mostra o aviso de indicação para contas existentes quando o visitante já está autenticado.

- `src/pages/auth/RegisterPage.tsx`
  - Lê `ref` para preencher o código de indicação.
  - Lê `invite` para voltar ao convite de grupo depois do cadastro.

- `src/components/referral/ReferralApplyHost.tsx`
  - Não aplica indicação automaticamente em contas existentes.
  - Mostra modal informando se o usuário já possui indicação ou se a indicação é apenas para novas contas.

## Cuidados

- Não usar o `inviteCode` do grupo como código de indicação.
- Não montar links de grupo sem preservar `?ref=<referralCode>` quando a intenção for também contar indicação.
- Não duplicar a regra de desbloqueio no front. O backend continua sendo a fonte de verdade para `canView`.
- Para novos recursos bloqueados, reutilizar `ReferralUnlockPanel` em vez de criar um card novo.
