# Web Push notifications

Documenta a camada frontend de notificações Web Push do PWA instalado.

## Escopo atual

O frontend permite ativar notificações apenas quando o app está rodando como
PWA instalada (`standalone`) e o navegador expõe `Notification`, Service Worker
e `PushManager`.

Nesta fase, o único tipo entregue ao usuário é `chat.message`, com texto
genérico:

- título: `Nova mensagem no bolão`;
- corpo: `Abra o chat para ver.`;
- clique: abre `/groups/:groupId?chat=1`.

Os tipos `match.starting`, `match.result` e `bet.reminder` existem no contrato
do backend, mas não têm produtores nem UI específica ainda.

## Arquivos principais

| Área | Arquivos |
| --- | --- |
| Service Worker | `src/sw.ts`, `vite.config.ts` |
| Service HTTP | `src/services/notification.service.ts` |
| Hook | `src/hooks/usePushNotifications.ts` |
| Host global | `src/components/notifications/PushNotificationHost.tsx` |
| UI | `src/pages/profile/ProfilePage.tsx`, `src/components/group-chat/GroupChatPanel.tsx` |

## Fluxo

1. `PushNotificationHost` roda após autenticação e ressincroniza uma assinatura
   já concedida, sem pedir permissão sozinho.
2. O card do Perfil e o CTA do chat chamam `usePushNotifications().enable()`
   somente após clique explícito do usuário.
3. O hook busca `GET /api/notifications/web-push-key`, pede permissão, cria a
   `PushSubscription` no Service Worker e registra em
   `POST /api/notifications/subscriptions`.
4. Ao desativar ou sair do app, o frontend tenta revogar a assinatura via
   `DELETE /api/notifications/subscriptions` e depois chama `unsubscribe()`.

## Service Worker

O PWA usa `vite-plugin-pwa` com `injectManifest` para permitir código customizado
no `src/sw.ts`. O SW preserva:

- precache do app shell;
- fallback SPA para `/index.html`, exceto `/api/*` e `/admin/*`;
- `/api/*` em `NetworkOnly`;
- imagens em `StaleWhileRevalidate`;
- fontes em `CacheFirst`;
- fluxo de atualização por prompt (`SKIP_WAITING`).

No evento `push`, o SW suprime a notificação se já houver uma janela visível do
app. No `notificationclick`, foca uma janela existente ou abre a URL da payload.

## Pontos de atenção

- A permissão não pode ser pedida automaticamente; navegadores exigem gesto do
  usuário.
- iOS/iPadOS exige PWA adicionada à Tela de Início e versão 16.4+.
- O corpo da mensagem do chat não vai para a notificação para reduzir exposição
  na tela bloqueada.
- O backend controla anti-flood por usuário e bolão; o frontend apenas ativa,
  remove e recebe.
