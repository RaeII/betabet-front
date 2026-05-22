# Implementation Plan: Admin Import API Football

**Branch**: `003-admin-import-api-football` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-admin-import-api-football/spec.md`

## Summary

A lazy-load import panel in the admin area that lets administrators preview World Cup teams and
matches from API Football and selectively persist them to the local database. The UI shows a
description and a "Buscar" button per entity type — data is only fetched on demand. Each preview
item carries an `exists` flag rendered as a badge, preventing accidental duplicates. Bulk and
individual save operations update the TanStack Query cache in-place (no full refetch) and report
outcomes via toast notifications.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18

**Primary Dependencies**:
- Vite 6 + `@vitejs/plugin-react` (build, dev-proxy)
- Tailwind CSS v4 + `tailwind-merge` + `clsx` (styling)
- shadcn/ui — `Button`, `Badge`, `useToast` (accessible base components)
- TanStack Query v5 — `useQuery` (enabled: false + refetch), `useMutation`, `setQueryData`
- React Router DOM v6 — nested admin routes
- Lucide React — `Download`, `CheckCircle2`, `AlertCircle`, `Loader2` icons

**Storage**: N/A — frontend state via TanStack Query cache only

**Testing**: Vitest + `@testing-library/react` + `msw` (API mocking). Run via `bun run test`.

**Target Platform**: Desktop-first admin panel (Chrome/Firefox; same constraint as existing admin area)

**Performance Goals**:
- Preview list renders in < 200ms after API response received (SC-001, SC-002)
- `exists` badge flips instantly after save (optimistic `setQueryData`)
- Status panel loads in < 500ms (lightweight DB count query)

**Constraints**:
- Files MUST NOT exceed 300 lines (Constitution IV)
- No hard-coded pixels — all spacing from Brasil Essencial tokens
- No new dependencies — reuse TanStack Query, shadcn/ui, Lucide already in project
- No auto-fetch on page mount for preview data (FR-002)
- Preview fetch is one-shot; refetch button available to reload

**Scale/Scope**: ~48 teams, ~104 matches — no pagination needed in v1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. DRY & Simplicity | `import.service.ts` reuses `apiGet`/`apiPost` from `api.ts`; no logic duplicated across hooks | ✅ PASS |
| II. Type Safety | All DTOs in `src/types/import.types.ts`; reuses `MatchStatus`/`TournamentPhase` from `match.types.ts` | ✅ PASS |
| III. Test-First | Vitest tests for all hooks + page integration tests written before implementation | ✅ PASS |
| IV. File Organization | All new files well under 300 lines; page-specific components under `pages/admin/components/`; `useImportStatus` is global (used by both pages) | ✅ PASS |
| V. Performance & Data Freshness | Lazy preview (no auto-fetch); `setQueryData` for instant cache updates after save; `staleTime: 60_000` on status | ✅ PASS |
| VI. Layout Consistency | All tokens from `styles/tokens.css` (Brasil Essencial); uses existing admin nav pattern | ✅ PASS |

**All gates pass. No violations. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-import-api-football/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # REST API contract (Phase 1 output)
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (new files)

```text
src/
├── types/
│   └── import.types.ts                   # DTOs: TeamPreview, MatchPreview, ImportResult, ImportStatus
│
├── services/
│   └── import.service.ts                 # 7 API calls wrapping apiGet/apiPost
│
├── hooks/
│   ├── useImportStatus.ts                # Auto-load import counts (staleTime 60s)
│   ├── useImportTeams.ts                 # Lazy preview query + save mutations (teams)
│   └── useImportMatches.ts              # Lazy preview query + save mutations (matches)
│
└── pages/
    └── admin/
        ├── AdminImportTeamsPage.tsx      # /admin/import/teams — description → buscar → list
        ├── AdminImportMatchesPage.tsx    # /admin/import/matches — description → buscar → list
        └── components/
            ├── ImportStatusPanel.tsx     # Auto-loaded counts widget (shared)
            ├── TeamPreviewRow.tsx        # Flag + name + exists badge + save button
            └── MatchPreviewRow.tsx       # Teams + date + exists/teamsImported badges + save

tests/
├── unit/
│   └── hooks/
│       ├── useImportStatus.test.ts
│       ├── useImportTeams.test.ts
│       └── useImportMatches.test.ts
└── integration/
    └── pages/
        ├── AdminImportTeamsPage.test.tsx
        └── AdminImportMatchesPage.test.tsx
```

### Modified Files

```text
src/router/index.tsx                      # Add /admin/import/teams and /admin/import/matches
src/pages/admin/AdminShell.tsx            # Add Import section with Download icon
```

**Structure Decision**: Extends the single Vite SPA. New hooks in `src/hooks/` (two pages share `useImportStatus`); page-specific components under `pages/admin/components/`. Follows the same pattern as the existing admin area.

## Component Design

### AdminShell nav update

Add a new section to `adminNav`:

```ts
{ to: '/admin/import/teams',   icon: Download, label: 'Importar Seleções' },
{ to: '/admin/import/matches', icon: Download, label: 'Importar Partidas'  },
```

### AdminImportTeamsPage layout

```
┌─────────────────────────────────────┐
│ ImportStatusPanel                   │  ← auto-loaded, shows "X/48 seleções"
├─────────────────────────────────────┤
│ [Idle state — no preview loaded]    │
│   Title: "Importar Seleções"        │
│   Description: what this does       │
│   [Buscar Seleções da API] button   │
├─────────────────────────────────────┤
│ [Loaded state]                      │
│   [Salvar Todas (X novas)] button   │
│   TeamPreviewRow × N                │
│     flag | name | country | group   │
│     [badge: Já importado / Nova]    │
│     [Salvar] (disabled if exists)   │
└─────────────────────────────────────┘
```

### TeamPreviewRow

- Flag image (`<img>` with `flagUrl`)
- Name + country + group letter
- Badge: green "Já importado" (`exists: true`) or neutral "Nova" (`exists: false`)
- "Salvar" button: `disabled` when `exists: true`; shows `Loader2` spinner while mutating

### MatchPreviewRow

- Home team flag + name | Away team flag + name
- Date (`formatMatchDate(scheduledAt)`)
- Phase + group info
- Badge: green "Já importada" or neutral "Nova"
- Badge: amber "Times ausentes" when `!teamsImported`
- "Salvar" button: `disabled` when `exists || !teamsImported`; tooltip on span when `!teamsImported`

## Service Layer Design

```ts
// src/services/import.service.ts
getImportStatus(): Promise<ImportStatus>
getTeamsPreview(): Promise<{ teams: TeamPreview[] }>
importAllTeams(): Promise<ImportResult>
importTeam(apiTeamId: number): Promise<ImportResult>
getMatchesPreview(): Promise<{ matches: MatchPreview[] }>
importAllMatches(): Promise<ImportResult>
importMatch(apiFixtureId: number): Promise<ImportResult>
```

## Hook Design

### useImportStatus

```ts
useQuery({
  queryKey: ['admin', 'import', 'status'],
  queryFn: getImportStatus,
  staleTime: 60_000,
})
```

### useImportTeams

```ts
// Preview query — manual trigger only
const preview = useQuery({
  queryKey: ['admin', 'import', 'teams', 'preview'],
  queryFn: getTeamsPreview,
  enabled: false,
})

// Single save mutation — updates cache item exists flag
const saveOne = useMutation({
  mutationFn: (apiTeamId: number) => importTeam(apiTeamId),
  onSuccess: (_, apiTeamId) => {
    queryClient.setQueryData(
      ['admin', 'import', 'teams', 'preview'],
      (old) => old && {
        teams: old.teams.map(t =>
          t.apiTeamId === apiTeamId ? { ...t, exists: true } : t
        )
      }
    )
    queryClient.invalidateQueries({ queryKey: ['admin', 'import', 'status'] })
    toast({ title: 'Seleção importada com sucesso' })
  },
})

// Bulk save mutation — marks all created teams as exists
const saveAll = useMutation({
  mutationFn: importAllTeams,
  onSuccess: (result) => {
    // Mark all non-existing items as existing after bulk import
    queryClient.invalidateQueries({ queryKey: ['admin', 'import', 'teams', 'preview'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'import', 'status'] })
    toast({ title: `${result.created} seleções importadas, ${result.skipped} ignoradas` })
  },
})
```

### useImportMatches — same pattern as useImportTeams, adapting to MatchPreview

## Error Handling

| Error | Handling |
|-------|---------|
| 503 (API Football down) | Toast: "Serviço externo indisponível. Tente novamente mais tarde." |
| 409 (already exists) | Toast: "Este item já está cadastrado." — badge updated to "Já importado" |
| 422 (teams missing) | Button is already disabled; if race condition: toast with missing team names |
| 401 (session expired) | `ApiRequestError` with status 401 → existing auth guard redirects to login |
| Network error | Toast: "Erro de rede. Verifique sua conexão." |

## Query Key Reference

```ts
['admin', 'import', 'status']             // ImportStatus
['admin', 'import', 'teams', 'preview']   // { teams: TeamPreview[] }
['admin', 'import', 'matches', 'preview'] // { matches: MatchPreview[] }
```

## Complexity Tracking

No Constitution violations require justification.
