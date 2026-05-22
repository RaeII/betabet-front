# Data Model: Admin Import API Football

**Branch**: `003-admin-import-api-football` | **Date**: 2026-05-21

All types live in `src/types/import.types.ts` (Constitution Principle II).
These are frontend DTOs — no local persistence. Backend handles DB operations.

---

## TeamPreview

Response shape from `GET /api/admin/import/teams/preview` (each element of the array).

```ts
interface TeamPreview {
  apiTeamId: number          // API Football team ID (external key)
  name: string               // Display name, e.g. "Brazil"
  flagUrl: string            // Logo/flag image URL from API Football CDN
  country: string            // Country name, e.g. "Brazil"
  groupLetter: string | null // World Cup group (A–L), null if not assigned
  exists: boolean            // true = already saved in the local DB
}
```

**Validation rules**: `apiTeamId` must be a positive integer. `name` must be non-empty. `exists` is always present (never undefined).

---

## MatchPreview

Response shape from `GET /api/admin/import/matches/preview` (each element of the array).

```ts
interface MatchPreview {
  apiFixtureId: number       // API Football fixture ID (external key)
  homeTeam: TeamPreview      // Home team data with exists flag
  awayTeam: TeamPreview      // Away team data with exists flag
  scheduledAt: string        // ISO 8601 UTC datetime
  status: MatchStatus        // Reuses existing 'upcoming'|'live'|'finished'|'cancelled'
  phase: TournamentPhase     // Reuses existing 'group'|'r16'|'qf'|'sf'|'final'
  groupName: string | null   // e.g. "Group A"; null for knockout phases
  matchday: number | null    // 1–3 for group stage; null for knockout
  homeScore: number | null   // null if not played yet
  awayScore: number | null   // null if not played yet
  exists: boolean            // true = match already saved in the local DB
  teamsImported: boolean     // true = both homeTeam and awayTeam exist in the local DB
}
```

**Validation rules**: `apiFixtureId` must be a positive integer. `teamsImported` is derived by the backend (true iff both `homeTeam.exists` and `awayTeam.exists` are true in the DB context).

---

## ImportResult

Response shape from `POST /api/admin/import/teams`, `POST /api/admin/import/teams/:apiTeamId`,
`POST /api/admin/import/matches`, `POST /api/admin/import/matches/:apiFixtureId`.

```ts
interface ImportResult {
  created: number    // Items newly inserted in the DB
  skipped: number    // Items already present in the DB (not overwritten)
  total: number      // Total items processed (created + skipped + errors.length)
  errors: string[]   // Human-readable error messages for items that failed
}
```

**Notes**: For single-item endpoints, `total` is always 1. `skipped` is 1 if the item existed (409 scenario surfaced as a result object, not an exception, when calling bulk endpoint).

---

## ImportStatus

Response shape from `GET /api/admin/import/status`.

```ts
interface ImportStatus {
  teamsInApi: number    // Total teams available from API Football for this tournament
  teamsInDb: number     // Teams currently saved in the local DB
  matchesInApi: number  // Total matches available from API Football
  matchesInDb: number   // Matches currently saved in the local DB
}
```

---

## State Relationships

```
ImportStatusPanel
  └── reads: ImportStatus

AdminImportTeamsPage
  ├── reads: ImportStatus (via ImportStatusPanel)
  ├── reads: TeamPreview[]
  └── writes: ImportResult (triggers cache update on TeamPreview[])

AdminImportMatchesPage
  ├── reads: ImportStatus (via ImportStatusPanel)
  ├── reads: MatchPreview[]
  └── writes: ImportResult (triggers cache update on MatchPreview[])
```

---

## Reused Types (no redefinition)

- `MatchStatus` — from `src/types/match.types.ts`
- `TournamentPhase` — from `src/types/match.types.ts`

Import these in `import.types.ts` to avoid duplication (Constitution Principle I).
