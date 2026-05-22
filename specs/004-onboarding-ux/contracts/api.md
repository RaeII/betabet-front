# API Contract Delta: Onboarding UX & Grupos

**Feature**: `004-onboarding-ux` | **Date**: 2026-05-22
**Base**: `specs/001-betabet-front/contracts/api.md`

Este documento registra apenas as **alterações** em relação ao contrato base. Todos os outros
endpoints permanecem inalterados.

---

## Grupos

### POST /api/groups — atualização

Campo novo aceito no request body:

**Request body (delta)**:
```json
{
  "name": "string",
  "emoji": "string | undefined",
  "coverUrl": "string | undefined",
  "resultPoints": "number | undefined",
  "exactScorePoints": "number | undefined",
  "showBetsBeforeKickoff": "boolean | undefined",
  "joinMode": "'invite' | 'request' | undefined"
}
```

- `emoji`: emoji único (ex.: `"🏆"`). Mutuamente exclusivo com `coverUrl` — se ambos enviados, `coverUrl` tem precedência.

**Response 201 — BettingGroup shape atualizada**:
```json
{
  "group": {
    "id": "string",
    "name": "string",
    "emoji": "string | null",
    "coverUrl": "string | null",
    "adminId": "string",
    "resultPoints": "number",
    "exactScorePoints": "number",
    "showBetsBeforeKickoff": "boolean",
    "joinMode": "'invite' | 'request'",
    "memberCount": "number",
    "inviteCode": "string",
    "createdAt": "string (ISO 8601)"
  }
}
```

**Erros**: `400` (validação), `401` (não autenticado)

---

## Endpoints reutilizados sem alteração

Os endpoints abaixo já existem e são usados pelo fluxo de onboarding sem modificação:

| Endpoint | Uso no onboarding |
|----------|-------------------|
| `GET /api/groups` | `OnboardingGuard` verifica se `groups.length === 0` |
| `GET /api/groups/invite/:code` | `JoinGroupPage` resolve o código antes de confirmar |
| `POST /api/groups/:groupId/join` | `JoinGroupPage` confirma entrada no grupo |

---

## Sem novos endpoints

Nenhum endpoint novo é necessário. O fluxo de onboarding é inteiramente coberto pelo contrato
existente com a adição do campo `emoji` na criação de grupos.
