# 011 - Admin · Campeão da Copa

## Objetivo

Documenta a página de admin **Campeão da Copa** (`/admin/champion`), que permite
ao administrador do sistema definir o time campeão do mundial e liquidar
automaticamente todas as apostas de campeão registradas em todos os grupos.

A regra de negócio e os endpoints estão documentados no backend em
`Doc/014-champion-bet.md`.

---

## Comportamento

Acessível em **`/admin/champion`** (lazy route, dentro do `AdminShell`).
O sidebar do admin tem um item **"Campeão"** com o ícone `Crown`, entre
"Seleções" e "API-Football Explorer".

### Banner do campeão atual

Quando já existe um campeão definido, exibe no topo da página um banner
destacado (fundo `--brand/10`, borda `--brand/30`) com:

- ícone `Crown` na cor `--brand`;
- bandeira e nome do time campeão;
- data e hora da liquidação (`settled_at` formatado em `pt-BR`);
- botão **"Remover campeão"** (variante `destructive`, ícone `Trash2`) alinhado
  à direita, que abre o `ConfirmDialog` de reversão.

Enquanto nenhum campeão estiver definido, o banner não aparece.

### Grade de seleções

Busca a lista completa de seleções via `GET /api/admin/teams` (React Query,
chave `['admin', 'teams']`, cache compartilhado com a página de Seleções) e
exibe cada time como um **card clicável** em grade responsiva
(`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`).

Cada card contém bandeira (`TeamFlagImage`) + nome truncado. O card do campeão
atual recebe um ícone `Crown` à direita. O card selecionado recebe borda
`--brand` e fundo `--brand/10`.

### Campo de busca

Input com ícone `Search` à esquerda filtra a grade em tempo real
(`toLowerCase`) pelo nome da seleção. Não dispara nenhuma requisição extra —
filtra o array já carregado.

### Botão de confirmação

Localizado no rodapé direito da página:

- desabilitado quando nenhuma seleção está selecionada;
- desabilitado quando a seleção escolhida já é o campeão atual (evita
  re-execução acidental sem necessidade);
- exibe o nome da seleção escolhida: **"Definir {nome} como campeão"**;
- ao clicar, abre o `ConfirmDialog`.

### ConfirmDialog

Modal de confirmação (`ConfirmDialog`) com texto:

> Confirmar "{nome}" como campeão? Isto liquidará todas as apostas de campeão
> em todos os grupos.

Durante a chamada ao backend o botão mostra **"Liquidando…"** e a interação
com o modal é bloqueada.

### Feedback

Ao receber a resposta `200` do backend, um toast de sucesso exibe:

> Campeão definido! N aposta(s) liquidada(s).

Erros de rede ou `ApiRequestError` exibem um toast de erro com a mensagem do
servidor.

### Remover campeão (reversão)

O botão **"Remover campeão"** no banner abre um segundo `ConfirmDialog`:

> Remover o campeão "{nome}"? Isto zera os pontos de campeão de todas as
> apostas — todos os usuários perdem os pontos ganhos no ranking.

Durante a chamada o botão mostra **"Removendo…"**. Ao receber `200`, um toast
de sucesso exibe **"Campeão removido. N aposta(s) revertida(s)."**, e a query
`['admin', 'champion']` é invalidada (o banner some). Útil principalmente para
**testes** — reverte a liquidação e permite redefinir o campeão depois.

---

## Liquidação (backend)

O `POST /api/admin/tournament/champion` é **idempotente**: pode ser refeito para
corrigir o campeão ou recomputar pontos caso as configurações de algum grupo
tenham mudado após a liquidação inicial. O campo `betsSettled` da resposta
indica quantas apostas foram atualizadas.

Cada aposta de campeão recebe:

| Cenário | Pontos atribuídos |
|---------|-------------------|
| Grupo com modalidade desabilitada | `0` |
| 1º palpite == time campeão | `champion_first_points` do grupo (padrão 15) |
| 2º palpite == time campeão | `champion_second_points` do grupo (padrão 10) |
| Nenhum palpite acertou | `0` |

Os pontos são somados ao `total_points` do ranking de cada grupo via subquery
correlacionada em `GroupDatabase.rankingByGroup`.

---

## Estado e dados

```ts
// React Query keys
['admin', 'teams']      // GET /api/admin/teams (compartilhado com AdminTeamsPage)
['admin', 'champion']   // GET /api/admin/tournament/champion
```

Ambas as queries são lançadas em paralelo (`useQuery`). O campeão atual é
buscado novamente via `invalidateQueries` após uma definição bem-sucedida.

---

## Service

Funções adicionadas em `src/services/admin.service.ts`:

```ts
getChampion(): Promise<ChampionState>
// GET /api/admin/tournament/champion
// { championTeamId: string | null, settledAt: string | null }

setChampion(championTeamId: number): Promise<SetChampionResult>
// POST /api/admin/tournament/champion { championTeamId }
// { championTeamId: string, betsSettled: number }

removeChampion(): Promise<RemoveChampionResult>
// DELETE /api/admin/tournament/champion
// { betsReset: number }
```

Tipos em `src/types/admin.types.ts`:

```ts
interface ChampionState {
  championTeamId: string | null
  settledAt: string | null
}

interface SetChampionResult {
  championTeamId: string
  betsSettled: number
}

interface RemoveChampionResult {
  betsReset: number
}
```

---

## Arquivos relevantes no frontend

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/admin/AdminChampionPage.tsx` | Página completa (banner, busca, grade, botão, ConfirmDialog) |
| `src/services/admin.service.ts` | `getChampion` e `setChampion` |
| `src/types/admin.types.ts` | `ChampionState` e `SetChampionResult` |
| `src/router/index.tsx` | Rota lazy `/admin/champion` dentro do `AdminShell` |
| `src/pages/admin/AdminShell.tsx` | Item "Campeão" com ícone `Crown` no sidebar admin |

Componentes reutilizados (sem alteração): `TeamFlagImage`, `Button`, `Input`,
`ConfirmDialog`, `useToast`, `cn`, `apiPost`, `ApiRequestError`.

---

## Pontos de atenção

- **A liquidação não é automática.** O backend não tem cron para derivar o
  campeão da final — a final pode terminar nos pênaltis e o placar empate não
  identifica o vencedor. O admin sempre executa a ação manualmente.
- **Idempotente por design.** Re-executar recalcula os pontos conforme a
  config de `champion_first_points` / `champion_second_points` de cada grupo
  no momento da chamada.
- **O banner de campeão atual usa o cache `['admin', 'teams']`** para resolver
  o nome e a bandeira do time a partir do `championTeamId` — se as seleções
  ainda não estiverem carregadas, o banner não aparece até a query terminar.
- **Sessão admin obrigatória.** As rotas do tournament exigem o cookie
  `admin_token`. Sem login admin o `AdminGuard` redireciona para `/admin/login`.

---

## Pontos de alteração futura

- **Derivar o campeão automaticamente** da final (com tratamento de pênaltis),
  mantendo o override manual do admin — documentado no backend em `014 §10`.
- **Recompute automático** ao alterar `champion_first_points` /
  `champion_second_points` de um grupo após a Copa encerrar, sem exigir
  nova execução do endpoint admin.
- **Histórico de liquidações** — exibir log de quando o campeão foi definido
  (ou alterado) e quantas apostas foram afetadas a cada vez.
- **Notificação em lote** — disparar push/email para os membros dos grupos
  informando o campeão e os pontos ganhos.
