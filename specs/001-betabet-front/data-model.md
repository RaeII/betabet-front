# Data Model: World Cup Betting App

**Phase**: 1 — Design
**Date**: 2026-05-19

All types are TypeScript interfaces stored in `src/types/`. No inline declarations in
components (Constitution Principle II).

---

## `src/types/auth.types.ts`

```typescript
export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  referralCode: string          // unique, system-generated
  referredByCode: string | null // immutable once set
  referralCount: number         // accepted referrals
  chartUnlocked: boolean        // true when referralCount >= 3
  createdAt: string             // ISO 8601
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  referralCode?: string         // optional at registration
}
```

---

## `src/types/match.types.ts`

```typescript
export type MatchStatus = 'upcoming' | 'live' | 'finished' | 'cancelled'

export type TournamentPhase =
  | 'group'   // Group stage (groups A–H)
  | 'r16'     // Round of 16
  | 'qf'      // Quarterfinals
  | 'sf'      // Semifinals
  | 'final'

export interface Team {
  id: string
  name: string
  flagUrl: string
  group: string | null  // "A"–"H" for group stage; null for knockout entries
}

export interface Stadium {
  id: string
  name: string
  city: string
}

export interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  stadium: Stadium
  scheduledAt: string       // ISO 8601
  status: MatchStatus
  phase: TournamentPhase
  groupName: string | null  // "A"–"H" for group stage; null otherwise
  matchday: number | null   // 1–3 for group stage; null for knockout
  homeScore: number | null  // null until admin confirms result
  awayScore: number | null
}

export interface MatchWithUserBet extends Match {
  userBet: Bet | null         // the authenticated user's bet (if any)
}

export interface DistributionData {
  matchId: string
  homePct: number             // 0–100
  drawPct: number
  awayPct: number
  totalBets: number
}
```

---

## `src/types/bet.types.ts`

```typescript
export type BetOutcome = 'home' | 'draw' | 'away'

export interface Bet {
  id: string
  matchId: string
  userId: string
  groupId: string
  homeScore: number
  awayScore: number
  resultPoints: number | null   // null until match is finished
  exactScorePoints: number | null
  createdAt: string             // ISO 8601
  updatedAt: string
}

export interface BetWithUser extends Bet {
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  reactions: EmojiReaction[]
}

export interface BetFormData {
  homeScore: number
  awayScore: number
  replicateToAllGroups: boolean
}

export interface EmojiReaction {
  id: string
  betId: string
  userId: string
  emoji: string               // one of: 🔥 ❤️ 😂 😮 👎 🏆
  createdAt: string
}

// Derived — computed from homeScore/awayScore
export function deriveBetOutcome(home: number, away: number): BetOutcome {
  if (home > away) return 'home'
  if (home < away) return 'away'
  return 'draw'
}
```

---

## `src/types/group.types.ts`

```typescript
export type GroupRole = 'admin' | 'member'
export type JoinMode = 'invite' | 'request'

export interface BettingGroup {
  id: string
  name: string
  coverUrl: string | null
  adminId: string
  resultPoints: number        // default: 1 — awarded for correct win/draw/loss
  exactScorePoints: number    // default: 3 — awarded for exact scoreline
  showBetsBeforeKickoff: boolean  // group-level setting
  joinMode: JoinMode
  memberCount: number
  inviteCode: string          // used in /invite/:code URL
  createdAt: string
}

export interface GroupMembership {
  groupId: string
  userId: string
  role: GroupRole
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface RankingEntry {
  userId: string
  userName: string
  avatarUrl: string | null
  position: number                // ranking denso: empate de pontos compartilha a posição (1,1,2,…)
  totalPoints: number
  exactScorePredictions: number   // estatística (não é mais tie-breaker)
  totalBets: number
}

export interface JoinRequest {
  id: string
  groupId: string
  userId: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
  createdAt: string
}
```

---

## `src/types/referral.types.ts`

```typescript
export interface ReferralInfo {
  code: string            // the user's own referral code
  link: string            // full shareable URL
  count: number           // number of accepted referrals
  isUnlocked: boolean     // true when count >= 3
  referredUsers: ReferredUser[]
}

export interface ReferredUser {
  id: string
  name: string
  joinedAt: string
}
```

---

## `src/types/admin.types.ts`

```typescript
export interface AdminStats {
  totalUsers: number
  totalGroups: number
  totalBets: number
}

export interface MatchAnalytics {
  matchId: string
  match: Match
  homePct: number
  drawPct: number
  awayPct: number
  totalBets: number
  byGroup: GroupBetDistribution[]
}

export interface GroupBetDistribution {
  groupId: string
  groupName: string
  homePct: number
  drawPct: number
  awayPct: number
  totalBets: number
}

export interface UserStats {
  userId: string
  name: string
  email: string
  groupsCreated: number
  referralCount: number
  totalBets: number
}

export interface MatchFormData {
  homeTeamId: string
  awayTeamId: string
  stadiumId: string
  scheduledAt: string     // ISO 8601
  phase: TournamentPhase
  groupName?: string
  matchday?: number
}

export interface TeamFormData {
  name: string
  flagUrl: string
  group?: string
}

export interface ResultFormData {
  homeScore: number
  awayScore: number
}
```

---

## State Transition: Match Status

```
upcoming ──[kick-off time passes]──→ live
live     ──[admin confirms result]──→ finished
upcoming ──[admin cancels]──────────→ cancelled
```

## State Transition: Bet Editability

```
created (> 15 min before kick-off) → editable
created (≤ 15 min before kick-off) → locked
```

## State Transition: Referral Unlock

```
referralCount 0–2 → chartUnlocked: false
referralCount ≥ 3 → chartUnlocked: true (irreversible)
```

## Validation Rules (Zod schemas in `src/lib/schemas/`)

| Schema | Key Rules |
|---|---|
| `LoginSchema` | email: valid email; password: min 8 chars |
| `RegisterSchema` | name: min 2 chars; email: valid; password: min 8; referralCode: optional 8-char string |
| `BetFormSchema` | homeScore: integer 0–20; awayScore: integer 0–20 |
| `GroupCreateSchema` | name: min 3, max 50 chars; resultPoints: 1–10; exactScorePoints: 1–20 |
| `MatchFormSchema` | homeTeamId, awayTeamId: non-empty string; scheduledAt: valid future ISO date |
| `ResultFormSchema` | homeScore: integer ≥ 0; awayScore: integer ≥ 0 |
