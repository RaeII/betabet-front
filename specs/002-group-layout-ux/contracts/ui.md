# UI Contract: Group Layout UX

This contract defines expected user-facing behavior for the redesigned group flow. It is intentionally UI-level because this feature does not require a new backend API.

## Routes

### `/groups`

**Purpose**: Show the user's group list.

**Mobile behavior**:

- Primary group entry screen.
- Shows a touch-friendly list of all groups.
- Empty state offers create/join path.

**Desktop behavior**:

- Shows group navigation in a bounded list area.
- If no group is selected, shows a bounded empty/selection state rather than a full-width blank dashboard.

### `/groups/:groupId`

**Purpose**: Show the selected group's home and group-specific actions.

**Mobile behavior**:

- Shows an active group header.
- Provides a visible "Ver grupos" control to return to `/groups`.
- Shows group home previews in one column.

**Desktop behavior**:

- Shows persistent left group rail.
- Shows selected group home in a constrained main area.
- Active group remains visible in both rail selected state and main header/hero.

### `/groups/:groupId/matches/:matchId`

**Purpose**: Existing group-scoped match detail/betting route.

**Behavior**:

- Match preview links from group home must use this route so the betting context remains group-scoped.

## Responsive Layout Contract

### 320px mobile minimum

- No horizontal scrolling.
- Group row avatars, text, metadata, and actions fit within viewport.
- Long group/team/member names truncate or wrap predictably.
- Main actions remain at least touch-friendly and do not overlap bottom navigation.

### Desktop

- Left group rail uses a purposeful fixed/bounded width.
- Main group home content uses bounded sections and responsive columns.
- Cards or previews do not stretch to full desktop width unless the content needs it.
- Large empty/loading states are centered within a bounded content area.

## Active Group Visibility Contract

- Any group-scoped screen must show the selected group's name or identity without requiring extra navigation.
- Switching groups updates selected rail state and main content.
- Group-specific match links must include `groupId`.
- Empty, loading, and error states must still preserve current group context when known.

## Group Home Content Contract

### Group identity hero

- Shows group name, visual identity, member count, and role/context when available.
- Surfaces the most relevant next action.
- Follows `doc/ui.md`: neutral base, green action, restrained support accents, no gradients.

### Upcoming matches preview

- Shows a concise list of upcoming matches.
- Each item opens the group-scoped match detail/betting route.
- Empty state explains that there are no upcoming matches.

### Past matches preview

- Shows a concise list of recent completed/past matches.
- Each item opens group-scoped match detail/history.
- Empty state explains that no past matches are available.

### Ranking preview

- Shows top entries and current user's position when available.
- Opens the full ranking view.
- Empty state explains that no ranking activity exists yet.

## Accessibility Contract

- The group rail/list must be keyboard reachable.
- Selected group state must be exposed using current/selected semantics where appropriate.
- Buttons and links must have clear accessible names.
- Focus styling must follow existing project behavior and local UI skill overrides.
- Motion must respect reduced-motion preferences.

## Visual Contract

- Use only existing CSS tokens from the project UI system.
- Preserve Plus Jakarta Sans and established type scale.
- Use borders and surfaces for hierarchy; shadows remain rare and subtle.
- Do not add gradients, blue primary actions, solid yellow cards, or decorative effects outside `doc/ui.md`.
- Avoid nested cards; use section layouts and repeated item cards only where they represent individual items.
