# Chat por bolão

Documenta o widget de chat textual exibido nas páginas internas de um bolão.

## Arquivos principais

| Área | Arquivos |
| --- | --- |
| Service HTTP/SSE | `src/services/chat.service.ts` |
| Hook de estado | `src/hooks/useGroupChat.ts` |
| UI | `src/components/group-chat/GroupChatWidget.tsx`, `GroupChatPanel.tsx` |
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

O botão flutuante usa `MessageCircle`, mostra badge de não-lidas e fica acima
da bottom nav no mobile. Ao abrir, o painel carrega a primeira janela de
mensagens do backend:

- com não-lidas, a janela vem ancorada em `lastSeenMessageId`;
- sem não-lidas, mostra as últimas mensagens;
- ao rolar para o topo, carrega antigas com `beforeId`.

## Realtime

O hook abre `EventSource` em
`/api/groups/:groupId/chat/events` com `withCredentials: true`, preservando a
autenticação por cookie httpOnly. Eventos `message.created` atualizam o badge e
anexam mensagens quando a janela já está carregada. Ao trocar de grupo, o
EventSource anterior é fechado.

## UX

- Mensagens próprias ficam alinhadas à direita; mensagens de outros membros à
  esquerda com avatar/nome.
- O painel mostra separadores de data, horário por mensagem, quebra de linha e
  `break-words`.
- O composer envia com Enter e quebra linha com Shift+Enter.
- O texto é validado no cliente e no servidor: 1 a 1000 caracteres.
- Quando o usuário chega ao fim da lista, o hook atualiza o read-state no
  backend.

## Pontos de atenção

- O MVP é texto puro: sem mídia, edição, exclusão, reações ou typing indicator.
- Não usar React Query para a lista do chat; o estado local evita conflito entre
  paginação manual, SSE e preservação de scroll.
- O service worker do PWA mantém `/api/*` como `NetworkOnly`, então o stream não
  deve ser cacheado.
- `chatEnabled=false` deve impedir o `EventSource`: o widget passa `groupId=null`
  ao hook enquanto o chat está oculto.
