# Feature Specification: World Cup Betting App

**Feature Branch**: `001-betabet-front`

**Created**: 2026-05-19

**Status**: Draft

**Input**: User description: "Quero fazer um app para fazer aposta de jogos da copa do mundo, onde será possivel apostar apenas o placar do jogo..."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Place and Manage Match Bets (Priority: P1)

A user opens the app, finds an upcoming World Cup match, and places a bet on the exact
scoreline. The system awards points if the user correctly predicts the match outcome
(win/draw/loss) and additional points for the exact final score. The user can edit their
bet up to 15 minutes before the match starts.

**Why this priority**: This is the core value proposition — without betting, nothing else in
the app has purpose.

**Independent Test**: A user registers, finds an upcoming match, places a score prediction,
and after the match result is confirmed by an admin, sees points credited to their account.
Fully demonstrable as a standalone MVP with no groups or social features.

**Acceptance Scenarios**:

1. **Given** an upcoming match not yet started, **When** a user submits a score prediction
   (e.g., Brazil 2 × 1 France), **Then** the bet is saved and the user sees a confirmation.
2. **Given** a saved bet on a match starting in more than 15 minutes, **When** the user edits
   the scoreline, **Then** the new prediction replaces the old one and is confirmed.
3. **Given** a saved bet on a match starting within 15 minutes or already started, **When**
   the user attempts to edit, **Then** editing is blocked and a clear message explains the
   deadline has passed.
4. **Given** a completed match with a confirmed result, **When** the system processes results,
   **Then** users who predicted the correct outcome receive result points, and users who also
   predicted the exact scoreline receive additional exact-score points.
5. **Given** a user who belongs to more than one betting group, **When** placing a bet,
   **Then** the user sees the option to replicate the same bet to all their groups or limit
   it to the current group only.

---

### User Story 2 - Browse Tournament Structure and Match Details (Priority: P1)

A user navigates the full World Cup tournament — viewing matches organized by group stage
(rounds and groups A–H) and knockout stages displayed as an interactive bracket. Tapping any
match opens a detail screen with teams, stadium, date/time, status, and the user's own
prediction.

**Why this priority**: Users must find matches to bet on them; tournament navigation is the
primary browsing experience.

**Independent Test**: A user with no bets can browse all scheduled matches by phase, tap any
match, and see its full details. Deliverable before any betting feature is built.

**Acceptance Scenarios**:

1. **Given** tournament matches are loaded, **When** a user opens the matches section,
   **Then** matches are organized into group stage (groups A–H with matchday rounds) and
   knockout phases (round of 16, quarterfinals, semifinals, final).
2. **Given** the knockout phase view, **When** the user opens it, **Then** a bracket diagram
   displays progression paths with teams and results filled in as matches are confirmed.
3. **Given** any match in any phase, **When** the user taps it, **Then** a detail screen
   shows: both teams with national flags, scheduled date and time, stadium name, current
   match status, and the user's own bet if one has been placed.

---

### User Story 3 - Home Screen and Quick Navigation (Priority: P1)

The home screen gives users an at-a-glance summary: upcoming matches, matches they have not
yet bet on, a preview of their ranking in each group, and clear navigation menus. The screen
is minimal, fast to scan, and immediately actionable.

**Why this priority**: The home screen is the primary daily entry point; showing unbetted
matches drives return visits.

**Independent Test**: A logged-in user opens the app and within two taps can reach any main
section, place a bet on an unbetted match, or view their full group ranking.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** the home screen loads, **Then** it displays: next
   3–5 upcoming matches, the user's current position in each of their group rankings, and a
   list of matches where no bet has been placed yet.
2. **Given** the home screen, **When** the user taps any match in the unbetted list,
   **Then** they are taken directly to the bet placement screen for that match.
3. **Given** the home screen ranking preview, **When** the user taps it, **Then** they are
   taken to the full live ranking of that group.

---

### User Story 4 - Create and Manage a Betting Group (Priority: P2)

A user creates a private betting group with a name and cover image, becoming its admin. The
admin manages membership (invites, join approvals, removals) and configures group rules (point
values, bet visibility before match start, join mode). Settings are visible only to the admin.

**Why this priority**: Groups are the social layer that drives long-term engagement and
competition between friends, colleagues, or communities.

**Independent Test**: A user creates a group, configures it, shares an invite link with a
second user, the second user joins, and both appear correctly in the group's member list.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they create a group with a name and optional
   cover image, **Then** the group is created and the creator is set as admin.
2. **Given** a group admin in the settings panel, **When** they adjust group rules, **Then**
   they can configure: result-point value, exact-score-point value, whether member bets are
   visible before match start, and join mode (invite-only or request-based).
3. **Given** a user who receives an invite link, **When** they open the link, **Then** they
   can accept and join immediately (invite link flow) or submit a request for the admin to
   approve (request-based flow).
4. **Given** a pending join request, **When** the admin approves it, **Then** the requesting
   user is added to the group and notified.
5. **Given** a group member who is not the admin, **When** they open the group, **Then** the
   settings panel is not visible or accessible.
6. **Given** an admin who removes a member, **When** the removal is confirmed, **Then** the
   removed user immediately loses access to the group.

---

### User Story 5 - Group Ranking, Bet Visibility, and Social Reactions (Priority: P2)

Each group has a live ranking board updated as match results are confirmed. Members can see
each other's individual bets after a match starts, or earlier if the group allows it. Members
react to visible bets with emoji reactions. Users who have unlocked the referral feature see
a Polymarket-style distribution chart on every match.

**Why this priority**: Real-time rankings and social reactions transform a solo activity into
a shared competition.

**Independent Test**: After a match result is confirmed, the group ranking updates correctly.
Any member can view another member's bet and add an emoji reaction to it.

**Acceptance Scenarios**:

1. **Given** a match result confirmed by an admin, **When** points are calculated, **Then**
   the group ranking immediately reflects each member's updated score and position.
2. **Given** a match that has started, **When** any group member views that match within the
   group, **Then** all members' score predictions for that match are visible.
3. **Given** a group configured to hide bets before match start, **When** a member views a
   match not yet started, **Then** individual bets are hidden; the aggregate distribution
   chart is still visible to users who have unlocked it.
4. **Given** a group configured to show bets before match start, **When** a member views a
   match not yet started, **Then** all members' predictions are already visible.
5. **Given** a visible bet, **When** a member taps the emoji reaction button and selects an
   emoji, **Then** the reaction is added and visible to all group members.
6. **Given** a user with 3 or more accepted referrals, **When** they view any match detail
   screen, **Then** they see a distribution chart showing the percentage of all platform bets
   on each outcome: home win, draw, away win.

---

### User Story 6 - Referral Program and Feature Unlocks (Priority: P3)

Users share a personal referral link. When 3 or more new users register using that link,
the referrer permanently unlocks the distribution chart feature. New users may enter a
referral code at registration or later in their profile area. Once a code is set it cannot
be changed, and users cannot apply their own code.

**Why this priority**: Referrals drive organic growth while rewarding engaged users with a
premium visual feature.

**Independent Test**: A user shares their referral link, three new users register via it,
and the distribution chart automatically appears on that user's match screens.

**Acceptance Scenarios**:

1. **Given** a logged-in user in their referral section, **When** they view it, **Then**
   they see their unique shareable link, current referral count, and whether the chart is
   unlocked.
2. **Given** a new user during registration who enters a valid referral code, **When**
   registration is complete, **Then** the referral is attributed to the code owner.
3. **Given** an existing user who has not yet set a referral code, **When** they enter one
   in their profile, **Then** it is saved permanently and credited to the code owner.
4. **Given** a user who enters their own referral code, **When** they submit, **Then** the
   system rejects it with a clear error message.
5. **Given** a user who already has a referral code saved, **When** they attempt to change
   it, **Then** the field is locked and no change is permitted.
6. **Given** a referrer whose third accepted referral completes registration, **When** that
   event occurs, **Then** the distribution chart is unlocked on the referrer's account
   automatically.

---

### User Story 7 - System Administration Panel (Priority: P3)

A system administrator uses a dedicated panel — accessed via a separate admin authentication —
to register tournament data (teams, stadiums, matches) and confirm match results. The admin
also accesses platform-wide analytics and can enter any betting group in silent observer mode.

**Why this priority**: Without the admin panel there is no tournament data and no result
confirmation; the rest of the app cannot function.

**Independent Test**: An admin logs in to the admin panel, registers a match with two teams
and a stadium, and the match appears for regular users in the correct tournament phase.

**Acceptance Scenarios**:

1. **Given** admin credentials, **When** the admin logs in via the admin panel, **Then**
   they access the admin dashboard through an authentication flow separate from regular
   user login.
2. **Given** the admin in the match management section, **When** they create a match with
   two teams, a stadium, date/time, and round/phase assignment, **Then** the match appears
   for all users in the correct tournament section.
3. **Given** a completed match, **When** the admin enters the final score and confirms the
   result, **Then** all user bets are evaluated and points are awarded automatically across
   all groups.
4. **Given** the analytics dashboard, **When** an admin views it, **Then** they see: total
   users, total groups, total bets placed, bet distribution per team per match (globally and
   per group), number of groups created per user, and referral counts per user.
5. **Given** a specific group, **When** an admin enters it in observer mode, **Then** they
   see all group content (members, bets, rankings) without appearing in the member list.
6. **Given** an admin selecting a user, **When** they view user details, **Then** they see
   the number of groups that user created, their referral count, and total bets placed.

---

### Edge Cases

- What happens to placed bets if a match is postponed or cancelled after bets are submitted?
- How are points handled if an admin enters an incorrect result and later corrects it?
- What happens to a removed group member's historical bets and points within that group?
- How are ties broken in the group ranking when two users have equal accumulated points?
- What happens if the group admin leaves — is admin status transferred or the group dissolved?
- What if a user places no bet on a match — are they shown at the bottom of the ranking or
  excluded from that match's point calculation?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST support user registration and secure account authentication.
- **FR-002**: Users MUST be able to view all World Cup matches organized by group stage
  (groups and matchday rounds) and knockout stage (bracket view).
- **FR-003**: Users MUST be able to place a score prediction (exact home and away goals) on
  any match that has not yet started.
- **FR-004**: Users MUST be able to edit their bet until 15 minutes before the scheduled
  match start; after that deadline the bet MUST be locked from editing.
- **FR-005**: Users in more than one betting group MUST see the option to replicate a new or
  edited bet to all their groups or limit it to the current group only.
- **FR-006**: After an admin confirms a match result, the system MUST automatically award
  result points to users who predicted the correct outcome and additional exact-score points
  to users who predicted the exact final scoreline; point values are configurable per group.
- **FR-007**: Users MUST be able to create a betting group with a name and optional cover
  image, automatically becoming the group admin.
- **FR-008**: Group admins MUST be able to: generate and share invite links, configure join
  mode (invite-only or request-based), approve or reject pending join requests, and remove
  members.
- **FR-009**: Group admins MUST be able to configure: points for a correct result, points for
  an exact score, and whether member bets are visible to others before a match starts.
- **FR-010**: Each group MUST display a live ranking of all members ordered by accumulated
  points, updated automatically whenever a match result is confirmed.
- **FR-011**: After a match starts, all group members MUST be able to see each other's score
  predictions for that match; if the group is set to show bets before kick-off, predictions
  MUST be visible before the match starts as well.
- **FR-012**: Members MUST be able to add emoji reactions to any visible bet; reaction types
  and counts MUST be visible to all group members.
- **FR-013**: Users with 3 or more accepted referrals MUST see a percentage distribution
  chart on every match detail screen showing the share of all platform bets on each outcome
  (home win, draw, away win).
- **FR-014**: Each user MUST have a unique shareable referral link; a referral is counted when
  a new user completes registration using that link or code.
- **FR-015**: Users MUST be able to enter a referral code at registration or in their profile
  area; once saved the code MUST NOT be changeable, and the system MUST prevent users from
  entering their own code.
- **FR-016**: System admins MUST authenticate via a dedicated admin login separate from
  regular user authentication.
- **FR-017**: System admins MUST be able to register and update: teams (name, flag image,
  additional info), stadiums (name, location), and matches (teams, stadium, date/time,
  round/phase assignment).
- **FR-018**: System admins MUST be able to confirm a match result by entering the final
  score, triggering automatic point calculation for all bets on that match across all groups.
- **FR-019**: System admins MUST have access to an analytics dashboard showing: total users,
  total groups, total bets placed, bet distribution per team per match (globally and per
  group), groups created per user, and referral counts per user.
- **FR-020**: System admins MUST be able to enter any betting group in observer mode, viewing
  all content without appearing in the member list.

### Key Entities

- **User**: End user; has a unique referral code, an optional referred-by code (immutable once
  set), referral count, and distribution-chart unlock status.
- **Match**: A World Cup game; has two teams, a stadium, scheduled date/time, status
  (upcoming / live / finished), and confirmed final score.
- **Team**: A national team; has name, flag image, and optional additional info.
- **Stadium**: Venue; has name and location.
- **Round / Phase**: Organizational unit — group stage (Group A–H, matchdays 1–3) or knockout
  stage (round of 16, quarterfinals, semifinals, final).
- **Bet**: A user's score prediction on a match within a specific group; tracks points earned
  for result and for exact score.
- **BettingGroup**: A private competition with name, cover image, admin, point configuration,
  and bet-visibility setting.
- **GroupMembership**: Links a user to a group with their role (admin or member) and join date.
- **GroupInvite / JoinRequest**: Pending access flows linking a prospective member to a group.
- **EmojiReaction**: An emoji type and the reacting user, attached to a specific bet.
- **Referral**: Links a referred user to their referrer; counted once registration is complete.
- **AdminUser**: A system-level admin with dedicated credentials and elevated permissions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can find an upcoming match, place a bet, and receive confirmation in
  under 60 seconds from opening the app on a standard mobile connection.
- **SC-002**: After an admin confirms a match result, all group rankings reflect updated
  points within 30 seconds — no manual refresh required.
- **SC-003**: The home screen loads with upcoming matches, ranking preview, and unbetted
  matches within 2 seconds on a standard mobile connection.
- **SC-004**: When a referrer's third accepted referral completes registration, the
  distribution chart is unlocked and visible on the referrer's device automatically.
- **SC-005**: An admin can register a complete match (teams, stadium, date/time, round) and
  have it appear for users within 2 minutes.
- **SC-006**: 90% of first-time users can place their first bet without requiring help or
  consulting documentation.

## Assumptions

- The app is for friendly competition using points only — no real money or monetary prizes
  are involved.
- Default point values are 1 point for a correct result and 3 points for an exact score;
  group admins can override these values per group.
- A match is considered started at its scheduled kick-off time; the system does not require
  live score tracking — admins manually confirm final results.
- Exactly 3 accepted referrals are required to unlock the distribution chart; there are no
  intermediate unlock tiers.
- The distribution chart shows aggregate bet percentages across all platform users, not just
  within a single group.
- Users can belong to an unlimited number of groups.
- Group join mode defaults to request-based; admin must approve unless the user arrived via
  a direct invite link.
- Knockout bracket slots are populated automatically as group-stage results are confirmed.
- Tie-breaking in group rankings: first by number of exact-score predictions, then
  alphabetically by display name.
- When a member is removed from a group, their historical bets and points remain in group
  records but they lose all access to the group.
- The distribution chart unlock is per user — once unlocked it is visible in all groups the
  user belongs to.
- If the group admin leaves without transferring admin rights, the longest-tenured member is
  automatically promoted to admin.
- The admin panel is a separate web interface; the end-user product is a mobile-first
  responsive or native mobile app.
