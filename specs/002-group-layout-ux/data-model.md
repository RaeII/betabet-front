# Data Model: Group Layout UX

This feature is mostly a view/layout change. Existing backend entities remain the source of truth. The models below describe the frontend data shapes and derived view states needed to implement the experience safely.

## Existing Entities Used

### BettingGroup

**Source**: `src/types/group.types.ts`

**Fields used**:

- `id`: unique group identifier and route parameter.
- `name`: visible group name in rail, header, and home hero.
- `coverUrl`: optional visual identity for group avatar/cover.
- `memberCount`: count displayed in group list and group home.
- `inviteCode`: used by existing invite panel.
- `adminId`, `resultPoints`, `exactScorePoints`, `showBetsBeforeKickoff`, `joinMode`: preserved for existing settings/member flows.

**Validation rules**:

- Long `name` values must truncate or wrap according to container role without horizontal scrolling.
- Missing `coverUrl` must fall back to the existing neutral group placeholder.

### RankingEntry

**Source**: `src/types/group.types.ts`

**Fields used**:

- `userId`
- `userName`
- `avatarUrl`
- `position`
- `totalPoints`
- `exactScorePredictions`
- `totalBets`

**Validation rules**:

- Preview should show a small leading subset and the current user's standing when available.
- Empty ranking should render an empty state without hiding active group context.

### Match

**Source**: `src/types/match.types.ts`

**Fields used**:

- `id`
- `homeTeam`, `awayTeam`
- `scheduledAt`
- `status`
- `homeScore`, `awayScore`
- `phase`, `groupName`, `matchday`
- `stadium`

**Validation rules**:

- Upcoming preview includes scheduled match detail and group-aware link.
- Past preview includes finished/cancelled/live status as appropriate and group-aware link.
- Long team names must not break 320px layout.

## Derived View Models

### ActiveGroupView

Represents the currently selected group context.

**Fields**:

- `groupId`: selected group id from route.
- `group`: selected `BettingGroup` when loaded.
- `role`: existing group role when available.
- `isLoading`: selected group loading state.
- `isError`: selected group unavailable/error state.

**Relationships**:

- Derived from route param plus `useGroup(groupId)`.
- Used by desktop rail, mobile current-group header, group home, invite/settings sections, and group-scoped links.

**State transitions**:

- No group selected: `/groups` route shows the mobile list and desktop list-first state.
- Group selected: `/groups/:groupId` route shows detail/home and active selected state.
- Group switched: route changes to another group id and dependent queries update.

### GroupListItemView

Represents one visible row in the group selector.

**Fields**:

- `group`: `BettingGroup`
- `isActive`: true when `group.id` matches route group id.
- `href`: `/groups/:groupId`
- `metadata`: member count and optional rank summary if available.

**Validation rules**:

- Active item must be distinguishable by more than color alone.
- Rows must remain touch-friendly and readable at 320px.

### GroupHomeOverview

Represents the selected group's landing content.

**Fields**:

- `group`: selected `BettingGroup`
- `upcomingMatches`: small list of upcoming `Match` records.
- `pastMatches`: small list of finished or past `Match` records.
- `rankingPreview`: small list of `RankingEntry` records.
- `currentUserRanking`: optional `RankingEntry`
- `primaryActionHref`: most relevant next action link.

**Validation rules**:

- Each section must support loading, empty, and loaded states.
- Preview sections link to dedicated full workflows.
- Desktop presentation uses bounded columns and avoids purposeless full-width cards.

### GroupPreviewSectionState

Represents each preview section's state.

**Fields**:

- `kind`: `upcoming-matches` | `past-matches` | `ranking`
- `status`: `loading` | `empty` | `ready` | `error`
- `itemsCount`: number of available preview items.
- `targetHref`: destination for full details.

**Validation rules**:

- Empty and error states preserve active group identity.
- Loading state reserves stable space to avoid layout jumps.

## Data Flow

1. `/groups` loads user groups through `useUserGroups`.
2. `/groups/:groupId` loads user groups for desktop rail and selected group details through `useUserGroups` and `useGroup(groupId)`.
3. Group home preview data comes from existing match and ranking hooks where possible:
   - `useAllMatches` for upcoming/past match previews.
   - `useGroupRanking(groupId)` for ranking preview.
4. Preview links keep group context:
   - Match preview: `/groups/:groupId/matches/:matchId`
   - Full ranking/member sections: existing group detail sections or routes defined in implementation.

## Data Contract Changes

No backend contract change is planned. If implementation shows that existing match data cannot support group home previews efficiently, a follow-up contract can introduce a group home summary endpoint, but that is outside this plan's baseline.
