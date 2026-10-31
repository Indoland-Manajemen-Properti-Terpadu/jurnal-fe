# reports

Financial reports: a catalog page and ten report pages (balance sheet, general ledger, trial balance, income statement, income statement vs budget, cash flow, journal entry log, equity changes, business summary, budget management). Formerly `ResultReport`.

## Routes (`src/router/routes.ts`)

| Constant                                                          | Path                                                         | Page                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `resultReport.main`                                               | `/result-reports`                                            | `ReportCatalogPage`                              |
| `resultReport.balanceSheet`                                       | `/result-reports/business-overview/balance-sheet`            | `BalanceSheetPage`                               |
| `resultReport.generalLedgerReport`                                | `.../general-ledger`                                         | `GeneralLedgerPage`                              |
| `resultReport.trialBalance`                                       | `.../trial-balance`                                          | `TrialBalancePage`                               |
| `resultReport.incomeStatement`                                    | `.../income-statement`                                       | `IncomeStatementPage`                            |
| `resultReport.incomeStatementBudget`                              | `.../income-statement-budget`                                | `IncomeStatementBudgetPage`                      |
| `resultReport.cashFlow`                                           | `.../cash-flow`                                              | `CashFlowPage`                                   |
| `resultReport.journalEntry`                                       | `.../journal-entry`                                          | `JournalEntryReportPage`                         |
| `resultReport.businessSummary`                                    | `.../business-summary`                                       | `BusinessSummaryPage`                            |
| `resultReport.equityChanges`                                      | `.../equity-changes`                                         | `EquityChangesPage`                              |
| `resultReport.budgetManagement`, `SettingBudget.BudgetManagement` | `.../budget-management`, `/setting-budget/budget-management` | `BudgetManagementPage` (same page on both paths) |

`resultReport.legacyBusinessSumary` (`.../business-sumary`, the old misspelling) redirects to `businessSummary`. `resultReport.businessOverview` has no page and is a known orphan in `routes.test.ts`. `index.ts` exports the eleven pages.

## Endpoints

- `REPORT_ENDPOINTS` in `infrastructure/reportEndpoints.ts`: `/v1/report/{journal-entry,balance,income-statement,trial-balance,equity-changes}` (absolute with `BASE_URL`), plus `/download` variants for income statement and equity changes (`REPORT_EXPORT_ENDPOINTS`).
- `balanceSheetApi`: `/v1/reports/balance-sheet`, `/v1/reports/balance-sheet/export/:type`, falling back to `/v1/report/balance/download` when the export fails.
- `generalLedgerApi`: `/v1/general-ledger`, `/v1/general-ledger/export/:type`.

## Layers

- `domain/`: report types (`balanceSheet`, `balanceSheetReport`, `generalLedger`, `TrialBalanceReport`, `JournalEntry`, `IncomeStatement`, `EquityChange`), `reportFormat` (money and date display, period presets) and `journalEntryTotals`, with tests.
- `infrastructure/`: `balanceSheetApi` + `balanceSheetMapper`, `generalLedgerApi` + `generalLedgerMapper`, `businessOverviewApi` (the five report fetches), `exportReport` (download and save a file), `reportEndpoints`, `reportValue` (`safeNumber`, `safeString`, `asRecord`, `asArray`).
- `presentation/`: pages, components grouped per report (`shared`, `balance-sheet`, `general-ledger`, `catalog`, ...), hooks (`useBalanceSheet`, `useGeneralLedger`, one `use*Report` per business-overview report, `usePeriodOptions`). The catalog data (`catalog/reportCatalogData.ts`) lives here because it holds icon components.

## Domain rules

- `safeNumber` reads numbers and numeric strings (`parseFloat`); anything else is 0.
- Balance sheet: a section total from the server that is `0` or missing is replaced by the sum of its items; the grand totals (`totalAssets`, `totalLiabilities`, `totalEquity`) use the server value only when the payload is wrapped in `data` and the field is not null (so a server `0` stays `0`). A flat liabilities list is split by category name: names containing "panjang" are long-term, the rest current. The sheet is balanced when assets and liabilities plus equity differ by less than 0.01.
- Journal entry totals (`calcJournalEntryTotals`, also used for the PDF export) round each line half up to the cent and add whole cents with `@/lib/money`.
- Period presets (`getPresetDateRange`): this month, last month, this quarter, this year, custom (defaults to this month).

## State

TanStack Query. Keys: `balance-sheet-report`, `general-ledger`, `balance_sheet_report`, `income_statement_report`, `trial_balance_report`, `equity_change_report`, `journal_entry_report`. Filters are local component state; nothing is persisted.

## i18n

Namespace `reports` (`id` and `en`), composed from `reportsCommon`, `reportsCatalog`, `reportsBalanceSheet`, `reportsLedger` and `reportsStatements`, with a key-parity test in `src/i18n/locales/reports.test.ts`. Period preset values ('All Period', 'Today', ...) are logic keys and stay literal; `usePeriodOptions` translates only their labels.

## Known gaps

- A failed report request rejects, so the trial balance, income statement and equity pages show their error state (not found); the journal entry report and balance sheet summary show their empty state because they have no error branch yet.
- Cash flow, business summary, income statement budget and budget management are placeholder pages: their tables show fixed sample numbers and sample dates (`19 Sept 2021`, `Budget Testing 1`), and `BusinessSummaryTable` and `CashFlowTable` call `useJournalAccounts()` without using the result (kept to preserve the request). The "Business Sumary Report" title keeps its typo because it is visible text.
- English-only legacy text (cash flow and summary rows, journal, equity and budget tables) has the same English value in `id` and `en`; real Indonesian copy is a product decision.
- Export failures on the income statement and equity changes pages still use `alert` (3 `no-alert` and 1 `new-cap` for `jsPDF` remain in the lint baseline).
- `GeneralLedgerPage` (report, `/v1/general-ledger`) and `account-ledger` (per account, M3) show overlapping data from different endpoints.
- No component tests; pages need a session and a live API.
