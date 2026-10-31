# Reports (`ResultReport`) Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/module/ResultReport` (53 files, about 6,400 lines) to the feature-first `src/module/reports` module with English names, i18n, README and tests, as the first module of Milestone 2 (release R3).

**Architecture:** One branch `refactor/reports` and one PR into `develop-frontend`, following the **Module Migration Procedure** of `2026-10-29-m1-small-modules.md` (13 steps, same gate). This plan carries only what differs for `reports`: dead code to delete, target tree, renames, characterization tests, i18n scope and rulings.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md) sections 4.2 to 4.4, 5, 8.1, 8.3. Procedure: [`2026-10-29-m1-small-modules.md`](2026-10-29-m1-small-modules.md) (Global Constraints and Module Migration Procedure apply in full).

## Global Constraints

Copied from the M1 plan; every task includes them.

- English identifiers and paths; kebab-case folders; PascalCase component files; user-facing text in `id` and `en` through `useTranslation('reports')` from `@/i18n`.
- Layers only where there is content: `domain/`, `application/`, `infrastructure/`, `presentation/{pages,components,hooks}`. Maximum depth below the module is 4 directories.
- Others import only from `@/module/reports` (its `index.ts`). `src/components` never imports `src/module`. No `../../../` chains. `axios` and `@/lib/http` only in `infrastructure/`.
- No `any`, no `console.*`, files at most 400 lines.
- No `Layout.tsx` wrappers: pages render `AppShellLayout` from `@/components/AppShellLayout`.
- No change to API payloads, endpoint URLs, query-key semantics or rendered accounting values (spec 8.3).
- Money sums use `@/lib/money` (`toMinor`, `fromMinor`, `sumMinor`).
- Ratchet only goes down: `node scripts/eslintRatchet.mjs --write-baseline` after the module.
- Commit 1 is a pure `git mv`. Conventional Commits with scope `reports`, ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Gate: `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`.

## Review Focus

- **Balance sheet totals fall back with `||`:** `balanceSheetApi.ts` uses `safeNumber(raw.totalX) || sum(items)`, so a server total of `0` is replaced by the item sum, while `totalAssets` uses `!= null`. Behavior must stay exactly as is; test both a `0` and a missing total.
- **Decimals and string amounts:** the server may send `"1500.50"` strings; `safeNumber` uses `parseFloat`. `JournalEntryTable` sums debit and credit with plain `+` and `|| 0`; after moving to `sumMinor`, `0.1 + 0.2` rows must total `0.30`, and whole-rupiah results must equal today's display.
- **Empty and error states:** a report with no rows, a failed request and a missing date range must show the empty or error state, not an endless spinner or a crash. The `BusinessOverview` services use the legacy `get` helper, which returns `null` on error (see R2).
- **Bookmarked URL `/result-reports/business-overview/business-sumary`:** keeps working through a redirect after the typo fix.
- **Language switch:** catalog titles, filter labels, column headers and export menu render in `id` and `en`; a missing key must not render the raw key (check `translate` fallback in `src/i18n/store.ts`).
- **Export (blob) downloads:** balance sheet falls back from `/v1/reports/balance-sheet/export/:type` to `/v1/report/balance/download` on failure; the fallback must still happen after the move.

## Rulings made while planning

- **R1:** Treat `GeneralLedger` report as part of `reports`. It hits `/v1/general-ledger` and is separate from the per-account `account-ledger` module (M3). Cost if wrong: a later move of one folder.
- **R2:** Keep the legacy `get`/`download` helpers in the five `BusinessOverview` services (marked `@deprecated`) and keep their swallow-and-return-null semantics. Switching to throwing semantics is a behavior change that spec section 11.2 reserves for a separate approval. The M1 plan swapped them for `apiClient`; this module does not unless the user approves. Cost if wrong: errors on four reports still show an empty state instead of an error state.
- **R3:** Rename the typo route key `resultReport.businessSumary` to `businessSummary` and the URL to `/business-summary`, with `<Navigate replace>` from the old URL, same pattern as `/pembelian` (`legacyRedirects.test.tsx`). Cost if wrong: one extra redirect.
- **R4:** `/setting-budget/budget-management` and `/result-reports/business-overview/budget-management` both render `BudgetManagementPage`. Keep both routes and both constants; `reports` exports the page and `budgeting` does not import it. Cost if wrong: none.
- **R5:** Dead code (verified by `git grep`, re-verify in Task 1 before deleting): `BusinessOverview/page/BalanceSheetPage.tsx` (the router uses `BalanceSheet/pages/BalanceSheetPage`), `BusinessOverview/services/BalanceSheet.service.ts`, `BusinessOverview/components/BalanceSheet/BalanceSheetTable.tsx` (`period-closing` has its own copy), `BusinessOverview/hooks/IncomeStatement.tsx` (fully commented out). Cost if wrong: restore from git.
- **R6:** `routes.resultReport.businessOverview` stays in `KNOWN_ORPHANS` of `routes.test.ts`; this module does not build a page for it. It is logged in the README known gaps.

## Target tree

```text
src/module/reports/
  README.md
  index.ts                       exports the 11 pages
  domain/
    balanceSheet.ts              from BalanceSheet/types/balanceSheet.types.ts
    generalLedger.ts             from GeneralLedger/types/generalLedger.types.ts
    trialBalanceReport.ts        from BusinessOverview/types/TrialBalanceReport.types.ts
    journalEntryReport.ts        from BusinessOverview/types/JournalEntry.types.ts
    incomeStatement.ts           from .../IncomeStatement.types.ts
    equityChange.ts              from .../EquityChange.types.ts
    reportCatalog.ts             ReportItem, ReportCategory, reportCatalogData (ids, routes, icons; no copy)
    reportFormat.ts              from utils/reportFormat.ts (PeriodPreset, getPresetDateRange, formatMoney, displayDate)
    journalEntryTotals.ts        extracted from JournalEntryTable (totalDebit, totalCredit)
  infrastructure/
    reportEndpoints.ts           the /v1/report* and /v1/general-ledger constants used by this module
    balanceSheetApi.ts           fetch + export (axios error mapping stays here)
    balanceSheetMapper.ts        normalizeBalanceSheet, safeNumber (pure, from balanceSheetApi.ts)
    generalLedgerApi.ts
    generalLedgerMapper.ts       normalizeGeneralLedger, safeNumber (pure)
    businessOverviewApi.ts       trial balance, income statement, equity change, journal entry fetches + export
  presentation/
    pages/                       ReportCatalogPage, BalanceSheetPage, TrialBalancePage, IncomeStatementPage,
                                 IncomeStatementBudgetPage, CashFlowPage, JournalEntryReportPage,
                                 BusinessSummaryPage, EquityChangesPage, BudgetManagementPage, GeneralLedgerPage
    components/
      shared/                    ReportPageHeader, ReportHeaderPeriod, FilterDate, ExportMenu
      balance-sheet/ general-ledger/ income-statement/ cash-flow/ trial-balance/
      journal-entry/ equity-changes/ business-summary/ catalog/
    hooks/                       useBalanceSheet, useGeneralLedger
```

## Rename map (file level)

| Current | Target |
|---|---|
| `BusinessOverview/page/JournalEntryPage.tsx` | `presentation/pages/JournalEntryReportPage.tsx` (avoids clash with `journal-entries`) |
| `BusinessOverview/page/BusinessSumaryPage.tsx` | `presentation/pages/BusinessSummaryPage.tsx` |
| `BusinessOverview/page/Layout.tsx` | deleted |
| `components/IncomeStatement/IncomeStatmentTable.tsx` | `presentation/components/income-statement/IncomeStatementTable.tsx` |
| `components/{IncomeStatement,CashFlow,BusinessSumary}/TableRow.tsx` | `IncomeStatementTableRow.tsx`, `CashFlowTableRow.tsx`, `BusinessSummaryTableRow.tsx` |
| `components/BusinessSumary/BusinessSumaryTable.tsx` | `business-summary/BusinessSummaryTable.tsx` |
| `components/TrialBalance/TrialBalanceTable.style.css` | `trial-balance/TrialBalanceTable.module.css` (stylelint-clean) |
| `BalanceSheet/services/balanceSheetApi.ts` | split into `infrastructure/balanceSheetApi.ts` + `balanceSheetMapper.ts` |
| `Catalog/data/reportCatalogData.ts` | `domain/reportCatalog.ts` (copy moves to i18n) |

Files over 400 lines: none currently (largest `GeneralLedgerAccountDetail.tsx` 340). Re-check after i18n, which adds lines.

---

### Task 1: Branch, baseline, dead code, pure move

**Files:**
- Modify: `src/router/index.tsx:21-32` (imports), `docs/modules/README.md` (row `reports`)
- Delete (R5): the four dead files listed in R5
- Move: every remaining file of `src/module/ResultReport` per the target tree

**Interfaces:**
- Produces: `src/module/reports/` with old internal structure mapped to target paths; router imports from `@/module/reports/presentation/pages/<Name>` (replaced by the index in Task 2).

- [ ] **Step 1:** `git fetch origin && git checkout -B refactor/reports origin/develop-frontend`.
- [ ] **Step 2:** Record baseline: `rtk proxy npx eslint src/module/ResultReport --ext .ts,.tsx -f json` rule counts into the PR notes; `yarn vitest --run` must be green.
- [ ] **Step 3:** For each file in R5 run `git grep -n "<basename>" -- src` and confirm the only hits are inside the dead set; then `git rm` them. Commit `refactor(reports): remove unreferenced legacy report files`.
- [ ] **Step 4:** `git mv` the remaining files to the target tree using the rename map and layer mapping, changing only import paths (use `@/module/reports/...`, no `../..` chains). Run `yarn typecheck`. Commit `refactor(reports): move files to feature layout` (no renames of identifiers in this commit).

### Task 2: Rename, index, router, redirect

**Files:**
- Create: `src/module/reports/index.ts`
- Modify: `src/router/index.tsx`, `src/router/routes.ts:81` (`businessSumary` to `businessSummary`, URL `/result-reports/business-overview/business-summary`), `src/router/legacyRedirects.test.tsx`
- Test: `src/router/legacyRedirects.test.tsx`

**Interfaces:**
- Produces: `index.ts` exports `ReportCatalogPage`, `BalanceSheetPage`, `TrialBalancePage`, `IncomeStatementPage`, `IncomeStatementBudgetPage`, `CashFlowPage`, `JournalEntryReportPage`, `BusinessSummaryPage`, `EquityChangesPage`, `BudgetManagementPage`, `GeneralLedgerPage` (each `export { default as X } from './presentation/pages/X'`).
- Produces: `routes.resultReport.businessSummary` and `routes.resultReport.legacyBusinessSumary = '/result-reports/business-overview/business-sumary'`.

- [ ] **Step 1: Write the failing test** in `legacyRedirects.test.tsx`: `matchRoutes(router.routes, routes.resultReport.legacyBusinessSumary)` has an element with `props.to === routes.resultReport.businessSummary` and `props.replace === true`; and `routes.resultReport.businessSummary` serves a page (not a redirect).
- [ ] **Step 2:** `yarn vitest --run src/router` fails (constants undefined).
- [ ] **Step 3:** Apply the rename map, rename all `Sumary`/`Statment` identifiers, delete remaining `Layout` wrappers if any, write `index.ts`, point the router at `@/module/reports`, add the legacy route with `<Navigate to={routes.resultReport.businessSummary} replace />`. Update the Navbar or catalog entry that used `businessSumary` (`git grep -n businessSumary -- src`).
- [ ] **Step 4:** `yarn typecheck && yarn vitest --run` passes, including `routes.test.ts`. Commit `refactor(reports): rename to English and expose public index`.

### Task 3: Characterization tests, then extraction of pure rules

**Files:**
- Create: `domain/reportFormat.test.ts`, `domain/journalEntryTotals.ts` + `.test.ts`, `infrastructure/balanceSheetMapper.ts` + `.test.ts`, `infrastructure/generalLedgerMapper.ts` + `.test.ts`
- Modify: `JournalEntryTable.tsx`, `balanceSheetApi.ts`, `generalLedgerApi.ts`

**Interfaces:**
- Produces: `normalizeBalanceSheet(raw: unknown): BalanceSheetData`, `normalizeGeneralLedger(raw: unknown): GeneralLedgerData`, `safeNumber(value: unknown): number` (exported once from `infrastructure/reportNumber.ts` and used by both mappers, replacing the two identical copies), `calcJournalEntryTotals(entries: JournalEntryReportRow[]): { totalDebit: number; totalCredit: number }`. Names `BalanceSheetData` and `GeneralLedgerData` are the existing return types of the current fetch functions; keep them.

- [ ] **Step 1: Write characterization tests against the current code first** (run before extracting, they must pass): `safeNumber` (`'1500.50'` is 1500.5, `'abc'` is 0, `undefined` is 0, `null` is 0); balance sheet totals: server `totalCurrentAssets: 0` with items summing 500 yields 500, missing total yields the sum, `totalAssets: 0` with `data.totalAssets` present yields 0 (the `!= null` branch); `getPresetDateRange` for each `PeriodPreset` with a fixed system time (`vi.setSystemTime`); `calcJournalEntryTotals` with two rows of `0.1` and `0.2` expects `{ totalDebit: 0.3 }` and an empty list expects zeros.
- [ ] **Step 2:** Run `yarn vitest --run src/module/reports`: the first three groups pass on the moved code; the journal total decimal case fails (RED, plain `+`).
- [ ] **Step 3:** Extract the mappers out of the two `*Api.ts` files, leaving fetch and export in the API files; implement `calcJournalEntryTotals` with `sumMinor`/`toMinor`/`fromMinor`, returning numbers; replace the inline `reduce` in `JournalEntryTable.tsx`.
- [ ] **Step 4:** `yarn vitest --run src/module/reports` passes. Commit `refactor(reports): extract report mappers and totals with tests`.

### Task 4: Layering and endpoints

**Files:**
- Create: `infrastructure/reportEndpoints.ts`, `infrastructure/businessOverviewApi.ts`
- Modify: the five `BusinessOverview` services, pages that call them directly, `src/services/endpoint.ts` (remove `API_REPORT`/`API_EXPORT_REPORT` entries only if no other caller remains per `git grep`), `src/services/index.ts`

**Interfaces:**
- Produces in `businessOverviewApi.ts`: `getTrialBalanceReport(fromDate, toDate)`, `getIncomeStatementReport(fromDate, toDate)`, `getEquityChangeReport(fromDate, toDate)`, `getJournalEntryReport(fromDate, toDate)`, `exportReport(kind: 'balance-sheet' | 'income-statement' | 'equity-changes' | 'general-journal', ...)`; parameters and URLs are exactly those of the current services (read each service and keep its signature).

- [ ] **Step 1:** Merge the five services into `businessOverviewApi.ts` keeping legacy helpers per R2 (add `@deprecated` note in the README, not new code), endpoints copied verbatim into `reportEndpoints.ts`.
- [ ] **Step 2:** Pages and components call hooks or the API module, never `apiClient` directly. Add query hooks only where a page currently fetches inside `useEffect`; reuse the existing hook style (`useBalanceSheet`, `useGeneralLedger`).
- [ ] **Step 3:** `git grep -n "axios\|@/lib/http" -- src/module/reports/presentation src/module/reports/domain` returns nothing. `yarn typecheck && yarn vitest --run`. Commit.

### Task 5: i18n

**Files:**
- Create: `src/i18n/locales/id/reports.ts`, `src/i18n/locales/en/reports.ts`, `src/i18n/locales/reports.test.ts`
- Modify: both locale `index.ts`, every page and component with hard-coded text, `domain/reportCatalog.ts` (title and description replaced by `titleKey`/`descriptionKey`; `englishTitle` field removed because `en` is now the translation)

- [ ] **Step 1: Write the failing test** `reports.test.ts`: the key sets of `id` and `en` `reports` are identical, and every `reportCatalogData` item has `titleKey` and `descriptionKey` present in `id`.
- [ ] **Step 2:** Run it; fails (files missing).
- [ ] **Step 3:** Find strings with the grep from M1 plan step 8 on `src/module/reports`; `id` is the current text verbatim, `en` uses the terminology table in `.codex/PROJECT_CONTEXT.md`. Register namespace `reports` in both `index.ts`. Keep it in sub-objects (`catalog`, `balanceSheet`, `generalLedger`, `columns`, `filters`, `export`, `states`) so no single locale file passes 400 lines; split to `reportsFinancial.ts` and `reportsLedger.ts` if it does, as `contactsForm.ts` did.
- [ ] **Step 4:** `yarn vitest --run src/i18n` passes. Switch language in `yarn dev` and open each report. Commit `feat(reports): translate report pages to id and en`.

### Task 6: Debt cleanup, README, status, ratchet, gate, PR

**Files:**
- Create: `src/module/reports/README.md`
- Modify: `docs/migration/STATUS.md` (row `ResultReport to reports`), `docs/modules/README.md` (link), `docs/migration/eslint-baseline.json`

- [ ] **Step 1:** Remove `any` (known: `JournalEntryTable.tsx` reducers; type them with `JournalEntryReportRow`), `console.*`, unused code and cycles in the module's files; `git grep -nE ": any|as any|console\." -- src/module/reports` returns nothing.
- [ ] **Step 2:** Write README: purpose, routes (the 12 `routes.resultReport.*` plus `SettingBudget.BudgetManagement`), endpoints (`/v1/report/*`, `/v1/reports/balance-sheet*`, `/v1/general-ledger*`, `/v1/report/balance/download` fallback), domain rules (balance sheet total fallback, safeNumber, journal totals via `@/lib/money`), state, i18n namespace `reports`, known gaps (R2 legacy helpers swallow errors; `businessOverview` orphan route; `JournalEntryReportPage` vs `journal-entries`; `routes.SettingBudget.BudgetIS` orphan belongs to `budgeting`). Update `budgeting/README.md` line 9 to say the pages now live in `reports`.
- [ ] **Step 3:** STATUS row: set only the columns that are true (Structure, Names, i18n, Docs, Tests). Release stays R3.
- [ ] **Step 4:** `node scripts/eslintRatchet.mjs --write-baseline`; `git diff docs/migration/eslint-baseline.json` shows a lower total.
- [ ] **Step 5:** Run the five gate commands, then `yarn dev` and open each of the 12 report routes with Playwright (redirect to `/login` without a session is expected; note it in the PR).
- [ ] **Step 6:** Push, open PR into `develop-frontend` with the manual smoke list: catalog, each report with a date range, an empty range, an export per report, balance sheet fallback export, language switch, old business-sumary URL, `/setting-budget/budget-management`. Wait for `test-and-build`, merge with a merge commit.

## Self-review

- **Spec coverage:** structure (Tasks 1, 2), names (2), layering and endpoints (4), `any`/`console` (6), i18n (5), README and STATUS (6), tests and route manifest (2, 3), redirect rule (2), ratchet (6). Behavior preservation is guarded by Task 3 and the R2 ruling.
- **Open for the user:** R2 (legacy helper semantics) and R3 (URL typo rename with redirect). Both default to the safest option above.
- **After this module:** `bank-cash`, then `petty-cash`, each with its own migration plan because they are larger and `petty-cash` has the open items 5 and 9 of spec section 11.
