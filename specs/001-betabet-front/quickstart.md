# Quickstart: World Cup Betting App (Frontend)

**Runtime**: Bun | **Build**: Vite 6 | **Framework**: React 18 + TypeScript

---

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.1 installed (`bun --version`)
- Node.js 20+ (some tooling may fall back to Node)
- A running backend API (see backend repo README for setup)

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd <repo-name>
bun install
```

---

## 2. Environment Variables

Copy the example file and fill in the backend URL:

```bash
cp .env.example .env.local
```

`.env.local`:
```
VITE_API_URL=http://localhost:3000
```

> **Never commit `.env.local`** — it is in `.gitignore`.

---

## 3. Run Dev Server

```bash
bun run dev
```

Opens at `http://localhost:5173`. All `/api` requests are proxied to `VITE_API_URL`.

---

## 4. Run Tests

```bash
bun run test          # Run all tests once
bun run test:watch    # Watch mode
bun run test:coverage # Coverage report
```

Tests use Vitest + Testing Library. `msw` mocks API calls — no backend required for tests.

---

## 5. Type Check

```bash
bun run typecheck
```

---

## 6. Build for Production

```bash
bun run build
bun run preview       # Preview production build locally
```

Output in `dist/`.

---

## 7. Add a shadcn Component

```bash
bunx shadcn@latest add <component-name>
# Examples:
bunx shadcn@latest add button
bunx shadcn@latest add dialog
bunx shadcn@latest add input
```

Components are copied to `src/components/ui/`.

---

## 8. Project Scripts (package.json)

| Script | Command |
|---|---|
| `bun run dev` | `vite` |
| `bun run build` | `tsc -b && vite build` |
| `bun run preview` | `vite preview` |
| `bun run test` | `vitest run` |
| `bun run test:watch` | `vitest` |
| `bun run test:coverage` | `vitest run --coverage` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | `eslint src` |

---

## 9. Key Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite config + dev proxy to backend |
| `src/styles/tokens.css` | Brasil Essencial CSS custom properties |
| `src/router/index.tsx` | Route tree |
| `tests/setup.ts` | Vitest + Testing Library global setup |
| `components.json` | shadcn/ui configuration |
| `.env.local` | Local environment variables (not committed) |

---

## 10. Adding a New Page

1. Create `src/pages/<page-name>/` directory
2. Create `<PageName>Page.tsx` as the page root (max 300 lines)
3. Create `src/pages/<page-name>/components/` for page-specific components
4. Add route to `src/router/index.tsx`
5. If the page needs auth, wrap with `<AuthGuard>`
6. Write integration test in `tests/integration/pages/`

---

## 11. Adding a New Global Component

A component qualifies as global if it is used (or will be used) in 2+ pages.

1. Create `src/components/<domain>/<ComponentName>.tsx`
2. Export from the component file
3. Write unit/integration test in `tests/`
4. Add to `.specify/memory/global-functions.md` if the component exposes a reusable utility

---

## 12. Adding a New API Service Call

1. Add the TypeScript types to `src/types/`
2. Add the service function in `src/services/<domain>.service.ts`
3. Add a custom hook in `src/hooks/use<Domain>.ts` using TanStack Query
4. Mock the endpoint in `tests/` with `msw`

---

## 13. Brasil Essencial Design Tokens

All visual values come from `src/styles/tokens.css`. Use CSS variables directly or via
Tailwind utilities mapped in the `@theme` block.

```css
/* Do */
background-color: var(--brand);
className="bg-[var(--brand)]"

/* Don't */
background-color: #123D2A;   /* hard-coded pixel/hex value */
```

Full token reference: `doc/ui.md` section 5 and section 15.
