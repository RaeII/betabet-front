# Quickstart: Group Layout UX

## Prerequisites

- Work on branch `002-group-layout-ux`.
- Read `doc/ui.md` before UI implementation.
- Check `.specify/memory/global-functions.md` before adding any reusable helper.

## Implementation Order

1. Add or update integration tests for the group flow:
   - desktop selected group is visible in the left rail and main content;
   - mobile detail view has a "Ver grupos" control back to `/groups`;
   - group home renders upcoming matches, past matches, and ranking previews;
   - 320px layout has no horizontal overflow in testable DOM assertions where feasible.
2. Implement page-specific group layout components under `src/pages/groups/components/`.
3. Update `GroupsPage.tsx` and `GroupDetailPage.tsx` to use the new list/detail and desktop rail behavior.
4. Reuse existing `MatchCard`, `GroupRanking`, `Button`, `Badge`, hooks, services, and format utilities where practical.
5. Add type definitions only if the view model is reused across files; keep trivial component props local.
6. Run focused tests and static checks.

## Verification Commands

```bash
rtk npm run typecheck
rtk npm run test -- GroupDetailPage
rtk npm run test -- HomePage
rtk npm run lint
```

If implementation touches Tailwind arbitrary selectors or shared styling:

```bash
rtk npm run build
```

## UI Review Checklist

- Active group is always visible on group-scoped screens.
- Desktop group rail is bounded and does not force the main content into purposeless full-width panels.
- Mobile works at 320px with no horizontal scrolling.
- Group home previews are entry points, not full detail dumps.
- Empty/loading/error states preserve group context.
- No gradients, blue primary actions, solid yellow cards, or unrelated visual effects were introduced.
- No new package was added unless documented in `plan.md` with a clear reason.

## Verification Results

- `rtk npm run test -- GroupDetailPage`: passed on 2026-05-21.
- `rtk npm run test -- HomePage`: passed on 2026-05-21; existing MSW warnings for `/api/groups` remain in that test file.
- `rtk npm run typecheck`: passed on 2026-05-21.
- `rtk npm run build`: passed on 2026-05-21.
- `rtk npm run test`: blocked on 2026-05-21 by existing `AdminGuard.test.tsx` provider setup failure; group feature tests passed inside the run.
- `rtk npm run lint`: blocked on 2026-05-21 because the repository has ESLint 9 but no `eslint.config.*` file.
