# Quickstart: Admin Import API Football

**Branch**: `003-admin-import-api-football` | **Date**: 2026-05-21

## Prerequisites

- Node.js / Bun installed
- Backend running at `http://localhost:3000` (or `VITE_API_URL` set)
- Admin credentials available

## Dev Server

```bash
cd /var/www/betabet-front
bun run dev
```

Admin panel accessible at: `http://localhost:5173/admin`

Login: `http://localhost:5173/admin/login`

## Import Flow

1. Login as admin
2. Navigate to **Importar → Seleções** (`/admin/import/teams`)
3. Click **"Buscar Seleções da API"** — loads preview from API Football
4. Review list: green "Já importado" = already in DB, grey "Nova" = new
5. Click **"Salvar Todas"** to import all new teams, or **"Salvar"** per team
6. Navigate to **Importar → Partidas** (`/admin/import/matches`)
7. Click **"Buscar Partidas da API"** — loads preview
8. Teams with "Times ausentes" badge cannot be saved until their teams are imported
9. Click **"Salvar Todas"** or save individually

## New Files Created by This Feature

```
src/types/import.types.ts              — DTOs: TeamPreview, MatchPreview, ImportResult, ImportStatus
src/services/import.service.ts         — 7 API calls for the import module
src/hooks/useImportStatus.ts           — TanStack Query: auto-load import counts
src/hooks/useImportTeams.ts            — preview query (lazy) + save mutations
src/hooks/useImportMatches.ts          — preview query (lazy) + save mutations
src/pages/admin/AdminImportTeamsPage.tsx
src/pages/admin/AdminImportMatchesPage.tsx
src/pages/admin/components/ImportStatusPanel.tsx  — shared status counts widget
src/pages/admin/components/TeamPreviewRow.tsx
src/pages/admin/components/MatchPreviewRow.tsx
```

## Modified Files

```
src/router/index.tsx                   — add /admin/import/teams and /admin/import/matches routes
src/pages/admin/AdminShell.tsx         — add Import nav items (Download icon)
```

## Running Tests

```bash
bun run test
```

Tests live in:
```
tests/unit/hooks/useImportTeams.test.ts
tests/unit/hooks/useImportMatches.test.ts
tests/unit/hooks/useImportStatus.test.ts
tests/integration/pages/AdminImportTeamsPage.test.tsx
tests/integration/pages/AdminImportMatchesPage.test.tsx
```

## Key Query Keys

```ts
['admin', 'import', 'status']           // ImportStatus — auto-loaded, stale 60s
['admin', 'import', 'teams', 'preview'] // TeamPreview[] — manual trigger
['admin', 'import', 'matches', 'preview'] // MatchPreview[] — manual trigger
```

## Environment Variables

No new environment variables required. Uses the same `VITE_API_URL` proxy as the rest of the app.
