# Petty-Cash Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user chose native, inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/module/BankCash/PettyCash` (a frontend prototype with in-memory mock state) to `src/module/petty-cash` with English names, i18n, README and tests, the last module of Milestone 2 (release R3).

**Architecture:** One branch `refactor/petty-cash`, one PR into `develop-frontend`, following the Module Migration Procedure of `2026-10-29-m1-small-modules.md` and the shape of the reports and bank-cash plans. The prototype keeps its behavior: state lives in a React context seeded from mock data; no HTTP is added.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md) sections 4, 5, 8.1, 8.3, 11 (items 5 and 9).

## Global Constraints

Same as the earlier module plans: English identifiers and paths, kebab-case folders, PascalCase component files, `@/` imports only, no `any`, no `console.*`, files at most 400 lines, no change to behavior, money sums with `@/lib/money`, ratchet only goes down, commit 1 is a pure move, Conventional Commits ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Gate: `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`.

## Review Focus

- **Fund balance arithmetic:** paying a voucher of `0.1` then `0.2` from a fund must leave the cent-exact balance and pending-reimbursement amount; reimbursement total equality must not fail on float noise (`0.1 + 0.2` against `0.3`).
- **Guards:** a frozen fund rejects vouchers and reimbursements; a voucher above the cash in hand is rejected (`INSUFFICIENT_CASH`); a reimbursement with an unknown, foreign or already reimbursed voucher is rejected; a total that differs from the vouchers is rejected.
- **Imprest cap:** a disbursement never lifts the balance above the fund ceiling (`pagu`), and pending reimbursement never goes below 0.
- **Route scope:** `/bank-cash/petty-cash` and `/bank-cash/petty-cash/:fundId` keep sharing one provider; an unknown fund id shows the not-found state.
- **Language switch:** every label, status and message in `id` and `en`.

## Rulings made while planning

- **R1:** The prototype state (`PettyCashPrototypeProvider`) stays a React context in `presentation/hooks`; replacing it with an API is out of scope (no backend contract yet).
- **R2:** The status vocabulary mismatch with `docs/petty-cash/API-SPEC-Petty-Cash-Backend.md` (spec 11 item 5) is not changed here; it is recorded in the README known gaps.
- **R3:** `docs/superpowers/plans/petty-cash-prd.md` (empty, 0 bytes) is left untouched (spec 11 item 9 needs approval to move or delete it); it is mentioned in the README.
- **R4:** Mock fixtures (`mockPettyCashData.ts`, 460 lines) are split by entity to respect the 400-line limit; the data itself does not change.
- **R5:** Existing `journal` namespace keys that the petty cash screens already use stay there; new text goes to the `pettyCash` namespace under a second hook named `tp`.

## Target tree

```text
src/module/petty-cash/
  README.md
  index.ts                   PettyCashPage, PettyCashDetailPage, PettyCashRouteScope
  domain/
    pettyCashTypes.ts        types (from types/pettyCash.types.ts)
    pettyCash.ts             recordPaidVoucher, submitReplenishment, disburseReplenishment, findFundById (+ tests)
  infrastructure/
    mockPettyCashFunds.ts, mockPettyCashVouchers.ts   split of data/mockPettyCashData.ts
  presentation/
    pages/                   PettyCashPage(.module.css), PettyCashDetailPage, PettyCashRouteScope
    components/              modals, tables, drawer, panels (+ PettyCashOverlay.module.css)
    hooks/                   usePettyCashPrototype (provider and hook)
```

---

### Task 1: Move
- [ ] `git mv` to the target tree, fix imports only (router and any outside importer). Commit `refactor(petty-cash): move files to feature layout`.

### Task 2: Rename, index, router
- [ ] Rename `types/pettyCash.types.ts` to `domain/pettyCashTypes.ts`, delete nothing else, write `index.ts`, router imports from `@/module/petty-cash`. Commit.

### Task 3: Cent-exact money in the domain (RED first)
- [ ] Tests for the Review Focus arithmetic; implement with `@/lib/money`; keep every guard and error code. Commit.

### Task 4: Split oversized files, i18n, cleanup
- [ ] Split files over 400 lines by responsibility; i18n namespace `pettyCash` in `id` and `en` with parity and hard-coded-text guard tests; remove `any`, `console`, unused code. Commit.

### Task 5: README, status, ratchet, gate, PR
- [ ] README, STATUS row `BankCash/PettyCash to petty-cash`, `docs/modules/README.md`, ratchet baseline, gate, push, PR, merge after `test-and-build`.
