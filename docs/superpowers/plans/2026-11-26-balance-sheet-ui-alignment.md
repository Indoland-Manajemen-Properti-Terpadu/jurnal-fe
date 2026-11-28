# PRO-130 Balance Sheet Implementation Plan

> **For agentic workers:** Implementation was completed in this workspace. Use this as the implementation record; do not treat remaining external API validation as a frontend code task.

**Goal:** Build the Neraca page and interactions described by Jira PRO-130 using the documented PRO-129 response.

**Architecture:** Keep HTTP and response normalization in `balanceSheetApi` and `balanceSheetMapper`; keep filters and row selection in the report hook/domain; render summaries, callouts, statement modes, and profit details in the balance-sheet presentation components. The server remains authoritative for report totals.

**Tech Stack:** React 18, TypeScript, Mantine 8, TanStack Query 5, CSS Modules, existing i18n.

**Spec:** `docs/superpowers/specs/2026-11-26-balance-sheet-ui-design.md` and Jira PRO-130's attached `Spesifikasi-Laporan-Neraca.md`.

## Global Constraints

- Preserve server balances and totals; do not change accounting rules or BE code.
- Preserve existing uncommitted work; keep scope to PRO-130 and directly required shared report controls.
- Use existing theme tokens, Mantine patterns, routes, translations, and APIs; add no dependency.
- Do not commit, push, deploy, or change Jira status.

## Review Focus

- With no compare date, keep the statement at three columns; with a compare date, show balance, comparison, delta, and percent.
- Hide an account only when its current and comparison balances are both zero.
- An account present in one snapshot only compares against zero; a zero comparison denominator displays a dash for percent change.
- Search forces detailed view and leaves the server subtotals unchanged.
- Unmapped-account and overdraft callouts render only when the corresponding server arrays are non-empty.
- Zero-denominator ratios display a dash; current ratio displays a dash when current liabilities are zero or negative.
- The account ledger links keep the selected report dates; derived earnings open a modal without client-side balance reconstruction.

---

### Task 1: API contract and domain snapshot

**Files:** `src/module/reports/domain/balanceSheet.types.ts`, `src/module/reports/domain/balanceSheetView.ts`, `src/module/reports/domain/reportFormat.ts`, `src/module/reports/infrastructure/balanceSheetApi.ts`, `src/module/reports/infrastructure/balanceSheetMapper.ts`.

- [x] Extend query state for an optional comparison date and report modes.
- [x] Map PRO-129 section/group/account totals, current and compare snapshots, profit fields, module/journal counts, unmapped accounts, and overdrafts.
- [x] Keep the old response mapper path available and use minor-unit arithmetic for grouped display amounts.

### Task 2: Period controls, summary, and warnings

**Files:** `src/module/reports/presentation/hooks/useBalanceSheet.ts`, `src/module/reports/presentation/components/shared/ReportToolbar.tsx`, `src/module/reports/presentation/components/balance-sheet/BalanceSheetFilterBar.tsx`, `BalanceSheetSummary.tsx`, `BalanceSheetReading.tsx`, `src/module/reports/presentation/pages/BalanceSheetPage.tsx`, both balance-sheet locale files.

- [x] Add report presets, the four comparison options, and custom comparison date state.
- [x] Add four position summaries, comparison changes, journal count, and current/debt/current-asset-share ratios.
- [x] Render unmapped and overdraft callouts with a chart-of-accounts link and explanatory copy.

### Task 3: Statement, detail, export, and print

**Files:** `src/module/reports/domain/balanceSheetView.ts`, balance-sheet statement/table/modal components and CSS, `balanceSheetApi`, `useBalanceSheet`, `src/module/reports/README.md`.

- [x] Add account search, hide-zero, detailed/summary modes, grouped subtotals, compare columns, and empty states.
- [x] Link accounts to account-ledger pages; show current/retained earnings details using existing report and journal sources.
- [x] Pass compare/view/zero settings to export and hide screen controls for print.
- [x] Document the updated screen behavior and the contract compatibility path.

## Verification and unresolved integration

- [x] `npm run typecheck` passed.
- [x] Prettier check passed for the changed TypeScript and locale files; `git diff --check` passed.
- [ ] Automated tests were not run in this task.
- [ ] The endpoint's active `date` query has been observed in the local app; comparison requests and export output still need an environment with representative comparison data. Jira's attached BE spec uses `as_of`/`compare_as_of`, while the deployed validator currently rejects those names.
