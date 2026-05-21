# Research: Group Layout UX

## Decision: Use the route as the active group source

**Rationale**: The app already routes group detail through `/groups/:groupId`, and existing hooks accept a group id. Keeping the route as the source of truth avoids duplicating active group state in context or local storage. It also makes links shareable and keeps refresh behavior predictable.

**Alternatives considered**:

- Global active group context: rejected because it duplicates route state and increases synchronization risk.
- Local storage active group: rejected because it can conflict with explicit URLs and stale memberships.

## Decision: Desktop uses a bounded left rail plus constrained content

**Rationale**: The user explicitly requested a WhatsApp-like desktop pattern. A fixed/bounded rail gives persistent group context while the main content remains focused. The content area should use intentional maximum widths and grids so cards do not stretch across the full desktop width without purpose.

**Alternatives considered**:

- Full-width group list above content: rejected because it does not keep group context visible while scrolling.
- Drawer-only desktop navigation: rejected because it hides the current group list and adds extra interaction cost.

## Decision: Mobile remains a list-to-detail flow

**Rationale**: At 320px width, showing a rail and content together would compromise readability. The existing routes already support `/groups` as a list and `/groups/:groupId` as detail, so the mobile flow can stay simple: list first, tap group, detail opens, use "Ver grupos" to return.

**Alternatives considered**:

- Horizontal group tabs on mobile: rejected because many groups and long names become hard to scan.
- Overlay drawer on mobile: rejected for this planning phase because route-based list/detail is simpler and easier to test.

## Decision: Group home is a preview dashboard, not a full detail dump

**Rationale**: The spec asks for a professional sports-style home that shows enough detail to click into specific pages. The group landing should prioritize group identity, next action, upcoming matches, past matches, and ranking preview while keeping full workflows on their dedicated pages.

**Alternatives considered**:

- Keeping the current tab-first detail page: rejected because it hides the sports overview and does not solve active group clarity.
- Showing all matches and full ranking on the landing page: rejected because it overloads the home and creates long, hard-to-scan mobile pages.

## Decision: Reuse existing dependencies; add no new library

**Rationale**: React Router covers navigation, TanStack Query covers server state, Framer Motion covers the existing motion model, Lucide covers icons, and existing UI primitives cover buttons/badges/cards. The requested layout does not require a new package.

**Alternatives considered**:

- Add a layout/sidebar package: rejected because the required behavior is straightforward and would add visual/API constraints that may conflict with `doc/ui.md`.
- Add carousel/swiper for previews: rejected because previews should remain simple, responsive, and accessible at 320px.

## Decision: Existing match and ranking data can power previews

**Rationale**: The app already has `useAllMatches`, `useGroupRanking`, and group-aware match links. Upcoming and past preview sections can filter existing match data by status/date for display, while group-scoped links preserve context.

**Alternatives considered**:

- New group home backend endpoint: deferred until implementation proves current data causes excessive requests or cannot represent required previews.
- Store derived previews in local state: rejected because derived display data should come from query results and memoized filtering, not duplicate source state.

## Decision: Preserve `doc/ui.md` and local UI overrides

**Rationale**: The user asked not to change UI rules. Implementation should use existing tokens, neutral surfaces, restrained support color, green actions, controlled motion, and page-specific components. Inputs are not central to this feature, but any touched input must keep the local no-yellow-focus override.

**Alternatives considered**:

- New visual theme for the group home: rejected because it would violate the established design system.
- Decorative gradient/startup hero treatment: rejected because `doc/ui.md` prohibits gradients and favors minimal, product-grade hierarchy.
