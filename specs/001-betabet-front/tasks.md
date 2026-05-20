---
description: "Task list for World Cup Betting App frontend"
---

# Tasks: World Cup Betting App

**Input**: Design documents from `specs/001-betabet-front/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅ quickstart.md ✅

**Tests**: Tests are MANDATORY per Constitution Principle III. Test tasks appear before
implementation tasks in every user story phase. Write tests first; ensure they FAIL before
implementing the feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

**Runtime**: All commands use `bun`. Never use npm or yarn.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Include exact file paths in every task description

## Path Conventions

All source code lives in `src/` at repository root.
Tests live in `tests/` at repository root.

---

## Phase 1: Setup

**Purpose**: Initialize the project and install all dependencies.

- [x] T001 Initialize Vite 6 + React 18 + TypeScript project: `bun create vite@latest . -- --template react-ts`
- [x] T002 [P] Configure Tailwind CSS v4: install `tailwindcss @tailwindcss/vite`, add plugin to `vite.config.ts`, create `src/index.css` with `@import "tailwindcss"`
- [x] T003 [P] Create `src/styles/tokens.css` with all Brasil Essencial CSS custom properties from `doc/ui.md` section 15 (both `:root` and `[data-theme="dark"]` blocks)
- [x] T004 [P] Initialize shadcn/ui: `bunx shadcn@latest init` with Tailwind v4 and `src/components/ui/` as output
- [x] T005 [P] Install runtime libraries: `bun add framer-motion zod @tanstack/react-query react-router-dom lucide-react tailwind-merge clsx`
- [x] T006 [P] Configure Vite dev proxy in `vite.config.ts`: proxy `/api` to `process.env.VITE_API_URL ?? 'http://localhost:3000'` with `changeOrigin: true`
- [x] T007 [P] Create `.env.example` with `VITE_API_URL=http://localhost:3000` and add `.env.local` to `.gitignore`
- [x] T008 Install test dependencies: `bun add -d vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw`; create `tests/setup.ts` with global test configuration
- [x] T009 [P] Add `vitest.config.ts` extending Vite config; add test, typecheck, lint scripts to `package.json`
- [x] T010 Create complete directory scaffold per plan.md: `src/assets/ src/components/ui/ src/components/layout/ src/components/match/ src/pages/ src/hooks/ src/services/ src/types/ src/lib/ src/router/guards/ src/context/ tests/unit/lib/ tests/unit/hooks/ tests/integration/pages/`

**Checkpoint**: `bun run dev` starts the dev server, `bun run test` runs (empty suite passes)

---

## Phase 2: Foundational

**Purpose**: Shared infrastructure that MUST be complete before any user story begins.

⚠️ **CRITICAL**: No user story work starts until this phase is complete.

- [x] T011 [P] Create `src/types/auth.types.ts`: `User`, `AuthState`, `LoginCredentials`, `RegisterData` interfaces (from `data-model.md`)
- [x] T012 [P] Create `src/types/match.types.ts`: `MatchStatus`, `TournamentPhase`, `Team`, `Stadium`, `Match`, `MatchWithUserBet`, `DistributionData` (from `data-model.md`)
- [x] T013 [P] Create `src/types/bet.types.ts`: `BetOutcome`, `Bet`, `BetWithUser`, `BetFormData`, `EmojiReaction` (from `data-model.md`)
- [x] T014 [P] Create `src/types/group.types.ts`: `GroupRole`, `JoinMode`, `BettingGroup`, `GroupMembership`, `RankingEntry`, `JoinRequest` (from `data-model.md`)
- [x] T015 [P] Create `src/types/referral.types.ts`: `ReferralInfo`, `ReferredUser` (from `data-model.md`)
- [x] T016 [P] Create `src/types/admin.types.ts`: `AdminStats`, `MatchAnalytics`, `GroupBetDistribution`, `UserStats`, `MatchFormData`, `TeamFormData`, `ResultFormData` (from `data-model.md`)
- [x] T017 [P] Create `src/lib/utils.ts` with `cn()` helper using `tailwind-merge` and `clsx` (shadcn standard)
- [x] T018 [P] Create `src/lib/date.utils.ts`: `formatMatchDate()`, `formatCountdown()`, `isBetEditable()`, `minutesUntilKickoff()` (signatures in `global-functions.md`)
- [x] T019 [P] Create `src/lib/bet.utils.ts`: `deriveBetOutcome()`, `calcPoints()` (signatures in `global-functions.md`)
- [x] T020 [P] Create `src/lib/format.utils.ts`: `formatScore()`, `formatPct()`, `formatRank()` (signatures in `global-functions.md`)
- [x] T021 [P] Create Zod schemas in `src/lib/schemas/`: `LoginSchema`, `RegisterSchema`, `BetFormSchema`, `GroupCreateSchema`, `MatchFormSchema`, `ResultFormSchema` (rules in `data-model.md`)
- [x] T022 Create `src/services/api.ts`: base `apiFetch()` wrapper with `credentials: 'include'`, JSON headers, error parsing from `{ error, code }` shape
- [x] T023 [P] Create `src/services/auth.service.ts`: `login()`, `register()`, `logout()`, `getMe()` using `apiFetch`
- [x] T024 [P] Create `src/context/auth.context.tsx`: `AuthContext` provider with `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()` actions; calls `GET /api/auth/me` on mount
- [x] T025 [P] Create `src/hooks/useAuth.ts`: thin wrapper that reads `AuthContext`
- [x] T026 [P] Create `src/hooks/useTheme.ts`: manages `'light' | 'dark'` state, persists to `localStorage`, sets `document.documentElement.dataset.theme`
- [x] T027 Add core shadcn components: `bunx shadcn@latest add button input badge dialog card tabs avatar`
- [x] T028 [P] Create `src/components/layout/PatternBackground.tsx` following `doc/ui.md` section 16.3 (accepts `theme` prop, `aria-hidden`)
- [x] T029 [P] Create `src/components/layout/Header.tsx`: sticky header with logo, navigation links, theme toggle button using `useTheme`; Brasil Essencial header styles from `doc/ui.md` section 10.1
- [x] T030 [P] Create `src/components/layout/BottomNav.tsx`: mobile bottom navigation with icons for Home, Matches, Groups, Profile
- [x] T031 Create `src/components/layout/AppShell.tsx`: root layout combining `Header`, `PatternBackground`, `<Outlet />`, and `BottomNav`
- [x] T032 [P] Create `src/components/match/TeamFlag.tsx`: flag `<img>` with team name and accessible `alt` text
- [x] T033 [P] Create `src/components/match/MatchStatusBadge.tsx`: badge with colour per status (upcoming/live/finished/cancelled)
- [x] T034 [P] Create `src/components/match/MatchCard.tsx`: compact card showing home team, away team, date, status badge; uses `TeamFlag` and `MatchStatusBadge`
- [x] T035 Create `src/router/guards/AuthGuard.tsx` (redirect to `/auth/login` if not authenticated) and `src/router/guards/AdminGuard.tsx` (redirect to `/` if not admin)
- [x] T036 Create `src/pages/auth/components/AuthForm.tsx` shared form shell and `src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx` with Zod validation and `useAuth` login/register calls
- [x] T037 Create `src/router/index.tsx` with initial route tree: `/auth/login`, `/auth/register`, `AppShell` layout wrapper, placeholder pages for `/`, `/matches`, `/groups`, `/profile`

**Checkpoint**: App runs, login/register pages render, theme toggle works, auth guard redirects unauthenticated users

---

## Phase 3: User Story 1 — Place and Manage Match Bets (Priority: P1) 🎯 MVP

**Goal**: Users can place and edit score predictions on matches; points are awarded after results.

**Independent Test**: Register a user → open any upcoming match → enter a score → confirm the
bet is saved. Log in as admin → confirm the match result → verify the user's points updated.

### Tests for User Story 1 (MANDATORY per Constitution Principle III)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T038 [P] [US1] Write unit tests for `isBetEditable()` in `tests/unit/lib/date.utils.test.ts`: test > 15 min (editable), ≤ 15 min (locked), past (locked)
- [x] T039 [P] [US1] Write unit tests for `deriveBetOutcome()` and `calcPoints()` in `tests/unit/lib/bet.utils.test.ts`
- [x] T040 [P] [US1] Set up msw handlers for `POST /api/bets` and `PUT /api/bets/:betId` in `tests/unit/hooks/bets.handlers.ts`
- [x] T041 [P] [US1] Write hook tests for `useBets` in `tests/unit/hooks/useBets.test.ts`: place bet, edit bet, locked bet error

### Implementation for User Story 1

- [x] T042 [P] [US1] Create `src/services/bets.service.ts`: `placeBet()`, `editBet()`, `toggleReaction()`
- [x] T043 [US1] Create `src/hooks/useBets.ts` with TanStack Query: `usePlaceBet()` mutation (optimistic update) and `useEditBet()` mutation (validates `isBetEditable()` before calling)
- [x] T044 [P] [US1] Create `src/pages/match-detail/components/BetForm.tsx`: two number inputs (home / away score, 0–20), replicate-to-all-groups toggle (visible only if user is in > 1 group), disabled state when bet is locked
- [x] T045 [US1] Integrate `BetForm` into a basic `src/pages/match-detail/MatchDetailPage.tsx` shell (match header + bet form + countdown to kick-off)
- [x] T046 [US1] Add `/matches/:matchId` route inside `AppShell` to router

**Checkpoint**: User Story 1 independently functional — bet placement, edit, and lock works

---

## Phase 4: User Story 2 — Browse Tournament Structure and Match Details (Priority: P1)

**Goal**: Users can navigate all matches by group stage and knockout bracket; tapping a match
shows full details.

**Independent Test**: Without placing any bet, browse all matches, switch between Group Stage
and Knockout tabs, click a match, and verify all details (teams, stadium, date, status) render.

### Tests for User Story 2 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T047 [P] [US2] Set up msw handlers for `GET /api/matches` and `GET /api/matches/:matchId` in `tests/integration/pages/matches.handlers.ts`
- [x] T048 [P] [US2] Write integration test for `MatchesPage` in `tests/integration/pages/MatchesPage.test.tsx`: verify group stage grid and phase selector render

### Implementation for User Story 2

- [x] T049 [P] [US2] Create `src/services/matches.service.ts`: `getMatches()`, `getMatchById()`, `getMatchDistribution()`
- [x] T050 [US2] Create `src/hooks/useMatches.ts`: `useMatches()` and `useMatch(matchId)` with TanStack Query
- [x] T051 [P] [US2] Create `src/pages/matches/components/PhaseSelector.tsx`: tab switcher between "Group Stage" and "Knockout" using shadcn Tabs
- [x] T052 [P] [US2] Create `src/pages/matches/components/GroupStageGrid.tsx`: displays matches grouped by group letter (A–H) with matchday sub-sections; uses `MatchCard`
- [x] T053 [US2] Create `src/pages/matches/components/KnockoutBracket.tsx`: SVG bracket showing r16 → qf → sf → final paths with team names filled in as results arrive
- [x] T054 [US2] Create `src/pages/matches/MatchesPage.tsx`: composes `PhaseSelector`, `GroupStageGrid`, and `KnockoutBracket`; uses `useMatches()`
- [x] T055 [US2] Expand `MatchDetailPage` to display: both team flags + names, stadium + city, scheduled date/time, match status badge, and existing user bet
- [x] T056 [US2] Add `/matches` route to router inside `AppShell`

**Checkpoint**: User Story 2 independently functional — full tournament navigation works

---

## Phase 5: User Story 3 — Home Screen and Quick Navigation (Priority: P1)

**Goal**: Home screen shows next matches, unbetted matches, and ranking preview; all sections
are tappable and navigate to the correct destinations.

**Independent Test**: Log in → verify home screen loads in < 2 s, shows ≥ 1 upcoming match,
≥ 1 unbetted match; tapping either navigates to the correct page.

### Tests for User Story 3 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T057 [P] [US3] Write integration test for `HomePage` in `tests/integration/pages/HomePage.test.tsx`: upcoming matches, unbetted matches, and ranking preview sections render

### Implementation for User Story 3

- [x] T058 [P] [US3] Create `src/pages/home/components/UpcomingMatches.tsx`: list of next 3–5 matches sorted by `scheduledAt`; each item is a tappable `MatchCard`
- [x] T059 [P] [US3] Create `src/pages/home/components/UnbettedMatches.tsx`: matches where `userBet === null`; tapping navigates to bet placement
- [x] T060 [P] [US3] Create `src/pages/home/components/RankingPreview.tsx`: shows user's position + top 3 in each group (placeholder data until `useRanking` is built in US5)
- [x] T061 [US3] Create `src/pages/home/HomePage.tsx`: composes `UpcomingMatches`, `UnbettedMatches`, `RankingPreview`; uses `useMatches()` and applies Motion entrance animations (`opacity 0→1, y 18→0`)
- [x] T062 [US3] Wire `BottomNav` links to `/` (Home), `/matches` (Matches), `/groups` (Groups), `/profile` (Profile)
- [x] T063 [US3] Set `/` as the default route (guarded by `AuthGuard`) in router

**Checkpoint**: User Stories 1, 2, and 3 all independently functional

---

## Phase 6: User Story 4 — Create and Manage a Betting Group (Priority: P2)

**Goal**: Users can create a group, configure rules, invite others, approve join requests, and
remove members. Settings panel is visible only to the admin.

**Independent Test**: Create a group → open settings (admin) → configure points → share invite
link → second user joins → verify both appear in member list; settings are hidden for the
non-admin member.

### Tests for User Story 4 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T064 [P] [US4] Set up msw handlers for `POST /api/groups`, `PUT /api/groups/:id`, `GET /api/groups/:id/members`, `DELETE /api/groups/:id/members/:userId` in `tests/integration/pages/groups.handlers.ts`
- [x] T065 [P] [US4] Write integration test for `GroupDetailPage` in `tests/integration/pages/GroupDetailPage.test.tsx`: settings panel visible for admin, hidden for member

### Implementation for User Story 4

- [x] T066 [P] [US4] Create `src/services/groups.service.ts`: `getUserGroups()`, `createGroup()`, `updateGroup()`, `removeMember()`, `generateInviteLink()`, `resolveInviteCode()`, `joinGroup()`, `getJoinRequests()`, `handleJoinRequest()`
- [x] T067 [US4] Create `src/hooks/useGroups.ts`: `useUserGroups()`, `useGroup(groupId)`, `useCreateGroup()`, `useUpdateGroup()`, `useRemoveMember()` with TanStack Query
- [x] T068 [P] [US4] Create `src/pages/groups/components/GroupCard.tsx`: card showing group cover image, name, member count, and user's current rank
- [x] T069 [US4] Create `src/pages/groups/GroupsPage.tsx`: lists user's groups with a "Create Group" button; uses `useUserGroups()`
- [x] T070 [P] [US4] Create `src/pages/group-detail/components/MemberList.tsx`: member avatars + names + roles; admin sees "Remove" button per member
- [x] T071 [P] [US4] Create `src/pages/group-detail/components/InvitePanel.tsx`: copy invite link button + pending join requests list with approve/reject actions (admin only)
- [x] T072 [US4] Create `src/pages/group-detail/components/GroupSettings.tsx`: form to update group name, cover, point values, bet visibility, join mode (rendered only when `role === 'admin'`)
- [x] T073 [US4] Create `src/pages/group-detail/GroupDetailPage.tsx`: tabs for Ranking (placeholder), Members, and Matches; conditionally renders `GroupSettings` and `InvitePanel` for admin
- [x] T074 [US4] Create `src/pages/group-invite/GroupInvitePage.tsx`: public page resolving `/invite/:code`, showing group info and Join / Request button
- [x] T075 [US4] Add `/groups`, `/groups/:groupId`, `/groups/:groupId/settings`, `/invite/:code` routes to router (groups routes inside `AuthGuard`)

**Checkpoint**: User Story 4 independently functional — groups can be created, configured, joined

---

## Phase 7: User Story 5 — Group Ranking, Bet Visibility, and Social Reactions (Priority: P2)

**Goal**: Group ranking updates live (30 s poll). After kick-off, members see each other's bets.
Emoji reactions work. Unlocked users see the distribution chart.

**Independent Test**: Confirm a match result → verify group ranking updates within 30 s without
manual refresh. Tap any visible bet → add an emoji reaction → verify it appears for all members.

### Tests for User Story 5 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T076 [P] [US5] Write unit test for `DistributionChart` in `tests/unit/DistributionChart.test.tsx`: verify bar widths match input percentages (60/20/20)
- [x] T077 [P] [US5] Set up msw handlers for `GET /api/groups/:groupId/ranking` and `GET /api/groups/:groupId/matches/:matchId/bets` in `tests/integration/pages/groups.handlers.ts`

### Implementation for User Story 5

- [x] T078 [US5] Create `src/hooks/useRanking.ts`: `useGroupRanking(groupId)` with `refetchInterval: 30_000` and `refetchIntervalInBackground: false`
- [x] T079 [P] [US5] Create `src/pages/group-detail/components/GroupRanking.tsx`: ranked table with position, avatar, name, total points, exact-score count; uses `useRanking`
- [x] T080 [P] [US5] Create `src/pages/match-detail/components/BetsGrid.tsx`: grid of member bets (visible based on `canView` flag from API); shows user avatar, predicted score, and emoji reactions
- [x] T081 [P] [US5] Create `src/pages/match-detail/components/EmojiPicker.tsx`: row of 6 fixed emoji buttons (🔥 ❤️ 😂 😮 👎 🏆); highlighted if current user already reacted; calls `toggleReaction()` on click
- [x] T082 [US5] Create `src/pages/match-detail/components/DistributionChart.tsx`: SVG horizontal bar chart showing home/draw/away percentages with team flag icons; guarded by `user.chartUnlocked`
- [x] T083 [US5] Extend `MatchDetailPage` in group context (`/groups/:groupId/matches/:matchId`): add `BetsGrid`, `EmojiPicker`, and `DistributionChart` sections below `BetForm`
- [x] T084 [US5] Replace placeholder in `GroupDetailPage` ranking tab with `GroupRanking` component
- [x] T085 [US5] Update `RankingPreview` on `HomePage` to use `useRanking` with 30 s polling; wire tap to full `GroupDetailPage`
- [x] T086 [US5] Add `/groups/:groupId/matches/:matchId` route to router

**Checkpoint**: User Stories 1–5 all independently functional; ranking auto-updates

---

## Phase 8: User Story 6 — Referral Program and Feature Unlocks (Priority: P3)

**Goal**: Each user has a shareable referral link. 3 accepted referrals unlock the distribution
chart. Code can only be set once; users cannot use their own code.

**Independent Test**: View referral section → share link → three users register via it →
referrer's distribution chart appears on match screens without manual step.

### Tests for User Story 6 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T087 [P] [US6] Set up msw handlers for `GET /api/referral` and `POST /api/referral/apply` in `tests/integration/pages/referral.handlers.ts`
- [x] T088 [P] [US6] Write integration test for `ReferralSection` in `tests/integration/pages/ProfilePage.test.tsx`: code input locked after first set; own-code rejected; chart unlock shown at count ≥ 3

### Implementation for User Story 6

- [x] T089 [P] [US6] Create `src/services/referral.service.ts`: `getReferralInfo()`, `applyReferralCode()`
- [x] T090 [US6] Create `src/hooks/useReferral.ts`: `useReferralInfo()` and `useApplyReferralCode()` mutation with TanStack Query
- [x] T091 [US6] Create `src/pages/profile/components/ReferralSection.tsx`: shows shareable link (copy button), referral count, unlock status badge; editable code input disabled once set
- [x] T092 [US6] Create `src/pages/profile/ProfilePage.tsx`: user avatar, name, email, `ReferralSection`; uses `useAuth`
- [x] T093 [US6] Guard `DistributionChart` in `MatchDetailPage` behind `user?.chartUnlocked === true` check; show unlock prompt otherwise
- [x] T094 [US6] Wire referral code field in `RegisterPage` to call `applyReferralCode()` post-registration if code was provided
- [x] T095 [US6] Add `/profile` route to router inside `AuthGuard`

**Checkpoint**: User Story 6 independently functional — referral link works, unlock triggers correctly

---

## Phase 9: User Story 7 — System Administration Panel (Priority: P3)

**Goal**: Admin panel with separate authentication; admins register matches/teams/results and
view analytics. Observer mode lets admin view any group silently.

**Independent Test**: Admin logs in → registers a new match → match appears for regular users.
Admin confirms a match result → user points update.

### Tests for User Story 7 (MANDATORY)

> **Write these tests FIRST. Ensure they FAIL before implementing.**

- [x] T096 [P] [US7] Set up msw handlers for `POST /api/admin/auth/login`, `POST /api/admin/matches/:id/result`, `GET /api/admin/analytics/matches` in `tests/integration/pages/admin.handlers.ts`
- [x] T097 [P] [US7] Write integration test for `AdminGuard` redirect in `tests/integration/pages/AdminGuard.test.tsx`: non-admin user redirected to `/`

### Implementation for User Story 7

- [x] T098 [P] [US7] Create `src/services/admin.service.ts`: `adminLogin()`, `getAdminStats()`, `createMatch()`, `updateMatch()`, `confirmResult()`, `getTeams()`, `createTeam()`, `getMatchAnalytics()`, `getUserStats()`, `getGroupObserver()`
- [x] T099 [US7] Create `src/pages/admin/AdminLayout.tsx`: sidebar navigation with links to Dashboard, Matches, Teams, Analytics; uses `AdminGuard`
- [x] T100 [P] [US7] Create `src/pages/admin/components/StatsCard.tsx`: metric tile with label and value used across admin pages
- [x] T101 [P] [US7] Create `src/pages/admin/components/TeamForm.tsx`: form to create/edit a team (name, flag URL, group); Zod validated
- [x] T102 [P] [US7] Create `src/pages/admin/components/MatchResultForm.tsx`: form to enter final homeScore and awayScore for a match; Zod validated
- [x] T103 [US7] Create `src/pages/admin/AdminDashboardPage.tsx`: shows `AdminStats` (total users, groups, bets) via `StatsCard` components
- [x] T104 [US7] Create `src/pages/admin/AdminMatchesPage.tsx`: list of all matches with a "Confirm Result" button per finished match that opens `MatchResultForm` in a dialog
- [x] T105 [US7] Create `src/pages/admin/AdminTeamsPage.tsx`: list of all teams with Create / Edit via `TeamForm` in a dialog
- [x] T106 [US7] Create `src/pages/admin/AdminAnalyticsPage.tsx`: table of match bet distributions; user stats table with groups created, referrals, bet count (paginated)
- [x] T107 [US7] Add `/admin`, `/admin/matches`, `/admin/teams`, `/admin/analytics` routes behind `AdminGuard` with `AdminLayout`

**Checkpoint**: All 7 user stories independently functional

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Animations, theme, compliance, and final validation across all stories.

- [x] T108 [P] Add Motion entrance animations to all page root components: `initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}` per `doc/ui.md` section 12
- [x] T109 [P] Add Motion card entrance animations (delay stagger) to `MatchCard`, `GroupCard`, `RankingEntry` lists per `doc/ui.md` section 12.2
- [x] T110 [P] Verify all components respect `prefers-reduced-motion` by wrapping Motion variants conditionally
- [x] T111 Audit all source files for the 300-line limit (Constitution IV); split any file that exceeds it
- [x] T112 [P] Audit all components for hard-coded hex colours or pixel values; replace with CSS token references or Tailwind utilities
- [x] T113 [P] Run `bun run typecheck` and fix all TypeScript errors
- [x] T114 [P] Run `bun run test` full suite; ensure all tests pass
- [x] T115 Verify layout at 375 px (mobile) and 1280 px (desktop) against `doc/ui.md` grid rules (section 7)
- [x] T116 [P] Verify WCAG contrast ratios for all text/background combinations per `doc/ui.md` section 13.1 (4.5:1 normal, 3:1 large)
- [x] T117 Audit `.specify/memory/global-functions.md`; add any new utility functions discovered during implementation that are used in 2+ places
- [x] T118 Run quickstart.md validation: `bun install` → `bun run dev` → `bun run test` → `bun run build` all succeed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundation — no story dependencies
- **US2 (Phase 4)**: Depends on Foundation — no story dependencies (parallel with US1)
- **US3 (Phase 5)**: Depends on US1 + US2 completion (uses `useMatches`, `useBets`)
- **US4 (Phase 6)**: Depends on Foundation — no story dependencies (parallel with US1/US2)
- **US5 (Phase 7)**: Depends on US1 + US4 (extends betting + groups)
- **US6 (Phase 8)**: Depends on Foundation — parallel with US4/US5
- **US7 (Phase 9)**: Depends on Foundation — parallel with US1–US6
- **Polish (Phase 10)**: Depends on all user stories complete

### User Story Dependencies

```
Foundation
├── US1 (P1) ─────────────┐
├── US2 (P1) ─────────────┤
│   └── US3 (P1) ─────────┤
├── US4 (P2) ─────────────┤
│   └── US5 (P2) ──────── Polish
├── US6 (P3) ─────────────┤
└── US7 (P3) ─────────────┘
```

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Types → Services → Hooks → Components → Page → Route
3. Mark phase complete only when independent test criterion passes

### Parallel Opportunities

- All [P] tasks within a phase can run concurrently (different files)
- US1, US2, US4, US6, US7 can all start in parallel after Foundation
- US3 starts after US1 + US2

---

## Parallel Execution Examples

### Foundation Phase (after T022 base API is done)

```
T023 auth.service.ts + useAuth   T026 useTheme.ts
T028 PatternBackground.tsx       T029 Header.tsx
T030 BottomNav.tsx               T032 TeamFlag.tsx
T033 MatchStatusBadge.tsx        T034 MatchCard.tsx
```

### User Story 1 (after Foundation checkpoint)

```
T038 isBetEditable() tests       T039 bet.utils tests
T040 msw bets handlers           T042 bets.service.ts
T044 BetForm.tsx
```

---

## Implementation Strategy

### MVP (User Story 1 + 2 + 3 only — P1 stories)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundation)
3. Complete Phase 3 (US1 — betting core)
4. Complete Phase 4 (US2 — tournament navigation)
5. Complete Phase 5 (US3 — home screen)
6. **STOP and VALIDATE**: All P1 stories pass independent tests
7. Deploy/demo: users can browse matches, place bets, see home screen

### Incremental Delivery

1. Foundation → MVP (US1–US3) → deploy
2. Add US4 (groups) → test → deploy
3. Add US5 (ranking + social) → test → deploy
4. Add US6 (referral) → test → deploy
5. Add US7 (admin) → test → deploy
6. Polish → final release

---

## Notes

- [P] = different files, no blocking dependencies within the phase
- All `bun` commands — never npm/yarn
- Each user story is independently completable and testable
- Tests MUST fail before implementation (Constitution Principle III)
- Commit after each checkpoint
- No file may exceed 300 lines (Constitution Principle IV)
- All CSS values from Brasil Essencial tokens — no hard-coded hex or pixel values (Constitution VI)
