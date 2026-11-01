# Bank-Cash Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user chose native, inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/module/BankCash` (everything except `PettyCash`) to `src/module/bank-cash` with English names, i18n, README and tests, as the second module of Milestone 2 (release R3).

**Architecture:** One branch `refactor/bank-cash`, one PR into `develop-frontend`, following the Module Migration Procedure of `2026-10-29-m1-small-modules.md` and the shape of `2026-10-30-reports-migration.md`. `src/module/BankCash/PettyCash` stays where it is (it moves in the `petty-cash` plan); only its route imports in `src/router/index.tsx` are untouched.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md) sections 4, 5, 8.1, 8.3.

## Global Constraints

Same as the M1 plan and the reports plan: English identifiers and paths, kebab-case folders, PascalCase component files, `@/` imports only, no `any`, no `console.*`, files at most 400 lines, no `Layout.tsx` wrappers, no change to API payloads or endpoints, money sums with `@/lib/money`, ratchet only goes down, commit 1 is a pure move, Conventional Commits ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Gate: `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`.

## Review Focus

- **Balanced journal payload:** receive, send and transfer post a journal. The debit line must equal the sum of the credit lines to the cent (`0.1 + 0.2` against `0.3`), and each amount is rounded to the cent once.
- **Amounts with decimals:** a typed `1500.505` must not silently produce a different debit and credit.
- **Prefill by query param:** `?toAccountId=` and `?fromAccountId=` still preselect the account.
- **Submit guards:** no double submit while pending; invalid forms never post.
- **Cache refresh:** after a successful post, `accounts`, `journal_transactions` and `detail_account` queries are invalidated and the user returns to `/bank-cash`.

## Rulings made while planning

- **R1:** The old Zustand stores and forms (`ReceiveMoney/store`, `ReceiveMoneyForm`, `TotalAmountReceive`, `SentMoney/components/*`, `TransferMoney/store`, `TransferMoneyForm`) are referenced by no page. Task 1 re-verifies with `git grep` and deletes them. They contain a wrong tax formula (`total * 0.89`) and a `totalSent` that never updates. Cost if wrong: restore from git.
- **R2:** `StatsGrid.stories.tsx` and `StatsGrid.module.css` are kept only if something imports them; otherwise deleted with the same check.
- **R3:** The three posting pages keep their current UI and behavior; the arithmetic moves to `domain/transactionPayload.ts` (cent-exact). A debit of `0.30000000000000004` becomes `0.3`. Cost if wrong: payload amounts differ by float noise only.
- **R4:** `PettyCash` is out of scope; the router keeps importing it from the old path.

## Target tree

```text
src/module/bank-cash/
  README.md
  index.ts                         BankAndCashMainPage, AddReceiveMoneyPage, AddSentMoneyPage, AddTransferMoneyPage
  domain/
    bankCashSummary.ts             summarizeBankCashAccounts (from StatsBankCashGrid) + test
    transactionPayload.ts          buildReceivePayload, buildSentPayload, buildTransferPayload, line totals
    transactionTypes.ts            BankCashTransactionPayload, BankCashDetailItem
  infrastructure/
    bankCashTransactionApi.ts      submitBankCashTransaction (postV2 to API_ACCOUNT.POST_TRANSACTION_ACCOUNT)
  presentation/
    pages/                         BankAndCashMainPage, AddReceiveMoneyPage, AddSentMoneyPage, AddTransferMoneyPage
    components/                    stats/, accounts-table/, transaction-form/ (shared pieces split from the 3 pages)
    hooks/                         useBankCashTransactionMutation
```

---

### Task 1: Branch, dead code, pure move
- [ ] Verify R1/R2 with `git grep`, `git rm` the dead files, commit `refactor(bank-cash): remove unreferenced legacy forms and stores`.
- [ ] `git mv` the rest (except `PettyCash`) to the target tree, fix imports only, router imports included. Commit `refactor(bank-cash): move files to feature layout`.

### Task 2: Rename, index, router
- [ ] Rename pages to `<Name>Page`, delete `Layout.tsx` wrappers (pages use `AppShellLayout`), write `index.ts`, point the router at `@/module/bank-cash`. `yarn typecheck && yarn vitest --run`. Commit.

### Task 3: Money rules with tests (RED first)
**Produces:** `buildReceivePayload({ transactionDate, depositToAccountId, items, payerName, notes, depositAccountName? }): BankCashTransactionPayload`, `buildSentPayload(...)`, `buildTransferPayload(...)`, `sumLineAmounts(items): number`.
- [ ] Write tests: debit equals the sum of credits for `[0.1, 0.2]`; empty and invalid amounts count as 0; default notes and descriptions are the current Indonesian texts; lines keep order (receive: cash debit first; sent: expense debits first, cash credit last).
- [ ] Run, watch fail, implement with `toMinor`-based rounding, replace the inline math in the three pages, run, commit.

### Task 4: Layering
- [ ] `submitBankCashTransaction` to `infrastructure/`, `useBankCashTransactionMutation` to `presentation/hooks/` (same invalidations, same navigation, same notifications).
- [ ] Test the submit function (status check and message) and the mutation's invalidation keys.

### Task 5: Split oversized files, i18n, cleanup
- [ ] Split pages over 400 lines by responsibility (shared transaction-form pieces, accounts table rows); i18n namespace `bankCash` in `id` and `en` with a key-parity test and a hard-coded-text guard like `reports/presentation/hardcodedText.test.ts`; remove `any`, `console`, unused code.

### Task 6: README, status, ratchet, gate, PR
- [ ] `src/module/bank-cash/README.md`, STATUS row `BankCash to bank-cash`, `docs/modules/README.md` link, `node scripts/eslintRatchet.mjs --write-baseline`, gate, push, PR into `develop-frontend` with a smoke checklist, merge after `test-and-build`.
