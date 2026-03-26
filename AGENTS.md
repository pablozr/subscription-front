# AGENTS Guide

This file is for coding agents working in `subscription-front`.
Follow it as the operational baseline for edits, tests, and delivery.

## Project Snapshot

- Framework: Angular 19, standalone components, lazy route loading.
- UI stack: PrimeNG 19, PrimeFlex, PrimeIcons, SCSS.
- Language: TypeScript (strict mode enabled).
- Test stack: Karma + Jasmine via Angular CLI.
- Package manager/scripts: npm.

## Rule Sources Checked

- Checked `.cursor/rules/`: not present.
- Checked `.cursorrules`: not present.
- Checked `.github/copilot-instructions.md`: not present.
- Existing guidance source found: `README.md`.
- Existing style/format signal found: `.editorconfig`.

## Working Agreements For Agents

- Prefer minimal, targeted changes over broad refactors.
- Do not rewrite unrelated files.
- Keep existing project architecture and naming patterns.
- Preserve standalone-component approach.
- Preserve PrimeNG + token-based styling approach.

## Additional Source: docs/

Primary design/architecture document found:

- `docs/frontend-system-design.md`

Apply these directives while coding:

- Build with Angular standalone components only.
- Keep feature logic inside `src/app/modules/<domain>/`.
- Keep one page per module; use query params for module-internal modes.
- Keep app shell thin (`app.config`, `app.routes`, `app.component*` only for global wiring).
- Use `BehaviorSubject` + observable streams for shared/session state when needed.
- Keep pages as orchestrators; move HTTP/business logic to services.
- Keep domain components input/output driven and reusable inside the domain.
- Prefer service-level normalization over leaking raw API blobs into templates.

Visual/product language from docs to preserve:

- Favor calm density and clear hierarchy (spacing, type, contrast, motion).
- Avoid generic/symmetrical “template-like” dashboards by default.
- Prefer token-driven styling; avoid hardcoded one-off colors and sizes.
- Use layered surfaces (soft borders, restrained shadows, subtle elevation).
- Keep motion purposeful (short, subtle, accessible; respect reduced motion).
- Ensure mobile keeps hierarchy (collapse complexity, not structure).

Non-negotiables from docs:

- No feature logic in app shell.
- No NgModule-driven feature architecture.
- No multiple page components inside one domain module unless architecture changes.
- No heavy black shadows, noisy gradients, or thick-border-first hierarchy.

## Setup And Core Commands

- Install deps: `npm install`
- Start dev server: `npm start`
- Build production bundle: `npm run build`
- Build in watch/dev mode: `npm run watch`
- Run all tests (watch mode): `npm test`

## Test Commands (Including Single Test)

- Run all tests once (CI-style): `npm test -- --watch=false`
- Run with coverage: `npm test -- --watch=false --code-coverage`
- Run one spec file:
  - `npm test -- --watch=false --include src/app/app.component.spec.ts`
  - `npm test -- --watch=false --include src/app/modules/global/components/sidebar/sidebar.component.spec.ts`
- Run a group of specs by glob:
  - `npm test -- --watch=false --include src/app/modules/global/services/**/*.spec.ts`
- Exclude tests by glob:
  - `npm test -- --watch=false --exclude src/app/modules/global/pages/**/*.spec.ts`

Notes:

- Angular CLI in this repo supports `--include` and `--exclude` for test selection.
- Paths for `--include` are relative to project root.
- If `npm test` hangs locally, you probably forgot `--watch=false`.

## Lint / Formatting Status

- There is currently no configured lint target in `angular.json`.
- `npx ng lint` fails with: cannot find `lint` target.
- There is no ESLint config file in repo root.
- Therefore, rely on existing code patterns + `.editorconfig`.

## Formatting Conventions

From `.editorconfig` and current codebase patterns:

- Indentation: 2 spaces.
- Charset: UTF-8.
- Trim trailing whitespace: yes (except Markdown).
- Insert final newline: yes.
- TypeScript quote preference: single quotes.
- Keep lines readable; avoid dense one-liners.
- Match the touched file's prevailing semicolon style.
  - Many files use no semicolons.
  - Some scaffolded files still contain semicolons.
  - Do not mix styles heavily within one file.

## Architecture Conventions

- Main app wiring:
  - `src/app/app.config.ts`
  - `src/app/app.routes.ts`
  - `src/app/app.component.*`
- Domain code is under `src/app/modules/`.
- Shared/global domain lives in `src/app/modules/global/`.
- Expected domain structure:
  - `pages/` for route-level orchestrator views.
  - `components/` for reusable UI parts.
  - `services/` for business logic and API access.
  - `interfaces/` for TypeScript contracts.

Routing:

- Use `loadComponent` lazy imports in `app.routes.ts`.
- Route guards use `canActivate` pattern (see `AuthService`).
- For sub-areas, project may use query params (`target`) instead of extra top-level routes.

## Angular / TypeScript Style

- Prefer `inject()` over constructor injection for services in components/services.
- Use `standalone: true` for components.
- Keep component `imports` explicit and minimal.
- Keep public API typed; avoid `any` unless unavoidable.
- Prefer interfaces for structured payloads.
- Interface names use `I` prefix (e.g., `IUser`, `ISigninData`).
- Class names: PascalCase.
- Selectors: `app-...`.
- File/folder names: kebab-case.

Imports:

- Keep imports grouped logically:
  1) Angular/core + Angular platform/router/forms/common.
  2) Third-party libraries (PrimeNG, RxJS, etc.).
  3) Local project imports.
- Keep import lists sorted in a stable, readable order.
- Remove unused imports immediately.

## Error Handling And Async Patterns

- Existing services often wrap `HttpClient` observables in `Promise`.
- Preserve this pattern unless doing a deliberate migration.
- On API failures:
  - Resolve with safe fallback values (`false`, `[]`, `null`) when expected by callers.
  - Show user-facing feedback via `AppToastService` when appropriate.
- Avoid throwing uncaught errors from UI-triggered flows.
- Keep error messages actionable and concise.

## UI / Styling Conventions

- Use SCSS for component styles.
- Prefer global CSS variables/tokens from `src/styles.scss`.
- Support both light mode and `.my-app-dark` mode.
- Avoid hardcoded colors when a token exists.
- Keep PrimeNG overrides scoped and intentional (`:host ::ng-deep` only when needed).
- Maintain responsive behavior for desktop and mobile.
- Preserve typography baseline (`Poppins`) unless feature requires otherwise.

## Sidebar/Header Specific Guidance

- Sidebar route definitions live in `sidebar.component.ts` (`availableRoutes`).
- When adding routes, include icon, access roles, and query behavior consistently.
- Header/sidebar icon alignment is sensitive; verify visually after CSS edits.
- Keep footer actions in sidebar anchored via existing layout strategy.

## Testing Conventions

- Specs are colocated as `*.spec.ts` files.
- Use Angular `TestBed` for component/service tests.
- Keep tests deterministic and isolated.
- For UI tweaks, at minimum run impacted spec(s) or full test suite once.
- For structural changes, run `npm run build` plus tests.

## Pre-PR / Pre-Commit Checklist For Agents

- Run `npm run build` and ensure success.
- Run targeted tests (or all tests if broad changes).
- Confirm no unresolved TypeScript errors.
- Remove dead code/imports introduced by your edit.
- Keep diffs focused; avoid opportunistic cleanup unrelated to the task.

## Known Gaps / Cautions

- No lint automation is currently enforced.
- Mixed historical formatting exists; prioritize local consistency.
- Some service methods still use broad types (`any`); tighten types when safe.

When uncertain, follow existing nearby patterns and keep changes small, typed, and verifiable.
