---
description: "Task list for Admin Import API Football feature"
---

# Tasks: Admin Import API Football

**Input**: Design documents from `specs/003-admin-import-api-football/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api.md ✅ | quickstart.md ✅

**Tests**: Mandatory per Constitution Principle III (Test-First). Test files must be written before implementation tasks complete. Run via `bun run test`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task description

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Shared type definitions and service layer. MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 Create `src/types/import.types.ts` — export `TeamPreview`, `MatchPreview`, `ImportResult`, `ImportStatus` interfaces; import `MatchStatus` and `TournamentPhase` from `src/types/match.types.ts`
- [X] T002 [P] Create `src/services/import.service.ts` — implement all 7 API functions using existing `apiGet`/`apiPost` helpers: `getImportStatus()`, `getTeamsPreview()`, `importAllTeams()`, `importTeam(apiTeamId)`, `getMatchesPreview()`, `importAllMatches()`, `importMatch(apiFixtureId)`

**Checkpoint**: Types and service ready — all user story hooks can now be implemented.

---

## Phase 2: User Story 1 — Importar Seleções via Admin (Priority: P1) 🎯 MVP

**Goal**: Admin can preview World Cup teams from API Football and import new ones individually or in bulk.

**Independent Test**: Access `/admin/import/teams`, click "Buscar Seleções da API", verify list with exists badges, save one individual team, confirm success toast and badge flips to "Já importado".

### Tests for User Story 1

> **Write these tests FIRST — confirm they fail before implementing T005–T009**

- [X] T003 [P] [US1] Create `tests/unit/hooks/useImportTeams.test.ts` — test MSW mocks for `GET /api/admin/import/teams/preview`, `POST /api/admin/import/teams`, `POST /api/admin/import/teams/:apiTeamId`; assert preview loads only on `refetch()` (`enabled: false`); assert `saveOne` flips `exists` flag via `setQueryData`; assert `saveAll` invalidates preview query; assert toast messages
- [X] T004 [P] [US1] Create `tests/integration/pages/AdminImportTeamsPage.test.tsx` — render page, assert idle state shows only description + "Buscar Seleções da API" button (no list); click button → assert team list renders with badges; click "Salvar" on one item → assert toast appears and badge changes to "Já importado"; assert "Salvar" is disabled for `exists: true` items; assert "Salvar Todas" triggers bulk import

### Implementation for User Story 1

- [X] T005 [P] [US1] Create `src/hooks/useImportTeams.ts` — `useQuery` with `enabled: false` on key `['admin', 'import', 'teams', 'preview']`; `saveOne` mutation calls `importTeam(apiTeamId)` then `setQueryData` to flip `exists: true` on that item + `invalidateQueries` status + toast "Seleção importada com sucesso"; `saveAll` mutation calls `importAllTeams()` then `invalidateQueries` preview + status + toast showing created/skipped counts
- [X] T006 [P] [US1] Create `src/pages/admin/components/TeamPreviewRow.tsx` — props: `team: TeamPreview`, `onSave: (id: number) => void`, `isSaving: boolean`; render flag `<img>` (`flagUrl`), name + country + group letter, Badge green "Já importado" (`exists: true`) or neutral "Nova" (`exists: false`), "Salvar" button `disabled` when `exists || isSaving`, show `Loader2` spinner while `isSaving`; all styling from Brasil Essencial tokens
- [X] T007 [US1] Create `src/pages/admin/AdminImportTeamsPage.tsx` — import `useImportTeams`; idle state (no data loaded): show title "Importar Seleções", description, "Buscar Seleções da API" button (disabled + Loader2 while loading); loaded state: show "Salvar Todas (X novas)" button and list of `TeamPreviewRow`; error state: toast "Serviço externo indisponível. Tente novamente mais tarde." for 503, toast "Erro de rede. Verifique sua conexão." for network errors; file must stay under 300 lines
- [X] T008 [US1] Update `src/router/index.tsx` — add lazy route `/admin/import/teams` pointing to `AdminImportTeamsPage`, nested inside existing admin auth guard
- [X] T009 [US1] Update `src/pages/admin/AdminShell.tsx` — add `{ to: '/admin/import/teams', icon: Download, label: 'Importar Seleções' }` to admin nav section; import `Download` from `lucide-react`

**Checkpoint**: User Story 1 fully functional — `/admin/import/teams` accessible, preview loads on demand, individual and bulk save work with toast feedback and cache updates.

---

## Phase 3: User Story 2 — Importar Partidas via Admin (Priority: P2)

**Goal**: Admin can preview World Cup matches from API Football and import eligible ones (teams already imported) individually or in bulk.

**Independent Test**: With teams already imported (US1), access `/admin/import/matches`, click "Buscar Partidas da API", verify `exists` and `teamsImported` badges, save one eligible match, confirm toast and badge flip.

### Tests for User Story 2

> **Write these tests FIRST — confirm they fail before implementing T012–T016**

- [X] T010 [P] [US2] Create `tests/unit/hooks/useImportMatches.test.ts` — test MSW mocks for `GET /api/admin/import/matches/preview`, `POST /api/admin/import/matches`, `POST /api/admin/import/matches/:apiFixtureId`; assert preview loads only on `refetch()`; assert `saveOne` flips `exists` via `setQueryData`; assert save button is disabled when `teamsImported: false`; assert 422 response shows toast with missing team names
- [X] T011 [P] [US2] Create `tests/integration/pages/AdminImportMatchesPage.test.tsx` — render page, assert idle state shows description + dependency warning + "Buscar Partidas da API" button; click button → assert match list renders; assert "Times ausentes" badge on matches with `teamsImported: false`; assert "Salvar" disabled on those matches; assert save on eligible match shows success toast

### Implementation for User Story 2

- [X] T012 [P] [US2] Create `src/hooks/useImportMatches.ts` — same pattern as `useImportTeams`: `useQuery` `enabled: false` on key `['admin', 'import', 'matches', 'preview']`; `saveOne` mutation calls `importMatch(apiFixtureId)` then `setQueryData` flips `exists: true` on that item + invalidates status + toast; `saveAll` mutation calls `importAllMatches()` then invalidates preview + status + toast showing created/skipped/errors from `ImportResult`; handle 422 toast "Times não importados: {names}" for individual save
- [X] T013 [P] [US2] Create `src/pages/admin/components/MatchPreviewRow.tsx` — props: `match: MatchPreview`, `onSave: (id: number) => void`, `isSaving: boolean`; render home team flag+name, away team flag+name, formatted date (`scheduledAt`), phase + group info; Badge green "Já importada" or neutral "Nova" for `exists`; Badge amber "Times ausentes" when `!teamsImported`; "Salvar" button `disabled` when `exists || !teamsImported || isSaving`; wrap disabled button in `<span title="...">` listing absent team names; show `Loader2` while saving
- [X] T014 [US2] Create `src/pages/admin/AdminImportMatchesPage.tsx` — import `useImportMatches`; idle state: title "Importar Partidas", description with note that teams must be imported first, "Buscar Partidas da API" button; loaded state: "Salvar Todas" button (creates only eligible matches) + list of `MatchPreviewRow`; same error handling as teams page (503/network toasts); file must stay under 300 lines
- [X] T015 [US2] Update `src/router/index.tsx` — add lazy route `/admin/import/matches` pointing to `AdminImportMatchesPage`, nested inside existing admin auth guard alongside T008's `/admin/import/teams` route
- [X] T016 [US2] Update `src/pages/admin/AdminShell.tsx` — add `{ to: '/admin/import/matches', icon: Download, label: 'Importar Partidas' }` to admin nav Import section created in T009

**Checkpoint**: User Stories 1 AND 2 fully functional — both import pages work independently with their respective preview, save, and error flows.

---

## Phase 4: User Story 3 — Status de Importação (Priority: P3)

**Goal**: Admin sees a status panel on both import pages showing `teamsInDb / teamsInApi` and `matchesInDb / matchesInApi` counts loaded automatically on page mount — no "Buscar" click required.

**Independent Test**: After importing 10 teams, open `/admin/import/teams` and verify the panel displays "10 / 48 seleções importadas" without clicking any button.

### Tests for User Story 3

> **Write this test FIRST — confirm it fails before implementing T018–T021**

- [X] T017 [US3] Create `tests/unit/hooks/useImportStatus.test.ts` — test MSW mock for `GET /api/admin/import/status`; assert query loads automatically on mount (no manual trigger); assert `staleTime: 60_000` (second render within 60s does not re-fetch); assert returned counts match mock response shape `{ teamsInApi, teamsInDb, matchesInApi, matchesInDb }`

### Implementation for User Story 3

- [X] T018 [US3] Create `src/hooks/useImportStatus.ts` — `useQuery` with `queryKey: ['admin', 'import', 'status']`, `queryFn: getImportStatus`, `staleTime: 60_000`; no `enabled: false` — loads automatically on mount
- [X] T019 [US3] Create `src/pages/admin/components/ImportStatusPanel.tsx` — consumes `useImportStatus()`; display loading skeleton while pending; display "X / Y seleções importadas" and "X / Y partidas importadas" counts using Brasil Essencial tokens; no error boundary needed (non-critical widget — render nothing on error)
- [X] T020 [US3] Integrate `ImportStatusPanel` into `src/pages/admin/AdminImportTeamsPage.tsx` — add `<ImportStatusPanel />` at the top of the page layout, above the idle/loaded state sections
- [X] T021 [US3] Integrate `ImportStatusPanel` into `src/pages/admin/AdminImportMatchesPage.tsx` — same placement as T020

**Checkpoint**: All three user stories functional. Status panel appears automatically on both import pages with correct counts.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Auth guard verification, final validation run, and code quality checks.

- [X] T022 [P] Verify `/admin/import/teams` and `/admin/import/matches` routes in `src/router/index.tsx` are nested inside the existing admin auth guard (same guard wrapping `/admin/matches`, `/admin/teams`) — no unauthenticated access possible (SC-006)
- [X] T023 [P] Run `bun run test` and confirm all 5 test files pass: `useImportStatus.test.ts`, `useImportTeams.test.ts`, `useImportMatches.test.ts`, `AdminImportTeamsPage.test.tsx`, `AdminImportMatchesPage.test.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 completion (needs `import.types.ts` + `import.service.ts`)
- **US2 (Phase 3)**: Depends on Phase 1 completion; does not depend on US1
- **US3 (Phase 4)**: Depends on Phase 1 + US1 (Phase 2) + US2 (Phase 3) completion (integrates into both pages)
- **Polish (Phase 5)**: Depends on all phases complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational — no dependency on US2 or US3
- **US2 (P2)**: Can start immediately after Foundational — no dependency on US1 or US3
- **US3 (P3)**: Must start AFTER US1 and US2 pages exist (T020, T021 integrate into those pages)

### Within Each User Story

- Tests (T003–T004, T010–T011, T017) MUST be written and run (failing) before implementation
- For US1: T005 + T006 are independent [P] → T007 depends on both → T008 + T009 can follow in parallel
- For US2: T012 + T013 are independent [P] → T014 depends on both → T015 + T016 can follow in parallel
- For US3: T018 → T019 → T020 + T021 [sequential — each depends on prior]

---

## Parallel Example: User Story 1

```bash
# Step 1 — Write tests in parallel (both are different files):
Task T003: "Create tests/unit/hooks/useImportTeams.test.ts"
Task T004: "Create tests/integration/pages/AdminImportTeamsPage.test.tsx"

# Step 2 — Implement hook and component in parallel (different files):
Task T005: "Create src/hooks/useImportTeams.ts"
Task T006: "Create src/pages/admin/components/TeamPreviewRow.tsx"

# Step 3 — Wire page (depends on T005 + T006):
Task T007: "Create src/pages/admin/AdminImportTeamsPage.tsx"

# Step 4 — Route + nav (can run in parallel after T007):
Task T008: "Update src/router/index.tsx"
Task T009: "Update src/pages/admin/AdminShell.tsx"
```

## Parallel Example: User Story 2

```bash
# Step 1 — Write tests in parallel:
Task T010: "Create tests/unit/hooks/useImportMatches.test.ts"
Task T011: "Create tests/integration/pages/AdminImportMatchesPage.test.tsx"

# Step 2 — Implement hook and component in parallel:
Task T012: "Create src/hooks/useImportMatches.ts"
Task T013: "Create src/pages/admin/components/MatchPreviewRow.tsx"

# Step 3 — Wire page:
Task T014: "Create src/pages/admin/AdminImportMatchesPage.tsx"

# Step 4 — Route + nav:
Task T015: "Update src/router/index.tsx"
Task T016: "Update src/pages/admin/AdminShell.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T002)
2. Complete Phase 2: User Story 1 (T003–T009)
3. **STOP and VALIDATE**: `/admin/import/teams` fully functional with preview + save + toasts
4. Ship or demo MVP — teams can be imported

### Incremental Delivery

1. Phase 1 (T001–T002) → Foundation ready
2. Phase 2 (T003–T009) → Teams import live → Demo MVP
3. Phase 3 (T010–T016) → Matches import live → Demo increment
4. Phase 4 (T017–T021) → Status panel live → Demo final
5. Phase 5 (T022–T023) → Auth + test validation → Ship

### Parallel Team Strategy

With two developers after Foundational is done:
- **Dev A**: Phase 2 (US1) — Teams import
- **Dev B**: Phase 3 (US2) — Matches import
- Both deliver independently; US3 integrates after both complete

---

## Summary

| Phase | Tasks | User Story | Parallelizable |
|-------|-------|------------|----------------|
| Phase 1: Foundational | T001–T002 | — | T002 [P] |
| Phase 2: US1 P1 | T003–T009 | Importar Seleções | T003, T004, T005, T006 [P] |
| Phase 3: US2 P2 | T010–T016 | Importar Partidas | T010, T011, T012, T013 [P] |
| Phase 4: US3 P3 | T017–T021 | Status de Importação | — |
| Phase 5: Polish | T022–T023 | — | T022, T023 [P] |

**Total tasks**: 23
**Tasks per user story**: US1 = 7 tasks | US2 = 7 tasks | US3 = 5 tasks
**Parallel opportunities**: 8 tasks marked [P] across all phases
**Independent test criteria**: Each story has its own failing-test checkpoint before implementation

## Notes

- [P] tasks write to different files — no merge conflicts when run in parallel
- [Story] label maps each task to its user story for traceability
- Tests (T003–T004, T010–T011, T017) must fail before implementation starts (Constitution Principle III)
- `staleTime: 60_000` on status query — do not set `enabled: false` on `useImportStatus`
- `enabled: false` + `refetch()` pattern ONLY for preview queries (`useImportTeams`, `useImportMatches`)
- `setQueryData` for individual save cache updates — do NOT `invalidateQueries` the preview after single save (avoids wasted API Football quota, Decision 2)
- All files must stay under 300 lines (Constitution Principle IV)
- All spacing/color from Brasil Essencial tokens — no hard-coded pixels or hex values
- No new npm dependencies — reuse TanStack Query, shadcn/ui, Lucide already installed
