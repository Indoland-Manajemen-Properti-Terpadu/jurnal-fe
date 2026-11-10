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
- `balanceSheetApi`: `/v1/reports/balance-sheet`, `/v1/reports/balance-sheet/export/:type`, falling back to `/v1/report/balance/download` when the export fails.
- `profitLossApi` (the income statement page): `GET /v1/reports/profit-loss` and `/export/:type` (pdf, xlsx, csv). Needs `startDate` and `endDate` (one year at most); `lang` (`id` or `en`) is sent with it and with every export; `limit` is 500 at most, so the statement is one request (`getReport` still reads further pages if there are any). Each line has a `type` (`title`, `head`, `account`, `subtotal`, `total`, `profit`, `blank`), a signed `amount` (null on a head, a title and a blank; a contra account such as a discount can be negative) and markers: `key` on a total, profit or title line, `groupId` on a subtotal (the head it adds up) and `parentId` on an account. `summary` has `grossRevenue`, `totalContra` and `netRevenue` (equal to `totalRevenue`). A failed request throws `ProfitLossRequestError` with the status: 400 is a refusal and shows as a calm warning, 403 means the role lacks the menu. The old `/v1/report/income-statement` (`businessOverviewApi`, `IncomeStatementTable`, `useIncomeStatementReport`) now serves only `IncomeStatementBudgetPage`.
- `trialBalanceApi` (the trial balance page): `GET /v1/reports/trial-balance` and `/export/:type` (pdf, xlsx, csv; `/print` answers an inline PDF and is not used, the toolbar prints the page). Needs `startDate` and `endDate` (one year at most, end not before start); it must not send `lang`, the server answers 400 `"lang" is not allowed` on the list and every export; `limit` is 100 at most, so `getReport` reads every page and joins the accounts, and takes `totals`, `balancing` and `profit` from the first page. Each account has five groups (`opening`, `movement`, `closing`, `profitLoss`, `balanceSheet`) of `{ debit, credit }`; an empty side is `null` and a whole group can be `null`. Errors are `ReportRequestError` (`infrastructure/reportRequest.ts`, shared with profit and loss): 400 a refusal, 403 no right.
- `generalLedgerApi`: `/v1/general-ledger`, `/v1/general-ledger/export/:type`. The ledger endpoint pages the accounts (`page`, `limit`: 20 by default, 100 at most; `pagination.totalAccounts` and `totalPages` come back) and accepts nothing else (no search or filter). `periodDebitTotal` and `periodCreditTotal` cover the whole ledger, while the per-account `periodDebit` and `periodCredit` of a parent account (`isHead`) already include its sub accounts, so never add the accounts up. Heavy periods can answer 504; keep the page size small.

## Layers

- `domain/`: report types (`balanceSheet`, `balanceSheetReport`, `generalLedger`, `JournalEntry`, `IncomeStatement`, `EquityChange`), `reportFormat` (money and date display, period presets) and `journalEntryTotals`, with tests.
- `infrastructure/`: `balanceSheetApi` + `balanceSheetMapper`, `generalLedgerApi` + `generalLedgerMapper`, `businessOverviewApi` (the five report fetches), `exportReport` (download and save a file), `reportEndpoints`, `reportValue` (`safeNumber`, `safeString`, `asRecord`, `asArray`).
- `presentation/`: pages, components grouped per report (`shared`, `balance-sheet`, `general-ledger`, `catalog`, ...), hooks (`useBalanceSheet`, `useGeneralLedger`, one `use*Report` per business-overview report, `usePeriodOptions`). The catalog data (`catalog/reportCatalogData.ts`) lives here because it holds icon components.

## Domain rules

- `safeNumber` reads numbers and numeric strings (`parseFloat`); anything else is 0.
- Balance sheet: a section total from the server that is `0` or missing is replaced by the sum of its items; the grand totals (`totalAssets`, `totalLiabilities`, `totalEquity`) use the server value only when the payload is wrapped in `data` and the field is not null (so a server `0` stays `0`). A flat liabilities list is split by category name: names containing "panjang" are long-term, the rest current. The sheet is balanced when assets and liabilities plus equity differ by less than 0.01.
- Journal entry totals (`calcJournalEntryTotals`, also used for the PDF export) round each line half up to the cent and add whole cents with `@/lib/money`.
- Period presets (`getPresetDateRange`): this month, last month, this quarter, this year, custom (defaults to this month).

## Trial balance screen

The page (`TrialBalancePage`, `useTrialBalance`) shows four cards like the general ledger (account count with a ring of the detail accounts that have a closing balance, closing debit and closing credit with a bar per column group, profit with a ring of its margin on the profit and loss credit total) and a wide card comparing debit against credit for the closing balance and for profit and loss and one table: Akun, then Saldo Awal, Mutasi, Saldo Akhir, Laba Rugi and Neraca, each with Debit and Kredit, then Total and Selisih Penyeimbang (`balancing`, only under Laba Rugi and Neraca) as plain rows at the end (not frozen; only the account column is, and the table has no fixed height: the page scrolls down). There is no balanced badge. Rules: a `null` side renders blank, never 0; a parent account (`isHead`) is bold and its figures already include its sub accounts, so nothing is added up on the client (totals are the server's); the search filters the loaded accounts by number or name on the client, because the server only filters by database ids (`accountIds`). The page needs read on menu `JP-GL-TB` (`TRIAL_BALANCE_MENU_ID`); the catalog hides the card without it, but never before the rights are known, and a 403 shows the "ask an admin" message. Checked against live data (Demo Site, 192 accounts, 16 parents, two pages of 100): `totals`, `balancing` and `profit` are identical on every page and equal the sum of the non-parent accounts (adding the parents too roughly doubles them), so the page takes them from the first page. In that data `profitLoss` is `null` on 92 accounts and `balanceSheet` on 100; `opening`, `movement` and `closing` were never `null`.

## Report screens

- Shared building blocks in `presentation/components/shared/`: `ReportToolbar` (quick periods, one date-range picker, print, refresh, optional export, an Apply button that shows only while the dates differ from `appliedPeriod`, and an `extra` slot for search or other filters; the balance sheet and general ledger filter bars are thin wrappers around it, and the general journal in `journal-entries` uses it too through `@/module/reports`, which also exports `ReportPageHeader` and `ReportSearchInput`), `ReportKpiStrip` (a status line plus one card per figure, with an optional ring or bar and a wide footer card), `ReportStatus` (a dot and a line of text instead of a badge), `ReportRing` (small progress ring), `ReportBackButton` (header action back to the report center; the balance sheet, general ledger and `ReportPageHeader` pages use it), `ReportUnavailable` (what a report shows when its data cannot be loaded) and `ReportShared.module.css`.
- The catalog (`ReportCatalogPage`) groups reports into three sections (financial statements, ledgers and journals, budget and analysis). `ReportItem.status` is `ready` for a report that reads real data and `soon` otherwise; `soon` cards carry a "Segera hadir" chip and sort after the ready ones. Flip the status when a report gets its data.
- The balance sheet is one layout: insights (funding structure, asset composition by category), then assets, liabilities and equity as one column; the side-by-side and vertical switch was removed. Balance sheet groups are collapsible (`BalanceSheetAccountTable`): the header keeps the subtotal, negative balances show in parentheses. Colours: brand blue and neutral only; red is kept for negative balances and an unbalanced check.

## General ledger screen

Accounts load one server page at a time (`useGeneralLedger` keeps `page`, with `keepPreviousData`). The summary shows the account total from `pagination` and the whole-ledger debit and credit with a two-bar comparison (`DebitCreditBars`, a ring for the match rate). Under it, `GeneralLedgerAccountsTable` lists every account of the page as one row (debit/credit mix bar, opening, debit, credit, closing); a row opens (Mantine `Accordion`, body rendered only while open) to `GeneralLedgerAccountBody`: a balance trend (`BalanceTrendChart`), the debit/credit bars per day or per month (`MovementBars`, `pickGranularity`), both drawn in SVG/CSS from `domain/generalLedgerInsights` (no chart library), and the movement table (search, sort, 25 rows per page). The search above the table only filters the accounts of the loaded page. There is no account picker or view switch.

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
- Profit and loss: `assignRoles` names each total, profit and title line from the `key` the server sends, so the page uses its own wording; a server that sends no key is read by order (six totals, four profit lines), and a line with an unknown key keeps the server's caption. A subtotal is named after the head its `groupId` points to ("Subtotal Pend. Lainnya"). `visibleLines` shows every account, with or without a balance; a search keeps the matching accounts and drops the head and subtotal of a group with none, while every total and profit line stays. The first card is net revenue; when there are discounts or returns its hint reads "gross less discounts and returns". There is no status badge or empty-account switch. A negative amount is drawn red with its sign.
- Rights: the page needs read on menu `JP-GL-PL` (`useProfitLoss`, `PROFIT_LOSS_MENU_ID`), and the catalog hides the card without it, but never before the rights are known. A 403 shows a message to ask an admin to set it in Settings > Roles, not the server's text. After a deploy a role may still lack the menu until the server syncs its menus.
