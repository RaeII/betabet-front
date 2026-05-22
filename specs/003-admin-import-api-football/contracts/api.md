# API Contract: Admin Import API Football

**Version**: 1.0 | **Date**: 2026-05-21
**Base URL (dev)**: proxied through Vite at `/api` → `VITE_API_URL`
**Auth**: Admin session cookie (HttpOnly, SameSite=Lax). All routes require valid admin session.

All requests and responses use `Content-Type: application/json`.
Error responses follow: `{ "error": string, "code": string }`.

---

## Import Status

### GET /api/admin/import/status

Returns current import counts comparing local DB to API Football totals.
Loaded automatically on page mount (lightweight DB-only query — no API Football call).

**Response 200**:
```json
{
  "teamsInApi": 48,
  "teamsInDb": 12,
  "matchesInApi": 104,
  "matchesInDb": 0
}
```

**Errors**: `401` (no admin session)

---

## Teams Import

### GET /api/admin/import/teams/preview

Fetches all World Cup teams from API Football (does **not** persist anything).
Returns each team with a flag indicating whether it already exists in the local DB.

**Response 200**:
```json
{
  "teams": [
    {
      "apiTeamId": 6,
      "name": "Brazil",
      "flagUrl": "https://media.api-sports.io/flags/br.svg",
      "country": "Brazil",
      "groupLetter": "D",
      "exists": false
    }
  ]
}
```

**Errors**: `401` (no admin session), `503` (API Football unavailable)

---

### POST /api/admin/import/teams

Imports all teams that do not yet exist in the local DB. Existing teams are skipped (not overwritten).

**Request body**: none (empty body or `{}`)

**Response 200**:
```json
{
  "created": 48,
  "skipped": 0,
  "total": 48,
  "errors": []
}
```

**Errors**: `401` (no admin session), `503` (API Football unavailable for re-fetching)

---

### POST /api/admin/import/teams/:apiTeamId

Imports a single team by its API Football ID.

**Path param**: `apiTeamId` — integer, the API Football team ID.

**Request body**: none

**Response 201**:
```json
{
  "created": 1,
  "skipped": 0,
  "total": 1,
  "errors": []
}
```

**Errors**:
- `401` (no admin session)
- `409` `{ "error": "Team already imported", "code": "TEAM_EXISTS" }` — team already in DB
- `404` `{ "error": "Team not found in API", "code": "API_NOT_FOUND" }` — apiTeamId doesn't exist in API Football

---

## Matches Import

### GET /api/admin/import/matches/preview

Fetches all World Cup matches from API Football (does **not** persist anything).
Returns each match with flags for DB existence and team availability.

**Response 200**:
```json
{
  "matches": [
    {
      "apiFixtureId": 1035049,
      "homeTeam": {
        "apiTeamId": 6,
        "name": "Brazil",
        "flagUrl": "https://media.api-sports.io/flags/br.svg",
        "country": "Brazil",
        "groupLetter": "D",
        "exists": true
      },
      "awayTeam": {
        "apiTeamId": 24,
        "name": "Croatia",
        "flagUrl": "https://media.api-sports.io/flags/hr.svg",
        "country": "Croatia",
        "groupLetter": "D",
        "exists": false
      },
      "scheduledAt": "2026-06-14T15:00:00Z",
      "status": "upcoming",
      "phase": "group",
      "groupName": "Group D",
      "matchday": 1,
      "homeScore": null,
      "awayScore": null,
      "exists": false,
      "teamsImported": false
    }
  ]
}
```

**Errors**: `401` (no admin session), `503` (API Football unavailable)

---

### POST /api/admin/import/matches

Imports all eligible matches (not yet in DB + both teams already imported).
Matches with absent teams are skipped and listed in the response.

**Request body**: none

**Response 200**:
```json
{
  "created": 80,
  "skipped": 24,
  "total": 104,
  "errors": [],
  "skippedItems": [
    {
      "apiFixtureId": 1035049,
      "reason": "Teams not imported: Brazil, Croatia"
    }
  ]
}
```

**Note**: `skippedItems` is present only on the bulk match import endpoint to explain why matches were skipped.

**Errors**: `401` (no admin session), `503` (API Football unavailable)

---

### POST /api/admin/import/matches/:apiFixtureId

Imports a single match by its API Football fixture ID.

**Path param**: `apiFixtureId` — integer, the API Football fixture ID.

**Request body**: none

**Response 201**:
```json
{
  "created": 1,
  "skipped": 0,
  "total": 1,
  "errors": []
}
```

**Errors**:
- `401` (no admin session)
- `409` `{ "error": "Match already imported", "code": "MATCH_EXISTS" }`
- `422` `{ "error": "Teams not imported: Brazil, Croatia", "code": "TEAMS_MISSING" }`
- `404` `{ "error": "Match not found in API", "code": "API_NOT_FOUND" }`

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Resource created |
| 401  | Not authenticated (admin session missing or expired) |
| 404  | Resource not found in API Football |
| 409  | Conflict — item already exists in local DB |
| 422  | Unprocessable — dependency missing (teams not imported) |
| 503  | API Football service unavailable |
