# Architecture

Jurnal ProApps is a React 18 + TypeScript (strict) single-page app built with Vite, Mantine 8, TanStack Query 5 and Zustand. It talks to the ProApps API through one shared HTTP client.

## Layout

```text
src/
  module/       feature modules, one folder per feature (kebab-case, English)
  components/   shared UI with no feature knowledge
  lib/          http client (lib/http), money helper (lib/money), core utilities
  hooks/        shared hooks
  store/        client state shared across features (auth, api loading)
  i18n/         locales and the useTranslation hook
  theme/        design tokens
  router/       route table and route constants
```

The target layout and the migration status of each feature are in [migration/STATUS.md](migration/STATUS.md). Legacy folders (`Contact`, `GeneralJournal`, ...) coexist with the target layout until their migration PR lands.

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

## State ownership

| State | Owner |
|---|---|
| Server data, request lifecycle, caching, invalidation | TanStack Query, hooks next to the feature |
| Client state shared across pages | Zustand store in the feature's `presentation/stores`, or `src/store` when shared across features |
| Local input and view state | React or Mantine form state |

Server responses are never mirrored in Zustand. Financial mutations are not optimistic.

## HTTP

All HTTP goes through `src/lib/http/apiClient.ts` (Bearer token, 401 refresh with a request queue, redirect to login, global loading bar), called only from a feature's `infrastructure/`. The legacy helpers `get/post/put/del/patch` return `error.response` or `null` on failure and are `@deprecated`; migrated code uses the default `apiClient` and handles errors explicitly. Responses use the envelope `{ code, message, data, pagination? }`.

## Money

Money math uses integer minor units through `src/lib/money` (`toMinor`, `fromMinor`, `sumMinor`). See [ADR 0005](adr/0005-integer-money-and-localstorage-tokens.md) and [migration/money-audit.md](migration/money-audit.md).

## Guardrails (enforced in CI)

| Rule | Where | Enforced by |
|---|---|---|
| No cross-feature internals | `.eslintrc.cjs` zones generated from `src/module/*` | `import/no-restricted-paths` |
| Domain does not import presentation or infrastructure | per-feature zones | `import/no-restricted-paths` |
| Shared components do not import features | `src/components` zone | `import/no-restricted-paths` |
| Axios only in infrastructure and `lib` | overrides in `.eslintrc.cjs` | `no-restricted-imports` |
| No `../../../` chains | pattern | `no-restricted-imports` |
| No `any`, no `console.log`, files at most 400 lines | rules | `@typescript-eslint/no-explicit-any`, `no-console`, `max-lines` |
| Every route constant resolves to a page | `src/router/routes.test.ts` | Vitest |

Existing violations are counted in [migration/eslint-baseline.json](migration/eslint-baseline.json). `npm run lint:ratchet` fails when any rule's count rises. When a migration lowers counts, run `node scripts/eslintRatchet.mjs --write-baseline` and commit the new baseline; reviewers must reject a baseline that goes up.

Formatting is owned by Prettier. CI checks it on changed files only (`npm run prettier:changed`); a migrated feature is fully formatted in its own PR.
