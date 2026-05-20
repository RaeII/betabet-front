# Implementation Plan: World Cup Betting App

**Branch**: `001-betabet-front` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-betabet-front/spec.md`

## Summary

A mobile-first React/TypeScript web application for World Cup score predictions. Users place
exact-score bets on matches, compete in configurable private groups with live rankings, and
unlock a Polymarket-style bet-distribution chart through a 3-referral program. A separate admin
panel manages tournament data, result confirmation, and platform analytics.

The frontend communicates exclusively with a RESTful backend through a Vite dev-proxy (`/api`)
and follows the Brasil Essencial design system defined in `doc/ui.md`.

## Technical Context

**Language/Version**: TypeScript 5.x / React 18

**Primary Dependencies**:

- Vite 6 + `@vitejs/plugin-react` (build, dev-proxy, HMR)
- Tailwind CSS v4 + `tailwind-merge` + `clsx` (styling)
- shadcn/ui (accessible base components, copy-paste model)
- Motion / Framer Motion 11 (animations)
- Zod (form validation + API response schema validation)
- TanStack Query v5 (server state, caching, 30 s polling)
- React Router DOM v6 (routing, nested layouts, guards)
- Lucide React (icon set — already a shadcn dependency)

**Runtime / Package Manager**: Bun

**Storage**: N/A — frontend only. Server state is managed via TanStack Query cache. Auth state
and theme preference live in React Context with `localStorage` persistence.

**Testing**: Vitest + `@testing-library/react` + `msw` (API mocking). Run via `bun run test`.

**Target Platform**: Mobile-first responsive web (Chrome/Safari/Firefox; iOS 15+/Android via
browser). No native app wrapper in v1.

**Performance Goals**:

- Home screen initial render < 2 s on standard mobile connection (SC-003)
- Group rankings reflect result confirmation ≤ 30 s (SC-002, via TanStack Query polling)
- Bet placement confirmation < 60 s end-to-end (SC-001)

**Constraints**:

- No real-money transactions
- Minimum library footprint — no library added without clear justification
- All API calls proxied through `/api` prefix (no CORS friction in dev)
- All spacing, colour, and typography strictly from Brasil Essencial CSS tokens (doc/ui.md)
- No hard-coded pixel values where a design token or Tailwind class exists
- Files MUST NOT exceed 300 lines (Constitution IV)

**Scale/Scope**: ~15–20 pages/views; single Vite project; monorepo-ready but single-app now

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Principle                       | Gate                                                                                               | Status  |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | ------- |
| I. DRY & Simplicity             | Reusable logic in `src/hooks/` and `src/lib/`; functions catalogued in `global-functions.md`       | ✅ PASS |
| II. Type Safety                 | All types in `src/types/` files; no inline interface declarations in components                    | ✅ PASS |
| III. Test-First                 | Vitest + Testing Library; tests written before implementation each story                           | ✅ PASS |
| IV. File Organization           | Global in `src/components/`; page-specific in `pages/[page]/components/`; max 300 lines            | ✅ PASS |
| V. Performance & Data Freshness | TanStack Query 30 s polling for rankings; optimistic mutations on bets                             | ✅ PASS |
| VI. Layout Consistency          | All tokens from `styles/tokens.css` (Brasil Essencial); Tailwind utility classes; no magic numbers | ✅ PASS |

**All gates pass. No violations. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-betabet-front/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # REST API contract (Phase 1 output)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── assets/
│   └── world-cup-pattern.png        # Brasil Essencial geometric pattern
│
├── components/                       # GLOBAL — used in 2 or more pages
│   ├── ui/                           # shadcn base components (Button, Input, Badge…)
│   ├── layout/
│   │   ├── AppShell.tsx              # Root layout (header + outlet + bottom nav)
│   │   ├── Header.tsx                # Sticky header with logo + theme toggle
│   │   ├── BottomNav.tsx             # Mobile bottom navigation bar
│   │   └── PatternBackground.tsx    # Brasil Essencial geometric pattern layer
│   └── match/
│       ├── MatchCard.tsx             # Compact match card (home + matches pages)
│       ├── TeamFlag.tsx              # Flag image + team name
│       └── MatchStatusBadge.tsx      # Upcoming / Live / Finished chip
│
├── pages/
│   ├── home/
│   │   ├── HomePage.tsx
│   │   └── components/
│   │       ├── UpcomingMatches.tsx   # Next 3–5 matches list
│   │       ├── UnbettedMatches.tsx   # Matches without a user bet
│   │       └── RankingPreview.tsx    # Compact group ranking widget
│   │
│   ├── matches/
│   │   ├── MatchesPage.tsx
│   │   └── components/
│   │       ├── PhaseSelector.tsx     # Tab: Group Stage / Knockout
│   │       ├── GroupStageGrid.tsx    # Matches grouped by A–H + matchday
│   │       └── KnockoutBracket.tsx   # SVG bracket diagram
│   │
│   ├── match-detail/
│   │   ├── MatchDetailPage.tsx
│   │   └── components/
│   │       ├── BetForm.tsx           # Score input + replicate toggle + submit
│   │       ├── BetsGrid.tsx          # All group members' bets (post kick-off)
│   │       ├── DistributionChart.tsx # SVG Polymarket-style % chart (unlocked users)
│   │       └── EmojiPicker.tsx       # Fixed emoji reaction set
│   │
│   ├── groups/
│   │   ├── GroupsPage.tsx
│   │   └── components/
│   │       └── GroupCard.tsx
│   │
│   ├── group-detail/
│   │   ├── GroupDetailPage.tsx
│   │   └── components/
│   │       ├── GroupRanking.tsx       # Live ranking table (30 s poll)
│   │       ├── GroupSettings.tsx      # Admin-only settings panel
│   │       ├── MemberList.tsx
│   │       └── InvitePanel.tsx        # Generate link + pending requests
│   │
│   ├── group-invite/
│   │   └── GroupInvitePage.tsx        # /invite/:code landing page
│   │
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   └── components/
│   │       └── ReferralSection.tsx    # Referral link + count + unlock status
│   │
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── components/
│   │       └── AuthForm.tsx           # Shared form shell for login/register
│   │
│   └── admin/
│       ├── AdminLayout.tsx            # Admin shell (sidebar nav)
│       ├── AdminDashboardPage.tsx
│       ├── AdminMatchesPage.tsx
│       ├── AdminTeamsPage.tsx
│       ├── AdminAnalyticsPage.tsx
│       └── components/
│           ├── MatchResultForm.tsx    # Confirm final score
│           ├── TeamForm.tsx
│           └── StatsCard.tsx
│
├── hooks/                             # Global custom hooks
│   ├── useAuth.ts                     # Auth state + login/logout/register
│   ├── useTheme.ts                    # Light/dark toggle + localStorage persist
│   ├── useMatches.ts                  # TanStack Query — match list + detail
│   ├── useBets.ts                     # TanStack Query — bets + place/edit mutations
│   ├── useGroups.ts                   # TanStack Query — group CRUD + membership
│   ├── useRanking.ts                  # TanStack Query with refetchInterval: 30000
│   └── useReferral.ts                 # Referral data + apply code mutation
│
├── services/                          # API service layer (all through /api proxy)
│   ├── api.ts                         # Base fetch wrapper: error handling, headers
│   ├── auth.service.ts
│   ├── matches.service.ts
│   ├── bets.service.ts
│   ├── groups.service.ts
│   ├── referral.service.ts
│   └── admin.service.ts
│
├── types/                             # All TypeScript types — Constitution Principle II
│   ├── auth.types.ts
│   ├── match.types.ts
│   ├── bet.types.ts
│   ├── group.types.ts
│   ├── referral.types.ts
│   └── admin.types.ts
│
├── lib/                               # Pure utility functions — Constitution Principle I
│   ├── utils.ts                       # cn() helper (shadcn standard)
│   ├── date.utils.ts                  # formatDate(), formatCountdown(), isBetEditable()
│   ├── bet.utils.ts                   # calcOutcome(), calcPoints()
│   └── format.utils.ts               # formatScore(), formatPct(), formatRank()
│
├── router/
│   ├── index.tsx                      # Route tree definition
│   └── guards/
│       ├── AuthGuard.tsx              # Redirect to /auth/login if unauthenticated
│       └── AdminGuard.tsx             # Redirect to / if not admin role
│
├── context/
│   └── auth.context.tsx               # User AuthContext provider
│
└── styles/
    └── tokens.css                     # Brasil Essencial CSS custom properties

tests/
├── unit/
│   ├── lib/                           # Tests for pure utility functions
│   └── hooks/                         # Hook tests with msw server mocking
├── integration/
│   └── pages/                         # Page render + interaction tests
└── setup.ts                           # Vitest + Testing Library global setup
```

**Structure Decision**: Single Vite SPA. Global components in `src/components/`; page-specific
in `pages/[page]/components/`. This enforces Constitution Principle IV and ensures that moving
a component to another page makes its global/local classification explicit.

## Complexity Tracking

No Constitution violations require justification.
