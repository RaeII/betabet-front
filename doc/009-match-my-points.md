# 009 - Pontos do usuário (antes / durante / depois) + ranking ao vivo

## Objetivo

Documentar como o frontend exibe **quantos pontos o usuário está fazendo** em
uma partida dentro de um grupo — provisórios **durante** o jogo (placar ao
vivo) e definitivos **depois** (liquidados no banco) — e como esses pontos
alimentam o **ranking em tempo real** e pílulas reutilizáveis espalhadas pelo
app.

O sistema foi desenhado para que os pontos sejam **consultáveis em qualquer
tela** de forma prática: um único service + hooks centralizados, com query keys
compartilhadas que o React Query deduplica.

Companions no backend:

- pontos do usuário na partida: [`011-match-my-points.md`](../../betabet/Doc/011-match-my-points.md);
- liquidação automática + snapshot pós-jogo: [`010-match-postmatch.md`](../../betabet/Doc/010-match-postmatch.md).

Companions no frontend:

- bloco ao vivo da partida: [`007-match-live.md`](./007-match-live.md);
- bloco pós-jogo da partida: [`008-match-postmatch.md`](./008-match-postmatch.md).

---

## Fluxo de dados

```
services/matchPoints.service.ts          GET /api/matches/:matchId/my-points?groupId=
        │  getMatchMyPoints() → MatchMyPoints (espelha MatchMyPointsDTO)
services/groups.service.ts               GET /api/groups/:groupId/ranking/live
        │  getGroupLiveRanking() → GroupLiveRanking (provisório por usuário, todos)
        │
hooks/useMatchPoints.ts
        ├─ matchPointsKeys.detail(matchId, groupId)   ← chave única (dedup)
        ├─ useMatchMyPoints(matchId, groupId, enabled) ← 1 partida; polling esperto
        └─ useGroupLiveMyPoints(groupId)               ← soma provisórios do usuário (legado)
hooks/useRanking.ts
        └─ useGroupLiveRanking(groupId)                ← provisório de TODOS (overlay do ranking)
        │
components
        ├─ MatchPointsCard      (match-detail)   "Seus pontos" — bloco completo
        ├─ MatchPointsBadge     (reutilizável)   pílula compacta para listas/cards
        └─ GroupRanking         (group-detail)   overlay ao vivo (todos) + reordenação
        │
composição
        ├─ MatchDetailPage      → MatchPointsCard (contexto de grupo, live/finished)
        ├─ GroupRanking         → overlay com useGroupLiveRanking (todos os membros)
        ├─ GroupPalpitesPage    → MatchPointsBadge por palpite (live + confirmado)
        └─ MatchCard            → MatchPointsBadge (só ao vivo, contexto de grupo)
```

A regra de pontos vive **inteiramente no backend** (`computeBetPoints`, mesma
regra da liquidação SQL). O frontend nunca recalcula os pontos ao vivo — só
consome `matchPoints.total`. A única conta feita no front é somar os pontos
**já definitivos** que vêm no próprio palpite (`resultPoints +
exactScorePoints`), evitando uma requisição para partidas encerradas.

---

## Arquivos

| Arquivo                                                                                                       | Papel                                                                            |
|---------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| [`services/matchPoints.service.ts`](../src/services/matchPoints.service.ts)                                   | `getMatchMyPoints(matchId, groupId)` + tipos (`MatchMyPoints`, `MatchPointsState`) |
| [`hooks/useMatchPoints.ts`](../src/hooks/useMatchPoints.ts)                                                   | `useMatchMyPoints`, `useGroupLiveMyPoints`, `matchPointsKeys`, polling esperto   |
| [`pages/match-detail/components/MatchPointsCard.tsx`](../src/pages/match-detail/components/MatchPointsCard.tsx) | Bloco "Seus pontos" da `MatchDetailPage` (estados live/confirmado/provisório)    |
| [`components/match/MatchPointsBadge.tsx`](../src/components/match/MatchPointsBadge.tsx)                        | Pílula compacta de pontos, reutilizável em listas e cards                        |
| [`pages/group-detail/components/GroupRanking.tsx`](../src/pages/group-detail/components/GroupRanking.tsx)     | Ranking do grupo com overlay ao vivo + reordenação + botão de detalhes por linha |
| [`pages/group-detail/components/RankingBreakdownModal.tsx`](../src/pages/group-detail/components/RankingBreakdownModal.tsx) | Modal: partidas + palpite + pontos de um membro (validação), livre para todo membro |
| [`pages/match-detail/MatchDetailPage.tsx`](../src/pages/match-detail/MatchDetailPage.tsx)                     | Composição: renderiza `MatchPointsCard` no gate `showPoints`                     |
| [`pages/groups/GroupPalpitesPage.tsx`](../src/pages/groups/GroupPalpitesPage.tsx)                            | "Meus palpites": `MatchPointsBadge` por palpite                                  |
| [`components/match/MatchCard.tsx`](../src/components/match/MatchCard.tsx)                                     | Card genérico de partida: `MatchPointsBadge` (só ao vivo, quando há `groupId`)   |

---

## Service — `matchPoints.service.ts`

Espelha o `MatchMyPointsDTO` do backend (doc `011`) **1:1**, sem normalizações:

```ts
export type MatchPointsState = 'scheduled' | 'live' | 'finished'

export interface MatchMyPoints {
  matchId: string
  groupId: string
  groupName: string
  state: MatchPointsState
  liveScore: { home: number | null; away: number | null } | null   // placar usado no cálculo
  bet: { homeScore: number; awayScore: number } | null             // null se não apostou
  matchPoints: {
    result: number        // pontos por acerto de vencedor/empate (0 se acertou o placar exato)
    exactScore: number    // pontos por placar exato
    total: number         // result OU exactScore — não acumulam (placar exato substitui o resultado)
    confirmed: boolean    // true = liquidado no banco (definitivo)
  }
  totalBeforeMatch: number  // total confirmado no grupo, EXCLUINDO esta partida
  totalWithMatch: number    // totalBeforeMatch + matchPoints.total
}

export function getMatchMyPoints(matchId, groupId): Promise<MatchMyPoints>
  → apiGet(`/api/matches/${matchId}/my-points?groupId=${encodeURIComponent(groupId)}`)
```

`groupId` é **obrigatório** — o endpoint lê o palpite e os totais no contexto de
um grupo. Por isso pontos só existem em telas com `groupId`.

---

## Hooks — `useMatchPoints.ts`

### `matchPointsKeys` — chave única (fundamental para o dedup)

```ts
matchPointsKeys.detail(matchId, groupId) = ['match-points', matchId, groupId]
```

Tanto `useMatchMyPoints` quanto `useGroupLiveMyPoints` (e o `MatchPointsBadge`)
usam **a mesma chave**. Resultado: quando o ranking já está acompanhando uma
partida ao vivo e o usuário abre o card daquela partida, o React Query serve do
cache — **nenhuma requisição extra**.

### Polling esperto

```ts
function pointsRefetchInterval(data): number | false {
  if (!data) return false
  if (data.state === 'live') return 60_000
  if (data.state === 'finished' && !data.matchPoints.confirmed) return 60_000
  return false   // confirmado → para de pollar (valor definitivo)
}
```

Bate com a recomendação do backend (doc `011` → "Recomendação de polling"): o
`getLive` interno cacheia 2 min, então polls a 60 s são quase sempre cache hit.
Uma vez `confirmed=true`, o valor é imutável e o polling desliga.

### `useMatchMyPoints(matchId, groupId, enabled = true)`

Uma partida. `staleTime: 30s`, `refetchIntervalInBackground: false` (não pesa
com a aba em segundo plano), `enabled` permite gate por status no caller.

### `useGroupLiveMyPoints(groupId): GroupLivePoints`

Alimenta o overlay do ranking. Usa `useQueries` para buscar `/my-points` das
partidas **candidatas** (status `live` no banco, lidas de `useGroupMatches`) e
depois decide o que é ao vivo pelo `state` **autoritativo** de cada resposta:

```ts
const candidateMatches = (data?.matches ?? []).filter(m => m.status === 'live')
// ...useQueries por candidata...
const liveResults = results.filter(r => r.data?.state === 'live')
const liveDelta = liveResults.reduce((sum, r) => sum + (r.data?.matchPoints.total ?? 0), 0)

return { liveDelta, liveMatchCount: liveResults.length, hasLiveMatch: liveResults.length > 0 }
```

> **Por que `state === 'live'` e não `status === 'live'`?** O status do banco
> fica `live` desde o apito inicial até a liquidação do admin — inclusive na
> janela em que o jogo **já acabou** no upstream (FT/AET/PEN) mas ainda não foi
> liquidado. Filtrar só pelo status faria o overlay anunciar "partida em
> andamento" para um jogo encerrado. O `/my-points` resolve isso: ele consulta o
> upstream e devolve `state: 'finished'` nessa janela, então a partida sai do
> overlay. Os pontos provisórios dela aparecem no ranking quando a liquidação
> confirmar (o que ocorre logo em seguida).
>
> **Por que não some `confirmed`?** Pontos já confirmados entram no total do
> `GET /ranking` (que só soma confirmados); somá-los de novo contaria em dobro.
> Como `state === 'live'` sempre vem com `confirmed: false`, o filtro por `state`
> já garante isso — o overlay soma **apenas** o provisório que ainda não está no
> ranking.

---

## Componentes

### `MatchPointsCard` (match-detail)

Bloco completo "Seus pontos". Renderiza `null` antes do jogo
(`state === 'scheduled'` — o `BetForm` já cobre esse estado). Três estados
visuais via `stateMeta`:

| Estado                                | Badge        | Cor do número            | Legenda                          |
|---------------------------------------|--------------|--------------------------|----------------------------------|
| `live`                                | `● Ao vivo`  | `--brand`                | "ganhando agora — muda com o placar" |
| `finished` + `confirmed`              | `Confirmado` | verde (>0) / muted (0)   | "pontos garantidos nesta partida" |
| `finished` + `!confirmed`             | `Provisório` | `--brand`                | "aguardando confirmação"         |

Mostra: total com sinal (`+N pts`), palpite vs. placar ao vivo, chips de
breakdown (`Resultado +X` / `Placar exato +Y`, só quando `total > 0`) e o
rodapé `totalBeforeMatch → totalWithMatch`. Se o usuário não apostou, exibe
"nenhum ponto em jogo".

### `MatchPointsBadge` (reutilizável) — **novo**

Pílula compacta para listas e cards, com **dois caminhos de dado sem
desperdício**:

```ts
const isLive = status === 'live'
const { data } = useMatchMyPoints(matchId, groupId, isLive && !!groupId)

// Ao vivo  → provisório do endpoint (mesma queryKey → dedup com o ranking)
if (isLive) { ... data.matchPoints.total ... }

// Encerrada → pontos definitivos do próprio palpite, SEM rede
if (status === 'finished' && userBet?.resultPoints !== null) {
  total = userBet.resultPoints + (userBet.exactScorePoints ?? 0)
}
```

- **Por que só `status === 'live'` dispara a busca:** cobre tanto a partida em
  andamento quanto a janela entre o apito (upstream `FT`) e o tick de
  liquidação — nessa janela o status interno ainda é `live` e os pontos do
  palpite ainda não foram gravados. Depois de liquidar, o status vira
  `finished` e os pontos passam a vir do `userBet` (sem requisição).
- **Pílula provisória** (ao vivo): ponto pulsante amarelo + `+N pts`.
- **Pílula confirmada** (encerrada): verde se `> 0`, cinza/muted se `0`.

### `GroupRanking` — overlay ao vivo de TODOS + reordenação

Sobre o ranking confirmado do `GET /ranking`, aplica o `livePoints` de **cada
usuário** (vindo do endpoint group-wide `GET /ranking/live` via
`useGroupLiveRanking`) e **reordena em tempo real**:

```ts
const liveByUser = new Map((liveData?.live ?? []).map(e => [e.userId, e.livePoints]))
const sortedRows = ranking
  .map(e => {
    const livePoints = liveByUser.get(e.userId) ?? 0
    return { ...e, livePoints, projectedTotal: e.totalPoints + livePoints }
  })
  .sort((a, b) =>
    b.projectedTotal - a.projectedTotal ||
    a.userName.localeCompare(b.userName, 'pt-BR', { sensitivity: 'base' }))
// livePosition DENSA: mesmo total → mesma posição, sem pular (1,1,2,3,3,4)
let livePosition = 0, prevTotal = null
const rows = sortedRows.map(e => {
  if (prevTotal === null || e.projectedTotal !== prevTotal) { livePosition += 1; prevTotal = e.projectedTotal }
  return { ...e, livePosition }
})
```

- **Todos os membros têm prévia ao vivo** — o backend expõe os pontos
  provisórios por usuário do grupo em `GET /api/groups/:groupId/ranking/live`
  (calculados contra o placar ao vivo, mesma regra da liquidação). O `/ranking`
  segue só com confirmados; os dois conjuntos são disjuntos (sem dupla
  contagem — ver invariante 1).
- **Ranking denso + ordem alfabética**: jogadores com o mesmo total projetado
  **compartilham a posição** e a numeração não pula (ex.: 1,1,2,3,3,4); o
  desempate de **exibição** dentro do grupo empatado é o nome A→Z
  (case-insensitive). Mesma regra do backend (`toRankingEntries` + `ORDER BY
  total_points DESC, LOWER(name)`), então live e confirmado ficam coerentes.
- Banner ao vivo quando `hasLiveMatch` (jogo **realmente em andamento**, não só
  `status === 'live'` no banco — o backend confirma via `getLive().isLive`);
  seta `TrendingUp` para **qualquer** usuário que **subiu** posições
  (`livePosition < position`); `+livePoints` ao lado do total de cada linha. Sem
  partida em andamento o endpoint fica desabilitado → nenhum overlay, nenhuma
  reordenação: o ranking fica exatamente o confirmado do `/ranking`.

#### `useGroupLiveRanking(groupId)` — polling group-wide

Vive em [`hooks/useRanking.ts`](../src/hooks/useRanking.ts). `refetchInterval:
60_000` + `refetchIntervalInBackground: false` (pausa com a aba em segundo
plano). Como o hook vive dentro do `GroupRanking`, o polling só ocorre
**enquanto a tela do ranking está montada/aberta** — atende ao requisito de
atualizar automaticamente com o ranking aberto. **Polla sempre enquanto montado**
(não fica atrás de um gate de `useGroupMatches`), então uma partida que **comece
a rolar com a página já aberta** é detectada sozinha em até 60 s. É barato no
ocioso: o backend só roda uma query indexada por `status='live'` (vazia, sem
chamar a API-Football) e o front não aplica overlay (`hasLiveMatch=false`).
Substitui o antigo `useGroupLiveMyPoints` (que só somava o provisório do usuário
autenticado) no overlay do ranking.

---

## Composição

### `MatchDetailPage`

```ts
// Pontos só existem em contexto de grupo e com o jogo em andamento/encerrado.
const showPoints = !!groupId && !!matchId && (isLiveStatus || isFinishedView)

{showPoints
  ? <MatchPointsCard matchId={matchId} groupId={groupId} />
  : match.userBet
  ? /* fallback: só mostra o palpite */
  : null}
```

### `GroupPalpitesPage` ("Meus palpites")

Cada palpite passa a exibir, abaixo do placar palpitado, a `MatchPointsBadge`.
Tem `MatchWithUserBet` em mãos → o caminho **encerrado** usa o `userBet` (zero
rede) e o **ao vivo** usa o endpoint.

### `MatchCard` (grade de Jogos)

Renderiza a `MatchPointsBadge` **apenas** quando há `groupId` **e**
`status === 'live'`. Como a grade da fase de grupos pode ter dezenas de
partidas, e o `MatchCard` ali **não** tem `userBet`, foi uma decisão
deliberada **não** buscar `/my-points` por partida encerrada (seriam dezenas de
requests numa tela só). Ao vivo são poucas partidas e a chave deduplica com o
ranking — custo praticamente zero.

---

## Detalhamento no ranking (validação entre jogadores)

Cada linha do `GroupRanking` tem um botão de **detalhes** (`ChevronRight`) que
abre o `RankingBreakdownModal`: a lista de **todas** as partidas do grupo com o
**palpite daquele membro** e **quantos pontos** ele fez em cada uma — inclusive
as partidas que ele **não palpitou** (`userBet === null` → "Não palpitou"). O
objetivo é transparência: qualquer jogador consegue **conferir de onde vieram**
os pontos dos outros no ranking.

```
GroupRanking (linha)
        │ botão Detalhes → setTarget({ userId, userName, position, totalPoints })
        ▼
RankingBreakdownModal
        │ useGroupUserBreakdown(groupId, userId, open)
        ▼
services/groups.service.ts → getGroupUserBreakdown
        GET /api/groups/:groupId/users/:userId/breakdown → RankingBreakdown
```

- **Livre para qualquer membro do grupo.** O detalhamento do ranking **não**
  exige indicações — diferente do `MatchBetsModal`, que mantém o gate
  `chartUnlocked` (3 indicações). O backend devolve `canView: true` para todo
  membro e o modal nunca renderiza o `ReferralUnlockPanel`.
- **Pontos exibidos são os definitivos do palpite.** O modal lê
  `userBet.resultPoints + userBet.exactScorePoints` (mesma fonte do caminho
  encerrado do `MatchPointsBadge`) — `null` enquanto não apurados, então
  partidas a jogar/ao vivo mostram o status ("A jogar"/"Ao vivo"/"Apurando") em
  vez de pontos. Sem polling: é histórico confirmado.
- **Backend reusa a query existente.** `GroupService.userBreakdown` chama
  `findMatchesWithUserBets(groupId, targetUserId, …)` — a mesma do
  `listGroupMatches`, só que para o membro-alvo. O mapeamento foi extraído para
  `toMatchWithUserBet` e é compartilhado pelos dois.
- **Cabeçalho do modal** mostra a posição e o total **confirmado** do membro
  (vindos da própria linha do ranking) — não o projetado ao vivo, coerente com
  os pontos por partida serem os já liquidados.

Companion no backend: a rota vive em `GroupController`
(`GET /:groupId/users/:targetUserId/breakdown`), sem gate de indicações —
qualquer membro do grupo vê (`canView` sempre `true`).

---

## Invariantes

1. **Nunca conta em dobro.** O overlay do ranking soma só pontos de partidas
   `state === 'live'` (sempre `!confirmed`); o `/ranking` soma só `confirmed`.
   Os dois conjuntos são disjuntos.
8. **"Ao vivo" é o estado real, não o status do banco.** O overlay do ranking
   só liga quando o `/my-points` reporta `state === 'live'`. Partida encerrada
   no upstream mas ainda `status='live'` no banco (aguardando liquidação) não
   conta como ao vivo — evita banner "em andamento" sem jogo rolando.
2. **Pontos definitivos não custam rede.** Partida encerrada lê
   `resultPoints`/`exactScorePoints` do próprio `userBet`. O endpoint
   `/my-points` só é chamado enquanto `status === 'live'`.
3. **Uma chave, um request.** `matchPointsKeys.detail` é compartilhada por
   todos os consumidores — ranking, card e badge da mesma partida usam o mesmo
   cache.
4. **Polling para ao confirmar.** `confirmed=true` desliga o
   `refetchInterval`; o valor é imutável.
5. **Pontos exigem grupo.** Sem `groupId` não há pontos (o endpoint exige
   grupo). Telas globais (home sem grupo) não disparam a busca.
6. **A regra de pontos é do backend.** O front só soma pontos já gravados; o
   provisório ao vivo vem pronto de `matchPoints.total` (mesma regra da
   liquidação SQL — provisório e definitivo nunca divergem para o mesmo placar).
7. **Todos os membros têm prévia ao vivo no ranking.** O overlay usa o endpoint
   group-wide `GET /ranking/live`, que devolve o provisório por usuário de todas
   as partidas em andamento. (Antes só o próprio usuário tinha prévia, via
   `useGroupLiveMyPoints` + `/my-points`.)

---

## Pontos de alteração futura

| Mudança                                                              | Como fazer                                                                                     |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| ~~Prévia ao vivo dos **outros** jogadores no ranking~~ ✅ feito        | Backend expõe `GET /api/groups/:groupId/ranking/live`; o front soma por `userId` em `useGroupLiveRanking` |
| Animar a subida/descida de posições no ranking                       | Envolver as linhas em `Reorder`/`AnimatePresence` do `framer-motion` (já no `package.json`)    |
| Badge de pontos no `MatchCard` encerrado da grade de Jogos           | Exigiria `userBet` na resposta de `useMatchesByPhase`, ou um batch endpoint de pontos por grupo |
| Total de pontos do grupo num header/persistente                      | Reusar `useGroupRanking` + posição do usuário; o dado já existe                                |
| Mostrar o delta exato de posição ("subiu 3") em vez de só a seta     | Já há `position - livePosition` no `GroupRanking`; basta renderizar o número                   |
| Skeleton enquanto `useMatchMyPoints` carrega no card                 | Condicionar um placeholder em `isLoading` (hoje o card só renderiza com `data`)                |

---

## Arquivos relevantes

| Arquivo                                                                                                       | Responsabilidade                                  |
|---------------------------------------------------------------------------------------------------------------|---------------------------------------------------|
| [`services/matchPoints.service.ts`](../src/services/matchPoints.service.ts)                                   | DTO + `getMatchMyPoints`                          |
| [`hooks/useMatchPoints.ts`](../src/hooks/useMatchPoints.ts)                                                   | Hooks + `matchPointsKeys` + polling               |
| [`pages/match-detail/components/MatchPointsCard.tsx`](../src/pages/match-detail/components/MatchPointsCard.tsx) | Bloco "Seus pontos"                               |
| [`components/match/MatchPointsBadge.tsx`](../src/components/match/MatchPointsBadge.tsx)                        | Pílula reutilizável                               |
| [`pages/group-detail/components/GroupRanking.tsx`](../src/pages/group-detail/components/GroupRanking.tsx)     | Overlay ao vivo + reordenação + botão de detalhes |
| [`pages/group-detail/components/RankingBreakdownModal.tsx`](../src/pages/group-detail/components/RankingBreakdownModal.tsx) | Modal de validação: pontos por partida de um membro |
| [`../../betabet/Doc/011-match-my-points.md`](../../betabet/Doc/011-match-my-points.md)                        | Companion: backend (endpoint, cálculo, totais)    |
| [`../../betabet/Doc/010-match-postmatch.md`](../../betabet/Doc/010-match-postmatch.md)                        | Companion: backend (liquidação + snapshot)        |
