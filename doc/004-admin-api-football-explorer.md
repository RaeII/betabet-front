# 004 - Admin · API-Football Explorer

## Objetivo

Documenta a página de admin **API-Football Explorer**, uma ferramenta interna
para descobrir IDs de **ligas**, **times** e **jogos** diretamente na API-Football
(inclusive partidas **fora da Copa do Mundo**). É usada principalmente para
encontrar um `fixtureId` para testar a infra de partidas ao vivo e para
identificar IDs antes de uma importação manual.

A regra de negócio e as rotas estão documentadas no backend em
`Doc/004-admin-api-football-explorer.md`.

---

## Comportamento

Acessível em **`/admin/explorer`** (lazy route, dentro do `AdminShell`).
O sidebar do admin tem um item "API-Football Explorer" com o ícone `Compass`.

A página tem **duas abas**:

### Aba 1 — *Ligas → Jogos* (default)

Layout em duas colunas (≥ `lg`):

- **Coluna esquerda — Ligas**
  - Campo de busca por nome (debounce de 350ms, mínimo 3 letras).
  - Checkbox *Apenas atuais* (default ligado) → adiciona `current=true`.
  - Lista de ligas como cards clicáveis com logo + nome + país + tipo.
  - **Badge fixo `Liga <id>`** em cada card (monoespaçado, cor `brand`).
  - Card selecionado ganha borda `--brand`.
  - Estado vazio: orienta a digitar ou marcar "apenas atuais".

- **Coluna direita — Jogos da liga selecionada**
  - Cabeçalho com logo + nome + país + tipo + badge `Liga <id>`.
  - `<select>` de **temporada** (preenchido a partir de `league.seasons`,
    ordenado decrescente, default = `seasons.find(current).year`).
  - Três botões de escopo: **Próximos** (`next=20`), **Últimos** (`last=20`),
    **Ao vivo** (`live=all`).
  - Lista de fixtures (componente `FixturesList` compartilhado).

### Aba 2 — *Buscar por Time*

- Form com:
  - Input `ID do time` (com label flutuante e `inputMode="numeric"`).
  - `<select>` direção: **Próximos** (`next`) ou **Últimos** (`last`).
  - `<select>` quantidade: 5 / 10 / 20 / 30.
  - Botão **Buscar**.
- Validação simples: id precisa ser inteiro positivo.
- Resultado: lista de fixtures (com a coluna **liga + ID da liga** visível,
  porque um time joga em várias competições — diferente da aba 1, que já
  está filtrada por liga).

### IDs sempre visíveis

Em todos os pontos onde aparece uma entidade da API:

- Card de liga → `IdBadge label="ID"`
- Cabeçalho da liga → `IdBadge label="Liga"`
- Linha do fixture → `IdBadge label="Fixture"` no cabeçalho da linha
- Cabeçalho do fixture (quando `showLeague`) → `IdBadge label="Liga"`
- Time (home/away) → texto monoespaçado `ID <n>` abaixo do nome

`IdBadge` é um wrapper sobre `<Badge>` (cor `brand`, fonte mono, tamanho 10).

---

## Status e cache visível

Cada query exibe um `QueryStatus` discreto:

- `Loading…` com spinner.
- Mensagem de erro padronizada (usa `error.message` quando é `ApiRequestError`).
- "N resultados · cache HH:MM:SS" — `cachedAt` vem do `meta` do envelope, então
  o admin enxerga se está olhando dado fresco ou cacheado.
- Spinner pequeno quando `isFetching` mas tem cache (revalidação).

---

## Estado e dados

React Query (já configurado globalmente) com chaves canônicas:

```ts
['admin', 'api-football', 'leagues', { search, currentOnly }]
['admin', 'api-football', 'fixtures', 'league', leagueId, season, scope]
['admin', 'api-football', 'fixtures', 'team', teamId, direction, count]
```

- `staleTime` de 5 min para ligas, 60s para fixtures (em cima do cache TTL do
  backend, que já tem 24h/1h/15s dependendo do status).
- Leagues query só dispara se `search.length >= 3` **ou** `currentOnly` está
  marcado (evita request inicial pesado sem filtro).
- Selecionar uma liga não dispara fetch das fixtures até o componente
  `LeagueFixtures` montar (lazy via render condicional).
- Trocar de liga reseta `season` e `scope` via `useEffect` dependendo de
  `league.league.id` (sem isso, a query key não muda se o `defaultSeason`
  bater por coincidência).

---

## Service

`src/services/apiFootballExplorer.service.ts` expõe 3 wrappers tipados:

```ts
listLeagues(params)     // GET /api/admin/api-football/leagues
listTeams(params)       // GET /api/admin/api-football/teams
listFixtures(params)    // GET /api/admin/api-football/fixtures
```

Tipos `ApiFootballLeague` / `ApiFootballTeam` / `ApiFootballFixture` são uma
projeção dos campos efetivamente usados pela UI — não tipam o payload inteiro
da API-Football, mas são compatíveis com ele (campos extras são ignorados).

O service usa `apiGet` de `src/services/api.ts`, que já injeta credentials e
trata erros via `ApiRequestError`.

---

## Arquivos relevantes no frontend

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/admin/AdminApiFootballExplorerPage.tsx` | Página, abas, todos os subcomponentes (LeagueExplorer, LeagueFixtures, TeamSearch, FixturesList, FixtureRow, TeamCell, StatusPill, IdBadge, QueryStatus, EmptyState) |
| `src/services/apiFootballExplorer.service.ts` | Wrappers tipados das 3 rotas + tipos consumidos pela UI |
| `src/router/index.tsx` | Rota lazy `/admin/explorer` dentro do `AdminShell` |
| `src/pages/admin/AdminShell.tsx` | Item "API-Football Explorer" no sidebar do admin |

Componentes reutilizados (sem alteração): `Button`, `Input`, `Badge`, `cn`,
`apiGet`, `ApiRequestError`.

---

## Pontos de atenção

- **Não importa nem persiste nada.** Este painel é só leitura — para gravar
  times/partidas no banco use o fluxo de **Importar Seleções** /
  **Importar Partidas**.
- **Sessão admin obrigatória.** As rotas exigem o cookie `admin_token`. Em
  produção, abrir a página sem login admin redireciona para `/admin/login`
  pelo `AdminGuard`.
- **Quota da API-Football é compartilhada** com o resto do app. O cache do
  backend evita repetir requests dentro da janela TTL, mas filtros muito
  abertos (ex.: `current=true` sem `search`) podem retornar centenas de
  ligas em uma chamada — prefira buscar por nome.
- **Imagens** (logos de ligas/times) vêm de `media.api-sports.io` e não
  contam na quota diária, mas têm rate por segundo — usamos `loading="lazy"`
  e escondemos a `<img>` em caso de erro de carregamento.
- **Time pode estar em várias ligas.** A aba *Buscar por Time* mostra a
  liga + ID da liga em cada linha por isso; já a aba *Ligas → Jogos* omite
  esses campos (todos os jogos são da liga selecionada).

---

## Pontos de alteração futura

- **Detalhes do fixture** (events, lineups, statistics) — hoje a linha mostra
  só placar/status/venue. O backend já expõe `GET /admin/api-football/fixtures?id=X`
  e a resposta vem embutida; basta um drawer/modal ao clicar na linha.
- **Filtros adicionais** na aba de ligas — país, tipo (`League`/`Cup`),
  range de temporadas.
- **Copiar ID** com um clique no `IdBadge` — UX comum em painéis de
  ferramenta interna.
- **Persistir aba ativa** na URL (`?tab=team`) para o admin compartilhar link
  já posicionado.
