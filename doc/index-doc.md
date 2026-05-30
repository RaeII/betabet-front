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

### [004-admin-api-football-explorer.md](./004-admin-api-football-explorer.md)

Documenta a página de admin **API-Football Explorer** (`/admin/explorer`), ferramenta interna read-only para descobrir IDs de ligas, times e jogos diretamente na API-Football.

Principais temas:

- abas **Ligas → Jogos** e **Buscar por Time**, layout 2-colunas e busca debounced;
- seletor de temporada por liga e escopo `Próximos / Últimos / Ao vivo` para fixtures;
- exibição consistente dos IDs (liga, time, fixture) via `IdBadge`;
- service `apiFootballExplorer.service.ts` e wrappers tipados das 3 rotas admin;
- chaves de React Query, `staleTime` e como o `meta.cachedAt` aparece na UI;
- registro da rota lazy em `router/index.tsx` e entrada no sidebar do `AdminShell`;
- pontos de atenção (read-only, quota compartilhada, time pertence a várias ligas).

### [005-admin-friendly-match.md](./005-admin-friendly-match.md)

Documenta o botão **Cadastrar** em cada `FixtureRow` do `/admin/explorer`, que dispara o backend para gravar partidas de outras ligas (não-Copa) e exercitar a infra de jogos ao vivo.

Principais temas:

- estados visuais do botão (`idle / loading / done / error`) e mensagens de feedback;
- estado local por `FixtureRow` com `useState` (sem cache global);
- mapeamento de `ApiRequestError` para mensagens (`409 → "Já cadastrada"`, etc.);
- service `registerFriendlyMatch(apiFixtureId)` em `apiFootballExplorer.service.ts`;
- reuso de `Button` (variants `primary`/`secondary`, size `sm`) e `apiPost`;
- pontos de atenção (não é "Importar Partidas", sessão admin obrigatória, estado não persiste após reload);
- pontos de alteração futura (badge persistente via GET, link para `/admin/matches`, botão de remoção).

### [006-match-preview-pre-match.md](./006-match-preview-pre-match.md)

Documenta a tela de pré-jogo dentro de `MatchDetailPage` (probabilidade de vitória, escalação 2D, desfalques, foto do estádio, árbitro) e a correção do bug de navegação em `GroupJogosPage` que mandava o usuário para `/matches/:id` (rota inexistente).

Principais temas:

- hook `useMatchPreview(matchId, enabled)` com `staleTime: 1h` (bate com o TTL upstream de predictions/injuries);
- service `getMatchPreview(matchId)` consumindo `GET /api/matches/:matchId/preview`;
- componentes `PreMatchProbability` (3 barras + xG + advice), `PreMatchLineup` (campo 2D em SVG com parse de `grid: "linha:coluna"` + toggle Campo/Lista + banco + técnico), `PreMatchInjuries` (badge `Fora`/`Dúvida`) e `PreMatchVenue` (foto com gradiente + cidade + capacidade + árbitro);
- correção da navegação: `GroupJogosPage` lê `groupId` via `useParams` e propaga para `GroupStageGrid`/`KnockoutBracket`; ambos passam para `MatchCard`/`MatchSlot` que constroem o href `/groups/:groupId/matches/:matchId`;
- mobile-first (`w-full`, `grid sm:grid-cols-2`, foto em `aspect-[16/9] sm:aspect-[21/9]`);
- tokens da UI seguidos (`--surface`, `--border`, `--radius-xl`, labels em `tracking-[0.18em]`, amarelo só em badges de "Dúvida");
- cenários cobertos pelo backend (`null` / `[]` quando dado não existe — componentes omitem o card silenciosamente);
- pontos de alteração futura (tabela do grupo, head-to-head, tradução do `winner.comment`, skeleton de loading).

### [007-match-live.md](./007-match-live.md)

Documenta a UI ao vivo dentro de `MatchDetailPage` (scoreboard com cronômetro pulsante, quebra de placar 1T/2T/Prorr/Pên, estatísticas comparativas lado a lado, timeline de eventos, campo 2D com escalação) e o sistema de notificações push (gol/expulsão) via diff de events entre polls.

Principais temas:

- hook `useMatchLive(matchId, enabled)` com `refetchInterval: 60_000` e `refetchIntervalInBackground: false` (bate com o TTL backend de 2 min);
- service `getMatchLive(matchId)` consumindo `GET /api/matches/:matchId/live` — único request que já traz events + lineups + statistics;
- componentes `LiveScoreboard` (placar 4xl + cronômetro `73' +2` + fase/estádio/árbitro), `LiveScoreBreakdown` (só segmentos com valor), `LiveEventsTimeline` (ícones por tipo, layout dual-side por time, mais recente → antigo), `LiveStats` (barras horizontais dual-side com labels PT-BR, tratamento especial para `Ball Possession`);
- reuso de `PreMatchLineup` com `headerLabel="Escalação"` e `emptyMessage` parametrizados — mesmo SVG de campo 2D do pré-jogo;
- hook `useLiveMatchNotifications(matchId, events)` que cria baseline no primeiro render e dispara toasts (⚽ gol / 🟥 expulsão) só nos deltas — sem retroativos ao trocar de match;
- composição na `MatchDetailPage`: scoreboard substitui o header padrão quando `status==='live' && hasApiFixtureId`;
- invariantes (polling só durante live, `homeTeamId` é o ID externo da API-Football, baseline por matchId);
- pontos de alteração futura (polling <60s, Browser Notification API, substituições inline na escalação 2D, stats por tempo, push real via SSE).

### [008-match-postmatch.md](./008-match-postmatch.md)

Documenta a UI pós-jogo dentro de `MatchDetailPage` (placar final com check no vencedor, breakdown 1T/2T/Prorr/Pên, estatísticas finais, timeline completa e escalação) e a correção do bug "jogo fica sempre ao vivo" — o front passa a detectar o término via `live.status.short ∈ {FT, AET, PEN}` sem depender do admin confirmar.

Principais temas:

- hook `useMatchPostMatch(matchId, enabled)` com `staleTime: 30min` (dado imutável após cron salvar) e sem polling;
- service `getMatchPostMatch(matchId)` consumindo `GET /api/matches/:matchId/post-match` (endpoint puramente DB no backend — zero quota da API-Football);
- componente novo `PostMatchScoreboard` espelhando o layout do `LiveScoreboard` com diferenças visuais sutis (badge `Final` no lugar do cronômetro, ponto cinza sem animação, vencedor em `--text` + `✓ `, chips de breakdown só quando há mais de 1 segmento);
- reuso direto de `LiveStats`, `LiveEventsTimeline` e `PreMatchLineup` — DTO pós espelha os shapes do live (`LiveEvent`, `LiveTeamStats`, `PreviewLineup`), sem precisar de abstração genérica;
- detecção `isFinishedView = match.status === 'finished' || live.status.short ∈ {FT, AET, PEN}` resolve o bug em que o bloco ao vivo nunca desligava;
- `postSource` unifica a fonte do snapshot: prioriza o DB (`postMatch.hasPostMatchData=true`), cai pra live cacheado (TTL 1h `Finished` no backend) na janela em que o cron ainda não capturou, ou `null` (header padrão);
- gates `showPostMatchBlock` / `showLiveBlock` mutuamente exclusivos via `!isUpstreamFinished`;
- invariantes (sem alteração nos hooks de preview/live, fontes mutuamente exclusivas, `fetchedAt` não exibido);
- pontos de alteração futura (badge de acerto vs. palpite, stats por tempo, ratings individuais, transição live → pós animada).

### [009-match-my-points.md](./009-match-my-points.md)

Documenta como o frontend exibe os pontos do usuário em uma partida (antes/durante/depois) e alimenta o ranking em tempo real, com pontos consultáveis de forma prática em qualquer tela.

Principais temas:

- service `getMatchMyPoints(matchId, groupId)` consumindo `GET /api/matches/:matchId/my-points?groupId=` (espelha o `MatchMyPointsDTO` do backend);
- hooks `useMatchMyPoints` (1 partida, polling esperto que para ao `confirmed`) e `useGroupLiveMyPoints` (soma os provisórios das partidas ao vivo do grupo), com `matchPointsKeys` compartilhada que o React Query deduplica;
- `MatchPointsCard` na `MatchDetailPage` (estados ao vivo/confirmado/provisório, breakdown resultado/placar exato, total antes → com a partida);
- `MatchPointsBadge` reutilizável: ao vivo via endpoint (dedup), encerrada via `resultPoints`/`exactScorePoints` do próprio palpite (sem rede) — usado em `GroupPalpitesPage` e `MatchCard`;
- overlay ao vivo do `GroupRanking`: aplica o `liveDelta` do usuário, reordena em tempo real e marca quem subiu de posição, sem contar pontos em dobro;
- invariantes (sem dupla contagem, definitivo lido do palpite, busca só com `status==='live'`, pontos exigem grupo) e pontos de alteração futura.

### [010-authentication.md](./010-authentication.md)

Documenta a autenticação no frontend para usuário comum, admin do sistema e admin de grupo.

Principais temas:

- cliente HTTP com `credentials: 'include'` e sessão por cookies httpOnly;
- `AuthProvider` com bootstrap via `GET /api/auth/me`, solicitação/validação de código e logout;
- login/cadastro de usuário comum por código de 6 dígitos, sem senha;
- login admin separado com e-mail e senha;
- preservação de `ref` e `invite` nos fluxos de cadastro/login;
- `AuthGuard`, `OnboardingGuard` e rotas protegidas de usuário;
- `AdminAuthProvider`, login admin e probe via `GET /api/admin/stats`;
- diferença entre admin do sistema e admin de grupo;
- detecção atual de admin de grupo via `role`/fallback `group.adminId === user.id`;
- ponto de atenção de contrato: o backend atual de `GET /api/groups/:groupId` retorna `{ group }`, sem `role`.

### [ui.md](./ui.md)

Documenta a direção visual e as regras de UI do frontend.

Principais temas:

- tokens de cor, superfícies, tipografia e espaçamento;
- padrões de componentes e layouts;
- estados de foco, erro e feedback;
- responsividade e consistência visual.
