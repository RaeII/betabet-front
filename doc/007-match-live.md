# 007 - Match Live (em andamento) — `MatchDetailPage`

## Objetivo

Documentar a UI **ao vivo** da `MatchDetailPage` — o conjunto de blocos
que aparecem quando `match.status === 'live'`: scoreboard com cronômetro,
quebra de placar (1T/2T/Prorr/Pên), estatísticas comparativas
lado-a-lado, timeline de eventos, escalações com campo 2D e notificações
push (gol / expulsão).

Companion no backend:
[`009-match-live.md`](../../betabet/Doc/009-match-live.md).
Catálogo completo de campos disponíveis na API externa enquanto a
partida está acontecendo:
[`006-api-football-live-data.md`](../../betabet/Doc/006-api-football-live-data.md).

---

## Fluxo de dados

```
MatchDetailPage
  │
  ├─ match.status === 'live'?
  │     │
  │     ├─ não → blocos pré-jogo (useMatchPreview) ou shape "encerrada"
  │     │
  │     └─ sim → useMatchLive(matchId, true)              // refetchInterval 60s
  │                │
  │                ├─ live.hasApiFixtureId?
  │                │     ├─ não → cai no header padrão (sem partida mapeada)
  │                │     └─ sim → renderiza LiveScoreboard + LiveScoreBreakdown
  │                │                       + LiveStats + LiveEventsTimeline
  │                │                       + PreMatchLineup (com headerLabel="Escalação")
  │                │
  │                └─ useLiveMatchNotifications(matchId, live.events)
  │                     └─ diff de events vs. snapshot anterior → toast()
```

`useMatchLive` é skip enquanto o status local for `upcoming`/`finished`
— o backend é chamado **apenas** durante o live. Quando o cron interno
muda `match.status` para `live` no servidor, o `useMatch` (já em
cache) re-fetcha e dispara o `useMatchLive`.

---

## Arquivos

| Arquivo                                                                                              | Papel                                                              |
|------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------|
| [`services/liveMatch.service.ts`](../src/services/liveMatch.service.ts)                              | `getMatchLive(matchId)` + tipos (`MatchLive`, `LiveEvent`, etc.)   |
| [`hooks/useMatches.ts`](../src/hooks/useMatches.ts)                                                  | `useMatchLive` com `refetchInterval: 60 * 1000`                    |
| [`hooks/useLiveMatchNotifications.ts`](../src/hooks/useLiveMatchNotifications.ts)                    | Diff de events entre polls → `useToast`                            |
| [`pages/match-detail/components/LiveScoreboard.tsx`](../src/pages/match-detail/components/LiveScoreboard.tsx)         | Placar + cronômetro pulsante + fase/estádio/árbitro                |
| [`pages/match-detail/components/LiveScoreBreakdown.tsx`](../src/pages/match-detail/components/LiveScoreBreakdown.tsx) | 1T / 2T / Prorr / Pên (só segmentos com valor)                     |
| [`pages/match-detail/components/LiveEventsTimeline.tsx`](../src/pages/match-detail/components/LiveEventsTimeline.tsx) | Lista de eventos (ordenada mais recente → antigo)                  |
| [`pages/match-detail/components/LiveStats.tsx`](../src/pages/match-detail/components/LiveStats.tsx)                   | Barras comparativas lado-a-lado                                    |
| [`pages/match-detail/components/PreMatchLineup.tsx`](../src/pages/match-detail/components/PreMatchLineup.tsx)         | Campo 2D + lista (reusado — `headerLabel="Escalação"`)             |
| [`pages/match-detail/MatchDetailPage.tsx`](../src/pages/match-detail/MatchDetailPage.tsx)                             | Composição: troca o header padrão pelo `LiveScoreboard` durante live |

---

## `useMatchLive` (hook)

```ts
export function useMatchLive(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.live(matchId),
    queryFn: () => getMatchLive(matchId),
    enabled: enabled && !!matchId,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,    // aba inativa → não polla
    staleTime: 30 * 1000,
  })
}
```

Alinhado ao TTL backend de 1 min:

- 60 s casa com o cache de 1 min → cada poll tende a encontrar uma
  entrada recém-expirada e recebe dados frescos, mantendo a defasagem
  da informação ao vivo em ~1 min.
- `refetchIntervalInBackground: false` evita gastar quota com aba
  minimizada.
- `staleTime: 30 s` cobre re-renders próximos sem hit extra.

Para reduzir defasagem a <1 min ver
[doc 009 backend §"Pontos de alteração futura"](../../betabet/Doc/009-match-live.md).

---

## `LiveScoreboard` — placar + cronômetro + cabeçalho

Layout 3 colunas: bandeira mandante / placar central / bandeira visitante.

- **Cronômetro** renderiza `elapsed +extra` (ex.: `73' +2`), com badge
  pulsante vermelho. `HT` vira `INT`, `BT` vira `INT P`, `SUSP`/`INT`
  mostram a label longa.
- **Status** no header com `●` animado e label PT-BR
  (`1H → "1º tempo"`, `HT → "Intervalo"`, etc.).
- **Fase** (`live.league.round`) à direita do status.
- **Estádio + cidade + árbitro** no footer (usa `live.venue` quando
  disponível, fallback para `match.stadium`).

```tsx
<LiveScoreboard
  live={live}
  homeTeamName={match.homeTeam.name}
  homeTeamFlag={match.homeTeam.flagUrl}
  awayTeamName={match.awayTeam.name}
  awayTeamFlag={match.awayTeam.flagUrl}
  fallbackStadium={match.stadium ? { name, city } : null}
/>
```

---

## `LiveScoreBreakdown` — 1T / 2T / Prorr / Pên

Tabela compacta com placares por etapa. Só mostra os segmentos que **já
têm valor** (campos `null` são filtrados) — em jogo de fase de grupos
isso geralmente fica em "1T 0-0 · 2T 1-1" e nada mais; em mata-mata
com prorrogação aparece a coluna "Prorr"; só em decisão por pênaltis
aparece "Pên".

> Volume mínimo de código (~50 linhas) — não vale a pena abstrair em
> sub-componentes.

---

## `LiveStats` — estatísticas comparativas lado a lado

Barra horizontal dual-side (mandante azul à esquerda, visitante laranja
à direita). Cada linha mostra os valores **brutos** nas pontas
(`12` × `7`) e a label centralizada (`Chutes totais`).

Regras de proporção:

- `Ball Possession` já vem como `"58%"` da API — usa o número direto
  (sem normalização).
- Demais tipos: `homePct = home / (home + away) * 100`.
- Total = 0 → 50/50 (evita NaN).

Ordem de exibição:

1. `PRIORITY[]` (`Ball Possession` → `Total Shots` → `Shots on Goal` →
   `Corner Kicks` → `Fouls` → `Offsides` → `Yellow Cards` →
   `Red Cards` → `Passes %` → `expected_goals`)
2. Demais tipos vindos da API na ordem original.

Labels em PT-BR via `LABELS` (`{ 'Ball Possession': 'Posse de bola', ... }`).
Tipos não mapeados caem no nome cru da API — não quebra a renderização.

xG (`expected_goals`) aparece quando a liga tem cobertura. Na Copa
costuma vir ausente — a UI silenciosamente omite a linha.

---

## `LiveEventsTimeline` — gols, cartões, substituições

Lista de `LiveEvent` ordenada do **mais recente para o mais antigo**
(o array do backend vem em ordem crescente — `[...events].reverse()`).

Classificação visual:

| `type` / `detail`                  | Ícone | Tom (border + bg)        |
|------------------------------------|-------|--------------------------|
| `Goal` (Normal Goal, Penalty)      | ⚽    | verde (`goal`)           |
| `Goal` — `Own Goal`                | ⚽    | verde (gol contra)       |
| `Goal` — `Missed Penalty`          | ✗     | default (`default`)      |
| `Card` — `Yellow Card`             | 🟨    | amarelo (`yellow`)       |
| `Card` — `Red Card` / `Second Yellow` | 🟥 | vermelho (`red`)         |
| `subst`                            | ⇄     | azul (`sub`)             |
| `Var`                              | 📺    | roxo (`var`)             |

Layout dual-side: eventos do **mandante** ficam alinhados à esquerda,
do visitante invertidos (`flex-row-reverse`). `homeTeamId` é o
`live.teams.home.id` da API-Football — não confundir com o ID interno
do match (esses dois mundos não se misturam aqui).

Em substituições, o backend grava: `player` = entrou, `assist` = saiu
(invariante da API-Football). A timeline mostra "sai X" como subtítulo.

---

## Campo 2D + escalações (reuso de `PreMatchLineup`)

`PreMatchLineup` aceita `headerLabel` e `emptyMessage` opcionais:

```tsx
<PreMatchLineup
  lineups={live.lineups}
  headerLabel="Escalação"
  emptyMessage="A federação ainda não publicou as escalações desta partida."
/>
```

O shape `PreviewLineup[]` é **idêntico** entre `/preview` e `/live` no
backend (mesmo Zod schema `lineupSideSchema`), então toda a lógica de
parse de `grid: "linha:coluna"` e desenho do campo SVG é reaproveitada.

> Substituições durante o jogo **não** mexem no array `lineups` (vai
> tudo em `events`). O usuário vê o startXI inicial no campo + a lista
> de saídas/entradas na timeline. Isso é uma limitação da API-Football,
> não do nosso código.

---

## `useLiveMatchNotifications` — push em delta

```ts
useLiveMatchNotifications(matchId, live?.events)
```

A primeira chamada para um `matchId` cria a baseline com **todos** os
events atuais — não dispara nada. A partir do segundo render, qualquer
event novo (chave =
`minute:extra:type:detail:teamId:player`) dispara um toast:

- ⚽ `Gol do <time>! <player> (assist: <assist>) — 73'` — `variant: 'success'`
- 🟥 `Expulsão (<time>): <player> — 73'` — `variant: 'error'`

`subst`, `Var`, cartões amarelos e gols perdidos **não** disparam toast
— ruído desnecessário.

Troca de `matchId` reseta a baseline sem notificar — abrir uma partida
nova não dispara avalanche de toasts.

> Implementação **client-side**: o "push" é o resultado do polling +
> diff em memória, não um WebSocket real. Custo zero adicional além do
> hit do `useMatchLive`. Para push real, ver
> [doc 009 backend §"Pontos de alteração futura"](../../betabet/Doc/009-match-live.md).

---

## Composição na `MatchDetailPage`

```tsx
const isLiveStatus = match?.status === 'live'
const { data: live } = useMatchLive(matchId ?? '', !!isLiveStatus)
useLiveMatchNotifications(matchId ?? '', live?.events)

const showLiveBlock = isLiveStatus && live && live.hasApiFixtureId
const liveHomeTeamId = live?.teams?.home.id ?? null

return (
  <div className="mx-auto max-w-lg space-y-6">
    {showLiveBlock ? <LiveScoreboard ... /> : <HeaderPadrão />}

    {showLiveBlock && (
      <>
        <LiveScoreBreakdown live={live} ... />
        <LiveStats statistics={live.statistics} homeTeamId={liveHomeTeamId} />
        <LiveEventsTimeline events={live.events} homeTeamId={liveHomeTeamId} />
        <PreMatchLineup lineups={live.lineups} headerLabel="Escalação" ... />
      </>
    )}

    {/* BetForm, distribution e BetsGrid continuam aparecendo
        normalmente — usuário pode ver/editar palpite enquanto a partida
        ainda está editável (regra de janela em isBetEditable). */}
  </div>
)
```

Ordem visual: scoreboard → breakdown → estatísticas (mais consumido
durante o jogo) → timeline (rolagem) → escalação (ref. estática).

---

## Tokens e responsividade

- Container `max-w-lg` — mesma largura dos outros blocos do `MatchDetailPage`.
- Surfaces (`var(--surface)`), borders (`var(--border)`), radius
  (`var(--radius-lg)`) — vide [`doc/ui.md`](./ui.md).
- Cronômetro usa `text-red-500` + `bg-red-500/15` + `animate-pulse`
  para indicar "ao vivo" sem depender de cor de tema.
- `LiveStats` usa `var(--brand)` (mandante) e `var(--accent, #D8A900)`
  (visitante) — amarelo só nas barras de stats e cards de amarelo, não
  em superfícies.
- Timeline e events são `text-xs` no mobile, sem `sm:` upscale — cabem
  na coluna mobile sem horizontal scroll.

---

## Invariantes (front)

1. **Polling só acontece em `match.status === 'live'`.** Mudou para
   `finished` no servidor → próximo `useMatch` invalida o estado;
   `useMatchLive` fica `enabled=false`. Nenhum tela "ao vivo" sobre
   partida encerrada.
2. **`homeTeamId` para classificar eventos é o ID da API-Football
   (`live.teams.home.id`)**, não o `match.homeTeam.id` (que é o ID
   interno). Os arrays de events/lineups/statistics todos referenciam
   o ID externo.
3. **Baseline de notificações por `matchId`.** Trocar de partida não
   gera toasts retroativos. Reload da página também não — o snapshot
   inicial nunca dispara.
4. **`PreMatchLineup` é compartilhado com pré-jogo.** Mexer no campo
   2D afeta os dois fluxos — passar antes pelo doc 006 do front.

---

## Pontos de alteração futura

| Mudança                                                          | Onde                                                                                                     |
|------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| Polling < 60 s                                                    | `useMatchLive` em [`hooks/useMatches.ts`](../src/hooks/useMatches.ts); também baixar TTL no backend       |
| Notificação para amarelo / subst                                 | Adicionar branches em `describe()` de [`useLiveMatchNotifications`](../src/hooks/useLiveMatchNotifications.ts) |
| Browser Notification API (sair do toast in-page)                 | Wrap do `toast()` que primeiro tenta `new Notification(...)` com permissão; cai para toast como fallback |
| Mostrar substituições inline na escalação 2D                      | Calcular subs a partir de `live.events` e mutar `lineups` antes de passar para `PreMatchLineup` (cuidado: hoje é puro pre-match) |
| Stats por tempo (toggle 1T/2T)                                   | Backend precisa expor `/fixtures/statistics?half=true` — ver doc 009 backend                              |
| Push real (SSE / WebSocket)                                      | Novo hook `useMatchLiveStream` substituindo o polling; manter `useMatchLive` como fallback                |
