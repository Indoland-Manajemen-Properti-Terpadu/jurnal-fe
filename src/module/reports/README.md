# reports

Financial reports: a catalog page and ten report pages (balance sheet, general ledger, trial balance, income statement, income statement vs budget, cash flow, journal entry log, equity changes, business summary, budget management). Formerly `ResultReport`.

## Routes (`src/router/routes.ts`)

| Constant                                                 | Path                                                         | Page                                             |
| -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `reports.main`                                           | `/result-reports`                                            | `ReportCatalogPage`                              |
| `reports.balanceSheet`                                   | `/result-reports/business-overview/balance-sheet`            | `BalanceSheetPage`                               |
| `reports.generalLedger`                                  | `.../general-ledger`                                         | `GeneralLedgerPage`                              |
| `reports.trialBalance`                                   | `.../trial-balance`                                          | `TrialBalancePage`                               |
| `reports.incomeStatement`                                | `.../income-statement`                                       | `IncomeStatementPage`                            |
| `reports.incomeStatementBudget`                          | `.../income-statement-budget`                                | `IncomeStatementBudgetPage`                      |
| `reports.cashFlow`                                       | `.../cash-flow`                                              | `CashFlowPage`                                   |
| `reports.journalEntries`                                 | `.../journal-entry`                                          | `JournalEntryReportPage`                         |
| `reports.businessSummary`                                | `.../business-summary`                                       | `BusinessSummaryPage`                            |
| `reports.equityChanges`                                  | `.../equity-changes`                                         | `EquityChangesPage`                              |
| `reports.budgetManagement`, `budgeting.budgetManagement` | `.../budget-management`, `/setting-budget/budget-management` | `BudgetManagementPage` (same page on both paths) |

`legacyPaths.reportsBusinessSumary` (`.../business-sumary`, the old misspelling) redirects to `reports.businessSummary`. `index.ts` exports the eleven pages.

## Endpoints

- `REPORT_ENDPOINTS` in `infrastructure/reportEndpoints.ts`: `/v1/report/{journal-entry,balance,income-statement,trial-balance,equity-changes}` (absolute with `BASE_URL`), plus `/download` variants for income statement and equity changes (`REPORT_EXPORT_ENDPOINTS`).
- `balanceSheetApi`: `/v1/reports/balance-sheet`, `/v1/reports/balance-sheet/export/:type`, falling back to `/v1/report/balance/download` when the export fails.
- `generalLedgerApi`: `/v1/general-ledger`, `/v1/general-ledger/export/:type`. The ledger endpoint pages the accounts (`page`, `limit`: 20 by default, 100 at most; `pagination.totalAccounts` and `totalPages` come back) and accepts nothing else (no search or filter). `periodDebitTotal` and `periodCreditTotal` cover the whole ledger, while the per-account `periodDebit` and `periodCredit` of a parent account (`isHead`) already include its sub accounts, so never add the accounts up. Heavy periods can answer 504; keep the page size small.

## Layers

- `domain/`: report types (`balanceSheet`, `balanceSheetReport`, `generalLedger`, `TrialBalanceReport`, `JournalEntry`, `IncomeStatement`, `EquityChange`), `reportFormat` (money and date display, period presets) and `journalEntryTotals`, with tests.
- `infrastructure/`: `balanceSheetApi` + `balanceSheetMapper`, `generalLedgerApi` + `generalLedgerMapper`, `businessOverviewApi` (the five report fetches), `exportReport` (download and save a file), `reportEndpoints`, `reportValue` (`safeNumber`, `safeString`, `asRecord`, `asArray`).
- `presentation/`: pages, components grouped per report (`shared`, `balance-sheet`, `general-ledger`, `catalog`, ...), hooks (`useBalanceSheet`, `useGeneralLedger`, one `use*Report` per business-overview report, `usePeriodOptions`). The catalog data (`catalog/reportCatalogData.ts`) lives here because it holds icon components.

## Domain rules

- `safeNumber` reads numbers and numeric strings (`parseFloat`); anything else is 0.
- Balance sheet: a section total from the server that is `0` or missing is replaced by the sum of its items; the grand totals (`totalAssets`, `totalLiabilities`, `totalEquity`) use the server value only when the payload is wrapped in `data` and the field is not null (so a server `0` stays `0`). A flat liabilities list is split by category name: names containing "panjang" are long-term, the rest current. The sheet is balanced when assets and liabilities plus equity differ by less than 0.01.
- Journal entry totals (`calcJournalEntryTotals`, also used for the PDF export) round each line half up to the cent and add whole cents with `@/lib/money`.
- Period presets (`getPresetDateRange`): this month, last month, this quarter, this year, custom (defaults to this month).

## Report screens

- Shared building blocks in `presentation/components/shared/`: `ReportToolbar` (period presets, from and to dates, print, export, plus an `extra` slot for the view switch or search; the balance sheet and general ledger filter bars are thin wrappers around it), `ReportKpiStrip` (a status line plus one card per figure, with an optional ring or bar and a wide footer card), `ReportStatus` (a dot and a line of text instead of a badge), `ReportRing` (small progress ring), `ReportBackButton` (header action back to the report center; the balance sheet, general ledger and `ReportPageHeader` pages use it), `ReportUnavailable` (what a report shows when its data cannot be loaded) and `ReportShared.module.css`.
- The catalog (`ReportCatalogPage`) groups reports into three sections (financial statements, ledgers and journals, budget and analysis). `ReportItem.status` is `ready` for a report that reads real data and `soon` otherwise; `soon` cards carry a "Segera hadir" chip and sort after the ready ones. Flip the status when a report gets its data.
- The balance sheet is one layout: insights (funding structure, asset composition by category), then assets, liabilities and equity as one column; the side-by-side and vertical switch was removed. Balance sheet groups are collapsible (`BalanceSheetAccountTable`): the header keeps the subtotal, negative balances show in parentheses. Colours: brand blue and neutral only; red is kept for negative balances and an unbalanced check.

## General ledger screen

Accounts load one server page at a time (`useGeneralLedger` keeps `page`, with `keepPreviousData`). The summary shows the account total from `pagination` and the whole-ledger debit and credit with a two-bar comparison (`DebitCreditBars`, a ring for the match rate). Under it, `GeneralLedgerAccountsTable` lists every account of the page as one row (debit/credit mix bar, opening, debit, credit, closing); a row opens (Mantine `Accordion`, body rendered only while open) to `GeneralLedgerAccountBody`: a balance trend (`BalanceTrendChart`), the debit/credit bars per day or per month (`MovementBars`, `pickGranularity`), both drawn in SVG/CSS from `domain/generalLedgerInsights` (no chart library), and the movement table (search, sort, 25 rows per page). The search above the table only filters the accounts of the loaded page. There is no account picker or view switch.

## State

TanStack Query. Keys: `balance-sheet-report`, `general-ledger`, `balance_sheet_report`, `income_statement_report`, `trial_balance_report`, `equity_change_report`, `journal_entry_report`. Filters are local component state; nothing is persisted.

## i18n

Namespace `reports` (`id` and `en`), composed from `reportsCommon`, `reportsCatalog`, `reportsBalanceSheet`, `reportsLedger` and `reportsStatements`, with a key-parity test in `src/i18n/locales/reports.test.ts`. Period preset values ('All Period', 'Today', ...) are logic keys and stay literal; `usePeriodOptions` translates only their labels.

## Known gaps

- The live API has no `/v1/report/{journal-entry,income-statement,trial-balance,equity-changes}` (they answer 404; only `/v1/reports/balance-sheet` and `/v1/general-ledger` exist in the Postman collection), so those four pages always show `ReportUnavailable`. Their tables and exports are untouched and need the endpoints before they can be checked against real data.
- Cash flow, business summary, income statement budget and budget management are placeholder pages: their tables show fixed sample numbers and sample dates (`19 Sept 2021`, `Budget Testing 1`), and `BusinessSummaryTable` and `CashFlowTable` call `useJournalAccounts()` without using the result (kept to preserve the request). The "Business Sumary Report" title keeps its typo because it is visible text.
- English-only legacy text (cash flow and summary rows, journal, equity and budget tables) has the same English value in `id` and `en`; real Indonesian copy is a product decision.
- Export failures on the income statement and equity changes pages still use `alert` (3 `no-alert` and 1 `new-cap` for `jsPDF` remain in the lint baseline).
- `GeneralLedgerPage` (report, `/v1/general-ledger`) and `account-ledger` (per account, M3) show overlapping data from different endpoints.
- No component tests; pages need a session and a live API.
