# Bank & Cash Navigation and Workspace Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicate page-level navigation with a nested Cash & Bank sidebar hierarchy and redesign the Cash & Bank landing page around liquidity and account work.

**Architecture:** The sidebar owns cross-workspace navigation through one parent and two children. The Cash & Bank page exposes one summary surface and one account workspace; filtering and account actions remain inside the table component.

**Tech Stack:** React, TypeScript, React Router, Mantine, CSS Modules, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-21-petty-cash-redesign.md`

## Global Constraints

- Preserve the existing primary blue and neutral white Jurnal ProApps palette.
- Keep Petty Cash under the Cash & Bank domain; never add it as a peer sidebar module.
- Show only one active child route while the Cash & Bank parent remains the active domain.
- Preserve account filtering, sorting, pagination, detail routing, and transaction actions.
- Do not add fabricated balances, trends, journals, or reconciliation results.
- Use scoped formatting and preserve unrelated worktree changes.

---

### Task 1: Nested Cash & Bank Navigation

**Files:**

- Modify: `src/components/Navbar/page.tsx`
- Modify: `src/components/Navbar/Links/page.tsx`
- Modify: `src/components/Navbar/Links/page.module.css`
- Modify: `src/components/Navbar/activeNavigation.ts`
- Test: `src/components/Navbar/activeNavigation.test.ts`
- Delete: `src/module/BankCash/Main/components/BankCashSectionNav/`
- Modify: Petty Cash and Cash & Bank page entry files to remove the horizontal section nav

**Interfaces:**

- Consumes: `routes.BankAndCash.Main`, `routes.BankAndCash.PettyCash`
- Produces: nested sidebar child matching that supports Petty Cash detail routes

- [ ] Add a failing navigation test proving a Petty Cash detail route activates the Petty Cash child but not the accounts child.
- [ ] Run the focused navigation test and confirm the new assertion fails.
- [ ] Add Cash & Bank children to the navigation model and boundary-aware child matching.
- [ ] Remove `BankCashSectionNav` from every page and delete its files.
- [ ] Run the focused navigation tests and confirm they pass.

### Task 2: Liquidity Summary

**Files:**

- Replace: `src/module/BankCash/Main/components/StatsBankCashGrid/StatsBankCashGrid.tsx`
- Create: `src/module/BankCash/Main/components/StatsBankCashGrid/StatsBankCashGrid.module.css`
- Test: `src/module/BankCash/Main/components/StatsBankCashGrid/StatsBankCashGrid.test.ts`

**Interfaces:**

- Consumes: `JournalAccounts[]`
- Produces: `summarizeBankCashAccounts(accounts)` with total, bank, cash, and account counts

- [ ] Write failing tests for bank/cash classification and summary totals.
- [ ] Run the summary test and confirm the missing helper failure.
- [ ] Extract the pure summary helper and implement one primary liquidity surface with three compact facts.
- [ ] Run the summary tests and confirm they pass.

### Task 3: Account Workspace and Page Composition

**Files:**

- Modify: `src/module/BankCash/Main/pages/BankAndCashMainPage.tsx`
- Create: `src/module/BankCash/Main/pages/BankAndCashMainPage.module.css`
- Modify: `src/module/BankCash/Main/components/Table/TableBankCash.tsx`
- Create: `src/module/BankCash/Main/components/Table/TableBankCash.module.css`
- Modify: `src/i18n/locales/id/journal.ts`
- Modify: `src/i18n/locales/en/journal.ts`

**Interfaces:**

- Consumes: existing account query, routes, and table callbacks
- Produces: a quieter Cash & Bank page with one primary action and preserved account workflows

- [ ] Simplify the module header to one primary add-account action and one transaction menu.
- [ ] Move refresh into the account workspace toolbar.
- [ ] Replace large pill tabs, icon tiles, and decorative badges with restrained controls and semantic text.
- [ ] Preserve empty, loading, filtering, sorting, pagination, detail, reconciliation, and transaction paths.
- [ ] Add bilingual copy for new labels.

### Task 4: Verification

**Files:**

- Verify all files above

**Interfaces:**

- Produces: evidence for type, behavior, style, build, desktop visual state, and responsive layout

- [ ] Run scoped Prettier, TypeScript, Vitest, ESLint, Stylelint, and `git diff --check`.
- [ ] Run the production build.
- [ ] Verify `/bank-cash` and `/bank-cash/petty-cash` in the browser, including sidebar parent-child active states.
- [ ] Inspect the final diff and preserve the branch without committing or pushing.
