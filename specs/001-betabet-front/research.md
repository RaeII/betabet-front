# Research: World Cup Betting App

**Phase**: 0 — Unknowns resolved before design
**Date**: 2026-05-19
**Branch**: `001-betabet-front`

---

## 1. Real-Time Ranking Updates (SC-002: ≤ 30 s)

**Decision**: TanStack Query polling with `refetchInterval: 30_000`

**Rationale**:

- No extra library required — TanStack Query is already in the stack
- Meets the "within 30 seconds" success criterion exactly
- Simpler to implement, test, and reason about than WebSocket
- Polling only fires when the browser tab is active (`refetchIntervalInBackground: false`)
  so no wasted requests when the user is away

**Alternatives considered**:

- WebSocket: Lower latency, push-based, more efficient at scale — but adds server-side
  infrastructure and a client library. Overkill for the current scale and timeline.
- Server-Sent Events (SSE): Push model, lighter than WebSocket — but still requires server
  support and adds complexity. Deferred to future iteration.

**How to apply**: `useRanking.ts` and any query where live freshness matters will pass
`{ refetchInterval: 30_000 }` to `useQuery`. Ranking and match-detail queries use this.
Bet mutation cache invalidation happens immediately after a successful POST/PUT.

---

## 2. Authentication Strategy

**Decision**: Session cookie managed by the backend (HttpOnly, SameSite=Lax)

**Rationale**:

- HttpOnly cookies are not accessible to JavaScript, making them XSS-resistant
- SameSite=Lax provides CSRF protection without a separate token for most flows
- No manual token management needed in the frontend (no Authorization headers)
- Works transparently through the Vite dev-proxy (cookies forwarded automatically)

**Alternatives considered**:

- JWT in localStorage: Simpler to implement but vulnerable to XSS token theft. Rejected.
- JWT in memory (React state): XSS-safe but lost on page refresh, forcing re-login. Rejected.

**How to apply**:

- `fetch` calls use `credentials: 'include'` so cookies are sent with every request
- The Vite proxy uses `changeOrigin: true` to forward cookies to the backend
- The `useAuth` hook calls `GET /api/auth/me` on mount to hydrate auth state; on 401 the
  user is redirected to login
- `AuthGuard` and `AdminGuard` components wrap protected routes

---

## 3. State Management

**Decision**: TanStack Query for all server state; React Context only for auth user +
theme preference

**Rationale**:

- Avoids two state management systems in the same app
- TanStack Query handles loading, error, caching, invalidation, and optimistic updates
  natively — no extra patterns needed
- Auth state is updated infrequently (login/logout) — React Context + useState is adequate
- Theme preference persists to localStorage via `useTheme` hook

**Alternatives considered**:

- Zustand for global client state: Better ergonomics than Context, but adds a dependency
  and introduces a third state layer alongside Context and TanStack Query. Rejected.
- Redux Toolkit: Heavy, designed for complex shared mutations. Rejected.

**How to apply**:

- All API-backed data lives in TanStack Query: matches, bets, groups, ranking, referral
- `auth.context.tsx` provides `user`, `isAuthenticated`, `login()`, `logout()`
- Theme state stored in `useTheme` hook with `localStorage` sync

---

## 4. Distribution Chart (Polymarket-style)

**Decision**: Custom SVG component — no chart library

**Rationale**:

- The chart is structurally simple: three horizontal bars (home / draw / away) with
  percentage labels and team flag indicators
- SVG in React is first-class — no additional import needed
- Avoids adding Recharts (~300 KB) or Chart.js (~200 KB) for a single static chart
- Custom component is fully controllable with Brasil Essencial tokens

**Alternatives considered**:

- Recharts: Easy API, well-maintained — but significantly increases bundle size for a
  single chart type. Rejected.
- Chart.js via react-chartjs-2: Similar weight issue. Rejected.

**How to apply**: `DistributionChart.tsx` renders an SVG with three filled bars.
Width is calculated from `homePct`, `drawPct`, `awayPct` (0–100 values from the API).
Colour tokens `--brand` and `--support` used for home/away/draw bars.

---

## 5. Form Handling

**Decision**: Zod schemas + controlled React state; no React Hook Form

**Rationale**:

- Zod is already required for API response validation — reusing it for form schemas
  keeps the library surface minimal
- All forms in the app are short (≤ 5 fields); complex form management libraries
  add overhead not justified by this complexity level
- `safeParse` results are used directly to produce per-field error messages

**Alternatives considered**:

- React Hook Form: Better DX for large forms, fewer re-renders — but adds a library
  dependency. Rejected for this scope.

**How to apply**: Each form page/component has a local Zod schema and a `useState` for
field values. On submit, `schema.safeParse(values)` is called; errors are mapped to field
names. Shared form utilities live in `lib/form.utils.ts` if reused across 2+ forms.

---

## 6. Emoji Reactions

**Decision**: Fixed set of 6 predefined emojis rendered as inline buttons

**Rationale**:

- No emoji picker library needed
- Fixed set avoids moderation complexity (user can't input arbitrary text)
- Set: 🔥 ❤️ 😂 😮 👎 🏆 — covers typical sports reactions

**Alternatives considered**:

- Full emoji picker (e.g., emoji-mart): Rich UX but ~100 KB and overkill for reactions.
  Rejected.

**How to apply**: `EmojiPicker.tsx` renders 6 buttons with fixed emoji strings.
Clicking sends `POST /api/bets/:id/reactions` or toggles off if already reacted.

---

## 7. Testing Strategy

**Decision**: Vitest + `@testing-library/react` + `msw`

**Rationale**:

- Vitest is Vite-native — no extra transform config, runs in the same module graph
- Testing Library encourages testing user-visible behaviour, not implementation details
- `msw` intercepts fetch at the network level, allowing realistic API simulation
- `bun run test` delegates to Vitest — Bun is the process runner, Vitest is the framework

**How to apply**:

- Unit tests cover `src/lib/` utilities (pure functions — easy TDD)
- Hook tests use `renderHook` + `msw` server to mock API responses
- Integration tests render full pages and assert on user-visible elements
- Constitution Principle III: tests MUST be written before implementation

---

## 8. Routing

**Decision**: React Router DOM v6 with nested routes and layout routes

**Rationale**:

- Industry standard for React SPAs, well-documented
- Nested routes allow `AppShell` to wrap all user routes and `AdminLayout` to wrap all
  admin routes without prop drilling
- File-system routing (TanStack Router) was considered but avoided to keep configuration
  simple and dependencies minimal

**Route map**:

```
/                        → HomePage (auth required)
/matches                 → MatchesPage
/matches/:matchId        → MatchDetailPage (global context — no group score)
/groups                  → GroupsPage
/groups/new              → CreateGroupPage
/groups/:groupId         → GroupDetailPage
/groups/:groupId/matches/:matchId → MatchDetailPage (group context)
/profile                 → ProfilePage
/invite/:code            → GroupInvitePage (public)
/auth/login              → LoginPage (public)
/auth/register           → RegisterPage (public)
/admin                   → AdminDashboardPage (admin only)
/admin/matches           → AdminMatchesPage
/admin/teams             → AdminTeamsPage
/admin/analytics         → AdminAnalyticsPage
```

---

## 9. Vite Proxy Security Configuration

**Decision**: Proxy `/api/*` to backend via `server.proxy` in `vite.config.ts`

**Security measures**:

- `changeOrigin: true` — rewrite `Host` header to target, prevents leaking client origin
- `secure: false` — only in dev (self-signed certs in local backend); production uses HTTPS
- Backend URL stored in `.env.local` (`VITE_API_URL`) — not hard-coded
- `credentials: 'include'` in all fetch calls — HttpOnly cookies forwarded
- No API keys or secrets ever stored in frontend JS

```typescript
// vite.config.ts (dev proxy)
proxy: {
  '/api': {
    target: process.env.VITE_API_URL ?? 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
  }
}
```

---

## 10. Tailwind CSS v4 + shadcn/ui Integration

**Decision**: Tailwind CSS v4 with `@tailwindcss/vite` plugin; shadcn/ui initialized for v4

**Rationale**:

- Tailwind v4 uses CSS-first configuration (no `tailwind.config.ts` needed for basic setup)
- Brasil Essencial tokens imported as CSS custom properties in `styles/tokens.css` and
  referenced in Tailwind utilities via `@theme`

**Alternatives considered**:

- Tailwind v3: Stable but superseded; v4 is the current version with better Vite integration.

**How to apply**:

- CSS tokens from `doc/ui.md` section 15 are placed in `src/styles/tokens.css`
- Tailwind `@theme` block maps tokens to Tailwind utilities (e.g., `bg-brand`, `text-muted`)
- shadcn components are initialized with `bunx shadcn@latest init`
- shadcn components added per-need: `bunx shadcn@latest add <component>`
