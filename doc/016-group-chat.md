# Chat por bolão

Documenta o widget de chat textual exibido nas páginas internas de um bolão.

## Arquivos principais

| Área | Arquivos |
| --- | --- |
| Service HTTP/SSE | `src/services/chat.service.ts` |
| Hook de estado | `src/hooks/useGroupChat.ts` |
| UI | `src/components/group-chat/GroupChatWidget.tsx`, `GroupChatPanel.tsx` |
| Push | `src/hooks/usePushNotifications.ts`, `src/services/notification.service.ts` |
| Montagem | `src/components/layout/GroupShell.tsx` |
| Tipos | `src/types/group-chat.types.ts` |

## Comportamento

O `GroupChatWidget` é montado no `GroupShell`, mas só renderiza quando a rota
tem `groupId` em `/groups/:groupId/*` e o bolão vem com `chatEnabled=true`.
Assim o chat não aparece em `/profile`, `/matches`, onboarding, login, admin ou
bolões ainda não liberados.

Bolões novos começam com `chatEnabled=false`. A página `/admin/chat` lista os
bolões via `listAdminGroups` e permite ativar/ocultar o chat em grupos
selecionados por `setGroupChatEnabled(groupId, chatEnabled)`. A flag é apenas
visual: o frontend esconde o ícone/widget, mas o backend do chat segue
autorizando por sessão e membership.

O botão flutuante usa `MessageCircle`, mostra badge de não-lidas, indicador
`@` quando há menção não vista e fica acima da bottom nav no mobile. Ao abrir,
o painel carrega a primeira janela de mensagens do backend:

- com não-lidas, a janela vem ancorada em `lastSeenMessageId`;
- sem não-lidas, mostra as últimas mensagens;
- ao rolar para o topo, carrega antigas com `beforeId`.

Quando a notificação Web Push é clicada, a URL `/groups/:groupId?chat=1` abre o
bolão e o `GroupChatWidget` abre o painel automaticamente.

## Realtime

O hook abre `EventSource` em
`/api/groups/:groupId/chat/events` com `withCredentials: true`, preservando a
autenticação por cookie httpOnly. Eventos `message.created` atualizam o badge e
anexam mensagens quando a janela já está carregada. Ao trocar de grupo, o
EventSource anterior é fechado. Se o stream reconectar, o hook busca mensagens
novas com `afterId` a partir do último ID conhecido e atualiza o estado do chat
no backend.

## UX

- Mensagens próprias ficam alinhadas à direita; mensagens de outros membros à
  esquerda com avatar/nome.
- A linha do autor mostra a posição atual do jogador no ranking como número
  ordinal compacto ao lado do nome. Jogadores empatados em primeiro aparecem com
  o nome em amarelo e emoji de coroa, inclusive nas mensagens do próprio usuário.
  Em mensagens próprias, o autor aparece como `você`.
- O painel mostra separadores de data, horário por mensagem, quebra de linha e
  `break-words`.
- O composer envia com Enter no desktop, quebra linha com Shift+Enter e, no
  teclado mobile, Enter insere quebra de linha no padrão nativo. O campo mantém
  fonte de 16px para evitar zoom de foco no iOS, desliga assistentes de texto
  do navegador (`autocomplete`, `autocorrect`, `autocapitalize`, `spellcheck`) e
  expande até algumas linhas antes de ativar rolagem interna discreta.
- O composer tem um botão de emoji no padrão de chat: ao clicar, abre um picker
  compacto com recentes, novos e categorias por tipo, busca visível no topo e
  seleção rápida de tom dos emojis. O usuário pode selecionar vários emojis em
  sequência, inserir junto ao texto ou enviar somente emoji; no mobile, abrir o
  picker e selecionar emojis mantém o teclado do composer estável. O conjunto
  padrão é renderizado pela fonte nativa do sistema (`EmojiStyle.NATIVE`): zero
  requisições, carregamento instantâneo. Apenas as entradas recentes de Emoji
  16.0 e 17.0 que ainda não vêm na base do pacote são injetadas como
  `customEmojis` (imagens do jsdelivr), pois nem todo SO tem glifo para elas.
  Atenção: o picker virtualiza a lista, então o label de categoria precisa de
  altura > 0 (`--epr-category-label-height: 1px`) — com `0px` o
  `getLabelHeight()` cai no fallback de 40px e os offsets do scroll divergem,
  fazendo emojis sumirem ao rolar. O painel fecha pelo botão de fechar, Escape
  ou clique fora.
- Ao digitar `@`, o composer abre a lista de membros do bolão. Só escolhas
  feitas nessa lista enviam `mentionedUserIds`; texto `@nome` digitado
  manualmente continua sendo texto comum.
- Mensagens que mencionam o usuário atual recebem destaque visual no painel e
  os tokens `@Nome` conhecidos são realçados sem HTML bruto.
- O texto é validado no cliente e no servidor: 1 a 250 caracteres e até 6 linhas.
- Quando o usuário chega ao fim da lista, o hook atualiza o read-state no
  backend.
- Ao abrir ou reabrir o painel, a lista restaura a posição local do chat por
  bolão/usuário. Sem posição local, abre na última mensagem vista quando há
  não-lidas; caso contrário, abre no fim. O scroll de outras páginas não
  influencia a lista do chat.
- Se o usuário já está no fim da lista, novas mensagens mantêm o scroll preso
  no fim para revelar a mensagem recém-chegada.
- Se o usuário está lendo mensagens anteriores, novas mensagens não roubam o
  scroll; o painel mostra um botão flutuante só com seta para baixo e contador
  de mensagens novas, levando direto ao fim da lista. O mesmo atalho aparece
  sem contador quando o usuário rola para cima manualmente.
- Ao enviar uma mensagem própria, o painel rola a lista para revelar a mensagem
  recém-criada.
- No mobile, o painel bloqueia o scroll da página de fundo enquanto está aberto;
  a lista de mensagens permanece como a área rolável.
- Quando a PWA instalada ainda não tem push ativo, o painel abre um popup claro
  e mantém o CTA discreto no topo para ativar notificações do chat.

## Web Push

O frontend não envia notificações diretamente. Ele apenas registra a
`PushSubscription` e recebe pushes pelo service worker. O backend envia no
máximo uma notificação genérica por bolão enquanto o usuário tiver mensagens não
lidas; ler o chat libera uma nova notificação futura.

Detalhes em `017-push-notifications.md` e no backend em
`../../betabet/Doc/024-push-notifications.md`.

## Pontos de atenção

- O MVP é texto puro: sem mídia, edição, exclusão, reações ou typing indicator.
- Menções são múltiplas, deduplicadas e limitadas a 10 usuários por mensagem.
- Não usar React Query para a lista do chat; o estado local evita conflito entre
  paginação manual, SSE e preservação de scroll.
- O service worker do PWA mantém `/api/*` como `NetworkOnly`, então o stream não
  deve ser cacheado.
- `chatEnabled=false` deve impedir o `EventSource`: o widget passa `groupId=null`
  ao hook enquanto o chat está oculto.
- O backend limita rajadas de envio e excesso de conexões SSE por usuário; se
  houver múltiplas instâncias, esses limites precisam de store compartilhada.
