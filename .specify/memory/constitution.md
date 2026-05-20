<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.1 → 1.0.2
Amendment date: 2026-05-19
Bump rationale: PATCH — renamed spec directory from `specs/001-world-cup-betting` to
`specs/001-betabet-front` to align with CLAUDE.md paths, feature.json, and project branding.
No principle, governance, or workflow rule changed.

Principles modified: none
Sections added: none
Sections removed: none

Templates reviewed:
  ✅ .specify/templates/plan-template.md          — No name references requiring change.
  ✅ .specify/templates/spec-template.md          — No name references requiring change.
  ✅ .specify/templates/tasks-template.md         — No name references requiring change.
  ✅ .specify/templates/constitution-template.md  — Source template; not modified.
  ✅ CLAUDE.md                                    — Already referencing betabet-front paths.
  ✅ .specify/feature.json                        — Already set to specs/001-betabet-front.

Deferred TODOs: none
-->

# betabet Constitution

*Não sejá beta nas apostas*

## Core Principles

### I. DRY & Simplicity (NON-NEGOTIABLE)

Logic and functions MUST NOT be duplicated. Every utility function MUST be extracted to a shared
module before a second copy is created elsewhere. Code MUST be self-explanatory through clear
naming — if a reader needs a comment to understand WHAT the code does, it MUST be refactored.
Global utility functions MUST be catalogued in `.specify/memory/global-functions.md` so they are
always discoverable across features and sessions.

**Rationale**: Duplicated logic is a maintenance debt multiplier. Every duplicate is a future
bug waiting to diverge.

### II. Type Safety

All type definitions MUST reside in dedicated type files (e.g., `types.ts`, `types/index.ts`,
or `*.d.ts`). Inline type declarations MUST NOT appear in implementation files except for
trivial, locally-scoped one-offs. Types are the source of truth for data contracts between
modules and MUST be updated before implementation when a contract changes.

**Rationale**: Centralised types make refactoring safer, reduce merge conflicts, and serve as
living documentation of data shapes.

### III. Test-First (NON-NEGOTIABLE)

Every feature and every non-trivial function MUST have a corresponding test. Tests MUST be
written before or alongside implementation — never after. The Red-Green-Refactor cycle MUST be
followed: write a failing test → implement → refactor. Code without tests MUST NOT be merged to
the main branch.

**Rationale**: Tests are the safety net that makes confident refactoring possible and prevents
regressions as the codebase grows.

### IV. File Organization & Component Architecture

No source file MUST exceed 300 lines. Code MUST be split into focused, single-responsibility
files. Components MUST be classified as either:

- **Global**: reused across 2 or more pages → live under `components/` (or `src/components/`).
- **Page-specific**: used only within one page context → co-locate under
  `pages/[page-name]/components/` (or equivalent).

Business logic MUST NOT live inside components — it belongs in services, hooks, or utility
modules. Each file MUST have a single, clear reason to change.

**Rationale**: Small, focused files are easier to review, test, and reason about. Clear
component boundaries prevent accidental coupling between pages.

### V. Performance & Data Freshness

The UI MUST always reflect the current application state. After any mutation (update or insert),
the local state or cache MUST be updated optimistically or invalidated immediately — stale reads
are not acceptable. Unnecessary network requests MUST be avoided: data already held in memory
MUST NOT be re-fetched unless explicitly invalidated. Pagination, lazy loading, and memoization
MUST be applied where datasets are large or computations are expensive.

**Rationale**: Users expect instant feedback. Redundant requests waste server resources, increase
latency, and degrade user experience.

### VI. Layout Consistency (NON-NEGOTIABLE)

Every screen, page, and component MUST follow the established layout rules — spacing, grid,
breakpoints, and typography scale — as defined in the project's design system or layout
specification. Deviations MUST be explicitly justified and approved before implementation.
Hard-coded pixel values MUST NOT appear where a design token or layout variable exists.

**Rationale**: Consistent layout builds user trust and reduces the cognitive overhead of
reviewing visual changes.

## Code Quality Standards

- Global utility functions MUST be catalogued in `.specify/memory/global-functions.md` with
  function signature, purpose, and a usage example. This file is the canonical reference — if a
  reusable function is not listed there, it is a candidate for extraction and registration.
- Before writing a new utility function, the developer MUST search `global-functions.md` to
  confirm an equivalent does not already exist.
- Code reviews MUST verify:
  - No duplicated logic or functions.
  - Types are in their own dedicated files.
  - Tests are present and passing.
  - No file exceeds 300 lines.
  - Components are correctly classified as global or page-specific.
- Static analysis (linting + type checking) MUST pass before any merge.
- Complexity MUST be justified. A pattern that requires explanation beyond its name MUST either
  be simplified or accompanied by a single-line "why" comment explaining the non-obvious
  constraint.

## Development Workflow

1. **Spec-first**: Every feature MUST have a spec (spec.md) before any implementation begins.
2. **Branch per feature**: Work MUST occur on a dedicated feature branch following the project
   naming convention (`###-feature-name`).
3. **Tests before code**: Acceptance tests or unit tests MUST be defined before implementation
   starts (Red phase of TDD).
4. **Global function audit**: When completing a feature, the developer MUST review any new
   utility functions and add eligible ones to `.specify/memory/global-functions.md`.
5. **Performance check**: Before closing a feature branch, the developer MUST verify there are
   no unnecessary re-renders, no redundant API calls, and that optimistic updates are in place
   where mutations occur.
6. **Layout review**: All UI changes MUST be visually reviewed against the layout specification
   before merging.

## Governance

This Constitution supersedes all informal conventions, tribal knowledge, and prior undocumented
practices. All code reviews MUST verify compliance with these six principles. Violations require
a written justification in the pull request description explaining why the deviation is
necessary and what the mitigation plan is.

**Amendment procedure**: Any principle change requires (1) a written proposal identifying the
principle and the proposed change, (2) documented rationale, and (3) a migration plan for
existing non-compliant code when applicable.

**Versioning policy**:
- MAJOR — principle removals, redefinitions, or incompatible governance changes.
- MINOR — new principles or sections, or material expansions of existing guidance.
- PATCH — wording clarifications, typo fixes, non-semantic refinements.

**Compliance review**: Principles MUST be reviewed each quarter or whenever a major new
technology or framework is adopted by the project.

Refer to `CLAUDE.md` for runtime development guidance and tool-specific instructions.

**Version**: 1.0.2 | **Ratified**: 2026-05-19 | **Last Amended**: 2026-05-19
