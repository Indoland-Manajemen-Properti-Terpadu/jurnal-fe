# dashboard

Home screen after login: financial position, receivables and activity at a glance, read only.

- **Route:** `routes.dashboard` (`/dashboard`, `DashboardPage`), rendered inside `AppShellLayout` with footer.
- **Public API (`index.ts`):** `DashboardPage` and `usePendingChangesCount`. The header (`src/components/HeaderNav`) deep-imports the hook from `presentation/hooks/useDashboardQueries` instead of the index: importing the index from a shared component would close an import cycle through the page (page, `AppShellLayout`, `HeaderNav`). The import stays in the lint baseline as a shared-component-to-feature dependency.
- **Endpoints** (`infrastructure/dashboardApi.ts`, `DASHBOARD_ENDPOINTS`, all `GET`): `/v1/reports/balance-sheet`, `/v1/sales` (page 1, limit 100), `/v1/pending-changes/count`, `/v1/accounting-periods`, `/v1/journal/audit-logs`, `/v1/contacts` (limit 1, only for the total).

## Layers

- `domain/`: `dashboardTypes.ts`; `dashboardMetrics.ts` (KPIs, 6 month trend, receivable aging, top debtors, cash and bank accounts, financial health); `dashboardTotals.ts` (trend, aging and composition totals used by widgets); `dashboardMoney.ts` (cent rounding and sums on `@/lib/money`).
- `infrastructure/`: `dashboardDto.ts` (raw API shapes), `dashboardMapper.ts` (every number parse and the cent rounding), `dashboardApi.ts` (calls).
- `presentation/`: `pages/DashboardPage.tsx` (composition), `components/` (one file per widget, `dashboard.module.css` shared, `dashboardFormat.ts` display formatters), `hooks/useDashboardQueries.ts`.

## Domain rules

- Amounts are rounded half up to the cent in the mapper and summed in integer cents (`sumAmounts`, `subtractAmounts`), so decimal data never shows float artefacts; whole-rupiah data is unchanged (characterization tests). Non-number amounts become 0.
- Open invoice: remaining amount above 0 and status not `DRAFT` or `VOID`. Overdue: open with a due date before today. Aging buckets: not due, 1-30, 31-60, over 60 days late.
- Cash is the sum of current-asset lines with category `KB`. The balance sheet is balanced when assets equal liabilities plus equity to the cent (always balanced while there is no data).
- Ratios (collection rate, equity, liability and cash share, donut shares) are presentation-only percentages and are not rounded to money.

## State

Server data only, TanStack Query (`dashboardKeys`, stale time 60 s). The refresh button invalidates `dashboardKeys.all`. Errors from `apiClient` reach the query hooks; a failed widget shows its empty state, not a spinner.

## i18n

Namespace `dashboard` (`id` and `en`); `src/i18n/locales/dashboard.test.ts` checks identical keys, placeholders and no empty values. Month labels come from `getMonthlyTrend(..., lang)`.

## Known gaps

- `SpatialFinancialCanvas`, `ActionBanner` and `SectionHeader` are not used by the page (`spatialMode` is fixed to `false`). They are kept, split under 400 lines, until a product decision to ship or delete them.
- `getReceivableAging` and `getTopDebtors` keep Indonesian default labels for callers that pass none; the page always passes translated ones.
- Currency and date formats use fixed `id-ID` number formatting (dates follow the language).
- A sum beyond about 90 trillion rupiah would exceed safe integer cents and throw.

## Financial figures (2026-10-31)

- **Net working capital** is current assets minus current liabilities. Current liabilities are all balance sheet liabilities except long-term ones (category `KJP`, or a name containing "panjang"); without line detail the total liabilities are used.
- **Monthly sales** (the revenue tile) sums net sales, the invoice subtotal minus the discount, before VAT and before withholding. The invoice total is only the fallback when the API sends no subtotal.
