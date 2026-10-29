# Quality Baseline

Recorded on 2026-10-29 at commit `94fe9ca` (`develop-frontend`, identical to `main-frontend`), before Milestone 0 changes. Numbers below are the reference every later milestone is measured against.

## Before Milestone 0

| Check | Command | Result |
|---|---|---|
| Typecheck | `yarn typecheck` | passes |
| Build | `yarn build` | passes; one JS chunk of 2.6 MB (gzip 748 kB), no code splitting |
| Unit tests | `yarn vitest` | 5 files pass (18 tests); 1 file fails: `src/components/Button/tests/Button.test.tsx` contains an empty `describe` ("No test found in suite") |
| ESLint | `npx eslint . --ext .ts,.tsx -f json` | 3433 errors, 46 warnings over 508 files; `eslint --cache` crashes with `TypeError: Keyv is not a constructor` |
| Stylelint | `yarn lint:stylelint` | 48 errors (33 auto-fixable) |
| Prettier | `npx prettier --check "src/**/*.{ts,tsx}"` | 224 files not formatted |
| Storybook | `yarn storybook:build` | fails before and after M0: `.storybook/preview.tsx` imports `theme` from `src/theme.ts`, which does not export it. Not a regression; needs a decision (fix or retire Storybook). Also prompts interactively for telemetry unless `STORYBOOK_DISABLE_TELEMETRY=1`. |
| Production deploy | GitHub Actions "Build & Deploy Frontend" | image build and push succeed; the SSH deploy step fails on the 12 most recent runs (connection times out after about 30 s), latest run id `39580303882` |

### ESLint breakdown (top rules)

Formatting rules that duplicate Prettier account for about 2600 of the errors (`react/jsx-indent-props` 1073, `@typescript-eslint/quotes` 632, `linebreak-style` 178, `max-len` 151, `jsx-quotes` 148, `no-multiple-empty-lines` 118, `@typescript-eslint/semi` 102, `react/jsx-tag-spacing` 72, `comma-dangle` 46, and smaller ones). The semantic remainder is dominated by `@typescript-eslint/no-unused-vars` 454, `import/order` 136 and `arrow-body-style` 104.

## After Milestone 0

Measured on the `chore/m0-foundation` branch (commands in the table above, ESLint run through the ratchet).

| Check | Result |
|---|---|
| Typecheck | passes |
| Build | passes; main JS chunk still 2.6 MB (code splitting is not part of the restructure) |
| Unit tests | 9 files, 108 tests, all pass (was 6 files, 1 failing) |
| ESLint | ratchet baseline total 1370 findings across 40+ rules, including rules added in M0 (the old 3433 errors were mostly formatting rules now owned by Prettier). Semantic debt is unchanged except `no-unused-vars` 454 to 451 and `import/order` 136 to 128 |
| Stylelint | 0 errors (was 48) |
| Prettier | changed files must be formatted (CI); 212 files in `src` still unformatted, each fixed in its feature's migration PR |
| Storybook | still fails (pre-existing, see above) |
| Deploy (SSH step) | not touched; still failing |

### Debt made visible by the new guardrails (ratchet baseline)

| Rule | Count | Meaning |
|---|---|---|
| `import/no-cycle` | 190 | circular imports; first visible once the `@/` alias resolver was added |
| `@typescript-eslint/no-explicit-any` | 204 | `any` usages |
| `import/no-restricted-paths` | 49 | cross-feature deep imports and `components` importing a feature |
| `max-lines` | 35 | files over 400 lines |
| `no-console` | 17 | `console.log` and similar |
| `no-restricted-imports` | 16 | `axios` outside infrastructure, `../../..` chains |
| `parse-error` | 1 | one file ESLint cannot parse |

Each migration PR is expected to lower these numbers; the baseline can never go up.

## After Milestone 1 (ten modules) and the accounting kernel

Measured on `develop-frontend` on 2026-10-29. Migrated: `costs`, `production`, `fulfillment`, `budgeting`, `landing`, `profile`, `pending-changes`, `purchases`, `assets`, `products`. Not yet: `contacts`, `sales`, `dashboard` (R3).

| Metric | After M0 | Now |
|---|---|---|
| ESLint ratchet total | 1370 | 1040 |
| `import/no-cycle` | 190 | 13 (the `apiClient` to router cycle was broken) |
| `no-explicit-any` | 204 | 183 |
| `no-unused-vars` | 451 | 402 |
| `import/no-restricted-paths` | 49 | 37 |
| `max-lines` | 35 | 27 |
| Test files | 10 | 50 |

Deploy: the SSH step still fails for `staging` and `main-frontend` (server side, see above). R1 was promoted to `staging` (PR #15); the image builds and pushes, the container is not updated.

## After Milestone 3 (ledger, R2)

Measured on `develop-frontend` on 2026-10-30. `src/module/GeneralJournal` is gone; the seven ledger modules are `chart-of-accounts`, `journal-entries`, `account-ledger`, `bank-statements`, `reconciliation`, `beginning-balances`, `period-closing`, on the accounting kernel `src/lib/accounting`. Not yet: `sales`, `dashboard`, `contacts` (R3).

| Metric | After M1 | Now |
|---|---|---|
| ESLint ratchet total | 1040 | 666 |
| `import/no-cycle` | 13 | 9 |
| `no-explicit-any` | 183 | 98 |
| `no-unused-vars` | 402 | 277 |
| `import/no-restricted-paths` | 37 | 12 |
| `max-lines` | 27 | 16 |
| `no-console` | n/a | 7 |
| Test files | 50 | 89 |

Not enforced today and left for a decision (see the M3 plan): closed-period or lock-date check, account code uniqueness, posting to header or archived accounts, journal edit or reversal, opening-balance cut-off, double counting of parent and child accounts in beginning balances, and the `period-closing` prototype that has no backend.

## Out of scope for Milestone 0

- The SSH deploy failure is a server-side or secret problem, not a code problem. It needs whoever owns the deployment server. Until it is fixed, a merge to `main-frontend` builds and publishes the image but does not update the running container.

## Needs decision

- Route constants `routes.SettingBudget.BudgetIS` (`/setting-budget/budget-IS`) and `routes.resultReport.businessOverview` (`/result-reports/business-overview`) have no page and no references; opening those URLs shows the not-found page. They are allow-listed in `src/router/routes.test.ts`. Build the page or delete the constant in the owning milestone (M2 `reports`; M1 `budgeting` found the old `SettingBudget` page unreferenced and removed it).
