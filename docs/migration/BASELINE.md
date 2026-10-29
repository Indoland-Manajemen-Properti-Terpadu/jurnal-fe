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
| Production deploy | GitHub Actions "Build & Deploy Frontend" | image build and push succeed; the SSH deploy step fails on the 12 most recent runs (connection times out after about 30 s), latest run id `39580303882` |

### ESLint breakdown (top rules)

Formatting rules that duplicate Prettier account for about 2600 of the errors (`react/jsx-indent-props` 1073, `@typescript-eslint/quotes` 632, `linebreak-style` 178, `max-len` 151, `jsx-quotes` 148, `no-multiple-empty-lines` 118, `@typescript-eslint/semi` 102, `react/jsx-tag-spacing` 72, `comma-dangle` 46, and smaller ones). The semantic remainder is dominated by `@typescript-eslint/no-unused-vars` 454, `import/order` 136 and `arrow-body-style` 104.

## Out of scope for Milestone 0

- The SSH deploy failure is a server-side or secret problem, not a code problem. It needs whoever owns the deployment server. Until it is fixed, a merge to `main-frontend` builds and publishes the image but does not update the running container.

## Needs decision

- Route constants `routes.SettingBudget.BudgetIS` (`/setting-budget/budget-IS`) and `routes.resultReport.businessOverview` (`/result-reports/business-overview`) have no page and no references; opening those URLs shows the not-found page. They are allow-listed in `src/router/routes.test.ts`. Build the page or delete the constant in the owning milestone (M1 `budgeting`, M2 `reports`).
