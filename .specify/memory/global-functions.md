# Global Functions Catalogue

This file is the canonical reference for all reusable utility functions in the project.
Before writing a new utility function, search here first (Constitution Principle I).
When a new reusable function is created, add it here before closing the feature branch.

## Format

```
### functionName(params): ReturnType
- **File**: `src/utils/example.ts`
- **Purpose**: One sentence describing what it does.
- **Usage**: `functionName(arg1, arg2)`
```

---

<!-- Functions identified during Phase 1 planning of 001-betabet-front -->

## Date Utilities — `src/lib/date.utils.ts`

### formatMatchDate(isoString: string): string

- **Purpose**: Format a match's scheduled ISO date into a localised display string.
- **Usage**: `formatMatchDate(match.scheduledAt)` → `"Sáb, 14 Jun · 16:00"`

### formatCountdown(isoString: string): string

- **Purpose**: Return a human-readable countdown to a future ISO date (e.g., "2h 34m").
- **Usage**: `formatCountdown(match.scheduledAt)` → `"2h 34m"`

### isBetEditable(scheduledAt: string): boolean

- **Purpose**: Returns true if the match starts more than 15 minutes from now (bet is still editable).
- **Usage**: `isBetEditable(match.scheduledAt)` — used in BetForm and edit guards.

### minutesUntilKickoff(scheduledAt: string): number

- **Purpose**: Return the number of minutes until the scheduled kick-off (negative if past).
- **Usage**: `minutesUntilKickoff(match.scheduledAt)`

---

## Bet Utilities — `src/lib/bet.utils.ts`

### deriveBetOutcome(homeScore: number, awayScore: number): BetOutcome

- **File**: `src/lib/bet.utils.ts`
- **Purpose**: Derive the predicted outcome ('home' | 'draw' | 'away') from a score pair.
- **Usage**: `deriveBetOutcome(2, 1)` → `"home"`

### calcPoints(bet: Bet, match: Match, group: BettingGroup): number

- **File**: `src/lib/bet.utils.ts`
- **Purpose**: Calculate total points earned for a bet given the final match result and group point config.
- **Usage**: `calcPoints(bet, match, group)` → `3`

---

## Format Utilities — `src/lib/format.utils.ts`

### formatScore(home: number | null, away: number | null): string

- **Purpose**: Format a score pair for display; returns "–" if scores are null (match not finished).
- **Usage**: `formatScore(2, 1)` → `"2 – 1"` ; `formatScore(null, null)` → `"– – –"`

### formatPct(value: number): string

- **Purpose**: Format a 0–100 percentage value for display in the distribution chart.
- **Usage**: `formatPct(66.7)` → `"67%"`

### formatRank(position: number): string

- **Purpose**: Format a ranking position with ordinal suffix.
- **Usage**: `formatRank(1)` → `"1°"` ; `formatRank(3)` → `"3°"`

---

## UI Utilities — `src/lib/utils.ts`

### cn(...classes: ClassValue[]): string

- **Purpose**: Merge Tailwind class names safely, resolving conflicts (shadcn standard utility).
- **Usage**: `cn("bg-brand", isActive && "opacity-100", "text-sm")`

---

## React Hooks — discovered during implementation

### useReducedMotion(): boolean

- **File**: `src/hooks/useReducedMotion.ts`
- **Purpose**: Returns true if the user has `prefers-reduced-motion: reduce` set. Used to disable Motion animations.
- **Usage**: `const reduced = useReducedMotion()` — wrap Motion components conditionally.

### matchHasResult(match: Match): boolean

- **File**: `src/lib/bet.utils.ts`
- **Purpose**: Returns true if both `homeScore` and `awayScore` are non-null (match result is confirmed).
- **Usage**: `matchHasResult(match)` — used to gate result display and point calculation.

---

## Matchday Utilities — `src/lib/matchday.utils.ts`

### groupMatchesByDay(matches: MatchWithUserBet[], options?: { includePast?: boolean }): MatchdayGroup[]

- **File**: `src/lib/matchday.utils.ts`
- **Purpose**: Group matches by local day (yyyy-mm-dd) in the user's browser timezone; orders chronologically and (by default) hides days whose matches are entirely in the past.
- **Usage**: `groupMatchesByDay(matches, { includePast: false })`

### findDefaultMatchday(matchdays: MatchdayGroup[]): number

- **File**: `src/lib/matchday.utils.ts`
- **Purpose**: Index of the matchday to highlight by default — today (local) if present, otherwise the first upcoming day, otherwise 0.
- **Usage**: `findDefaultMatchday(matchdays)`

### isPastDay(matchday: MatchdayGroup, now?: Date): boolean

- **File**: `src/lib/matchday.utils.ts`
- **Purpose**: Returns true if every match for the day is finished or scheduled in the past.
- **Usage**: `isPastDay(matchday)`

---

## Last-accessed group — `src/services/last-group.service.ts`

### getLastAccessedGroup(userId: string): string | null

- **Purpose**: Read the stored last-accessed groupId for a user from `localStorage`; tolerates read errors silently.

### setLastAccessedGroup(userId: string, groupId: string): void

- **Purpose**: Persist the last-accessed groupId for a user in `localStorage`; tolerates write errors silently (e.g. Safari private mode).

### clearLastAccessedGroup(userId: string): void

- **Purpose**: Remove the stored last-accessed groupId for a user; tolerates errors silently.
