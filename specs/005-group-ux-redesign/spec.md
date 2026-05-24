# Feature Specification: Group UX Redesign

**Feature Branch**: `005-group-ux-redesign`

**Created**: 2026-05-24

**Status**: Draft

**Input**: User description: "Modernize group experience UX: always reopen the last accessed group (or only group) on entry; replace the persistent group list with a 'Grupos' button that opens a modal containing the group list and an inline group creation flow that reuses the OnboardingPage creation components (no page navigation); make the active group header minimalist (image + name only) with a gear icon that opens a dropdown with 'Detalhes' and 'Sair' (leave triggers a confirmation modal); add a left sidebar with Home, Jogos, Palpites, Ranking, Membros, and Configurações (Configurações only visible to group admins) that only appears when the user is inside a group; on the home, replace the long match list with a horizontal day-strip that the user navigates and that hides past matches by default, defaulting the selected day to today's matchday or the closest upcoming one; let the user place score bets directly inside modern match cards without leaving the home; once a match is finished, the card shows the final result and the points the user earned alongside their bet; add a progress bar above the day-strip that reflects how many of the navigable matches the user has already bet on; ship the redesign for mobile as well; follow the Brasil Essencial UI direction documented in doc/ui.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resume the Last Group Instantly (Priority: P1)

A returning user opens the application and is taken directly into the group they last used, or into their only group if they belong to just one, so they can keep betting without navigating through any group selector.

**Why this priority**: Group selection is currently friction on every visit. Auto-resuming the last group makes the experience feel personal and dynamic, removes a step from every session, and is the foundation for the sidebar and modal model that follows.

**Independent Test**: A user with multiple groups picks one, navigates around it, closes the application, and reopens it on the same device — the application opens directly inside that group. A different user belonging to only one group always lands inside that single group regardless of prior activity.

**Acceptance Scenarios**:

1. **Given** a returning user belongs to multiple groups and previously used Group A, **When** they reopen the application, **Then** they land inside Group A's home without seeing a group selector first.
2. **Given** a user belongs to exactly one group, **When** they open the application, **Then** they land inside that group regardless of any previously stored preference.
3. **Given** the last accessed group no longer exists or the user is no longer a member, **When** they reopen the application, **Then** they fall back to another group they belong to or to the appropriate empty/onboarding state without an error.
4. **Given** a user belongs to zero groups, **When** they open the application, **Then** they are guided to the onboarding flow to join or create a group, and no group-only chrome (sidebar, group header) is shown.

---

### User Story 2 - Switch and Create Groups Through a Modal (Priority: P1)

When the user wants to change groups or create a new one, they open a single "Grupos" entry point that presents a modal listing their groups and offering an inline creation flow that mirrors the existing onboarding creation experience, so they never lose the active group context behind them.

**Why this priority**: This replaces the always-visible group list with a focused, on-demand experience that keeps the main screen calm. Creation must stay inside the modal so users do not lose their position or context, and reusing the onboarding creation components keeps both flows consistent.

**Independent Test**: From inside any group, the user opens "Grupos", sees their full list, switches to another group, returns to the modal, starts a new group creation, completes it without leaving the modal, and is then placed inside the newly created group.

**Acceptance Scenarios**:

1. **Given** the user is inside a group, **When** they open the "Grupos" entry point, **Then** a modal opens showing the list of their groups and an option to create a new group, while the previously active group remains visible underneath.
2. **Given** the modal is open, **When** the user selects another group from the list, **Then** the modal closes and the application updates to that group as the active context.
3. **Given** the modal is open, **When** the user chooses to create a group, **Then** the group creation flow renders inside the modal using the same fields, copy, and steps as the onboarding creation experience, without navigating to another page.
4. **Given** the user completes group creation inside the modal, **When** the new group is created, **Then** the modal transitions to the new group as the active context and persists it as the last accessed group.
5. **Given** the user cancels the modal or the creation flow at any step, **When** they close it, **Then** the previously active group remains intact and unchanged.

---

### User Story 3 - Use a Minimalist Group Header With a Settings Menu (Priority: P1)

While inside a group, the user sees a compact header showing only the group image and name, plus a gear icon that opens a small menu with "Detalhes" (open group details) and "Sair" (leave the group). Leaving the group requires explicit confirmation in a modal.

**Why this priority**: The previous header consumed too much vertical space. A minimalist identity strip preserves orientation without dominating the screen, and consolidating destructive actions like leaving behind a confirmation prevents accidental losses of membership.

**Independent Test**: A user opens a group, sees only the group image and name plus a gear icon, opens the gear menu, navigates to details and back, then triggers "Sair" and confirms via the modal to leave the group successfully — and on a separate attempt cancels the confirmation modal and remains in the group.

**Acceptance Scenarios**:

1. **Given** the user is inside any group screen, **When** the screen renders, **Then** the group header shows only the group image, the group name, and a gear icon, with no additional metadata or controls cluttering the strip.
2. **Given** the user taps or clicks the gear icon, **When** the menu opens, **Then** it shows at minimum a "Detalhes" entry and a "Sair" entry.
3. **Given** the user chooses "Detalhes", **When** they confirm the action, **Then** they are taken to the group details view.
4. **Given** the user chooses "Sair", **When** the menu triggers the action, **Then** a confirmation modal appears asking the user to confirm leaving the group, with a clear cancel option.
5. **Given** the confirmation modal is open, **When** the user confirms, **Then** they leave the group, the application falls back to another group (or empty state if none remain), and the previous group is no longer set as the last accessed group.
6. **Given** the confirmation modal is open, **When** the user cancels, **Then** they remain in the group with no state changes.

---

### User Story 4 - Navigate Inside a Group via a Left Sidebar (Priority: P1)

While the user is inside a group, a left sidebar provides primary navigation to Home, Jogos, Palpites, Ranking, Membros, and Configurações (the last only visible to group administrators). The sidebar is hidden outside group context.

**Why this priority**: Sidebar navigation is the spine of the new layout. Without it, the rest of the redesign (minimalist header, modal switching, group home) does not cohere into a usable product, and admins need a clear, gated entry to settings.

**Independent Test**: A non-admin member sees five items in the sidebar and reaches each section. A group administrator additionally sees "Configurações" and can open it. A user outside of any group context (onboarding, account flows) sees no sidebar at all.

**Acceptance Scenarios**:

1. **Given** the user is inside a group as a member, **When** any group screen is shown, **Then** the left sidebar shows Home, Jogos, Palpites, Ranking, and Membros, and does not show Configurações.
2. **Given** the user is inside a group as an administrator, **When** any group screen is shown, **Then** the left sidebar also shows Configurações.
3. **Given** the user is on a non-group screen (onboarding, account, group-less empty state), **When** the screen is shown, **Then** the sidebar is hidden.
4. **Given** the user is on a sidebar destination, **When** the sidebar is shown, **Then** the current destination is visually highlighted so the user knows where they are.
5. **Given** the user is on a narrow mobile screen, **When** the sidebar would not fit alongside content, **Then** an equivalent mobile navigation surface is provided that exposes the same destinations and the same admin visibility rules.

---

### User Story 5 - Bet on Matches From a Day-Strip on Home (Priority: P1)

On the group home, the user navigates upcoming match days through a horizontal day-strip and places score bets directly inside modern match cards without leaving the home. Past match days are excluded from the strip by default, and the strip opens on the current matchday or the closest upcoming day.

**Why this priority**: The match list is where users spend most of their time. Inline score betting from a clean, date-segmented home removes navigation overhead, focuses attention on the right matches, and makes the application feel modern and fast.

**Independent Test**: A user opens the group home, sees a day-strip that starts on today's matchday (or the next one if there are no matches today), scrolls between upcoming days, places a score bet on a match directly inside its card on the home, and confirms the bet was saved without leaving the home screen.

**Acceptance Scenarios**:

1. **Given** the group has matches scheduled across multiple days, **When** the user opens the group home, **Then** a horizontal day-strip is visible and the default selected day is today if there are matches today, otherwise the closest upcoming matchday.
2. **Given** the day-strip is rendered, **When** the user looks at it, **Then** it does not include days that contain only past matches, while still allowing the user to opt into viewing past days if they actively navigate to them.
3. **Given** a future day is selected in the strip, **When** the matches for that day are shown, **Then** each match appears in a modern card that allows the user to enter a score bet inline without navigating away.
4. **Given** the user enters a score bet inline, **When** they confirm, **Then** the bet is saved against that match and the card reflects the saved bet without a full page reload.
5. **Given** the user changes the selected day in the strip, **When** the new day's matches load, **Then** the user remains on the home and the selected day remains highlighted.
6. **Given** the group has no upcoming matches at all, **When** the home loads, **Then** the day-strip presents a polished empty state explaining the situation while keeping the group context visible.

---

### User Story 6 - See Match Results and Earned Points Inside the Card (Priority: P2)

Once a match has been played, its card on the home (or wherever it appears) updates to show the final score alongside the user's score bet and the points the user earned for that match, so the user can review outcomes without opening a separate result page.

**Why this priority**: Closing the feedback loop between betting and scoring inside the same card builds engagement and reduces navigation. It depends on the modern card foundation from User Story 5 and is most valuable once that is in place.

**Independent Test**: A user opens a past-day view (or a card whose match has finished), and sees the final result, the user's own bet, and the points awarded together inside a single card without navigating away.

**Acceptance Scenarios**:

1. **Given** a match has ended and an official result exists, **When** the user opens that match's card, **Then** the card shows the final score of the match.
2. **Given** the user placed a bet on that match, **When** the card is shown after the match has ended, **Then** the user's bet is shown alongside the final score and the points earned for that bet.
3. **Given** the user did not place a bet on that match, **When** the card is shown after the match has ended, **Then** the card clearly indicates that no bet was placed and shows the final score only.
4. **Given** the official result is not yet available for an ended match, **When** the card is shown, **Then** the card communicates that the result is pending instead of falsely declaring zero points.

---

### User Story 7 - Track Betting Progress for the Selected Day Range (Priority: P2)

A progress bar above the day-strip reflects how many of the matches available through the strip have already been bet on, so the user knows at a glance when they are fully covered.

**Why this priority**: The progress bar turns the betting task into a closable loop. It is a strong motivator and aligns with the modern UX direction, but it depends on the day-strip and inline betting work to be meaningful.

**Independent Test**: A user opens the home with several upcoming matches, places bets on some of them, and observes the progress bar advance accordingly; when all available matches are bet on, the bar reaches 100% and clearly indicates completion.

**Acceptance Scenarios**:

1. **Given** there are upcoming matches available through the day-strip, **When** the user opens the home, **Then** a progress bar is visible above the day-strip showing how many of those matches the user has already bet on.
2. **Given** the user places a new bet from a match card, **When** the bet is saved, **Then** the progress bar updates without requiring a page reload.
3. **Given** the user has bet on every match available in the day-strip range, **When** the home is shown, **Then** the progress bar is fully filled and communicates completion clearly.
4. **Given** there are no upcoming matches available, **When** the home is shown, **Then** the progress bar is hidden or replaced with an explanatory state instead of showing as empty in a misleading way.

---

### User Story 8 - Experience the Redesign on Mobile (Priority: P1)

The entire redesign — auto group resume, modal-based group switching and creation, minimalist header, sidebar navigation, day-strip, inline betting cards, finished-match cards, and progress bar — works on mobile screens with the same logic and following the Brasil Essencial visual direction.

**Why this priority**: Mobile is a primary use case for this product. Shipping the redesign for desktop only would create two divergent experiences and undermine adoption.

**Independent Test**: On a narrow mobile viewport, the user goes through every scenario from User Stories 1 to 7 successfully: lands in the last group, opens the "Grupos" modal, switches and creates a group inside it, uses the minimalist header and gear menu, navigates via the mobile equivalent of the sidebar, uses the day-strip, places bets inline, sees finished-match results, and watches the progress bar update.

**Acceptance Scenarios**:

1. **Given** a mobile user opens the application, **When** they enter a group, **Then** the group header, primary navigation, and home content are usable without horizontal scrolling.
2. **Given** the mobile user opens the "Grupos" modal, **When** they switch or create a group, **Then** the modal and its inline creation flow are fully usable on small viewports.
3. **Given** the mobile user views the day-strip on the home, **When** they navigate days and select matches, **Then** the strip scrolls horizontally with touch, the selected day stays visible, and match cards remain readable and tappable.
4. **Given** the mobile user places a score bet inline, **When** they confirm, **Then** the bet is saved and the progress bar updates without losing the user's place on the home.
5. **Given** the mobile user opens the gear menu and triggers the leave-confirmation modal, **When** the modal is shown, **Then** confirm and cancel actions remain clearly visible and reachable.

---

### Edge Cases

- The user belongs to zero groups: no sidebar, no group header, and the application directs them to join or create a group.
- The user's stored "last accessed group" no longer exists or they were removed from it: silently fall back to another available group or to onboarding.
- A user is demoted from administrator while a session is active: Configurações must stop appearing in the sidebar without requiring a manual refresh of their role view, at the latest the next navigation event.
- The group has matches but none in the future (whole tournament is over): the day-strip must explain the state instead of being empty by default; the user can still opt into past days.
- The group has no matches at all yet: the home presents an empty but inviting state and the progress bar is not shown.
- A match's result arrives between two interactions: the card must reflect the new state on its next render without the user having to leave and return.
- Long group names, long team names, or large scores must not break the minimalist header, day-strip pills, or match cards.
- The user leaves the group from the gear menu: their last accessed group must be cleared so they are not redirected back to a group they no longer belong to.
- Two devices for the same user: the last accessed group should resolve to a sensible default on each device without producing conflicting jumps mid-session.
- Network errors while placing inline bets: the card must communicate failure and allow the user to retry without losing the typed score.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST persist the user's last accessed group and, on next application entry, restore that group as the active context when it is still valid.
- **FR-002**: When the user belongs to exactly one group, the system MUST always enter that group on application entry regardless of any stored preference.
- **FR-003**: When the stored last accessed group is no longer available to the user, the system MUST gracefully fall back to another group they belong to, or to onboarding if none remain, without surfacing an error.
- **FR-004**: The system MUST NOT show a persistent always-visible list of groups on group screens; group switching MUST be exposed through a single "Grupos" entry point that opens a modal.
- **FR-005**: The "Grupos" modal MUST display the user's groups and provide an option to create a new group.
- **FR-006**: Group creation MUST happen entirely inside the "Grupos" modal, reusing the same creation flow used in the onboarding experience, without navigating the user to a separate page.
- **FR-007**: After a group is created in the modal, the system MUST place the user inside the new group as the active context and update the last accessed group accordingly.
- **FR-008**: The group header MUST be minimalist, showing only the group image, the group name, and a gear control that opens a menu of group actions.
- **FR-009**: The gear menu MUST offer at least a "Detalhes" action and a "Sair" action.
- **FR-010**: The "Sair" action MUST trigger a confirmation modal before the user actually leaves the group; cancelling the modal MUST leave membership unchanged.
- **FR-011**: When the user successfully leaves a group, the system MUST clear it from the last accessed group memory and route the user to another available group or to onboarding.
- **FR-012**: When inside a group, the system MUST display a left sidebar exposing Home, Jogos, Palpites, Ranking, and Membros as primary destinations.
- **FR-013**: The sidebar MUST additionally expose Configurações only when the user is an administrator of the active group.
- **FR-014**: The sidebar MUST NOT appear on screens that are not in a group context (onboarding, account flows, group-less empty states).
- **FR-015**: The sidebar MUST clearly indicate the current destination so the user always knows where they are inside the group.
- **FR-016**: On viewports too narrow to host a persistent sidebar, the system MUST provide an equivalent mobile navigation surface that exposes the same destinations and the same admin-only visibility rules for Configurações.
- **FR-017**: The group home MUST present matches through a horizontal day-strip that segments matches by day and lets the user navigate between days.
- **FR-018**: The day-strip MUST default to the matchday that contains today's matches if any exist, otherwise to the closest upcoming matchday with matches.
- **FR-019**: The day-strip MUST hide days that contain only past matches from the default view while still allowing the user to navigate to past days if they explicitly choose to.
- **FR-020**: The system MUST allow the user to place a score bet directly inside a match card on the home, without navigating to a separate betting page.
- **FR-021**: Once a match has ended and an official result exists, its match card MUST show the final score, the user's bet (if one was placed), and the points the user earned for that match.
- **FR-022**: When the user did not bet on a finished match, the card MUST clearly communicate the absence of a bet alongside the final score.
- **FR-023**: A progress bar MUST appear above the day-strip and reflect how many of the matches available through the strip the user has already bet on, updating in near real time as bets are placed.
- **FR-024**: The progress bar MUST communicate completion when every available match has been bet on, and MUST hide or adapt when no upcoming matches exist instead of showing a misleading empty state.
- **FR-025**: All redesigned surfaces — group resume, "Grupos" modal, minimalist header and gear menu, sidebar (or mobile equivalent), day-strip, match cards, finished-match cards, leave-group confirmation, and progress bar — MUST be implemented for mobile viewports as well as desktop.
- **FR-026**: All redesigned surfaces MUST follow the project's Brasil Essencial visual direction documented in `doc/ui.md`, including neutral surfaces, restrained brand color, clear hierarchy, accessible contrast, and minimal decoration.
- **FR-027**: All empty, loading, and error states across the redesigned surfaces MUST preserve the active group context where it applies and explain to the user what they can do next.

### Key Entities

- **User**: The authenticated person interacting with the application; may belong to zero, one, or many groups, and may hold administrator role in any of them.
- **Group**: A betting community the user belongs to, with identity (name, image), membership, and optional administrator role per user.
- **Last Accessed Group**: A per-user memory of which group the user last entered, used to auto-resume into that group on next entry.
- **Group Membership Role**: The user's role inside a group (member or administrator); drives whether Configurações appears in the sidebar.
- **Match**: A scheduled or completed sporting fixture inside the group's context, with date/time, teams, and (eventually) an official final score.
- **Matchday**: A grouping of matches by day, used as the navigation unit in the day-strip.
- **Score Bet**: The user's predicted score for a given match, editable until the match starts and stored against the user and the match.
- **Match Result**: The official final score of a played match; combined with the user's bet to compute the points earned.
- **Betting Progress**: The proportion of currently-available navigable matches that the user has bet on; drives the progress bar.
- **Sidebar Destination**: One of Home, Jogos, Palpites, Ranking, Membros, or Configurações; the last is gated on administrator role.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Returning users with multiple groups land directly inside their last accessed group in at least 95% of sessions, without seeing any intermediate group selector.
- **SC-002**: Users can switch between groups, including opening the "Grupos" modal and selecting another group, in no more than 2 interactions on desktop and 2 taps on mobile.
- **SC-003**: Users can create a new group entirely from within the "Grupos" modal without being navigated to a separate page, in at least 95% of attempts.
- **SC-004**: From inside any group screen, the active group's identity is recognizable within 2 seconds in usability testing on both desktop and mobile.
- **SC-005**: At least 90% of users who attempt to leave a group correctly encounter the confirmation modal, and accidental leaves (reverted within 24 hours) drop by at least 70% compared to the previous flow.
- **SC-006**: Non-administrators see exactly five sidebar destinations and administrators see exactly six, with 0 incidents of Configurações leaking to non-administrators during review.
- **SC-007**: On the group home, the day-strip opens on today's matchday or the closest upcoming matchday in at least 95% of loads, and past-only days are excluded by default.
- **SC-008**: Users can place a score bet from the home and see the bet reflected in the match card and progress bar without leaving the home in at least 95% of attempts.
- **SC-009**: For finished matches, at least 95% of cards show the final score, the user's bet (when present), and the points earned together in a single card without navigation.
- **SC-010**: The progress bar reaches 100% within one interaction after the user's last available match is bet on, in at least 95% of cases.
- **SC-011**: The redesigned surfaces have no horizontal scrolling, clipped primary text, or overlapping interactive elements at 320px wide during review.
- **SC-012**: At least 80% of test users describe the redesigned group experience as more modern, faster, and easier to use than the previous layout.

## Assumptions

- The data needed to support this redesign — group membership, administrator role, matches with dates, score bets, official results, and earned points — is already available or in scope of the broader product and is not redefined by this feature.
- The existing onboarding group creation experience (`src/pages/onboarding/OnboardingPage.tsx` and related components) is the canonical creation flow and is suitable to be embedded inside the new modal with at most minor adaptation.
- The previous group layout work (spec 002) established the group-first navigation model and active-group concept; this feature evolves that model rather than replacing it.
- "Inside a group" is defined as any screen whose primary context depends on a selected group (home, jogos, palpites, ranking, membros, configurações, match detail, etc.); onboarding, account settings, and the group-less empty state are not "inside a group".
- A user's administrator role for the active group can be determined synchronously at render time and is stable for the duration of a screen.
- The default day-strip behavior assumes that "today" is interpreted in the user's local time zone unless the project later defines a different competition-time convention.
- Past matches remain accessible through explicit navigation (for example, paging the day-strip backwards or via Palpites/Jogos sections), even though they are excluded from the default home view.
- The progress bar's denominator is the set of matches reachable through the day-strip at its current scope (upcoming matches by default), not the entire historical match catalogue.
- The redesign reuses the project's Brasil Essencial design tokens, spacing scale, and component primitives rather than introducing new visual languages.
