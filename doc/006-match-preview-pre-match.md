# 006 - Tela de pré-jogo (probabilidade, forma recente, escalação, desfalques, estádio)

## Objetivo

Documentar como o front consome `GET /api/matches/:matchId/preview` e
renderiza os blocos de pré-jogo dentro da `MatchDetailPage` quando o
status da partida é `upcoming`.

Companion no backend:
[`008-match-preview.md`](../../betabet/Doc/008-match-preview.md) (DTO,
pipeline e invariantes).

Inclui também a **correção do bug de navegação** em `GroupJogosPage` que
mandava o usuário para `/matches/:id` (rota inexistente) — o link agora
respeita o contexto de grupo (`/groups/:groupId/matches/:matchId`).

---

## Fluxo do usuário

1. Usuário entra em `Jogos` (`/groups/:groupId/jogos`).
2. Clica em uma partida → vai pra `/groups/:groupId/matches/:matchId`
   (antes o link ia para `/matches/:id` e dava 404).
3. Se a partida está `upcoming`, o componente abaixo do `BetForm` carrega
   os dados de pré-jogo:
   - Probabilidade de cada time vencer + xG + recomendação textual.
   - **Forma recente**: placar dos últimos 10 jogos de cada seleção, com
     resultado (V/E/D), adversário, mando (Casa/Fora) e data.
   - Escalação provável em campo 2D (com cores do uniforme) ou em lista.
   - Banco de reservas + técnico (foto + nome) por time.
   - Desfalques separados por time (foto + motivo + badge "Fora" ou "Dúvida").
   - Foto do estádio + nome + cidade + capacidade + árbitro.

Se a partida está `live` ou `finished` o preview **não** é carregado
(`enabled` do `useQuery` é `false`).

---

## Arquivos novos

| Arquivo                                                                                | Responsabilidade                                                |
|----------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [`services/matchPreview.service.ts`](../src/services/matchPreview.service.ts)          | Tipos `MatchPreview/*` (inclui `PreviewRecentForm*`) + `getMatchPreview(matchId)` (`apiGet`) |
| [`pages/match-detail/components/PreMatchProbability.tsx`](../src/pages/match-detail/components/PreMatchProbability.tsx) | Barras `home/draw/away` + xG + advice                            |
| [`pages/match-detail/components/PreMatchRecentForm.tsx`](../src/pages/match-detail/components/PreMatchRecentForm.tsx) | Últimos 10 jogos por seleção: pill V/E/D + bandeira do adversário + placar |
| [`pages/match-detail/components/PreMatchLineup.tsx`](../src/pages/match-detail/components/PreMatchLineup.tsx) | Campo 2D em SVG, toggle Campo/Lista, banco + técnico             |
| [`pages/match-detail/components/PreMatchInjuries.tsx`](../src/pages/match-detail/components/PreMatchInjuries.tsx) | Duas colunas: foto + motivo + badge "Fora"/"Dúvida"              |
| [`pages/match-detail/components/PreMatchVenue.tsx`](../src/pages/match-detail/components/PreMatchVenue.tsx) | Foto do estádio com gradiente + cidade + capacidade + árbitro    |

## Arquivos alterados

| Arquivo                                                                                | Mudança                                                          |
|----------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [`pages/groups/GroupJogosPage.tsx`](../src/pages/groups/GroupJogosPage.tsx)            | Lê `groupId` via `useParams` e propaga para os grids             |
| [`pages/matches/components/GroupStageGrid.tsx`](../src/pages/matches/components/GroupStageGrid.tsx) | Aceita `groupId?` e repassa para `MatchCard`                |
| [`pages/matches/components/KnockoutBracket.tsx`](../src/pages/matches/components/KnockoutBracket.tsx) | `MatchSlot` aceita `groupId?` e constrói href com prefixo de grupo |
| [`hooks/useMatches.ts`](../src/hooks/useMatches.ts)                                    | Hook `useMatchPreview(matchId, enabled)` com `staleTime: 1h`     |
| [`pages/match-detail/MatchDetailPage.tsx`](../src/pages/match-detail/MatchDetailPage.tsx) | Integra os 5 componentes quando `status === 'upcoming'` (forma recente logo após a probabilidade) |

---

## Hook + service

```ts
// services/matchPreview.service.ts
export function getMatchPreview(matchId: string): Promise<MatchPreview> {
  return apiGet(`/api/matches/${matchId}/preview`)
}

// hooks/useMatches.ts
export function useMatchPreview(matchId: string, enabled = true) {
  return useQuery({
    queryKey: matchKeys.preview(matchId),
    queryFn: () => getMatchPreview(matchId),
    enabled: enabled && !!matchId,
    staleTime: 60 * 60 * 1000, // bate com o TTL upstream de predictions/injuries
  })
}
```

> **Por que `staleTime: 1h`?** A API-Football atualiza `/predictions` a
> cada 1h e `/injuries` a cada 4h. Um polling mais agressivo no front
> só queimaria cache do backend sem ganhar frescor.

Uso na `MatchDetailPage`:

```tsx
const isUpcoming = match?.status === 'upcoming'
const { data: preview } = useMatchPreview(matchId ?? '', !!isUpcoming)
```

---

## Componentes — detalhes de UI

Todos seguem [`ui.md`](./ui.md):

- container externo: `rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5`;
- label de seção: `text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]`;
- mobile-first, ganha colunas em `sm:` (`grid sm:grid-cols-2`);
- amarelo (`--support`) apenas em badges de "Dúvida" — nunca em áreas amplas;
- verde (`--brand`) destaca a maior probabilidade e ícones.

### `PreMatchProbability`

- A probabilidade vem das **odds** das casas de aposta (mercado Match Winner /
  1X2), calculada no backend em `computeOddsPercent` — **não** mais das
  `/predictions`. Rótulo do card: "Probabilidade pelas odds".
- O backend só devolve `prediction` quando há odds; sem odds (jogo a mais de
  ~14 dias ou upstream sem cotação) `prediction` vem `null` e o card é **omitido**
  (`{preview.prediction ? <PreMatchProbability/> : null}` na `MatchDetailPage`).
- 3 barras horizontais (home / empate / away), altura `h-2`, radius pill.
- A maior probabilidade ganha `bg-[var(--brand)]`; demais ficam em
  `bg-[var(--text-muted)]/45` (neutro, mesmo no tema escuro).
- Quando `prediction.winner.comment` existe ("Win", "Win or draw"),
  aparece um chip no canto direito do header.
- Grid inferior (2-col): "Gols esperados" (`home × away`) e "Total de gols"
  (`underOver`). Só renderiza se `expectedGoals` ou `underOver` tiver dado.
- Bloco `advice` no rodapé (`Recomendação: ...`) — texto em inglês vindo
  da API; não traduzimos por enquanto.

### `PreMatchRecentForm`

- Renderiza logo abaixo do `PreMatchProbability` (blocos analíticos juntos).
- Consome `preview.recentForm.{home,away}` — cada lado é independente e pode
  vir `null` (time sem `api_team_id` ou upstream falhou); **não** renderiza
  o card inteiro só quando os **dois** lados são `null`.
- Layout `grid sm:grid-cols-2`: uma coluna por seleção. Header de cada coluna:
  bandeira da seleção + nome + resumo `NV NE ND`.
- 🏳️ **Regra das bandeiras (importante):**
  - A **seleção cadastrada** (a do match) mantém o **sistema de bandeiras** —
    usa `TeamFlagImage` com `src={match.{home,away}Team.flagUrl}` e
    `teamId={match.{home,away}Team.id}` (resolve base64/fundo branco, igual ao
    resto do app). O componente recebe esses dados via prop `homeTeam`/`awayTeam`.
  - O **adversário** de cada jogo é renderizado pela **URL da API-Football**
    (`game.opponent.logo`) num `<img>` simples (`OpponentFlag`); se vier `null`,
    cai pra inicial em `surface-soft`.
- Cada linha de jogo (`GameRow`): pill `V/E/D` colorido + bandeira do
  adversário + nome + `Casa/Fora · dd/mês` + **placar** `golsPró × golsContra`
  (fonte mono, `tabular-nums`). Sem placar (jogo não-terminal) → `—`.
- Cores do pill: vitória `--success` (texto branco), derrota `--danger`
  (texto branco), empate neutro (`surface-soft` + `text-muted`). **Não** usa
  `--support` (reservado a "Dúvida" nos desfalques).
- Placar e resultado já vêm **sob a ótica da seleção** do backend
  (`goalsFor`/`goalsAgainst`/`result`) — o front não recalcula nada.

### `PreMatchLineup`

- Toggle `Campo / Lista` no header (segmented control, mesmo estilo do
  `replicate` toggle do [`InlineBetCard`](../src/pages/home/components/InlineBetCard.tsx)).
- **Campo 2D**: SVG `viewBox="0 0 100 100"`, aspect ratio `5:3`. Fundo
  `color-mix(in srgb, var(--brand) 18%, var(--surface-soft))` (verde
  esbatido, funciona em ambos os temas). Linhas brancas com 55% de alpha.
- Parse de `grid: "linha:coluna"` em `parseGrid`:
  - `row 1` = goleiro → fica na borda do campo.
  - `row N (maior)` = atacante → fica perto da linha do meio.
  - Eixo X: home ocupa 6→44; away ocupa 56→94 (espelhado).
  - Eixo Y: distribui os jogadores da linha igualmente em 12→88.
  - Fallback se nenhum jogador tem `grid`: distribui em linha vertical.
- Cada jogador é desenhado como `<circle>` + número + último sobrenome
  (truncado para nomes > 12 chars).
- **Cores do uniforme**: lê `team.colors.player.primary`/`number`/`border`
  e sanitiza com `ensureColor` (aceita `#RRGGBB`, `#RGB` ou retorna fallback
  — alguns jogos vêm sem `colors`, daí precisamos do fallback `--brand`
  para home e `--support` para away).
- **Lista**: alternativa acessível ao campo. Mostra todos os 11 titulares
  com bolinha colorida + número + nome.
- **Banco + técnico**: bloco inferior em 2 colunas (1 col no mobile),
  cada coluna com `CoachInfo` (foto circular + nome) e `BenchList`
  (foto opcional + número + nome + posição).

### `PreMatchInjuries`

- Não renderiza nada se `injuries.length === 0`.
- Separa em 3 grupos: home, away e "outros" (segurança — quando a API
  responde com fixtures de times não mapeados).
- Cada linha: foto circular `h-8 w-8` ou inicial em `surface-soft`,
  nome, motivo (truncado) e badge.
- Badge `Fora` (`Missing Fixture`) usa `--danger` em 12% opacity.
- Badge `Dúvida` (`Questionable`) usa `--support` em 15% opacity.

### `PreMatchVenue`

- Foto do estádio em `aspect-[16/9]` (mobile) / `aspect-[21/9]` (desktop).
- Gradiente vertical sobre a foto (`color-mix(...surface 80% transparent)`)
  para garantir contraste do texto inferior.
- Cai pra "header só com texto" se `venue.image` for `null`.
- Usa `match.stadium.name/city` como fallback quando a API-Football não
  cobre o venue (raro, mas acontece em partidas amistosas).
- Ícones `MapPin` (cidade), `Users` (capacidade), `UserCheck` (árbitro)
  do `lucide-react` — todos com `text-[var(--brand)]`.

---

## Bug de navegação corrigido

**Antes:**

- `GroupStageGrid` chamava `<MatchCard match={...} />` sem passar `groupId`.
- `MatchCard` defaultava o href para `/matches/:id` quando não recebia
  `groupId`. Essa rota **não existe** no `router/index.tsx` — só existe
  `/groups/:groupId/matches/:matchId`.
- Resultado: o clique em qualquer partida na `GroupJogosPage` levava o
  usuário para uma página em branco / 404 do React Router.

**Depois:**

```tsx
// GroupJogosPage.tsx
const { groupId } = useParams<{ groupId: string }>()
…
{data && phase === 'group' && <GroupStageGrid data={data.groupStage} groupId={groupId} />}
{data && phase === 'knockout' && <KnockoutBracket data={data.knockout} groupId={groupId} />}
```

`GroupStageGrid` e `KnockoutBracket` agora aceitam `groupId?: string` e
repassam para `MatchCard`/`MatchSlot`. O href é construído como
`/groups/${groupId}/matches/${matchId}` quando há grupo.

> Por que `groupId?` (opcional)? Para não quebrar usos futuros fora de
> contexto de grupo (`/matches` global) — mantém compat com o `MatchCard`
> existente que já fazia esse fallback.

---

## Estados visuais e cenários

| Cenário                                                  | Comportamento                                     |
|----------------------------------------------------------|---------------------------------------------------|
| `match.status !== 'upcoming'`                            | Bloco de pré-jogo nem é carregado (`enabled=false`) |
| `match.status === 'upcoming'` mas backend devolveu erro  | `preview === undefined` → bloco simplesmente omitido |
| `prediction === null` (sem odds p/ a fixture)            | Card `PreMatchProbability` não renderiza          |
| `lineups.length === 0`                                   | Card mostra "Escalações publicadas ~30–60min antes" |
| `injuries.length === 0`                                  | Card `PreMatchInjuries` não renderiza             |
| `recentForm.home` **e** `recentForm.away` ambos `null`   | Card `PreMatchRecentForm` não renderiza           |
| Só um lado de `recentForm` é `null`                      | Card mostra apenas a coluna disponível            |
| `venue.image === null` e sem nada do venue/referee       | Card `PreMatchVenue` não renderiza                |
| Time tem `colors === null`                               | Fallback `--brand` (home) / `--support` (away)    |
| Partida sem `api_fixture_id` (cadastrada manual)         | `hasApiFixtureId=false` → probabilidade/escalação/desfalques/venue omitidos, **mas a forma recente ainda aparece** (usa `api_team_id`, não a fixture) |

Tudo isso é projetado pelo backend (DTO já chega com `null` / `[]`
quando não há dado). O front não precisa fazer try/catch além do que o
`useQuery` já gerencia.

---

## Mobile-first

- Container externo da `MatchDetailPage` continua `max-w-lg` — todos os
  cards do pré-jogo herdam essa largura.
- Componentes não declaram larguras absolutas. Usam `w-full` + `grid`
  com `sm:grid-cols-2` para abrir em 2 colunas a partir de 640px.
- Foto do estádio responsiva via `aspect-[16/9] sm:aspect-[21/9]`.
- Ícones `h-3.5 w-3.5` (escala pequena) — leitura no mobile não pesa.
- Textos truncados via `truncate` em listas de jogadores/desfalques.

---

## Invariantes do front

1. **`enabled` do `useMatchPreview` casa com `match.status === 'upcoming'`**.
   Buscar preview de partida ao vivo ou finalizada é desperdício.
2. **Não duplicamos type checks** com Zod no front — o backend já
   tipa o DTO e o `apiGet` é tipado via genéricos.
3. **Não traduzimos `advice` / `winner.comment`** — vêm em inglês da
   API e isso é mostrado como referência ("Recomendação:"). Traduzir
   exigiria mapa estático e teria buracos toda vez que a API adicionar
   um detalhe novo.
4. **A foto do estádio é cacheada pelo navegador** — não passamos por
   nenhum proxy. URL externa de `media.api-sports.io`.
4b. **Bandeiras da forma recente seguem a origem do dado:** seleção
   cadastrada → sistema de bandeiras (`TeamFlagImage` + `teamId`);
   adversário → URL crua da API (`opponent.logo`). Não misturar: o front
   não tenta resolver a bandeira cadastrada do adversário.
5. **`groupId` opcional** em `GroupStageGrid`/`KnockoutBracket` mantém
   compat com uso fora de grupo (não usado hoje, mas preserva o
   `MatchCard` existente).

---

## Pontos de alteração futura

- Mostrar a "tabela do grupo" do jogo (já temos `/api-football/standings`
  proxiado — basta um card abaixo do venue).
- Mostrar **head-to-head** dos últimos 5 confrontos (também já proxiado) —
  complementa a forma recente (que olha cada seleção isoladamente).
- Quando o adversário da forma recente também for um time **cadastrado**
  (matchable por `api_team_id`), usar o sistema de bandeiras nele também,
  em vez da URL da API.
- Tradução simples do `winner.comment` ("Win" → "Vitória", "Win or draw"
  → "Vitória ou empate") — mapa estático de 3-4 entradas.
- Posicionar reservas no banco virtual (faixa lateral do campo 2D) em
  vez de lista — só rola se os designs aprovarem.
- Skeleton de loading nos 4 cards (hoje aparecem só quando o `useQuery`
  resolve; sem placeholder visual durante a primeira carga).
