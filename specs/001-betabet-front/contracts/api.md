# API Contract: World Cup Betting App

**Version**: 1.0 | **Date**: 2026-05-19
**Base URL (dev)**: proxied through Vite at `/api` → `VITE_API_URL`
**Auth**: Session cookie (HttpOnly, SameSite=Lax); all protected routes require a valid session.

All requests and responses use `Content-Type: application/json`.
Error responses follow the shape: `{ "error": string, "code": string }`.

---

## Authentication

### POST /api/auth/register

Register a new user account.

**Request body**:
```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 8 chars)",
  "referralCode": "string | undefined"
}
```

**Response 201**:
```json
{ "user": User }
```

**Errors**: `400` (validation), `409` (email already registered), `400` (invalid referral code),
`400` (own referral code)

---

### POST /api/auth/login

**Request body**:
```json
{ "email": "string", "password": "string" }
```

**Response 200**: Sets session cookie. Returns:
```json
{ "user": User }
```

**Errors**: `401` (invalid credentials)

---

### POST /api/auth/logout

No body. Clears session cookie.

**Response 200**: `{ "ok": true }`

---

### GET /api/auth/me

Returns the currently authenticated user. Used to hydrate auth state on page load.

**Response 200**: `{ "user": User }`
**Response 401**: Not authenticated.

---

## Matches

### GET /api/matches

Returns all matches grouped by phase and ordered chronologically within each phase.

**Query params**: none

**Response 200**:
```json
{
  "groupStage": {
    "A": { "matchday1": Match[], "matchday2": Match[], "matchday3": Match[] },
    "B": { ... },
    ...
  },
  "knockout": {
    "r16": Match[],
    "qf": Match[],
    "sf": Match[],
    "final": Match[]
  }
}
```

Each `Match` object is as defined in `data-model.md`.

---

### GET /api/matches/:matchId

Returns a single match with the authenticated user's bet for that match (null if not placed).

**Response 200**: `MatchWithUserBet`

---

### GET /api/matches/:matchId/distribution

Returns the platform-wide bet distribution percentages for a match.
**Access**: Only users with `chartUnlocked: true`.

**Response 200**: `DistributionData`
**Response 403**: Chart feature not unlocked.

---

## Bets

### POST /api/bets

Place a new bet. If `replicateToAllGroups` is true, one bet record is created per group the
user belongs to.

**Request body**:
```json
{
  "matchId": "string",
  "groupId": "string",
  "homeScore": 0,
  "awayScore": 0,
  "replicateToAllGroups": false
}
```

**Response 201**: `{ "bets": Bet[] }` (array because replication may create multiple)

**Errors**: `400` (match already started), `400` (bet already exists for this group+match — use PUT),
`404` (match not found), `403` (not a member of the group)

---

### PUT /api/bets/:betId

Edit an existing bet. Only allowed if match starts in > 15 minutes.

**Request body**:
```json
{ "homeScore": 0, "awayScore": 0 }
```

**Response 200**: `{ "bet": Bet }`

**Errors**: `403` (edit deadline passed), `403` (not the bet owner), `404`

---

### GET /api/groups/:groupId/matches/:matchId/bets

Get all bets placed by group members for a specific match.
Bets are returned only if: (a) the match has started, or (b) the group has
`showBetsBeforeKickoff: true`.

**Response 200**: `{ "bets": BetWithUser[], "canView": boolean }`

---

### POST /api/bets/:betId/reactions

Toggle an emoji reaction on a bet. If the user already reacted with the same emoji,
the reaction is removed (toggle).

**Request body**: `{ "emoji": "🔥" }` (one of: `🔥 ❤️ 😂 😮 👎 🏆`)

**Response 200**: `{ "reactions": EmojiReaction[] }` (updated list for this bet)

**Errors**: `400` (invalid emoji), `403` (bet not visible yet)

---

## Groups

### GET /api/groups

Returns all betting groups the authenticated user belongs to.

**Response 200**: `{ "groups": BettingGroup[] }`

---

### POST /api/groups

Create a new betting group. Creator becomes admin.

**Request body** (multipart/form-data or JSON):
```json
{
  "name": "string",
  "coverUrl": "string | undefined",
  "resultPoints": 1,
  "exactScorePoints": 3,
  "showBetsBeforeKickoff": false,
  "joinMode": "request"
}
```

**Response 201**: `{ "group": BettingGroup }`

---

### GET /api/groups/:groupId

Returns group details. Any member may call this.

**Response 200**: `{ "group": BettingGroup, "role": GroupRole }`

---

### PUT /api/groups/:groupId

Update group settings. Admin only.

**Request body**: Partial `BettingGroup` fields (name, coverUrl, resultPoints,
exactScorePoints, showBetsBeforeKickoff, joinMode).

**Response 200**: `{ "group": BettingGroup }`

**Errors**: `403` (not admin)

---

### GET /api/groups/:groupId/members

Returns all members with their roles.

**Response 200**: `{ "members": GroupMembership[] }`

---

### DELETE /api/groups/:groupId/members/:userId

Remove a member. Admin only. Admin cannot remove themselves this way.

**Response 200**: `{ "ok": true }`

**Errors**: `403` (not admin), `400` (cannot remove self as admin)

---

### GET /api/groups/:groupId/ranking

Returns the group ranking. Polled every 30 s by the client.

**Response 200**: `{ "ranking": RankingEntry[], "updatedAt": string }`

---

### POST /api/groups/:groupId/invite-link

Regenerate the invite link (admin only). Returns the current invite code.

**Response 200**: `{ "inviteCode": string, "link": string }`

---

### GET /api/groups/invite/:inviteCode

Resolve an invite code to group info (public endpoint — works unauthenticated).

**Response 200**: `{ "group": Pick<BettingGroup, 'id'|'name'|'coverUrl'|'memberCount'> }`

**Errors**: `404` (invalid code)

---

### POST /api/groups/:groupId/join

Join a group via its invite code. If `joinMode` is `invite`, user joins directly.
If `joinMode` is `request`, a join request is created.

**Request body**: `{ "inviteCode": "string" }`

**Response 200**: `{ "joined": boolean, "pending": boolean }`

---

### GET /api/groups/:groupId/requests

List pending join requests. Admin only.

**Response 200**: `{ "requests": JoinRequest[] }`

---

### PUT /api/groups/:groupId/requests/:requestId

Approve or reject a join request. Admin only.

**Request body**: `{ "action": "approve" | "reject" }`

**Response 200**: `{ "ok": true }`

---

## Referral

### GET /api/referral

Returns the authenticated user's referral info.

**Response 200**: `ReferralInfo`

---

### POST /api/referral/apply

Apply a referral code to the authenticated user's account. Can only be done once.

**Request body**: `{ "code": "string" }`

**Response 200**: `{ "ok": true }`

**Errors**: `400` (own code), `400` (code already set), `404` (invalid code)

---

## Admin Endpoints

All `/api/admin/*` endpoints require `AdminUser` session (separate admin login).

### POST /api/admin/auth/login

**Request body**: `{ "email": "string", "password": "string" }`
**Response 200**: Sets admin session cookie. Returns `{ "admin": AdminUser }`.

---

### GET /api/admin/stats

**Response 200**: `AdminStats`

---

### GET /api/admin/teams

**Response 200**: `{ "teams": Team[] }`

### POST /api/admin/teams

**Request body** (multipart or JSON): `TeamFormData`
**Response 201**: `{ "team": Team }`

### PUT /api/admin/teams/:teamId

**Request body**: Partial `TeamFormData`
**Response 200**: `{ "team": Team }`

---

### GET /api/admin/stadiums

**Response 200**: `{ "stadiums": Stadium[] }`

### POST /api/admin/stadiums

**Request body**: `{ "name": string, "city": string }`
**Response 201**: `{ "stadium": Stadium }`

---

### GET /api/admin/matches

**Response 200**: `{ "matches": Match[] }`

### POST /api/admin/matches

**Request body**: `MatchFormData`
**Response 201**: `{ "match": Match }`

### PUT /api/admin/matches/:matchId

**Request body**: Partial `MatchFormData`
**Response 200**: `{ "match": Match }`

---

### POST /api/admin/matches/:matchId/result

Confirm the final score. Triggers automatic point calculation for all bets on this match.

**Request body**: `{ "homeScore": number, "awayScore": number }`
**Response 200**: `{ "match": Match, "betsProcessed": number }`

**Errors**: `400` (match not in "live" or "upcoming" status), `409` (result already confirmed)

---

### GET /api/admin/analytics/matches

Returns bet distribution for all matches.

**Response 200**: `{ "analytics": MatchAnalytics[] }`

---

### GET /api/admin/analytics/users

Returns per-user statistics.

**Query params**: `page`, `limit` (pagination)

**Response 200**: `{ "users": UserStats[], "total": number }`

---

### GET /api/admin/groups/:groupId/observer

Returns full group data as seen by an admin in observer mode. The admin does NOT appear
in the members list.

**Response 200**:
```json
{
  "group": BettingGroup,
  "members": GroupMembership[],
  "ranking": RankingEntry[]
}
```

---

## Common HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error or bad request |
| 401 | Not authenticated |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict (duplicate, already exists) |
| 500 | Server error |
