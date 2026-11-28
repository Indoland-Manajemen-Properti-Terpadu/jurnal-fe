# reports

Financial reports: a catalog page and nine report pages (balance sheet, general ledger, trial balance, income statement, income statement vs budget, cash flow, equity changes, business summary, budget management). Formerly `ResultReport`.

## Routes (`src/router/routes.ts`)

| Constant                                                 | Path                                                         | Page                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `reports.main`                                           | `/result-reports`                                            | `ReportCatalogPage`                                                         |
| `reports.balanceSheet`                                   | `/result-reports/business-overview/balance-sheet`            | `BalanceSheetPage`                                                          |
| `reports.generalLedger`                                  | `.../general-ledger`                                         | `GeneralLedgerPage`                                                         |
| `reports.trialBalance`                                   | `.../trial-balance`                                          | `TrialBalancePage`                                                          |
| `reports.incomeStatement`                                | `.../income-statement`                                       | `IncomeStatementPage` (profit and loss)                                     |
| `reports.incomeStatementBudget`                          | `.../income-statement-budget`                                | `IncomeStatementBudgetPage`                                                 |
| `reports.cashFlow`                                       | `.../cash-flow`                                              | `CashFlowPage`                                                              |
| `journalEntries.main` (module `journal-entries`)         | `.../journal-entry`                                          | `JournalHistoryPage`, the real general journal; the catalog card links here |
| `reports.businessSummary`                                | `.../business-summary`                                       | `BusinessSummaryPage`                                                       |
| `reports.equityChanges`                                  | `.../equity-changes`                                         | `EquityChangesPage`                                                         |
| `reports.budgetManagement`, `budgeting.budgetManagement` | `.../budget-management`, `/setting-budget/budget-management` | `BudgetManagementPage` (same page on both paths)                            |

`legacyPaths.reportsBusinessSumary` (`.../business-sumary`, the old misspelling) redirects to `reports.businessSummary`. `index.ts` exports the eleven pages.

## Endpoints

- `REPORT_ENDPOINTS` in `infrastructure/reportEndpoints.ts`: `/v1/report/{balance,income-statement,equity-changes}` (absolute with `BASE_URL`), plus `/download` variants for income statement and equity changes (`REPORT_EXPORT_ENDPOINTS`).
- `balanceSheetApi`: `/v1/reports/balance-sheet` with `date` set to the selected period's end date; comparisons use a second point-in-time request. The current backend also accepts `as_of` and `compare_as_of` aliases. Exports send `startDate`, `endDate`, custom comparison dates, `summary`, and `showZero` to `/export/:type`, falling back to `/v1/report/balance/download` when needed.
- `profitLossApi` (the income statement page): `GET /v1/reports/profit-loss` and `/export/:type` (pdf, xlsx, csv). Needs `startDate` and `endDate` (one year at most); optional `compareStartDate` and `compareEndDate` request the comparison period. `lang` (`id` or `en`) is sent with it and with every export; `limit` is 500 at most, so the statement is one request (`getReport` still reads further pages if there are any). The response includes the paged legacy `rows` and `summary`, plus `statement.current` and optional `statement.compare` with section accounts, totals, journal counts and module counts. Exports also accept `mode` (`rinci` or `ringkas`) and `hideZero`. A failed request throws `ProfitLossRequestError` with the status: 400 is a refusal and shows as a calm warning, 403 means the role lacks the menu. The old `/v1/report/income-statement` (`businessOverviewApi`, `IncomeStatementTable`, `useIncomeStatementReport`) now serves only `IncomeStatementBudgetPage`.
- `trialBalanceApi`: `GET /v1/reports/trial-balance` accepts `startDate`, `endDate`, optional `allAccounts`, `page` and `limit` (100 at most); it must not send `lang`. `getReport` reads every account page and takes totals, balancing, profit, and the three-pair `statement` from page one. The legacy account rows retain their five groups (`opening`, `movement`, `closing`, `profitLoss`, `balanceSheet`). Exports accept `mode` and `hideZero`, and include the company name. The server response includes `precision` and `negativeFormat`. Errors are `ReportRequestError` (`infrastructure/reportRequest.ts`, shared with profit and loss): 400 a refusal, 403 no right.
- `generalLedgerApi`: `/v1/general-ledger`, `/v1/general-ledger/export/:type`. The ledger endpoint pages the accounts (`page`, `limit`: 20 by default, 100 at most; `pagination.totalAccounts` and `totalPages` come back) and accepts nothing else (no search or filter). `periodDebitTotal` and `periodCreditTotal` cover the whole ledger, while the per-account `periodDebit` and `periodCredit` of a parent account (`isHead`) already include its sub accounts, so never add the accounts up. Heavy periods can answer 504; keep the page size small.

## Layers

- `domain/`: report types (`balanceSheet`, `balanceSheetReport`, `generalLedger`, `JournalEntry`, `IncomeStatement`, `EquityChange`), `reportFormat` (money and date display, period presets) and `journalEntryTotals`, with tests.
- `infrastructure/`: `balanceSheetApi` + `balanceSheetMapper`, `generalLedgerApi` + `generalLedgerMapper`, `businessOverviewApi` (the five report fetches), `exportReport` (download and save a file), `reportEndpoints`, `reportValue` (`safeNumber`, `safeString`, `asRecord`, `asArray`).
- `presentation/`: pages, components grouped per report (`shared`, `balance-sheet`, `general-ledger`, `catalog`, ...), hooks (`useBalanceSheet`, `useGeneralLedger`, one `use*Report` per business-overview report, `usePeriodOptions`). The catalog data (`catalog/reportCatalogData.ts`) lives here because it holds icon components.

## Domain rules

- `safeNumber` reads numbers and numeric strings (`parseFloat`); anything else is 0.
- Balance sheet: a section or grand total from the server is used whenever the field is present, including `0`; missing totals are calculated from the available items. A flat liabilities list is split by category name: names containing "panjang" are long-term, the rest current. The sheet is balanced when assets and liabilities plus equity differ by less than 0.01.
- Journal entry totals (`calcJournalEntryTotals`, also used for the PDF export) round each line half up to the cent and add whole cents with `@/lib/money`.
- Period presets (`getPresetDateRange`): this month, last month, this quarter, this year, custom (defaults to this month).

## Trial balance screen

`TrialBalancePage` reads all paged account rows and uses the endpoint's `statement` payload for the report shown on screen. Its table has Kode/Akun plus three debit-credit pairs (Saldo awal, Mutasi periode, Saldo akhir). Rinci shows category bands, account rows with journal-line counts, and server subtotals; Ringkas shows one server subtotal per category. “Sembunyikan saldo nol” starts on and reloads with `allAccounts=true` when turned off. The search filters visible rows client-side, while totals remain the API's totals. Clicking an account opens its ledger. The summary cards show opening, movement and closing debit/credit totals plus the three balance differences. The page passes the selected mode and zero-balance option to export. `negativeFormat` and `precision` from report settings control signed amount formatting. If the server omits `statement`, the page falls back to the legacy five-group table.

## Report screens

- Shared building blocks in `presentation/components/shared/`: `ReportToolbar` (quick periods, one date-range picker, print, refresh, optional export, an Apply button that shows only while the dates differ from `appliedPeriod`, and an `extra` slot for search or other filters; the balance sheet and general ledger filter bars are thin wrappers around it, and the general journal in `journal-entries` uses it too through `@/module/reports`, which also exports `ReportPageHeader` and `ReportSearchInput`), `ReportKpiStrip` (a status line plus one card per figure, each with an optional picture, a layout of its own through `content`, and an optional wide footer card), `ReportStatus` (a dot and a line of text instead of a badge), `ReportSummaryCard` (the one anatomy of a summary card: name and caption, lines with a figure and a bar each, a rule, a closing line; the trial balance uses it through `ReportKpiStrip`'s `content`), `ReportBackButton` (header action back to the report center; the balance sheet, general ledger and `ReportPageHeader` pages use it), `ReportUnavailable` (what a report shows when its data cannot be loaded) and `ReportShared.module.css`.
- The catalog (`ReportCatalogPage`) groups reports into three sections (financial statements, ledgers and journals, budget and analysis). `ReportItem.status` is `ready` for a report that reads real data and `soon` otherwise; `soon` cards carry a "Segera hadir" chip and sort after the ready ones. Flip the status when a report gets its data.
- The balance sheet reads top to bottom: one bordered summary panel with four columns for assets, liabilities, equity, and the accounting equation; a three-ratio panel (current ratio, debt ratio, current-assets share); then a single statement card. Its period is an as-of date, with optional comparison against the prior period, the same date last year, or a selected date. Unmapped-account and bank-overdraft callouts use the report response. The statement supports account search, hide-zero, detailed/summary modes, comparison columns, grouped subtotals, account-ledger links, and profit-breakdown details for current and retained earnings. Search forces detailed mode. Exports carry comparison, display mode and hide-zero settings; print hides screen controls. Totals and subtotals come from the server, while account/category view rows use integer minor units when amounts must be grouped.

## General ledger screen

The page follows PRO-134 and the supplied reference: a back link, compact title and print/export actions, period select with two dates, a four-cell summary, then one categorized ledger table. The endpoint still pages accounts; generalLedgerApi reads 50 per request and joins every page. It preserves the server's period debit/credit totals, including when the table hides accounts without transactions or filters a search.

Accounts are grouped by the category returned by the server, retaining their order. Each account shows a link to its detail with the selected range, its normal side, opening balance, journal rows with running balances, and closing balance. Search by account shows the whole block; search by journal number, description, reference, or memo shows matching journal rows and labels the unchanged closing balance as covering all the account's journals. Accounts can be collapsed individually or together while keeping closing balances visible. The screen pages each account's journal rows 25 at a time; printing expands them all. Debit/credit zero is a dash, balance zero is formatted, and negative balances use parentheses.

The default switch hides accounts with no period transactions. PDF and XLSX use the backend's existing export routes with accountIds restricted to accounts with transactions when the switch is on; search and collapse do not affect export. CSV is generated from the loaded report so it carries category, account code/name, journal fields, opening and closing lines. All file names use buku-besar-<from>_<to>.<ext>. The current backend PDF and XLSX templates differ from the attached specification (landscape PDF, no category bands or repeated ledger-style section layout); their exact file layout still needs backend work.

## State

TanStack Query. Keys: `balance-sheet-report`, `general-ledger`, `balance_sheet_report`, `income_statement_report`, `trial-balance`, `equity_change_report`, . Filters are local component state; nothing is persisted.

## i18n

Namespace `reports` (`id` and `en`), composed from `reportsCommon`, `reportsCatalog`, `reportsBalanceSheet`, `reportsLedger` and `reportsStatements`, with a key-parity test in `src/i18n/locales/reports.test.ts`. Period preset values ('All Period', 'Today', ...) are logic keys and stay literal; `usePeriodOptions` translates only their labels.

## Known gaps

- The live API has no `/v1/report/{income-statement,equity-changes}` (they answer 404), so those two pages always show `ReportUnavailable`. Their tables and exports are untouched and need the endpoints before they can be checked against real data.
- Cash flow, business summary, income statement budget and budget management are placeholder pages: their tables show fixed sample numbers and sample dates (`19 Sept 2021`, `Budget Testing 1`), and `BusinessSummaryTable` and `CashFlowTable` call `useJournalAccounts()` without using the result (kept to preserve the request). The "Business Sumary Report" title keeps its typo because it is visible text.
- English-only legacy text (cash flow and summary rows, journal, equity and budget tables) has the same English value in `id` and `en`; real Indonesian copy is a product decision.
- Export failures on the income statement and equity changes pages still use `alert` (3 `no-alert` and 1 `new-cap` for `jsPDF` remain in the lint baseline).
- `GeneralLedgerPage` (report, `/v1/general-ledger`) and `account-ledger` (per account, M3) show overlapping data from different endpoints.
- No component tests; pages need a session and a live API.
- Profit and loss: the page uses the statement response for a four-card summary, margin indicators, period and comparison filters, and a sectioned statement table. Comparison can use the previous period, the same period last year, or custom dates. Detailed/summary view, zero-balance visibility and account search filter the table; export sends the selected view and zero-balance setting. Account labels link to the account ledger. Older API responses still use `assignRoles` and `visibleLines` as a fallback. Negative balances display in parentheses.
- Rights: the page needs read on menu `JP-GL-PL` (`useProfitLoss`, `PROFIT_LOSS_MENU_ID`), and the catalog hides the card without it, but never before the rights are known. A 403 shows a message to ask an admin to set it in Settings > Roles, not the server's text. After a deploy a role may still lack the menu until the server syncs its menus.
