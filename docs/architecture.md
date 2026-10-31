# Architecture

Jurnal ProApps is a React 18 + TypeScript (strict) single-page app built with Vite, Mantine 8, TanStack Query 5 and Zustand. It talks to the ProApps API through one shared HTTP client.

## Layout

```text
src/
  module/       feature modules, one folder per feature (kebab-case, English)
  components/   shared UI with no feature knowledge (PascalCase folder per component)
  lib/          http client + endpoints (lib/http), money (lib/money), accounting rules (lib/accounting)
  utils/        small pure helpers (camelCase files): formatCurrency, formatDate, dateRange
  constants/    static reference data (banks, Indonesian regions)
  store/        client state shared across features (auth, api loading)
  i18n/         locales and the useTranslation hook
  theme/        design system: tokens, Mantine theme, CSS variables (docs/design-system.md)
  styles/       global CSS and font loading
  assets/       images/{brand,illustrations,auth} (kebab-case names)
  router/       routes.ts (path constants), modules/<feature>.tsx (route objects per module), legacy redirects
public/         favicon and downloadable templates (templates/csv); no mock data
```

The target layout and the migration status of each feature are in [migration/STATUS.md](migration/STATUS.md). Every feature module has been migrated to the layout below (see [migration/AUDIT.md](migration/AUDIT.md)).

## Feature module

```text
src/module/<feature>/
  README.md        purpose, routes, endpoints, domain rules, state, i18n namespace
  index.ts         public API: the only file other features may import
  domain/          entities, value objects, ports, pure accounting rules
  application/     use cases and DTOs
  infrastructure/  endpoints, API DTOs, mappers, repository adapters
  presentation/    pages, components, hooks, stores
```

Create only layers that have real content.

## Dependency direction

```text
presentation -> application -> domain
infrastructure -> domain (implements ports)
app composition root -> everything
```

- Domain and application code does not import React, Mantine, Axios, TanStack Query or Zustand.
- Pages render state and forward intent. They do not call HTTP, build endpoints or contain accounting rules.
- Other features are used only through `@/module/<feature>` (its `index.ts`).
- `src/components` never imports from `src/module`.

## Routes

- Path constants live in `src/router/routes.ts`: one group per feature module, named like the module folder in camelCase (`bankCash`, `chartOfAccounts`, ...), keys `main`, `detail`, `add`, `edit`, then descriptive names. The file never imports a component, so modules can read it without import cycles.
- Each module registers its pages in `src/router/modules/<module>.tsx` (an array of route objects); `src/router/index.tsx` only composes them and adds the not-found route last.
- A public URL is never changed in place: the old path goes to `routes.legacyPaths` and gets a redirect in `src/router/modules/legacy.tsx`. `routes.test.ts` checks that every constant resolves to a page, that no path is used twice and that names are camelCase; `legacyRedirects.test.tsx` checks the redirects.
- To add a route: add the constant, add the route object to the module's file, and list it in the module README.

## View, business logic and data access

- Pages and view components render state, collect input and forward user intent. They never call Axios or fetch, build endpoints, hold accounting rules or coordinate multi-step business workflows.
- Business rules and calculations live in `domain` (or `application` use cases) where they can be tested without rendering React.
- API access, API DTOs, response mapping and repository adapters live in the feature's `infrastructure`. Do not use domain entities as raw API response types; map at the boundary when shapes or meanings differ.
- Presentation hooks adapt domain code to React and TanStack Query. Keep query keys and query hooks inside the feature; pages consume typed results and render loading, empty, error and success states.
- Shared UI and helpers live in the shared folders above. Do not create a second shared-components or API-client directory. Avoid circular dependencies and deep imports across features.

## State ownership

| State                                                 | Owner                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Server data, request lifecycle, caching, invalidation | TanStack Query, hooks next to the feature                                                        |
| Client state shared across pages                      | Zustand store in the feature's `presentation/stores`, or `src/store` when shared across features |
| Local input and view state                            | React or Mantine form state                                                                      |

Server responses are never mirrored in Zustand, and global state is not used for something with one consumer. Mutations give clear pending and failure feedback and block duplicate submits. Financial mutations (journal, ledger, balance) are not optimistic unless correctness and rollback are established for that operation.

## HTTP

All HTTP goes through `src/lib/http/apiClient.ts` (Bearer token, 401 refresh with a request queue, redirect to login, global loading bar), called only from a feature's `infrastructure/`. The client rejects on an HTTP error, so queries report `isError` and mutations their `onError`; there are no error-swallowing helpers (the old `get/post/put/del/patch/download` ones were removed). Responses use the envelope `{ code, message, data, pagination? }`.

## Accounting and money

Ledger rules and money handling are in [accounting.md](accounting.md).

## API integration

- Route all HTTP through the shared client and the feature's infrastructure; never from a page or component.
- Do not guess endpoints, permissions, tenant or site scoping, accounting rules or response shapes. Verify them in backend documentation or an authorized Postman collection; if evidence is missing, state the assumption and ask before building a contract-dependent change.
- Use Postman CLI only for an explicitly in-scope API task and only against the authorized collection and environment.
- Keep credentials and secrets out of source control and logs; do not change token storage or authorization behavior without approval.
- Normalize API errors at the boundary without swallowing useful details; show safe, actionable messages and keep technical detail out of user-facing copy.

## Guardrails (checked by CI on every PR)

| Rule                                                  | Where                                               | Enforced by                                                     |
| ----------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| No cross-feature internals                            | `.eslintrc.cjs` zones generated from `src/module/*` | `import/no-restricted-paths`                                    |
| Domain does not import presentation or infrastructure | per-feature zones                                   | `import/no-restricted-paths`                                    |
| Shared components do not import features              | `src/components` zone                               | `import/no-restricted-paths`                                    |
| Axios only in infrastructure and `lib`                | overrides in `.eslintrc.cjs`                        | `no-restricted-imports`                                         |
| No `../../../` chains                                 | pattern                                             | `no-restricted-imports`                                         |
| No `any`, no `console.log`, files at most 400 lines   | rules                                               | `@typescript-eslint/no-explicit-any`, `no-console`, `max-lines` |
| Every route constant resolves to a page               | `src/router/routes.test.ts`                         | Vitest                                                          |

CI runs these checks on every PR into `develop-frontend`, `staging` and `main-frontend`. They become a hard merge requirement once the required status check is applied to branch protection (see [`.github/branch-protection/README.md`](../.github/branch-protection/README.md)); until then reviewers must not merge a red PR.

Existing violations are counted in [migration/eslint-baseline.json](migration/eslint-baseline.json). `npm run lint:ratchet` fails when any rule's count rises. When a migration lowers counts, run `node scripts/eslintRatchet.mjs --write-baseline` and commit the new baseline; reviewers must reject a baseline that goes up.

Formatting is owned by Prettier. CI checks it on changed files only (`npm run prettier:changed`); a migrated feature is fully formatted in its own PR.
