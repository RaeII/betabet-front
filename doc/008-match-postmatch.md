# 008 - Match Post-Match (encerrada) — `MatchDetailPage`

## Objetivo

Documentar a UI **pós-jogo** da `MatchDetailPage` — o conjunto de blocos
que aparecem quando a partida termina (status interno `finished` **ou**
upstream `FT`/`AET`/`PEN`): placar final com indicador de vencedor,
breakdown 1T/2T/Prorr/Pên, estatísticas finais, timeline completa de
eventos e escalações.

Resolve também o bug anterior em que o front ficava **sempre exibindo o
bloco "ao vivo"** mesmo após o apito final (porque `match.status` só vira
`finished` quando o admin confirma o resultado).

Companion no backend:
[`010-match-postmatch.md`](../../betabet/Doc/010-match-postmatch.md).
Catálogo completo dos campos disponíveis na API externa após o apito
final:
[`007-api-football-pre-post-match.md`](../../betabet/Doc/007-api-football-pre-post-match.md).

---

## Fluxo de dados

```
MatchDetailPage
  │
  ├─ match.status === 'live' → useMatchLive (refetchInterval 60s)
  ├─ match.status ∈ {live, finished} → useMatchPostMatch (staleTime 30min)
  │
  ├─ isFinishedView = match.status === 'finished'
  │               ||  live.status.short ∈ {FT, AET, PEN}     ← consome o live cacheado
  │
  └─ postSource (fonte canônica do snapshot pós-jogo):
        ├─ postMatch.hasPostMatchData=true  → usa o DB (zero quota upstream)
        ├─ isUpstreamFinished && live       → usa o live cacheado (1h no backend)
        └─ caso contrário                   → null → cai no header padrão "Encerrado"
```

A detecção **não depende do admin confirmar o resultado**. Assim que o
upstream marca `FT`/`AET`/`PEN`, o `useMatchLive` recebe esse status no
próximo poll (cache backend de 1h para finished) e a UI comuta para o
bloco pós-jogo sem custo adicional de cota.

Quando o cron grava o snapshot no banco (≥ 2h após o kickoff, batch de 5
partidas a cada 10 min), `postMatch.hasPostMatchData` vira `true` e a
fonte muda transparentemente para o DB — a partir daí nenhum hit ao
upstream é necessário.

---

## Arquivos

| Arquivo                                                                                                                  | Papel                                                                  |
|--------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| [`services/postMatch.service.ts`](../src/services/postMatch.service.ts)                                                  | `getMatchPostMatch(matchId)` + tipos (`MatchPostMatch`, `PostMatchTeamRef`) |
| [`hooks/useMatches.ts`](../src/hooks/useMatches.ts)                                                                      | `useMatchPostMatch` com `staleTime: 30min` (dado imutável após salvo)  |
| [`pages/match-detail/components/PostMatchScoreboard.tsx`](../src/pages/match-detail/components/PostMatchScoreboard.tsx)  | Header pós-jogo: placar final + check no vencedor + breakdown 1T/2T/Prorr/Pên + gols por time |
| [`pages/match-detail/components/LiveStats.tsx`](../src/pages/match-detail/components/LiveStats.tsx)                      | **Reusado** — mesma shape (`LiveTeamStats`) serve para o pós          |
| [`pages/match-detail/components/LiveEventsTimeline.tsx`](../src/pages/match-detail/components/LiveEventsTimeline.tsx)    | **Reusado** — timeline funciona idêntica para events terminais         |
| [`pages/match-detail/components/PreMatchLineup.tsx`](../src/pages/match-detail/components/PreMatchLineup.tsx)            | **Reusado** com `headerLabel="Escalação"` — escalação final = titulares iniciais (substituições estão nos events) |
| [`pages/match-detail/MatchDetailPage.tsx`](../src/pages/match-detail/MatchDetailPage.tsx)                                | Composição: troca header padrão por `PostMatchScoreboard` e renderiza a seção pós-jogo |
| [`pages/home/components/InlineBetCard.tsx`](../src/pages/home/components/InlineBetCard.tsx) | Consome `useMatchLive` para detectar `TERMINAL_STATUSES` no upstream e trocar o badge `Ao vivo` por `Encerrada` no card da home enquanto o admin não confirma o resultado |
| [`hooks/useGroupLiveMatch.ts`](../src/hooks/useGroupLiveMatch.ts) | Indicador compartilhado que consulta `/live` das partidas candidatas do grupo e só retorna `true` quando `live.isLive=true` |
| [`components/layout/GroupSidebar.tsx`](../src/components/layout/GroupSidebar.tsx) / [`GroupMobileNav.tsx`](../src/components/layout/GroupMobileNav.tsx) | Consomem `useGroupHasLiveMatch` para mostrar o ponto vermelho em "Jogos" apenas quando há partida realmente em andamento |

---

## `useMatchPostMatch` (hook)

```ts
export function useMatchPostMatch(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.postMatch(matchId),
    queryFn: () => getMatchPostMatch(matchId),
    enabled: enabled && !!matchId,
    staleTime: 30 * 60 * 1000,        // dado imutável; long staleTime evita refetch
  })
}
```

Diferenças contra os hooks de preview/live:

- **Sem `refetchInterval`** — não há motivo de polling: depois do cron salvar,
  o JSONB no DB nunca muda mais.
- **`staleTime` longo (30 min)** — a query é remontada várias vezes durante
  navegação (entrar/sair do match-detail); manter o cache evita roundtrip à API.
- **Endpoint backend é puramente DB** — não atrasa o request com fetch
  upstream nem consome quota.

Enable é `hasStarted` (`match.status ∈ {live, finished}`). Quando a
partida está em `live` mas o upstream ainda não terminou, o endpoint
devolve `hasPostMatchData=false` (vazio) — o front simplesmente ignora.

---

## Componentes

### `PostMatchScoreboard`

Header pós-jogo. Espelha o layout do `LiveScoreboard` (mesmo grid 3-colunas
com bandeiras + placar central) com 4 diferenças visuais:

| Live                            | Pós                                               |
|---------------------------------|---------------------------------------------------|
| Ponto vermelho pulsante         | Ponto cinza sólido (sem animação)                 |
| Cronômetro `73' +2` em verde    | Badge `Final` em `--surface-soft`                 |
| Status: `1º tempo`/`Intervalo`  | Status: `Encerrada`/`Após prorrog.`/`Após pênaltis` |
| Nome do time sempre `--text-muted` | Vencedor em `--text` + `✓ ` no prefixo         |

Quando o jogo passou de regulamento, exibe abaixo do placar uma linha de
chips `1T 1-0 · 2T 1-1 · Prorr 0-0 · Pên 4-3` (só os segmentos com valor;
suprime quando só tem 1 segmento — daria leitura redundante com o placar
principal).

Os gols por time são filtrados via `events[type='Goal' && detail !== 'Missed Penalty']`
e segregados pelo `teamId` (com fallback para `teamName` quando
`homeTeamId` for null). Mesma lógica do `LiveScoreboard` para manter
consistência visual entre live e post.

### Reuso dos componentes do live

O DTO do pós-jogo **espelha** o do live: mesmas estruturas para
`events` (`LiveEvent[]`), `statistics` (`LiveTeamStats[]`) e `lineups`
(`PreviewLineup[]`). Por isso `LiveStats`, `LiveEventsTimeline` e
`PreMatchLineup` são consumidos sem modificação — uma única
implementação serve para o live e o pós.

Não foi extraído um "stats genérico" ou "timeline genérica" — manter o
nome `LiveStats`/`LiveEventsTimeline` é o padrão atual e a abstração
seria prematura (3. Surgical Changes).

---

## Composição na `MatchDetailPage`

### Detecção do estado "encerrado"

```ts
const TERMINAL_STATUSES = new Set(['FT', 'AET', 'PEN'])
const isUpstreamFinished = !!live && TERMINAL_STATUSES.has(live.status.short)
const isFinishedView = isFinishedStatus || isUpstreamFinished
```

Dois sinais combinados via OR:

1. **`match.status === 'finished'`** — admin confirmou o resultado pelo
   backend (`POST /admin/matches/:id/confirm-result`).
2. **`live.status.short ∈ {FT, AET, PEN}`** — upstream já reporta status
   terminal mesmo que o admin não tenha confirmado.

O sinal 2 elimina o bug anterior em que o jogo "ficava sempre ao vivo" —
o `useMatchLive` continuava pollando e o `LiveScoreboard` ficava
renderizado indefinidamente.

### `postSource` — fonte canônica unificada

Para evitar dois caminhos paralelos de render (um para "do DB", outro
para "do live cacheado"), o componente normaliza em um único `postSource`:

```ts
const postSource = postMatch?.hasPostMatchData
  ? { /* projeção do postMatch */ }
  : isUpstreamFinished && live
  ? { /* projeção do live  */ }
  : null
```

Vantagens:

- **Render único** — `PostMatchScoreboard`, `LiveStats`, `LiveEventsTimeline`
  e `PreMatchLineup` recebem sempre `postSource.*`, sem ramificações.
- **Transição suave** — quando o cron grava (`hasPostMatchData` vira `true`),
  o `postSource` aponta automaticamente para o DB; nenhum efeito de
  remontagem para o usuário.
- **Sem dados inventados** — se nem o DB nem o live forem fontes válidas,
  `postSource` é `null` e o header cai no card padrão "Encerrado" (com
  `match.homeScore × match.awayScore` vindo do admin-confirm).

### Gates de exibição

| Bloco                  | Condição                                                              |
|------------------------|-----------------------------------------------------------------------|
| `showPostMatchBlock`   | `isFinishedView && !!postSource`                                       |
| `showLiveBlock`        | `isLiveStatus && live && live.hasApiFixtureId && !isUpstreamFinished` |
| Header padrão estático | nenhum dos dois — partida sem mapping na API ou `upcoming`            |

A negação `!isUpstreamFinished` no `showLiveBlock` é o que **fecha** o
bloco live assim que o upstream reporta terminal. Antes da mudança, esse
gate só dependia de `match.status === 'live'`, o que mantinha o bloco
ativo eternamente.

### Propagação para o card da home (`InlineBetCard`)

O mesmo bug se manifestava no card da home: enquanto o admin não
confirmava o resultado, `match.status` ficava `'live'` e o badge **Ao
vivo** aparecia indefinidamente. A correção replica o padrão acima:
`InlineBetCard` chama `useMatchLive(match.id, isLiveStatus)` (gated em
`status==='live'`, então só polla o que está jogando) e deriva
`isUpstreamFinished` da mesma lista `TERMINAL_STATUSES`. Quando a
partida está em `FT/AET/PEN` upstream:

- `isLive = isLiveStatus && !isUpstreamFinished` — `<LiveDot />` somente
  enquanto o upstream ainda reportar `1H/2H/HT/ET/…`;
- `locked` inclui `isUpstreamFinished` para travar o input de palpite no
  mesmo instante que o jogo de fato acaba;
- Badge dedicado `<EndedDot />` ("Encerrado", em `--text-muted`)
  substitui o ponto vermelho enquanto o admin não confirma, sem trocar para
  um card separado.

O custo é o mesmo do `MatchDetailPage`: cada card "ao vivo" gera um
`useMatchLive` próprio, mas o backend cacheia o `/live` por 2 min e o
hook polla a 60 s — então o pior caso é cache hit. Quando o admin enfim
confirma o resultado, o `match.status` vira `finished`, `DayMatchList`
mantém o item no mesmo `InlineBetCard` das partidas ao vivo e futuras, e
o `useMatchLive` desliga por falta de gate.

### Propagação para a navegação de grupo

`GroupSidebar` e `GroupMobileNav` não usam mais apenas
`matches.some(m => m.status === 'live')` para renderizar o ponto vermelho em
"Jogos". Esse filtro gerava falso positivo quando o banco ainda mantinha
`status='live'`, mas o upstream já tinha fechado a partida em `FT/AET/PEN`.

A regra agora fica em `useGroupHasLiveMatch(groupId)`:

```ts
const candidateMatches = matches.filter(match => match.status === 'live')
// ...useQueries por candidata com matchKeys.live(match.id)...
return liveQueries.some(query => query.data?.isLive === true)
```

Enquanto o `/live` não confirma `isLive=true`, o indicador permanece oculto.
Assim, partidas encerradas-mas-ainda-não-liquidadas deixam de acender a
notificação de "Ao vivo" no desktop e no mobile.

### Layout

Mesma ordem visual do live (consistência), só que com dados terminais:

```
┌──────────────────────────────────┐
│  PostMatchScoreboard             │   ← header (substitui Live + estático)
│   Brasil ✓ 2 × 1 Argentina       │
│   1T 1-0 · 2T 1-1                │
│   ⚽ Vinícius Jr., 12'  ⚽ Messi, 38' │
└──────────────────────────────────┘
   Estádio Azteca, Cidade do México

┌──────────────────────────────────┐
│  Estatísticas (LiveStats reusado)│
│   58%  Posse de bola  42%        │
│    7   Chutes no alvo  4         │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Timeline (LiveEventsTimeline)   │
│   90'+4 ⚽ Vinícius Jr.           │
│    45'  🟨 Messi                  │
│    ...                           │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Escalação (PreMatchLineup)      │
│   Campo 2D / Lista — toggle      │
└──────────────────────────────────┘
```

---

## Invariantes

1. **`useMatchPostMatch` é o único hook novo.** Os hooks de preview e
   live não foram alterados — `staleTime`/`refetchInterval` mantidos.
2. **Fontes são mutuamente exclusivas no `postSource`.** Prioridade:
   DB → live cacheado → null. Nunca os dois ao mesmo tempo.
3. **`showPostMatchBlock` e `showLiveBlock` são mutuamente exclusivos.**
   `showLiveBlock` tem o gate `!isUpstreamFinished`.
4. **Dados do live continuam fluindo durante o pós.** O hook `useMatchLive`
   permanece habilitado enquanto `match.status === 'live'` — o backend
   serve do cache (TTL `Finished = 1h`), sem hit upstream extra.
   Isso é o que viabiliza a fonte `live` no `postSource` durante a
   janela "upstream FT, mas cron ainda não capturou".
5. **Notificações de live param sozinhas.** Quando o upstream marca FT,
   nenhum novo event entra; o `useLiveMatchNotifications` não dispara
   novas toasts porque o diff fica vazio.
6. **`postMatch.fetchedAt` não é exibido na UI** — informação operacional
   relevante para o backend/admin, mas ruído para o usuário final.
7. **Sem modificações no `LiveScoreboard`.** Ele continua mostrando
   "Encerrada" se for renderizado, mas com a mudança no `showLiveBlock`
   nunca chega a ser usado para FT/AET/PEN.

---

## Pontos de alteração futura

| Mudança                                                                | Como fazer                                                                                          |
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Mostrar quanto tempo se passou desde o jogo (`há 2 dias`)              | Adicionar `formatRelativeTime(postMatch.fetchedAt)` no header do `PostMatchScoreboard`              |
| Comparar palpite do usuário com placar final (sublinhar acertos)       | Já existe `match.userBet` no card abaixo do header — aumentar com badge "Acertou placar / vencedor" |
| Stats por tempo (1T vs. 2T) lado a lado                                | Backend precisa proxiar `/fixtures/statistics?half=true` e gravar em coluna nova (ver doc backend 010) |
| Ratings individuais dos jogadores no campo 2D                          | Backend precisa proxiar `/fixtures/players?fixture=ID`; front renderiza nota 0–10 sobre cada nome   |
| Animar a transição live → pós (placar congela, badge "Final" fade-in)  | Envolver o swap de header em `Transition` do `framer-motion` (já listado em `package.json`)         |
| "Melhor em campo" — destacar o jogador com maior `rating` no scoreboard | Depende do mesmo proxy de ratings; renderizar avatar + nome no `PostMatchScoreboard`                |
| Skeleton enquanto `postMatch` carrega                                  | Mesmo padrão dos demais hooks: condicionar `<MatchDetailSkeleton />` em `isLoading`                 |

---

## Arquivos relevantes

| Arquivo                                                                  | Responsabilidade                                                |
|--------------------------------------------------------------------------|-----------------------------------------------------------------|
| [`services/postMatch.service.ts`](../src/services/postMatch.service.ts)  | DTO + `getMatchPostMatch`                                       |
| [`hooks/useMatches.ts`](../src/hooks/useMatches.ts)                      | `useMatchPostMatch`, `matchKeys.postMatch`                      |
| [`pages/match-detail/components/PostMatchScoreboard.tsx`](../src/pages/match-detail/components/PostMatchScoreboard.tsx) | Componente do header pós-jogo                                   |
| [`pages/match-detail/MatchDetailPage.tsx`](../src/pages/match-detail/MatchDetailPage.tsx) | Composição + detecção `isFinishedView` + `postSource`           |
| [`007-match-live.md`](./007-match-live.md)                               | Companion: bloco ao vivo                                        |
| [`006-match-preview-pre-match.md`](./006-match-preview-pre-match.md)     | Companion: blocos pré-jogo                                      |
| [`../../betabet/Doc/010-match-postmatch.md`](../../betabet/Doc/010-match-postmatch.md) | Companion: backend (endpoint, cron, persistência)               |
