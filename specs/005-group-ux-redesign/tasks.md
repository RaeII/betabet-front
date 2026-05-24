# Tasks: Group UX Redesign

**Input**: Design documents from `/specs/005-group-ux-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: MANDATORY per Constitution Principle III (Test-First). Test tasks precede the corresponding implementation tasks; ensure each test FAILS before implementing.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and shipped independently. User Story 8 (Mobile) is treated as cross-cutting — each preceding story includes a mobile-validation task, and a dedicated mobile polish phase covers viewport-wide audits.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Different file, no dependency on incomplete tasks — safe to run in parallel
- **[Story]**: User story (US1–US8); omitted in Setup, Foundational, and Polish phases
- Paths are relative to repo root `/Users/israel/dev/betabet-front/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tooling, dependencies, and type scaffolding required by every other phase.

- [X] T001 Verify `@radix-ui/react-dropdown-menu` presence in [package.json](package.json); install via `bun add @radix-ui/react-dropdown-menu` if absent (research.md §9, §14)
- [X] T002 [P] Add `SidebarDestination`, `SidebarItem`, and `LeaveGroupResult` types to [src/types/group.types.ts](src/types/group.types.ts) per data-model.md §group.types
- [X] T003 [P] Add `MatchdayGroup`, `BettingProgress`, `GroupMatchesResponse`, and refine `MatchWithUserBet.userBet` typing in [src/types/match.types.ts](src/types/match.types.ts) per data-model.md §match.types
- [X] T004 [P] Create [src/types/last-group.types.ts](src/types/last-group.types.ts) exporting `LastAccessedGroupResolution` per data-model.md
- [X] T005 [P] Extend `groupKeys` with `matches: (id) => [...all, 'matches', id]` in [src/hooks/useGroups.ts](src/hooks/useGroups.ts) per data-model.md §React Query keys
- [X] T006 [P] Confirm `tests/unit/`, `tests/unit/hooks/`, `tests/unit/lib/`, `tests/unit/components/`, `tests/integration/layout/`, `tests/integration/pages/` directories exist (create empty `.gitkeep` if needed) so subsequent test tasks can drop files in

**Checkpoint**: Types compile, dependencies installed, query keyspace extended. Ready for foundational layer.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Storage service, layout shell, route restructure, and the shared API plumbing that every user story builds on.

**⚠️ CRITICAL**: No user story phase may begin until Phase 2 is complete.

- [X] T007 Create [src/services/last-group.service.ts](src/services/last-group.service.ts) exporting `getLastAccessedGroup`, `setLastAccessedGroup`, `clearLastAccessedGroup` with try/catch-silent `localStorage` access per plan.md §last-group.service
- [X] T008 Add `leaveGroup(groupId): Promise<LeaveGroupResult>` and `getGroupMatches(groupId): Promise<GroupMatchesResponse>` to [src/services/groups.service.ts](src/services/groups.service.ts) per contracts/api.md
- [X] T009 Create [src/components/ui/modal.tsx](src/components/ui/modal.tsx) — Radix Dialog wrapper applying `--radius-xl`, `bg-[var(--surface)]`, focus ring `--support`, no pattern background (doc/ui.md §9.5)
- [X] T010 Create skeleton [src/components/layout/GroupShell.tsx](src/components/layout/GroupShell.tsx) with `<Outlet />` slot, sidebar/header placeholders, and pattern at reduced opacity per research.md §10
- [X] T011 Restructure [src/router/index.tsx](src/router/index.tsx): introduce `GroupShell` layout route under `/groups/:groupId`, add root index resolver route (placeholder navigate — wired up in US1), move `/groups/new` outside the shell, preserve `/profile` and `/onboarding` under `AppShell` per plan.md §Routing tree
- [X] T012 [P] Register `groupMatchesByDay`, `findDefaultMatchday`, and `lastAccessedGroup.{get,set,clear}` entries in [.specify/memory/global-functions.md](.specify/memory/global-functions.md) so future features discover them

**Checkpoint**: Layout shell renders, routes resolve, storage + new service methods exist. User stories may now proceed in parallel.

---

## Phase 3: User Story 1 — Resume the Last Group Instantly (Priority: P1) 🎯 MVP

**Goal**: A returning user lands directly inside their last accessed group (or only group), with safe fallbacks when storage is stale or the user has zero/one groups.

**Independent Test**: User with 2+ groups picks Group A, reloads — lands in Group A. User with 1 group always lands in that group regardless of storage. User with 0 groups lands in `/onboarding`. Stale `localStorage` value falls back to first group with no error.

### Tests for User Story 1

> Write these tests FIRST and confirm they FAIL before implementation.

- [X] T013 [P] [US1] Unit test `useLastAccessedGroup` in [tests/unit/hooks/useLastAccessedGroup.test.ts](tests/unit/hooks/useLastAccessedGroup.test.ts) covering: 0 groups → `reason: 'none'`, 1 group → `'single'`, lastId ∈ groups → `'stored'`, lastId ∉ groups → `'fallback'`, `localStorage` throws → silent fallback
- [X] T014 [P] [US1] Unit test `useActiveGroup` in [tests/unit/hooks/useActiveGroup.test.ts](tests/unit/hooks/useActiveGroup.test.ts) covering: URL `groupId` writes through to `setLastAccessedGroup`, missing group → `null`, role/`isAdmin` derived from `useGroup`
- [X] T015 [P] [US1] Integration test root resolver redirect behavior in [tests/integration/router/RootResolver.test.tsx](tests/integration/router/RootResolver.test.tsx): 0 groups → `/onboarding`, single group → `/groups/<id>`, multi-group with stored id → `/groups/<storedId>`, no flash of intermediate UI

### Implementation for User Story 1

- [X] T016 [US1] Implement [src/hooks/useLastAccessedGroup.ts](src/hooks/useLastAccessedGroup.ts) consuming `useUserGroups` + `useAuth` + `getLastAccessedGroup`, returning `LastAccessedGroupResolution` per data-model.md §Active group resolution
- [X] T017 [US1] Implement [src/hooks/useActiveGroup.ts](src/hooks/useActiveGroup.ts): reads `:groupId` from URL, calls `setLastAccessedGroup` on change, exposes `{ groupId, group, role, isAdmin }`
- [X] T018 [US1] Create [src/router/RootResolver.tsx](src/router/RootResolver.tsx) using `useLastAccessedGroup` to `<Navigate replace>` to `/groups/:id` or `/onboarding`; render a tiny suspense placeholder until `isReady`
- [X] T019 [US1] Wire `RootResolver` as the index route of `/` in [src/router/index.tsx](src/router/index.tsx); remove the old global `HomePage` from `/`
- [X] T020 [US1] Mobile validation: confirm resolver flow has no flash, redirect respects safe-area, and `localStorage` errors degrade silently on 320px viewport (US8 cross-cutting)

**Checkpoint**: Logging in or reloading delivers the user directly into the right group context; tests for resolution + fallback pass.

---

## Phase 4: User Story 2 — Switch and Create Groups Through a Modal (Priority: P1)

**Goal**: A single "Grupos" entry point opens a Radix Dialog listing groups and offering an inline two-step creation flow that reuses `GroupIdentityStep` + `ScoringConfigStep`, with no route navigation.

**Independent Test**: From inside a group, open "Grupos", switch to another group via the list, return, start creation, complete both steps, land in the newly created group as active context.

### Tests for User Story 2

- [X] T021 [P] [US2] Integration test `GroupsModal` (list mode) in [tests/integration/pages/GroupsModal.test.tsx](tests/integration/pages/GroupsModal.test.tsx): opens with current group context behind, lists groups, selecting another navigates and closes, ESC/overlay close without side-effects
- [X] T022 [P] [US2] Integration test `GroupsModal` (creation mode) in [tests/integration/pages/GroupsModalCreate.test.tsx](tests/integration/pages/GroupsModalCreate.test.tsx): clicking "Criar novo grupo" renders `GroupIdentityStep` then `ScoringConfigStep`, calls `createGroup` (not `navigate`), on success closes modal, sets active group, persists last-accessed

### Implementation for User Story 2

- [X] T023 [P] [US2] Create [src/pages/groups/components/GroupsModalList.tsx](src/pages/groups/components/GroupsModalList.tsx) reusing `GroupAvatar`; highlights active group; calls `onSelect(groupId)` from props
- [X] T024 [P] [US2] Create [src/pages/groups/components/GroupsModalCreate.tsx](src/pages/groups/components/GroupsModalCreate.tsx) embedding existing [src/pages/groups/components/GroupIdentityStep.tsx](src/pages/groups/components/GroupIdentityStep.tsx) and [src/pages/groups/components/ScoringConfigStep.tsx](src/pages/groups/components/ScoringConfigStep.tsx) with local `step: 1 | 2` state; submit calls `createGroup` mutation, on success calls `onCreated(newGroupId)` (research.md §4)
- [X] T025 [US2] Create [src/pages/groups/components/GroupsModal.tsx](src/pages/groups/components/GroupsModal.tsx) — Radix Dialog wrapper hosting `GroupsModalList` and `GroupsModalCreate`, internal `mode: 'list' | 'create'` state, back-button in create mode, max 300 lines (split confirmed by T023/T024)
- [X] T026 [US2] Expose modal trigger from `GroupShell` chrome (sidebar `+ Grupos` button placeholder; full wiring lives in US4) — for US2 in isolation, add a temporary trigger to verify the modal renders within the group context
- [X] T027 [US2] On successful group creation inside modal, call `setLastAccessedGroup(userId, newGroup.id)` and `navigate('/groups/' + newGroup.id)`; ensure no stack pollution (replace if already on a group route)
- [X] T028 [US2] Mobile validation: modal fills viewport at 320px, back button reachable to thumb, wizard steps scroll without trapping focus (US8)

**Checkpoint**: Switching groups and inline creation work end-to-end without leaving the active context.

---

## Phase 5: User Story 3 — Minimalist Header With Settings Menu (Priority: P1)

**Goal**: Group header shows only avatar + name + gear; gear opens a dropdown with "Detalhes" and "Sair"; "Sair" requires explicit confirmation and clears the last-accessed memory.

**Independent Test**: Enter a group, see compact header, open gear, navigate to Detalhes and back, trigger Sair → cancel keeps membership, trigger Sair → confirm leaves the group and falls back to next group or `/onboarding`.

### Tests for User Story 3

- [X] T029 [P] [US3] Integration test `GroupGearMenu` in [tests/integration/layout/GroupGearMenu.test.tsx](tests/integration/layout/GroupGearMenu.test.tsx): "Detalhes" navigates to `/groups/:id/detalhes`, "Sair" opens `LeaveGroupConfirm`, last-admin (`role==='admin' && memberCount > 1` with no other admins) disables the "Sair" item with tooltip
- [X] T030 [P] [US3] Integration test `LeaveGroupFlow` in [tests/integration/pages/LeaveGroupFlow.test.tsx](tests/integration/pages/LeaveGroupFlow.test.tsx): cancel keeps membership unchanged, confirm calls `useLeaveGroup`, clears `lastAccessedGroup`, invalidates `groupKeys.lists()`, navigates to `/`
- [X] T031 [P] [US3] Unit test `useLeaveGroup` in [tests/unit/hooks/useLeaveGroup.test.ts](tests/unit/hooks/useLeaveGroup.test.ts): success path runs side-effects in order; 409 LAST_ADMIN surfaces an `ApiError` toast and keeps modal open

### Implementation for User Story 3

- [X] T032 [P] [US3] Implement [src/hooks/useLeaveGroup.ts](src/hooks/useLeaveGroup.ts) wrapping `groups.service.leaveGroup`, with `onSuccess` running `clearLastAccessedGroup` + `queryClient.invalidateQueries({ queryKey: groupKeys.lists() })` + `navigate('/', { replace: true })`
- [X] T033 [P] [US3] Create [src/components/layout/GroupHeader.tsx](src/components/layout/GroupHeader.tsx) — 64px height, avatar + name + gear button, `backdrop-blur(16px)` border-bottom per plan.md §Routing tree visual rules
- [X] T034 [P] [US3] Create [src/components/layout/GroupGearMenu.tsx](src/components/layout/GroupGearMenu.tsx) — Radix DropdownMenu with "Detalhes" `NavLink` and "Sair" button (disabled when last admin), ARIA per research.md §11
- [X] T035 [US3] Create [src/pages/groups/components/LeaveGroupConfirm.tsx](src/pages/groups/components/LeaveGroupConfirm.tsx) — Radix Dialog using `components/ui/modal`, copy per plan.md §LeaveGroupConfirm, destructive primary button, cancel button
- [X] T036 [US3] Mount `GroupHeader` (with `GroupGearMenu`) inside [src/components/layout/GroupShell.tsx](src/components/layout/GroupShell.tsx) replacing the placeholder
- [X] T037 [US3] Mobile validation: header stays single-line on 320px (truncate name with ellipsis), gear button hit area ≥ 44px, confirm modal buttons reachable to thumb (US8)

**Checkpoint**: Header is minimalist, gear menu works, leave flow is gated by confirmation and cleans up state.

---

## Phase 6: User Story 4 — Left Sidebar Navigation (Priority: P1)

**Goal**: Inside a group, a left sidebar (desktop) / bottom-nav (mobile) exposes Home, Jogos, Palpites, Ranking, Membros, and (admin-only) Configurações; sidebar is hidden outside the group context.

**Independent Test**: Member sees 5 destinations and reaches each. Admin sees 6 including Configurações. Outside a group (onboarding, profile, `/groups/new`) the sidebar is absent. Mobile bottom-nav mirrors the same rules.

### Tests for User Story 4

- [X] T038 [P] [US4] Integration test `GroupShell` in [tests/integration/layout/GroupShell.test.tsx](tests/integration/layout/GroupShell.test.tsx): sidebar/header render on `/groups/:id/*`, absent on `/onboarding`, `/profile`, `/groups/new`
- [X] T039 [P] [US4] Integration test `GroupSidebar` in [tests/integration/layout/GroupSidebar.test.tsx](tests/integration/layout/GroupSidebar.test.tsx): member shows 5 items, admin shows 6, `aria-current="page"` on active destination, mid-session role demotion hides Configurações on next render
- [X] T040 [P] [US4] Integration test `GroupMobileNav` in [tests/integration/layout/GroupMobileNav.test.tsx](tests/integration/layout/GroupMobileNav.test.tsx): renders below `lg`, horizontal scroll for admin's 6 items, "Grupos" item opens modal

### Implementation for User Story 4

- [X] T041 [P] [US4] Create [src/lib/sidebar-destinations.ts](src/lib/sidebar-destinations.ts) exporting the `SidebarItem[]` registry (single source of truth consumed by `GroupSidebar` and `GroupMobileNav`)
- [X] T042 [P] [US4] Create [src/components/layout/GroupSidebar.tsx](src/components/layout/GroupSidebar.tsx) — `<nav aria-label="Navegação do grupo">`, `NavLink` per destination, conditional Configurações via `useActiveGroup().isAdmin`, "+ Grupos" button at the bottom (opens `GroupsModal` from US2)
- [X] T043 [P] [US4] Create [src/components/layout/GroupMobileNav.tsx](src/components/layout/GroupMobileNav.tsx) — bottom-nav with horizontal scroll, same destination registry, dedicated "Grupos" item that triggers the modal
- [X] T044 [US4] Mount `GroupSidebar` (≥ lg) and `GroupMobileNav` (< lg) inside [src/components/layout/GroupShell.tsx](src/components/layout/GroupShell.tsx); ensure pattern background runs in shell only, not children
- [X] T045 [P] [US4] Create [src/pages/groups/GroupJogosPage.tsx](src/pages/groups/GroupJogosPage.tsx) hosting existing `PhaseSelector` + `GroupStageGrid` + `KnockoutBracket` (research.md §12) — no duplication
- [X] T046 [P] [US4] Create [src/pages/groups/GroupPalpitesPage.tsx](src/pages/groups/GroupPalpitesPage.tsx) listing user bets via `useGroupMatches(groupId)` filtered by `userBet !== null`
- [X] T047 [P] [US4] Create [src/pages/groups/GroupRankingPage.tsx](src/pages/groups/GroupRankingPage.tsx) reusing existing `GroupRanking`
- [X] T048 [P] [US4] Create [src/pages/groups/GroupMembersPage.tsx](src/pages/groups/GroupMembersPage.tsx) reusing existing `MemberList` + `InvitePanel`
- [X] T049 [P] [US4] Create [src/pages/groups/GroupSettingsPage.tsx](src/pages/groups/GroupSettingsPage.tsx) reusing existing `GroupSettings` and wrapping in a `role==='admin'` guard (Navigate replace to `/groups/:id` if not admin) per research.md §13
- [X] T050 [P] [US4] Create [src/pages/groups/GroupDetailsPage.tsx](src/pages/groups/GroupDetailsPage.tsx) — aggregated identity (avatar large, name, description, invite, scoring) extracted from the old `GroupHomeHero`
- [X] T051 [US4] Register all new pages as children of the `GroupShell` route in [src/router/index.tsx](src/router/index.tsx); collapse or remove the legacy aggregate `GroupDetailPage`
- [X] T052 [US4] Mobile validation: bottom-nav fits 320px, no horizontal scroll outside the nav itself, hit areas ≥ 44px (US8)

**Checkpoint**: Navigation spine works in both viewports; admin gating verified; six new pages render their reused content.

---

## Phase 7: User Story 5 — Day-Strip + Inline Score Betting on Home (Priority: P1)

**Goal**: Group home uses a horizontal day-strip defaulting to today (or closest upcoming day), hiding past-only days, with modern cards that let the user place a score bet inline.

**Independent Test**: Group with matches across days opens on today; user scrolls upcoming days, types a score, saves — card reflects "Palpite salvo" without leaving the home; past-only days are hidden by default but reachable on opt-in.

### Tests for User Story 5

- [X] T053 [P] [US5] Unit test `matchday.utils` in [tests/unit/lib/matchday.utils.test.ts](tests/unit/lib/matchday.utils.test.ts): `groupMatchesByDay` groups by local yyyy-mm-dd and orders chronologically; `findDefaultMatchday` returns today index, falls back to first upcoming, then to 0; `isPastDay` correct for finished-only days; TZ uses local
- [X] T054 [P] [US5] Unit test `useGroupMatches` in [tests/unit/hooks/useGroupMatches.test.ts](tests/unit/hooks/useGroupMatches.test.ts) (MSW): returns `MatchWithUserBet[]`, respects `groupKeys.matches(groupId)`, 30s staleTime, invalidated on bet mutation
- [X] T055 [P] [US5] Component test `DayStrip` in [tests/unit/components/DayStrip.test.tsx](tests/unit/components/DayStrip.test.tsx): renders pills for matchdays, selected pill highlighted, click changes selection, supports horizontal scroll without losing selection
- [X] T056 [P] [US5] Component test `InlineBetCard` in [tests/unit/components/InlineBetCard.test.tsx](tests/unit/components/InlineBetCard.test.tsx): two numeric inputs (0–20), "Salvar palpite" disabled while empty, optimistic update paints "Palpite salvo" badge, network error keeps typed score and shows retry
- [X] T057 [P] [US5] Integration test `HomePage` in [tests/integration/pages/HomePage.test.tsx](tests/integration/pages/HomePage.test.tsx): default day = today, past-only days hidden by default, day change does not re-fetch, inline bet succeeds without route change

### Implementation for User Story 5

- [X] T058 [P] [US5] Implement [src/lib/matchday.utils.ts](src/lib/matchday.utils.ts) exporting `groupMatchesByDay(matches, { includePast? })`, `findDefaultMatchday(matchdays)`, `isPastDay(matchday, now?)` per plan.md §matchday.utils
- [X] T059 [P] [US5] Implement [src/hooks/useGroupMatches.ts](src/hooks/useGroupMatches.ts) — `useQuery` against `groups.service.getGroupMatches`, key `groupKeys.matches(groupId)`, `staleTime: 30_000`
- [X] T060 [US5] Update [src/hooks/useBets.ts](src/hooks/useBets.ts) (or wherever `usePlaceBet`/`useEditBet` live): on `onMutate` perform `setQueryData(groupKeys.matches(groupId), ...)` optimistic patch; `onError` rollback; `onSettled` invalidate (research.md §8)
- [X] T061 [P] [US5] Create [src/pages/home/components/DayStripPill.tsx](src/pages/home/components/DayStripPill.tsx) — single pill with selected/empty/past states and `aria-pressed`
- [X] T062 [US5] Create [src/pages/home/components/DayStrip.tsx](src/pages/home/components/DayStrip.tsx) — horizontal scroll container, default selection via `findDefaultMatchday`, opt-in toggle to include past days, Framer Motion entry transition
- [X] T063 [P] [US5] Create [src/pages/home/components/DayMatchList.tsx](src/pages/home/components/DayMatchList.tsx) — renders `InlineBetCard` for upcoming/live, defers finished to US6's `FinishedMatchCard` (placeholder until US6 ships)
- [X] T064 [US5] Create [src/pages/home/components/InlineBetCard.tsx](src/pages/home/components/InlineBetCard.tsx) — flag/team layout, two numeric inputs, "Salvar palpite" button, optimistic state via `usePlaceBet`/`useEditBet`, badge after save
- [X] T065 [US5] Rewrite [src/pages/home/HomePage.tsx](src/pages/home/HomePage.tsx) to consume `useGroupMatches(useActiveGroup().groupId)`, render `DayStrip` + `DayMatchList`, drop the legacy long-list rendering; cap file at 300 lines
- [X] T066 [US5] Wire `HomePage` as the index route of `/groups/:groupId` in [src/router/index.tsx](src/router/index.tsx)
- [X] T067 [US5] Empty states: no matches at all → branded empty card; no upcoming → message + "ver dias passados" toggle; respect Brasil Essencial tokens (doc/ui.md §9)
- [X] T068 [US5] Mobile validation: pills tappable, horizontal scroll smooth with snap, inline inputs use `inputMode="numeric"` and don't trigger zoom on iOS, card readable at 320px (US8)

**Checkpoint**: Group home is the redesigned experience; inline betting works with optimistic UI.

---

## Phase 8: User Story 6 — Finished Match Cards Show Result + Points (Priority: P2)

**Goal**: Once a match is `finished`, the card shows the official score, the user's bet (if any), and the points earned, all in a single card; pending official results are communicated without falsely showing zero points.

**Independent Test**: A finished match with a placed bet shows score + bet + points in one card. A finished match without a bet shows "Você não palpitou" + score. A finished match without official result shows "Resultado pendente".

### Tests for User Story 6

- [X] T069 [P] [US6] Component test `FinishedMatchCard` in [tests/unit/components/FinishedMatchCard.test.tsx](tests/unit/components/FinishedMatchCard.test.tsx): three states (bet present, no bet, result pending); points computed via `calcPoints`; ARIA roles for status

### Implementation for User Story 6

- [X] T070 [P] [US6] Create [src/pages/home/components/FinishedMatchCard.tsx](src/pages/home/components/FinishedMatchCard.tsx) — flag/team/score header, "Seu palpite: X × Y — N ponto(s)" line, fallback strings for no-bet and pending-result branches; consume `calcPoints` from `src/lib/bet.utils.ts`
- [X] T071 [US6] Wire `FinishedMatchCard` into [src/pages/home/components/DayMatchList.tsx](src/pages/home/components/DayMatchList.tsx): switch by `match.status === 'finished'`; remove the US5 placeholder
- [X] T072 [US6] Mobile validation: long team names truncate, "X ponto(s)" stays visible at 320px (US8)

**Checkpoint**: Finished matches are visually closed loops without extra navigation.

---

## Phase 9: User Story 7 — Betting Progress Bar (Priority: P2)

**Goal**: A progress bar above the day-strip shows how many of the navigable matches the user has bet on; updates optimistically; communicates completion at 100%; hides/adapts when there are no upcoming matches.

**Independent Test**: Open the home with N upcoming matches and M bets — bar shows M/N. Place a new bet — bar advances without reload. Bet on all available — bar fills and shows completion state. No upcoming matches — bar is hidden or replaced with an explanatory state.

### Tests for User Story 7

- [X] T073 [P] [US7] Unit test `useBettingProgress` in [tests/unit/hooks/useBettingProgress.test.ts](tests/unit/hooks/useBettingProgress.test.ts): pure memoized selector; correct `{ betted, total, pct, isComplete }`; `total === 0` returns `isComplete: false`
- [X] T074 [P] [US7] Component test `BettingProgressBar` in [tests/unit/components/BettingProgressBar.test.tsx](tests/unit/components/BettingProgressBar.test.tsx): renders pct + label; hidden when `total === 0`; reaches 100% renders completion state; ARIA `role="progressbar"` with `aria-valuenow`

### Implementation for User Story 7

- [X] T075 [P] [US7] Implement [src/hooks/useBettingProgress.ts](src/hooks/useBettingProgress.ts) — `useMemo` selector over `MatchdayGroup[]`, returns `BettingProgress`; no fetch
- [X] T076 [P] [US7] Create [src/pages/home/components/BettingProgressBar.tsx](src/pages/home/components/BettingProgressBar.tsx) — greeting + label "X de Y palpites", styled bar via tokens, completion variant, hidden-state branch
- [X] T077 [US7] Insert `BettingProgressBar` above `DayStrip` in [src/pages/home/HomePage.tsx](src/pages/home/HomePage.tsx); ensure recompute is instant when `useGroupMatches` cache changes (relies on US5 optimistic patch)
- [X] T078 [US7] Mobile validation: bar legible at 320px, percentage and label do not wrap awkwardly (US8)

**Checkpoint**: Progress bar gives the home a closable goal and reacts in real time to inline bets.

---

## Phase 10: User Story 8 — Mobile Coverage Audit (Priority: P1, cross-cutting)

**Goal**: Every redesigned surface works at 320px through `lg` breakpoint without horizontal scroll, clipped text, or unreachable controls.

**Independent Test**: A 320px viewport user completes the full walkthrough (resume → modal switch → modal create → header gear → leave-cancel → leave-confirm → day-strip → inline bet → finished card → progress bar) without horizontal scrolling or tap-target failures.

> Each preceding story already includes a mobile validation task; this phase covers the cross-cutting audits that span multiple stories.

- [X] T079 [US8] Run the full quickstart.md §4 manual walkthrough at 320px / 375px / 414px viewports; record any failures as follow-up tasks
- [X] T080 [P] [US8] Add visual-regression / DOM tests for safe-area insets in [tests/integration/layout/MobileSafeArea.test.tsx](tests/integration/layout/MobileSafeArea.test.tsx): bottom-nav respects `env(safe-area-inset-bottom)`, header respects top inset
- [X] T081 [US8] Verify Brasil Essencial tokens used everywhere (no hard-coded pixels/colors) across files touched by US1–US7 — grep for `#`, `rgb(`, and raw `px` literals introduced in this feature
- [X] T082 [US8] Verify focus rings use `--support` and outline-offset 3px on all new interactive elements (research.md §11)

**Checkpoint**: Mobile parity is documented and enforced.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation sync, gates.

- [X] T083 [P] Update [.specify/memory/global-functions.md](.specify/memory/global-functions.md) with the final signatures of `groupMatchesByDay`, `findDefaultMatchday`, `isPastDay`, and `lastAccessedGroup.{get,set,clear}` (if not already done in T012)
- [X] T084 [P] Confirm every new file is ≤ 300 lines (Constitution IV); split `GroupsModal` into `GroupsModalList` + `GroupsModalCreate` if needed (already pre-split in T023/T024)
- [X] T085 [P] Remove the legacy aggregate `GroupDetailPage` in [src/pages/groups/GroupDetailPage.tsx](src/pages/groups/GroupDetailPage.tsx) (or reduce to a redirect) — content is now distributed across the new pages
- [X] T086 [P] Remove `userBet: null` cast in [src/pages/home/HomePage.tsx](src/pages/home/HomePage.tsx) (and any other site that referenced the old workaround); replaced by real `userBet` from `useGroupMatches`
- [X] T087 Run `bun run typecheck && bun run lint && bun run test` — all must pass before merge (quickstart.md §2)
- [X] T088 Execute the full quickstart.md §4 manual walkthrough at desktop + mobile; document outcomes in PR description

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1. Blocks every user story phase.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2. Independent from US1 implementation (but shares the GroupShell mount point).
- **Phase 5 (US3)**: Depends on Phase 2. Independent from US1/US2 (header is its own component).
- **Phase 6 (US4)**: Depends on Phase 2. **Soft-depends** on US2 modal trigger (T026 placeholder bridges) — sidebar's "+ Grupos" button (T042) integrates US2's modal once both are landed.
- **Phase 7 (US5)**: Depends on Phase 2 + the bet mutation hooks (`usePlaceBet`/`useEditBet`) existing. Independent from US3/US4 visually.
- **Phase 8 (US6)**: Depends on Phase 7 (`DayMatchList` must exist).
- **Phase 9 (US7)**: Depends on Phase 7 (`HomePage` + `useGroupMatches` must exist).
- **Phase 10 (US8)**: Cross-cutting; runs after at least one full user-flow chain (US1 → US7) is in place.
- **Phase 11 (Polish)**: Depends on all desired user stories being complete.

### Within Each User Story

- Tests precede implementation (Constitution III).
- Types/services precede hooks; hooks precede components; components precede pages.
- Mount/wire-up tasks come last within each story.

### Parallel Opportunities

- All `[P]` Setup tasks (T002–T006) — independent files.
- All `[P]` Foundational tasks (T012) plus T007–T009 (different files).
- Within US1: T013/T014/T015 in parallel; T016/T017 in parallel.
- Within US2: T021/T022 in parallel; T023/T024 in parallel.
- Within US3: T029/T030/T031 in parallel; T032/T033/T034 in parallel.
- Within US4: T038/T039/T040 in parallel; T041/T042/T043 in parallel; T045–T050 in parallel.
- Within US5: T053–T057 in parallel; T058/T059/T061/T063 in parallel.
- Within US6: T069 standalone before T070.
- Within US7: T073/T074 in parallel; T075/T076 in parallel.
- Between stories: US3, US4, US5 can all proceed in parallel by different developers after Phase 2.

---

## Parallel Example: User Story 5

```bash
# Tests written first, in parallel:
Task: "Unit test matchday.utils in tests/unit/lib/matchday.utils.test.ts"
Task: "Unit test useGroupMatches in tests/unit/hooks/useGroupMatches.test.ts"
Task: "Component test DayStrip in tests/unit/components/DayStrip.test.tsx"
Task: "Component test InlineBetCard in tests/unit/components/InlineBetCard.test.tsx"
Task: "Integration test HomePage in tests/integration/pages/HomePage.test.tsx"

# Then implementation, in parallel where files are independent:
Task: "Implement src/lib/matchday.utils.ts"
Task: "Implement src/hooks/useGroupMatches.ts"
Task: "Create src/pages/home/components/DayStripPill.tsx"
Task: "Create src/pages/home/components/DayMatchList.tsx"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1).
2. STOP and VALIDATE: returning users land in the right group.
3. Ship MVP — the auto-resume alone is shippable value.

### Incremental Delivery (recommended order)

1. **MVP**: US1 (auto-resume) → demonstrable improvement on its own.
2. **+ Switching**: US2 (modal) — unlocks group switching without page changes.
3. **+ Identity & Exit**: US3 (header + gear) — round-trips the navigation contract.
4. **+ Navigation Spine**: US4 (sidebar) — completes the layout vision.
5. **+ Home Redesign**: US5 (day-strip + inline bet) — the most user-visible change.
6. **+ Closed Loop**: US6 (finished cards) — pairs with US5.
7. **+ Goal Visualization**: US7 (progress bar) — caps the home experience.
8. **+ Mobile Audit**: US8 — viewport-wide sweep.
9. **Polish**: Phase 11.

### Parallel Team Strategy

With multiple developers after Phase 2:

- **Developer A**: US1 → US7 (resume flow, hooks, progress bar).
- **Developer B**: US2 (modal) → US3 (header/gear).
- **Developer C**: US4 (sidebar) → US5 (home) → US6 (finished cards).
- **All**: collaborate on US8 mobile sweep + Phase 11.

---

## Notes

- `[P]` tasks = independent files, no incomplete dependency. Same-file edits must serialize.
- Every story is independently testable per the "Independent Test" header above its tests.
- Confirm each test FAILS before the matching implementation task is started.
- Commit per task or per logical group; reference task IDs in commit messages.
- Stop at any "Checkpoint" to validate the story in isolation.
- All file paths assume repo root `/Users/israel/dev/betabet-front/`.
