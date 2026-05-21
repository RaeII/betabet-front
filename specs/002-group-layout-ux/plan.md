# Implementation Plan: Group Layout UX

**Branch**: `002-group-layout-ux` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-group-layout-ux/spec.md`

## Summary

Redesign the group experience so every group-scoped action has an obvious active group. The implementation keeps the existing React/Tailwind structure, uses the current group route as the source of selection, adds a desktop left rail for group switching, keeps mobile as a list-to-detail flow, and turns the group detail landing state into a sports-style group home with bounded preview sections for next matches, past matches, and ranking.

No new UI rules or visual language are introduced. The plan follows `doc/ui.md`: neutral surfaces, controlled green actions, restrained support accents, accessible contrast, minimal decoration, mobile-first spacing, and no purposeless full-width desktop panels.

## Technical Context

**Language/Version**: TypeScript `~5.8.3`, React `^19.1.0`

**Primary Dependencies**: Vite 6, React Router DOM 7, TanStack Query 5, Tailwind CSS 4, Framer Motion 12, Lucide React, existing shadcn-style UI primitives. No new dependency planned.

**Storage**: N/A for this feature. Active group selection is represented by the route (`/groups/:groupId`) and existing server state via TanStack Query.

**Testing**: Vitest, Testing Library, MSW, existing integration tests under `tests/integration/pages/`.

**Target Platform**: Mobile-first responsive web, including 320px viewport support; desktop layout must use bounded content widths rather than stretching every panel to 100%.

**Project Type**: Frontend web application.

**Performance Goals**:

- Group list and selected group content should render from existing cached query data when available.
- Switching groups should avoid unnecessary full-page data refetches beyond the selected group's detail/ranking/match data.
- Desktop layout should remain stable while group list, previews, and ranking states load.

**Constraints**:

- Preserve `doc/ui.md`; do not change tokens, palette, focus policy, typography rules, or spacing philosophy.
- Follow local UI skill overrides: no yellow input focus, no global `:focus-visible` additions, no `focus-visible:*` Tailwind additions.
- Do not add a library unless implementation proves an existing dependency cannot cover the need.
- Do not make desktop components occupy full width without a clear reason; use a fixed/bounded group rail and constrained content columns.
- Keep source files under 300 lines and place page-specific group UI under `src/pages/groups/components/`.
- Reuse current hooks/services/types before adding data contracts.

**Scale/Scope**:

- Affects group list/detail flow, group home landing area, and group-scoped navigation context.
- Expected source changes are limited to `src/pages/groups/`, existing hooks/types/services as needed, tests, and route-aware links.
- No backend rule changes and no betting rule changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. DRY & Simplicity | Reuse `useUserGroups`, `useGroup`, `useGroupRanking`, `useAllMatches`, `MatchCard`, `Button`, `Badge`, and `cn` before adding helpers. Any reusable helper must be checked against `global-functions.md`. | PASS |
| II. Type Safety | New shared shapes, if needed, go in dedicated type files. Component-local props may stay local only when trivial and not reused. | PASS |
| III. Test-First | Add or update integration tests for desktop active group visibility, mobile return-to-list control, and group home preview entry points before implementation. | PASS |
| IV. File Organization & Component Architecture | Page-specific group layout pieces live in `src/pages/groups/components/`; files remain focused and below 300 lines. | PASS |
| V. Performance & Data Freshness | Use TanStack Query keys already in hooks; do not duplicate group or match state in component state beyond UI-only mobile visibility. | PASS |
| VI. Layout Consistency | Keep `doc/ui.md` tokens and spacing; desktop rail and content use bounded widths and grid/flex tracks instead of purposeless `w-full` cards. | PASS |

No constitution violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-group-layout-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
└── tasks.md              # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── groups/
│       ├── GroupsPage.tsx
│       ├── GroupDetailPage.tsx
│       └── components/
│           ├── GroupCard.tsx
│           ├── GroupDesktopRail.tsx
│           ├── GroupMobileHeader.tsx
│           ├── GroupHomeHero.tsx
│           ├── GroupMatchPreviewSection.tsx
│           ├── GroupRankingPreview.tsx
│           └── GroupStatePanel.tsx
├── pages/
│   └── group-detail/
│       └── components/
│           └── GroupRanking.tsx
├── components/
│   ├── match/
│   │   └── MatchCard.tsx
│   └── ui/
│       ├── badge.tsx
│       └── button.tsx
├── hooks/
│   ├── useGroups.ts
│   ├── useMatches.ts
│   └── useRanking.ts
├── services/
│   ├── groups.service.ts
│   └── matches.service.ts
└── types/
    ├── group.types.ts
    └── match.types.ts

tests/
└── integration/
    └── pages/
        ├── GroupDetailPage.test.tsx
        ├── groups.handlers.ts
        └── matches.handlers.ts
```

**Structure Decision**: This is a single frontend app. Group-specific layout components remain page-specific under `src/pages/groups/components/` because they serve the group flow only. Existing global match and UI primitives remain global. New global abstractions are avoided unless a component becomes reused by at least two pages.

## Phase 0: Research Summary

See [research.md](./research.md).

Key decisions:

- Route-driven active group selection using `/groups/:groupId`.
- Desktop persistent left rail with bounded width and selected state.
- Mobile list/detail navigation using existing routes and an explicit "Ver grupos" return control.
- Group home previews use existing match/ranking data and link to full pages.
- No new package is required.

## Phase 1: Design Summary

See [data-model.md](./data-model.md) and [contracts/ui.md](./contracts/ui.md).

The design introduces view-level models for group selection, preview sections, and layout states without changing backend betting rules. The UI contract defines route behavior, responsive expectations, active group visibility, and preview navigation.

## Post-Design Constitution Check

| Principle | Result | Notes |
|-----------|--------|-------|
| I. DRY & Simplicity | PASS | Plan reuses existing hooks/services and avoids a new state library. |
| II. Type Safety | PASS | Any new shared view model belongs in `src/types/group.types.ts`; component-only props stay local. |
| III. Test-First | PASS | Quickstart lists tests to add before implementation. |
| IV. File Organization & Component Architecture | PASS | Components are split by responsibility under group page scope. |
| V. Performance & Data Freshness | PASS | Route param and TanStack Query remain the state boundary. |
| VI. Layout Consistency | PASS | Plan explicitly preserves `doc/ui.md` and bounded desktop layout. |

No complexity exceptions are required.
