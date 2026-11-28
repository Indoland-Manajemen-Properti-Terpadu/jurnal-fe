# PRO-134 General Ledger Implementation Plan

> **For agentic workers:** The implementation is present in this workspace. Use this as the implementation record; automated tests and live API/export verification remain unrun.

**Goal:** Deliver the general ledger screen and interactions specified by PRO-134 using the existing backend ledger response.

**Architecture:** Keep `/v1/general-ledger` as the data source and its totals authoritative. Adapt the reports module's ledger-specific hook, components, and locale strings; keep other report pages untouched. Use server exports with account IDs for the hide-empty setting, and document any export-format gap against the Jira attachment.

**Tech Stack:** React 18, TypeScript, Mantine 8, TanStack Query 5, CSS Modules, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-26-general-ledger-reference-design.md` and PRO-134's attached `Spesifikasi-Laporan-Buku-Besar.md` §5.

## Global Constraints

- Preserve existing uncommitted work and do not commit, push, deploy, or change Jira status.
- Keep Indonesian and English translations in parity and use existing theme tokens.
- Do not calculate ledger balances in the view; use the server's balances and totals.
- Do not add dependencies or change backend code.

## Review Focus

- Account search shows a full account block; a journal-only match shows only matching rows while retaining the real closing balance.
- Hiding empty accounts affects table and export but never re-sums the server's financial totals.
- A collapsed account keeps its closing row visible.
- Zero debit or credit shows a dash, zero balance shows a formatted zero, and negative zero never appears.
- The ledger remains usable with many transactions and on a phone width.

---

### Task 1: Ledger data and display state

**Files:** `src/module/reports/presentation/hooks/useGeneralLedger.ts`, `src/module/reports/domain/generalLedger.types.ts`, `src/module/reports/infrastructure/generalLedgerMapper.ts`, `src/module/reports/infrastructure/generalLedgerApi.ts`, `src/module/reports/domain/reportFormat.ts`.

- [x] Add the missing journal and period metadata that the present response can safely provide or derive.
- [x] Implement account and journal matching, hide-empty behavior, period presets including last year, and export account-ID selection without recalculating money.
- [x] Add focused coverage for the search and export selection rules.

### Task 2: Reference-aligned report page

**Files:** `src/module/reports/presentation/pages/GeneralLedgerPage.tsx`, ledger-specific components in `src/module/reports/presentation/components/general-ledger/`, `src/i18n/locales/{id,en}/reportsLedger.ts`.

- [x] Compose back link, header actions, period card, unbalanced callout, four-cell summary, toolbar, and report heading.
- [x] Render category and account sections with opening, journal, and closing rows; add account links, journal links, collapse controls, search result states, and period totals.
- [x] Add CSS Module rules for responsive scrolling and print layout using existing tokens.
- [x] Update focused component tests for the specified interactions.

### Task 3: Export integration and review

**Files:** ledger hook/API, `src/module/reports/README.md`, relevant tests.

- [x] Pass selected account IDs to backend export, use the requested filename, and ensure search/collapse do not affect the file selection.
- [x] Document the frontend behavior and the known export-format gap in the feature README.
- [x] Run TypeScript and formatting checks and inspect the scoped diff; tests and live API/export verification were not run.
