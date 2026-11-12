# Cash & Bank Accounts List and Petty Cash Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Cash & bank page and its three posting forms list every postable Cash & Bank account (not only the header), with a show/hide archived toggle, and petty cash fund accounts are badged, linked to their fund and blocked from plain receive/send/transfer.

**Architecture:** Pure domain functions in `bank-cash/domain` flatten the hierarchical `GET /v1/accounts` tree, summarize it with integer money, and decide whether an account may take a transaction. A small read hook in `bank-cash/presentation/hooks` maps petty cash funds to their ledger accounts through the `@/module/petty-cash` public API. Pages and the table consume those functions; the petty cash module gets a link back and a book-versus-fund balance note.

**Tech Stack:** React, TypeScript, Mantine, TanStack Query, Vitest, i18n namespace `bankCash` (`id`, `en`), `@/lib/money`.

**Spec:** `docs/superpowers/specs/2026-11-12-cash-bank-accounts-design.md`

## Global Constraints

- Money math only through `@/lib/money` (`toMinor`, `sumMinor`, `fromMinor`); never add floats in views (`docs/accounting.md`).
- Other features are imported only through `@/module/<feature>` (`index.ts`); no deep imports (`docs/architecture.md`, enforced by ESLint zones).
- UI text is professional and business-facing: never "server", "API", "code" or stack words (user rule); new text goes in `id` and `en` of the `bankCash` namespace with parity tests passing; no hard-coded text (`presentation/hardcodedText.test.ts`).
- Default notes written to the journal stay Indonesian memo text, not translated.
- Frontend never invents financial figures: Receivables/Payables 30-day cards are omitted (no endpoint).
- No commit, push or PR unless the user asks; show the UI first and commit only after the user says it is right. Steps below end with a checkpoint, not a commit.
- Do not disable lint, typecheck or tests to get green.
- No backend change; the guard is frontend-only until the backend adds its own (see spec "Open points").

## Review Focus

- A cash account whose parent header is not cash, or a header with no `isPostable` flag but `isHead: true`: still handled (header dropped, children kept).
- Archived child under an active header: hidden by default, header rollup `amount` never used in totals.
- Petty cash funds request fails, is slow, or the user has no petty cash right: list renders without badges and nothing throws.
- `?toAccountId=` / `?fromAccountId=` pointing at an account the simple list does not offer (petty cash, archived): form shows a notice and clears the selection instead of posting; no flash of the notice while the list loads.
- A cash account missing from the balance tree: option still offered with balance 0 and no crash.
- Empty states: no cash accounts at all, versus filters or archived toggle hiding all of them; closed fund no longer blocks its account.
- Cent-exact totals (`0.1 + 0.2`) and negative balances (shown red, summed as is).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/module/chart-of-accounts/domain/journalAccount.ts` (modify) | Add optional `isHead`, `isPostable` to `JournalAccounts` |
| `src/module/bank-cash/domain/cashBankAccounts.ts` (create) | `flattenCashBankAccounts`, `cashBankOptions`, `transactionBlock`, `pettyCashAccountIndex` |
| `src/module/bank-cash/domain/bankCashSummary.ts` (modify) | New `summarizeBankCashAccounts`; drop `isBankAccount` in Task 3 |
| `src/module/petty-cash/index.ts` (modify) | Export `usePettyCashFunds` and the `PettyCashFund` type |
| `src/module/bank-cash/presentation/hooks/usePettyCashAccountIndex.ts` (create) | Funds to `PettyCashAccountIndex` |
| `.../components/stats/StatsBankCashGrid.tsx` (modify) | One balance card with count and as-of date |
| `.../components/accounts-table/TableBankCash.tsx`, `BankCashAccountRow.tsx` (modify) | Grouped list, no tabs, badges, guarded menu |
| `.../pages/BankAndCashMainPage.tsx` (modify) | Archived toggle in the URL, flattened data |
| `chart-of-accounts` `accountApi.ts`, `useSimpleAccounts.ts` (modify) | Optional `isBankAndCash` param on the simple accounts list |
| `.../pages/AddReceiveMoneyPage.tsx`, `AddSentMoneyPage.tsx`, `AddTransferMoneyPage.tsx` (modify) | Options from the simple endpoint, balances from the tree, blocked-prefill notice |
| `src/i18n/locales/{id,en}/bankCash.ts` (modify) | New `list.*` and `block.*` keys |
| `src/module/petty-cash/presentation/components/FundOverview.tsx` (modify) | Ledger link and book-versus-fund note |
| `src/module/bank-cash/README.md`, `src/module/petty-cash/README.md` (modify) | Document new rules, remove the `isBankAccount` known gap |

## Task 1: Flatten, summarize, one balance card

**Files:**
- Modify: `src/module/chart-of-accounts/domain/journalAccount.ts` (add `isHead?: boolean; isPostable?: boolean;`)
- Create: `src/module/bank-cash/domain/cashBankAccounts.ts`, `src/module/bank-cash/domain/cashBankAccounts.test.ts`
- Modify: `src/module/bank-cash/domain/bankCashSummary.ts`, `bankCashSummary.test.ts`, `.../stats/StatsBankCashGrid.tsx`, `StatsBankCashGrid.stories.tsx`, `src/i18n/locales/{id,en}/bankCash.ts`

**Interfaces:**
- Produces: `flattenCashBankAccounts(accounts: JournalAccounts[]): CashBankAccount[]` where `CashBankAccount = JournalAccounts & { groupName: string | null }`; `summarizeBankCashAccounts(accounts: JournalAccounts[]): { total: number; accountCount: number }` (input is the raw tree; it flattens and ignores archived itself). `isBankAccount` stays exported until Task 3.

- [ ] **Step 1: Write failing tests** in `cashBankAccounts.test.ts` with a fixture shaped like the Demo Site: header `1-10000` (`isHead: true`, `isPostable: false`, `isBankAndCash: true`, amount `-274_596_069`) with `subAccount` of `1-10001` (553_665_000), `1-10002` (500_000), `1-10003` (-677_100_000), `1-10004` (-154_207_489), `1-10005` (2_546_420), `1-10099` (0), all postable and `isBankAndCash`. Assertions: result ids are exactly the six children, each with `groupName: 'Kas dan Setara Kas'`; a non-cash top-level account (`isBankAndCash: false`) is dropped; a cash child under a non-cash header is kept with `groupName: null`; a duplicate id appears once; an account with `isHead: true` and no `isPostable` is dropped; nesting two levels deep is walked.
- [ ] **Step 2: Run** `npx vitest run src/module/bank-cash/domain/cashBankAccounts.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `flattenCashBankAccounts` (recursive walk; header means `isHead === true || isPostable === false`; `groupName` is the nearest cash header's name).
- [ ] **Step 4: Rewrite the summary test** to expect `summarizeBankCashAccounts(fixture)` equal to `{ total: -274_596_069, accountCount: 6 }`; an archived child is excluded from both fields; `0.1` plus `0.2` totals `0.3`; empty input gives `{ total: 0, accountCount: 0 }`. Run it, expect FAIL.
- [ ] **Step 5: Implement the new `summarizeBankCashAccounts`** with `toMinor`/`sumMinor`/`fromMinor` over the flattened, non-archived accounts. Keep `isBankAccount` exported (still used by the table).
- [ ] **Step 6: Update `StatsBankCashGrid`** to a single card: title, balance, "n accounts", and the line "balance as of <today's date>" (`id`: "Saldo per {{date}}"); remove the bank/cash/managed tiles; update the story. Add keys `list.balanceTitle`, `list.accountCount`, `list.asOf` (id and en).
- [ ] **Step 7: Run** `npx vitest run src/module/bank-cash src/i18n` and `npm run typecheck`. Expected: PASS.
- [ ] **Checkpoint:** `git status` shows only the files above; no commit.

## Task 2: Petty cash account index

**Files:**
- Modify: `src/module/petty-cash/index.ts`
- Modify: `src/module/bank-cash/domain/cashBankAccounts.ts` and its test
- Create: `src/module/bank-cash/presentation/hooks/usePettyCashAccountIndex.ts`, `usePettyCashAccountIndex.test.tsx`

**Interfaces:**
- Consumes: `CashBankAccount` from Task 1; `usePettyCashFunds`, `PettyCashFund` (`account: { id, name, accountNumber }`, `id`, `name`, `status`).
- Produces: `type PettyCashAccountIndex = Map<string, { fundId: string; fundName: string }>`; `pettyCashAccountIndex(funds: PettyCashFund[]): PettyCashAccountIndex` (ignores funds whose status is `CLOSED`; confirm the status literal in `pettyCashStatus`); `type TransactionBlock = 'archived' | 'pettyCash' | null`; `transactionBlock(account: JournalAccounts, index: PettyCashAccountIndex): TransactionBlock` (archived wins over pettyCash); hook `usePettyCashAccountIndex(): { index: PettyCashAccountIndex; isReady: boolean }`, an empty index when the query errors or is loading.

- [ ] **Step 1: Write failing domain tests:** closed fund not indexed; `transactionBlock` returns `'pettyCash'` for account `6aec71d1248ac0bdd13974cf` with an active fund, `'archived'` for an archived account that is also petty cash, `null` for a plain account. Run, expect FAIL.
- [ ] **Step 2: Implement** the three functions in `cashBankAccounts.ts`.
- [ ] **Step 3: Export** `usePettyCashFunds` and `type PettyCashFund` from `src/module/petty-cash/index.ts`. Check `FundListParams` and request enough rows to cover all funds (use the largest allowed `limit`).
- [ ] **Step 4: Write the hook test** with a mocked `usePettyCashFunds`: success yields a populated index; error and loading yield an empty index and no throw. Run, expect FAIL; implement the hook; run, expect PASS.
- [ ] **Step 5: Run** `npx vitest run src/module/bank-cash src/module/petty-cash` and `npm run lint:eslint`. Expected: PASS (no restricted-path error).
- [ ] **Checkpoint:** `git status`; no commit.

## Task 3: List page with archived toggle, badges, guarded menu

**Files:**
- Modify: `BankAndCashMainPage.tsx`, `TableBankCash.tsx`, `BankCashAccountRow.tsx`, `TableBankCash.module.css`, `bankCashSummary.ts` (remove `isBankAccount`), `src/i18n/locales/{id,en}/bankCash.ts`, `src/i18n/locales/id/journal.ts` and `en/journal.ts` only if a key is removed
- Test: `src/module/bank-cash/presentation/components/accounts-table/TableBankCash.test.tsx` (create)

**Interfaces:**
- Consumes: `flattenCashBankAccounts`, `transactionBlock`, `usePettyCashAccountIndex`, `summarizeBankCashAccounts`; `useJournalAccounts(showArchived: boolean)`.
- Produces: `TableBankCash` props `{ accounts: JournalAccounts[]; loading?: boolean; onRefresh?: () => void; showArchived: boolean; onShowArchivedChange: (value: boolean) => void }`; archived state lives in the URL (`?archived=1`).

- [ ] **Step 1: Write failing component tests** (render with a router and mocked petty cash index), using the Task 1 fixture: six rows render and the header "Kas dan Setara Kas" appears once as a group title, not as a row; no Bank/Cash tabs; `1-10002` shows the "Kas kecil" badge with a link to `routes.pettyCash.detail` and its menu has no transfer/receive/send items but has "Buka kas kecil"; an archived account (passed in) is absent until the switch is on, then shows an "Diarsipkan" badge and only the view action; negative balance has the overdraft style; the empty state differs between no accounts and a search with no match.
- [ ] **Step 2: Run** `npx vitest run src/module/bank-cash/presentation/components/accounts-table`. Expected: FAIL.
- [ ] **Step 3: Implement.** Page: read `archived` from `useSearchParams`, call `useJournalAccounts(showArchived)`, pass the raw tree to the stats grid and to the table. Table: flatten, group by `groupName`, drop tabs and the type column, columns Kode, Nama, Saldo di Jurnal, Aksi; keep search, sort (balance high/low, code, name) and pagination; "Tampilkan akun yang diarsipkan" `Switch` above the table. Row: badge and link for `'pettyCash'`; for `'archived'` show only view-detail; otherwise the existing menu without the reconcile-bank item gated by `isBankAccount` (show reconcile for every active account). Remove `isBankAccount` and its imports and tests. New keys under `list.*` and `block.*` in `id` and `en` (no technical wording).
- [ ] **Step 4: Run** `npx vitest run src/module/bank-cash src/i18n` and `npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Look at it in a browser** on the Demo Site as `finance2` (credentials from the user's memory, not in code): six accounts, `1-10002` badged and linked, toggle works, no console errors. Show the user before anything else.
- [ ] **Checkpoint:** no commit; wait for the user to approve the UI.

## Task 4: Posting forms use the simple accounts endpoint

Verified live (Demo Site, `finance2`): `GET /v1/accounts/simple?isBankAndCash=true` returns five flat postable accounts, no header and no `1-10002 Kas Kecil Kasir`; `showArchived` is rejected with 400 there; without the filter it returns 175 flat accounts. So the server already decides which accounts a form may offer, and the forms do not need the petty cash funds query.

**Files:**
- Modify: `src/module/chart-of-accounts/infrastructure/accountApi.ts` (`getSimpleAccounts(params?: { isBankAndCash?: boolean })`), `presentation/hooks/useSimpleAccounts.ts` (`useSimpleAccounts(params?)`, query key `['accounts', 'simple', params ?? {}]`), their tests
- Modify: `AddReceiveMoneyPage.tsx`, `AddSentMoneyPage.tsx`, `AddTransferMoneyPage.tsx`, `src/module/bank-cash/domain/accountPrefill.ts` and test, `src/i18n/locales/{id,en}/bankCash.ts`

**Interfaces:**
- Consumes: `useSimpleAccounts`, `useJournalAccounts`, `flattenCashBankAccounts` (Task 1; used only to read balances).
- Produces: `useSimpleAccounts(params?: { isBankAndCash?: boolean }): { accounts: SimpleAccount[]; isLoading: boolean; isError: boolean }`; `cashBankOptions(simple: SimpleAccount[], balances: CashBankAccount[]): { account: SimpleAccount; balance: number }[]` in `cashBankAccounts.ts` (balance 0 when the id is not in `balances`); `resolvePrefill(accountId: string, selectable: SimpleAccount[]): { accountId: string | null; blocked: boolean }`.

- [ ] **Step 1: Write failing tests:** `getSimpleAccounts({ isBankAndCash: true })` sends `?isBankAndCash=true` and no params sends none (extend `accountApi.test.ts`); distinct params use distinct query keys; `cashBankOptions` pairs each simple account with its balance and falls back to 0; `resolvePrefill` gives `{ accountId: null, blocked: true }` for an id absent from `selectable` (the `1-10002` id), `{ accountId: id, blocked: false }` for a present one, and `{ accountId: null, blocked: false }` for an empty id. Run, expect FAIL.
- [ ] **Step 2: Implement** the API param, hook param, `cashBankOptions` and `resolvePrefill`.
- [ ] **Step 3: Update the three pages:** the cash or bank selects (deposit, paying, transfer from and to) take their options from `useSimpleAccounts({ isBankAndCash: true })` with balances from `useJournalAccounts()`; the source and expense select takes `useSimpleAccounts()` (all postable accounts, label `accountNumber - name`, add the account `type` only if it reads as a category name; check one value first). A `?toAccountId=` or `?fromAccountId=` that is not selectable shows an `Alert` (`block.prefillNotice`, `id` and `en`) and an empty selection; wait for the simple list before resolving so a slow load does not flash the notice. Overdraft warning keeps working from the paired balance.
- [ ] **Step 4: Run** `npx vitest run src/module/bank-cash src/module/chart-of-accounts` and `npm run typecheck`. Expected: PASS. Other users of `useSimpleAccounts` (`JournalLinesEditor`, `BeginningBalancePage`) must still pass untouched.
- [ ] **Step 5: Browser check:** `/bank-cash/add-receive-money?toAccountId=6aec71d1248ac0bdd13974cf` shows the notice and an empty selection; the select offers exactly the five accounts; the source select now includes sub accounts. Do not post anything.
- [ ] **Checkpoint:** no commit.

## Task 5: Petty cash link back and book-versus-fund balance

**Files:**
- Modify: `src/module/petty-cash/presentation/components/FundOverview.tsx`, `src/i18n/locales/{id,en}/pettyCash.ts`
- Test: `src/module/petty-cash/presentation/components/FundOverview.test.tsx` (create or extend)

**Interfaces:**
- Consumes: `useJournalAccounts` and `flattenCashBankAccounts` are not imported here; use `useDetailAccount`/`useJournalAccounts` from `@/module/chart-of-accounts` (public API) to read the ledger balance of `fund.account.id`.
- Produces: a "Buka di Kas & Bank" link to `routes.accountLedger.cashBank` for the fund's account, and a quiet line "Saldo buku {{book}}, saldo kas dana {{fund}}" shown only when they differ, as received figures (server-owned, no recomputation).

- [ ] **Step 1: Write failing tests:** with book `500000` and `cashBalance` `390000` the note renders both figures; equal values render no note; a failed ledger read renders no note and no error.
- [ ] **Step 2: Run, expect FAIL; implement; run, expect PASS** (`npx vitest run src/module/petty-cash`).
- [ ] **Checkpoint:** no commit.

## Task 6: Documentation and full verification

**Files:** `src/module/bank-cash/README.md`, `src/module/petty-cash/README.md`

- [ ] **Step 1: Update READMEs:** the account list rules (flatten, headers as groups, archived toggle via `?archived=1`, petty cash guard and its frontend-only limit), remove the `isBankAccount` known gap and the old summary description, document `usePettyCashAccountIndex` and the new `petty-cash` exports.
- [ ] **Step 2: Run** `npm test` (typecheck, prettier, lint, vitest, build). Expected: all pass; if prettier fails run `npm run prettier:write` on changed files only.
- [ ] **Step 3: Final browser pass** on the Demo Site: list, toggle, badge link, blocked prefill on all three forms, petty cash overview note. Report outcomes, including anything not verifiable (archived behavior: no archived account exists on the Demo Site).
- [ ] **Checkpoint:** summarize changed files; wait for the user to approve before any commit.
