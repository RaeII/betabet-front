# Autenticação no frontend

Este documento descreve como o frontend autentica usuário comum e admin.
Usuário comum usa código de 6 dígitos enviado por e-mail. Admin do sistema
continua usando e-mail + senha.

## Arquivos principais

| Área | Arquivos |
| --- | --- |
| Cliente HTTP | `src/services/api.ts` |
| Auth usuário | `src/context/auth.context.tsx`, `src/hooks/useAuth.ts`, `src/services/auth.service.ts`, `src/types/auth.types.ts` |
| Auth admin | `src/context/admin.context.tsx`, `src/hooks/useAdminAuth.ts`, `src/services/admin.service.ts`, `src/types/admin.types.ts` |
| Rotas e guards | `src/router/index.tsx`, `src/router/guards/AuthGuard.tsx`, `src/router/guards/AdminGuard.tsx`, `src/router/guards/OnboardingGuard.tsx` |
| Telas públicas | `src/pages/auth/LoginPage.tsx`, `src/pages/auth/RegisterPage.tsx`, `src/pages/admin/AdminLoginPage.tsx` |

## Transporte da sessão

O frontend não guarda JWT em `localStorage`, `sessionStorage` nem estado global
persistente. Toda chamada usa:

```ts
credentials: 'include'
```

O cookie httpOnly é criado pelo backend apenas após validação do código.

## Sessão do usuário comum

`AuthProvider` mantém:

- `user`, `isAuthenticated`, `isLoading`;
- `requestLoginCode(email)`;
- `verifyLoginCode({ challengeId, code })`;
- `requestRegisterCode(data)`;
- `verifyRegisterCode({ challengeId, code })`;
- `logout` e `setUser`.

Ao carregar a aplicação, o provider chama `GET /api/auth/me`. `401` limpa a
sessão local; outros erros tentam novamente com backoff.

## Login de usuário

`LoginPage` tem duas etapas:

1. e-mail;
2. código de 6 dígitos em campos individuais com `inputMode="numeric"` e
   `autoComplete="one-time-code"` no primeiro campo.

Ao digitar, o foco avança automaticamente para o próximo dígito. Ao colar um
código completo, os dígitos são distribuídos entre os campos.

Na etapa do código, a tela exibe uma contagem regressiva baseada em
`expiresAt` e a opção de reenviar o código. O botão respeita
`resendAvailableAt` e chama novamente `POST /api/auth/login/request-code` para
gerar um novo `challengeId`. Enquanto uma solicitação de envio ou reenvio está
pendente, a tela mantém uma trava local para evitar chamadas duplicadas por
duplo clique; a proteção autoritativa continua no backend.

Contratos:

```http
POST /api/auth/login/request-code
POST /api/auth/login/verify-code
```

Em sucesso, `verifyLoginCode` salva o usuário no contexto e a tela navega para
`/`, ou tenta entrar no grupo quando há `invite` na URL.

## Cadastro de usuário

`RegisterPage` tem duas etapas:

1. nome, e-mail e código de indicação opcional;
2. código de 6 dígitos em campos individuais.

Ao digitar, o foco avança automaticamente para o próximo dígito. Ao colar um
código completo, os dígitos são distribuídos entre os campos.

Na etapa do código, a tela usa `expiresAt` para mostrar a contagem regressiva
de expiração e permite reenviar o código quando `resendAvailableAt` já passou.
O reenvio reutiliza `POST /api/auth/register/request-code` e substitui o
`challengeId` anterior. Enquanto uma solicitação de envio ou reenvio está
pendente, a tela mantém uma trava local para evitar chamadas duplicadas por
duplo clique; a proteção autoritativa continua no backend.

Contratos:

```http
POST /api/auth/register/request-code
POST /api/auth/register/verify-code
```

Não existe campo de senha nem confirmação de senha no cadastro de usuário
comum.

Depois do cadastro:

- com `invite` válido, tenta entrada no grupo;
- se o grupo permite entrada direta, navega para `/groups/:groupId`;
- se exige aprovação, navega para `/onboarding` com estado pendente;
- sem convite, navega para `/`.

## Admin do sistema

Admin do sistema continua separado e usa senha.

`AdminLoginPage` valida com `AdminLoginSchema` e chama:

```http
POST /api/admin/auth/login
```

`AdminAuthProvider` valida a sessão chamando `GET /api/admin/stats`, pois não há
endpoint dedicado `/api/admin/auth/me`.

## Guards

`AuthGuard` protege rotas de usuário comum e redireciona para `/auth/login`
preservando `location.search`.

`OnboardingGuard` consulta `GET /api/groups`; se o usuário não tem grupos e não
está no onboarding, redireciona para `/onboarding`.

`AdminGuard` protege `/admin/*` e redireciona para `/admin/login` quando a
sessão admin não é válida.

## Testes relacionados

- `tests/integration/pages/AuthPages.test.tsx`
- `tests/mocks/handlers/auth.handlers.ts`
- `tests/integration/pages/AdminGuard.test.tsx`
- `tests/unit/guards/OnboardingGuard.test.tsx`
