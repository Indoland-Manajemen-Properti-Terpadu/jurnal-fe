# Petty Cash Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the noisy, accounting-unsafe Petty Cash prototype with a calm Kas & Bank workspace whose mock behavior follows the approved imprest lifecycle.

**Architecture:** Pure domain functions define route ownership and financial transitions. A single page-level prototype state feeds focused presentation components so list and detail views cannot independently mutate contradictory balances. Existing Mantine 8, theme tokens, and i18n remain the UI foundation.

**Tech Stack:** React 18, TypeScript, Mantine 8, React Router 6, Vitest, React Testing Library, project i18n.

**Spec:** `docs/superpowers/specs/2026-10-21-petty-cash-redesign.md`

## Global Constraints

- Petty Cash is nested inside Kas & Bank and never appears as a sibling sidebar item.
- Use ProApps `primary` and white as the dominant palette; semantic colors only communicate real states.
- No backend endpoint or persistence claim may be invented.
- Money in this frontend prototype is integer IDR; production representation remains contract-dependent.
- All user-facing copy must support Indonesian and English.
- Preserve unrelated working-tree changes and do not commit without user authorization.

---

### Task 1: Domain lifecycle and navigation ownership

**Files:**

- Create: `src/module/BankCash/PettyCash/domain/pettyCash.ts`
- Create: `src/module/BankCash/PettyCash/domain/pettyCash.test.ts`
- Create: `src/components/Navbar/activeNavigation.ts`
- Create: `src/components/Navbar/activeNavigation.test.ts`
- Modify: `src/components/Navbar/Links/page.tsx`
- Modify: `src/components/Navbar/page.tsx`

**Interfaces:**

- Produces: `isNavigationLinkActive(pathname: string, link: string, siblingLinks: string[]): boolean`
- Produces: `submitReplenishment(state, draft)` and `disburseReplenishment(state, reimbursementId)` immutable transitions.
- Produces: balance and eligibility selectors consumed by presentation.

- [ ] Write tests proving longest-route navigation ownership, submission without balance mutation, and disbursement-only restoration.
- [ ] Run the focused Vitest files and confirm failures are caused by missing functions.
- [ ] Implement the smallest pure functions and wire navbar active matching.
- [ ] Re-run focused tests and refactor only after green.

### Task 2: Correct prototype state and modal behavior

**Files:**

- Modify: `src/module/BankCash/PettyCash/types/pettyCash.types.ts`
- Modify: `src/module/BankCash/PettyCash/data/mockPettyCashData.ts`
- Create: `src/module/BankCash/PettyCash/hooks/usePettyCashPrototype.ts`
- Create: `src/module/BankCash/PettyCash/hooks/usePettyCashPrototype.test.tsx`
- Modify: `src/module/BankCash/PettyCash/components/CreateVoucherModal.tsx`
- Modify: `src/module/BankCash/PettyCash/components/ReplenishmentModal.tsx`
- Modify: `src/module/BankCash/PettyCash/components/CashCountModal.tsx`

**Interfaces:**

- Consumes: Task 1 domain operations.
- Produces: one state/actions hook shared by Petty Cash pages.

- [ ] Write hook tests for fund selection synchronization, voucher payment effect, replenishment submission, and disbursement.
- [ ] Verify the tests fail against the current duplicated page state.
- [ ] Implement the shared prototype hook and remove fabricated modal defaults.
- [ ] Re-run focused tests and keep lifecycle logic outside views.

### Task 3: Quiet Payvora-inspired Petty Cash workspace

**Files:**

- Create: `src/module/BankCash/PettyCash/pages/PettyCashPage.module.css`
- Create: `src/module/BankCash/PettyCash/components/PettyCashBalancePanel.tsx`
- Create: `src/module/BankCash/PettyCash/components/PettyCashFundSelector.tsx`
- Modify: `src/module/BankCash/PettyCash/pages/PettyCashPage.tsx`
- Modify: `src/module/BankCash/PettyCash/components/VoucherTable.tsx`
- Modify: `src/module/BankCash/PettyCash/pages/PettyCashDetailPage.tsx`
- Remove after replacement: `src/module/BankCash/PettyCash/components/PettyCashStatsGrid.tsx`
- Remove after replacement: `src/module/BankCash/PettyCash/components/PettyCashFundCard.tsx`

**Interfaces:**

- Consumes: shared prototype state and domain selectors.
- Produces: one primary action, compact balance panel, fund selector, task tabs, invalid-fund state.

- [ ] Write presentation tests for single-primary-action hierarchy and invalid fund handling.
- [ ] Verify tests fail on the current four-KPI/fund-card composition.
- [ ] Build the responsive workspace with neutral surfaces and restrained status color.
- [ ] Replace duplicated detail mutations with the shared state interface.
- [ ] Re-run presentation tests at desktop and mobile viewport assumptions.

### Task 4: Kas & Bank integration and bilingual copy

**Files:**

- Modify: `src/module/BankCash/Main/pages/BankAndCashMainPage.tsx`
- Modify: `src/components/HeaderNav/page.tsx`
- Modify: `src/i18n/locales/id/journal.ts`
- Modify: `src/i18n/locales/en/journal.ts`
- Modify: `src/i18n/locales/id/navigation.ts`
- Modify: `src/i18n/locales/en/navigation.ts`

**Interfaces:**

- Produces: one Kas & Bank sidebar owner, internal Petty Cash destination, equivalent ID/EN copy.

- [ ] Add translation and navigation behavior assertions.
- [ ] Remove the duplicate Petty Cash sidebar entry and replace the header CTA with an internal workspace affordance.
- [ ] Move every Petty Cash literal rendered by changed components into `journal` translations.
- [ ] Run focused tests and search the feature for remaining user-facing mixed-language literals.

### Task 5: Durable agent design rules

**Files:**

- Modify: `.codex/PROJECT_CONTEXT.md`

**Interfaces:**

- Produces: evidence-based layout rules used by future agents.

- [ ] Replace mandatory decorative KPI/header recipes with hierarchy-based defaults.
- [ ] Add one-primary-action, color-budget, progressive-disclosure, financial-event, navigation-ownership, and responsive-priority rules.
- [ ] Review the documentation diff for conflicts with architecture and accessibility rules.

### Task 6: Verification and visual QA

**Files:**

- Review all files listed above.

**Interfaces:**

- Consumes: completed Tasks 1-5.
- Produces: verification evidence and documented remaining backend-contract limitations.

- [ ] Run focused Petty Cash and navigation Vitest suites.
- [ ] Run `yarn typecheck`.
- [ ] Run scoped Prettier check and scoped ESLint without repository-wide writes.
- [ ] Run `yarn build`.
- [ ] Start the Vite app and inspect Petty Cash in a browser at desktop and mobile widths.
- [ ] Review `git diff --check`, `git status`, and the scoped diff for unrelated changes.
- [ ] Request an independent code review and resolve all critical/important findings.
