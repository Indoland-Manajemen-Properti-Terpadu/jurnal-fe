# budgeting

Placeholder module for budget planning. It renders `BaseModulePage` with a title and the active route; there is no domain logic, endpoint or state yet.

- **Route:** `routes.budgeting.planning` (`/budget-planning`)
- **Page:** `presentation/pages/BudgetPlanningPage.tsx`, exported from `index.ts`
- **i18n namespace:** `budgeting` (`id` primary, `en`)
- **Endpoints / state:** none
- **Related, not owned here:** `/setting-budget/budget-management` and the budget income statement are served by the `reports` module (`BudgetManagementPage`, `IncomeStatementBudgetPage`). `routes.SettingBudget.BudgetIS` is an orphan constant (see `docs/migration/BASELINE.md`).
- **Known gaps:** the feature itself awaits a product decision.
