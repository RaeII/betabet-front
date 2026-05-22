# Research: Admin Import API Football

**Branch**: `003-admin-import-api-football` | **Date**: 2026-05-21

---

## Decision 1: Lazy Preview Loading Strategy

**Decision**: Use TanStack Query `useQuery` with `enabled: false` + imperative `refetch()` on button click.

**Rationale**: `enabled: false` prevents the query from running on mount. Calling `refetch()` on button click triggers a single fetch. The query cache stores the result so navigating away and back does not re-fetch. This satisfies FR-002 (no auto-load) and Constitution Principle V (no unnecessary requests).

**Alternatives considered**:
- Local `useState` + manual `fetch()` — rejected: no caching, no loading/error state management, duplicates work TanStack already handles.
- Suspense + `startTransition` — rejected: over-engineering for a one-shot admin fetch.

---

## Decision 2: Updating `exists` Flag After Individual Save

**Decision**: After a successful `POST /admin/import/teams/:apiTeamId`, use `queryClient.setQueryData` to optimistically flip `exists: true` for the saved item in the cached preview list — no full refetch needed.

**Rationale**: The preview list can have ~48 teams or ~104 matches. Invalidating and refetching the full preview after each single save would make the UI reload the entire list (slow, API cost). A targeted `setQueryData` mutation is O(1) and instant. This satisfies Constitution Principle V.

**Alternatives considered**:
- `queryClient.invalidateQueries` after each save — rejected: triggers a full API Football preview re-fetch, wasting quota.
- Keeping local React state alongside Query cache — rejected: two sources of truth, violates DRY (Principle I).

---

## Decision 3: Bulk Save Result Feedback

**Decision**: After `POST /admin/import/teams` (or matches), call `queryClient.setQueryData` to mark all items as `exists: true` using the `created` list in `ImportResult`, and display a toast: "X seleções criadas, Y ignoradas".

**Rationale**: ImportResult includes `created`, `skipped`, `total`. We can update the cache in-place without a full refetch. Toast provides clear outcome feedback.

**Alternatives considered**:
- Invalidate and refetch preview after bulk save — acceptable but wastes an API Football call; rejected for same reason as Decision 2.

---

## Decision 4: Disabled Save Button for "Times Ausentes"

**Decision**: When `matchPreview.teamsImported === false`, render the "Salvar" button with `disabled` attribute. Wrap it in a `<span title="...">` with a tooltip listing the absent teams by name.

**Rationale**: Native `disabled` prevents accidental clicks. A tooltip via `title` attribute is accessible and zero-dependency. This satisfies FR-008.

**Alternatives considered**:
- shadcn Tooltip component — valid but adds complexity for a simple admin-only UI; deferred.

---

## Decision 5: Import Status Auto-Load

**Decision**: `useImportStatus` uses a standard TanStack Query with `staleTime: 60_000` (1 min) and no `enabled: false`. It loads automatically when the page mounts and caches the result for 1 minute.

**Rationale**: The status endpoint (`GET /admin/import/status`) is a lightweight count query against the local DB — no API Football quota consumed. Auto-loading on page mount gives the admin immediate context. 1-minute stale time avoids redundant calls during the same session.

**Alternatives considered**:
- Manual refresh only — rejected: admin would need to explicitly trigger a low-value action.
- No caching (refetch on every page visit) — rejected: unnecessary DB load.

---

## Decision 6: Hook File Organization

**Decision**: Three focused hook files in `src/hooks/`:
- `useImportStatus.ts` — shared between both import pages
- `useImportTeams.ts` — teams preview + save mutations
- `useImportMatches.ts` — matches preview + save mutations

**Rationale**: Keeps each file under 300 lines (Principle IV), separates concerns, and makes `useImportStatus` clearly global (shared across two pages). Teams and matches hooks are independent — changes in one don't affect the other.

---

## Decision 7: Toast Notification System

**Decision**: Reuse the shadcn `useToast` hook already available via the shadcn/ui dependency.

**Rationale**: shadcn/ui is already a project dependency. The Toast component and hook are part of the copy-paste model used by the project. Zero additional dependencies.

---

## Resolved NEEDS CLARIFICATION

None — all decisions above were inferable from the existing codebase and project constitution.
