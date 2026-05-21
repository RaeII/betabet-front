# Tasks: Group Layout UX

**Input**: Design documents from `/specs/002-group-layout-ux/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui.md](./contracts/ui.md), [quickstart.md](./quickstart.md)

**Tests**: Mandatory per Constitution Principle III. Add failing integration tests before implementation work for each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks that touch different files and do not depend on incomplete work.
- **[Story]**: User story label for story phases only.
- Every task includes an exact file path.

## Phase 1: Setup

**Purpose**: Confirm project context and prepare fixtures for task execution.

- [x] T001 Review feature constraints in specs/002-group-layout-ux/plan.md before implementation and confirm no new package is needed in package.json
- [x] T002 [P] Review UI constraints from doc/ui.md and note forbidden visual changes in specs/002-group-layout-ux/quickstart.md
- [x] T003 [P] Extend group test fixture data to include at least three groups in tests/integration/pages/groups.handlers.ts
- [x] T004 [P] Ensure match test fixture data includes upcoming and finished matches for group home previews in tests/integration/pages/matches.handlers.ts

---

## Phase 2: Foundational

**Purpose**: Shared group UI pieces and test helpers that block the user-story implementation.

- [x] T005 Create reusable group empty/loading/error state panel in src/pages/groups/components/GroupStatePanel.tsx
- [x] T006 Update group list item behavior to support active and compact display states in src/pages/groups/components/GroupCard.tsx
- [x] T007 Add group detail render helper with router/query providers for group-flow tests in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T008 Verify existing group route coverage and preserve `/groups/:groupId` and `/groups/:groupId/matches/:matchId` behavior in src/router/index.tsx

**Checkpoint**: Shared fixtures and base group components are ready; user stories can begin.

---

## Phase 3: User Story 1 - Identify and Switch Current Group (Priority: P1) - MVP

**Goal**: Desktop users can always see the active group, switch groups from a persistent bounded left rail, and see the selected group reflected in the main content.

**Independent Test**: With three groups, render `/groups/group-1`, verify the left rail is visible, `Bolão dos Amigos` is selected, switch to another group, and verify the active indicator and main group content update.

### Tests for User Story 1

- [x] T009 [P] [US1] Add desktop active-group rail and group-switching integration tests in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T010 [P] [US1] Add desktop no-selected-group bounded list state test for `/groups` in tests/integration/pages/GroupDetailPage.test.tsx

### Implementation for User Story 1

- [x] T011 [P] [US1] Create bounded desktop group rail with selected state and group links in src/pages/groups/components/GroupDesktopRail.tsx
- [x] T012 [US1] Integrate GroupDesktopRail into selected group detail layout in src/pages/groups/GroupDetailPage.tsx
- [x] T013 [US1] Update group list route to show desktop bounded selector and non-full-width empty state in src/pages/groups/GroupsPage.tsx
- [x] T014 [US1] Preserve selected group identity in loading and error states in src/pages/groups/GroupDetailPage.tsx

**Checkpoint**: User Story 1 is independently testable and provides the MVP active-group clarity.

---

## Phase 4: User Story 2 - Navigate Groups on Mobile (Priority: P1)

**Goal**: Mobile users start from a readable group list, open a group detail/home screen, and can return to the list with a clear control while the active group remains visible.

**Independent Test**: At a 320px viewport, render `/groups`, verify the group list is readable, open `/groups/group-1`, verify the current group header and "Ver grupos" control, activate the control, and verify navigation back to `/groups`.

### Tests for User Story 2

- [x] T015 [P] [US2] Add mobile group list and group detail return-control integration tests in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T016 [P] [US2] Add 320px no-horizontal-overflow assertion for group list/detail wrappers in tests/integration/pages/GroupDetailPage.test.tsx

### Implementation for User Story 2

- [x] T017 [P] [US2] Create mobile active group header with "Ver grupos" navigation in src/pages/groups/components/GroupMobileHeader.tsx
- [x] T018 [US2] Integrate GroupMobileHeader into mobile group detail flow in src/pages/groups/GroupDetailPage.tsx
- [x] T019 [US2] Refine mobile group list spacing, touch targets, and empty state in src/pages/groups/GroupsPage.tsx
- [x] T020 [US2] Ensure GroupCard text truncation and avatar sizing work at 320px in src/pages/groups/components/GroupCard.tsx

**Checkpoint**: User Story 2 is independently testable on mobile and preserves group context.

---

## Phase 5: User Story 3 - Explore a Professional Group Home (Priority: P2)

**Goal**: The selected group opens to a professional sports-style home with group identity, upcoming match previews, past match previews, and ranking preview that link to full pages.

**Independent Test**: Render `/groups/group-1`, verify group identity, upcoming matches, past matches, and ranking preview are visible, then verify preview links use group-scoped destinations.

### Tests for User Story 3

- [x] T021 [P] [US3] Add group home hero and preview-section integration tests in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T022 [P] [US3] Add group-scoped match preview link assertions in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T023 [P] [US3] Add empty-state coverage for missing matches and ranking in tests/integration/pages/GroupDetailPage.test.tsx

### Implementation for User Story 3

- [x] T024 [P] [US3] Create group identity hero with bounded action area in src/pages/groups/components/GroupHomeHero.tsx
- [x] T025 [P] [US3] Create upcoming and past match preview section component in src/pages/groups/components/GroupMatchPreviewSection.tsx
- [x] T026 [P] [US3] Create ranking preview component with top entries and user standing in src/pages/groups/components/GroupRankingPreview.tsx
- [x] T027 [US3] Derive upcoming and past match preview data from useAllMatches in src/pages/groups/GroupDetailPage.tsx
- [x] T028 [US3] Replace tab-first landing content with group home overview in src/pages/groups/GroupDetailPage.tsx
- [x] T029 [US3] Preserve existing invite, settings, members, and full ranking access from the new group home in src/pages/groups/GroupDetailPage.tsx

**Checkpoint**: User Story 3 is independently testable as a group home preview dashboard.

---

## Phase 6: User Story 4 - Preserve Professional, Mobile-First Visual Quality (Priority: P2)

**Goal**: The group layout remains professional, consistent with `doc/ui.md`, usable at 320px, and avoids purposeless full-width desktop panels.

**Independent Test**: Review 320px, mobile, tablet, and desktop states; verify no clipped primary text, no overlapping controls, no forbidden color treatment, and no full-width desktop panels without purpose.

### Tests for User Story 4

- [x] T030 [P] [US4] Add visual-structure assertions for bounded desktop content and rail layout in tests/integration/pages/GroupDetailPage.test.tsx
- [x] T031 [P] [US4] Add long group and team name fixture coverage in tests/integration/pages/groups.handlers.ts

### Implementation for User Story 4

- [x] T032 [US4] Audit and adjust group layout classes to use project tokens and bounded desktop widths in src/pages/groups/GroupDetailPage.tsx
- [x] T033 [US4] Audit and adjust group list classes to prevent purposeless desktop full-width cards in src/pages/groups/GroupsPage.tsx
- [x] T034 [US4] Audit preview components for 320px-safe text behavior and no nested cards in src/pages/groups/components/GroupMatchPreviewSection.tsx
- [x] T035 [US4] Audit ranking preview for 320px-safe text behavior and accessible selected/current semantics in src/pages/groups/components/GroupRankingPreview.tsx

**Checkpoint**: User Story 4 validates the feature against the UI contract and responsive requirements.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and documentation alignment.

- [x] T036 [P] Run focused group detail tests and record result against specs/002-group-layout-ux/quickstart.md
- [x] T037 [P] Run typecheck and lint verification listed in specs/002-group-layout-ux/quickstart.md
- [x] T038 Review touched files for 300-line limit and component ownership rules from specs/002-group-layout-ux/plan.md
- [x] T039 Search for forbidden UI patterns such as gradients, blue primary actions, yellow input focus, and focus-visible additions in src/pages/groups/
- [x] T040 Update specs/002-group-layout-ux/quickstart.md only if implementation changes the verification commands or scope

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2; suggested MVP.
- **Phase 4 US2**: Depends on Phase 2; can run in parallel with US1 if separate files are coordinated, but final integration shares `GroupDetailPage.tsx`.
- **Phase 5 US3**: Depends on Phase 2; can build preview components in parallel, final integration depends on `GroupDetailPage.tsx` coordination.
- **Phase 6 US4**: Depends on US1, US2, and US3 implementation because it audits the full visual result.
- **Phase 7 Polish**: Depends on all desired user stories.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2; no dependency on other stories.
- **US2 (P1)**: Can start after Phase 2; no dependency on US1, but both edit `GroupDetailPage.tsx`.
- **US3 (P2)**: Can start after Phase 2; final landing integration should account for US1/US2 layout.
- **US4 (P2)**: Depends on the implemented UI from US1-US3.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Build page-specific components before integrating them into `GroupDetailPage.tsx` or `GroupsPage.tsx`.
- Keep route-driven group selection as the state boundary.
- Validate each story independently before moving to lower-priority work.

## Parallel Opportunities

- T002, T003, and T004 can run in parallel during setup.
- T005 and T006 can run in parallel if component props are agreed upfront.
- T009 and T010 can run in parallel because both are tests in the same file only if edited by one worker; otherwise sequence them to avoid conflicts.
- T011 can run in parallel with T009 and T010 after test expectations are known.
- T015 and T016 can run in parallel only if a single worker owns `GroupDetailPage.test.tsx`; otherwise sequence them.
- T024, T025, and T026 can run in parallel because they create separate component files.
- T030 and T031 can run in parallel because they touch different files.

## Parallel Example: User Story 3

```text
Task: "Create group identity hero with bounded action area in src/pages/groups/components/GroupHomeHero.tsx"
Task: "Create upcoming and past match preview section component in src/pages/groups/components/GroupMatchPreviewSection.tsx"
Task: "Create ranking preview component with top entries and user standing in src/pages/groups/components/GroupRankingPreview.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) so active group visibility and desktop switching work.
3. Validate US1 independently with the focused group tests.

### Incremental Delivery

1. Add Phase 4 (US2) for the 320px mobile list/detail flow.
2. Add Phase 5 (US3) for the professional sports-style group home.
3. Add Phase 6 (US4) for visual polish, responsive constraints, and design-system audit.
4. Complete Phase 7 verification before handoff.
