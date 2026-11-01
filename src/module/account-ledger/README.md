# account-ledger

The ledger screen of one account: header with the account actions, KPI row and a tab host. It is the hub that composes `journal-entries`, `bank-statements`, `reconciliation` and `chart-of-accounts`. Task 8 of milestone 3 replaced the two near-twin pages of `GeneralJournal/DetailAccount/Main` (about 1370 lines) with one `AccountLedgerPage`, and deleted `src/module/GeneralJournal`.

## Routes (unchanged, rendered by the router with a `variant`)

- `/general-journal/detail-account-cb/:idAccount` (`routes.accountLedger.cashBank`): `<AccountLedgerPage variant="cashBank" />`. Four tabs: journal entries, bank statement, bank reconciliation, cash mapping. KPI: ledger balance, bank balance, reconciliation status, entry count. Orange alert when bank rows are unreconciled.
- `/general-journal/detail-account/:idAccount` (`routes.accountLedger.nonCashBank`): `<AccountLedgerPage variant="nonCashBank" />`. Two tabs: movements and account information. KPI: balance, normal side, total debit, total credit.

## Public API (`index.ts`)

`AccountLedgerPage` and the type `LedgerVariant`. Everything else is internal.

## Layout

- `domain/`: `normalBalance` (`getNormalBalance`), `ledgerSummary` (`summarizeMutations`, `countUnreconciled`, `countStatements`, `unwrapAccountDetail`), `serverMessage`, `ledgerVariant`. Pure and tested.
- `presentation/pages/AccountLedgerPage.tsx`: shared page (keyed by variant, so a switch between the two routes remounts it: the tab ids differ).
- `presentation/components/`: `LedgerHeader`, `LedgerAccountMenu`, `LedgerCreateActions`, `LedgerAccountDialogs`, `LedgerKpiCard` with `CashBankKpiCards` and `NonCashBankKpiCards`, `LedgerTabsShell`, the tab hosts `CashBankTabs` and `NonCashBankTabs`, `LedgerTransactionsPanel`, `AccountInfoPanel`.
- `presentation/hooks/`: `useLedgerAccountActions` (archive/restore and delete with the modal state), `useCashBankSummary` (reconciliation and bank statement figures).
- `testing/ledgerMocks.tsx`: module mocks for the page tests (not imported by production code).

## Endpoints

None of its own; it only uses hooks of the sibling modules (`useDetailAccount`, `archiveAccount`, `useDeleteAccount`, `useJournalEntriesByAccount`, `useDeleteJournalEntries`, `useBankStatement`, `useReconciliation`), always through their `index.ts`.

## State

- Query keys it invalidates or refetches: `['detail_account', id]` (refetch after archive, invalidate after deleting entries) and `['transaction_by_account', id]` (prefix of the journal list key). Selection of journal rows and the active tab live in the page; the bank statement selection lives in `CashBankTabs`.
- `?tab=` is ignored. `BankCash` links to the cash/bank route with `?tab=reconciliation`, but the page always opens on the first tab (documented, not changed).

## Domain rules

- I5 normal balance (non cash/bank screen): `getNormalBalance({ categoryName, type, isDebit, isContra })` goes through the kernel `isDebitNormal`: the backend `category.isDebit` flag wins, the Indonesian keyword fallback (category name, or the account type when the name is empty) applies when the flag is absent, and `isContra` flips the side. The cash/bank variant shows no normal balance. Pinned by `normalBalance.test.ts`.
- I7 locked accounts: the header menu offers archive and delete only when `canArchiveAccount` and `canDeleteAccount` (chart-of-accounts) allow it. The edit button stays available.
- Mutation totals (`summarizeMutations`): only strictly positive debit and credit amounts count and are summed on integer cents (no float drift); the old code summed floats. Whole-rupiah data gives identical figures, and the display already rounds to two decimals.

## i18n

Namespace `accountLedger` (`src/i18n/locales/{id,en}/accountLedger.ts`, parity test `src/i18n/locales/accountLedger.test.ts`). Groups: `common`, `cashBank`, `nonCashBank`, `entries`. Text that contained bold parts is split into `...Before` / `...After` keys around the `<strong>`. The domain keeps the side as the Indonesian `'Debit' | 'Kredit'` value and the page translates it through `common.side.*`.

## Errors (R3)

The page used no swallowing helper: `archiveAccount` and the delete hooks already throw (migrated in `chart-of-accounts`). A failed archive keeps its red toast with the server message. `useDetailAccount` now reads through the throwing `apiClient`: a failed detail request shows an error state (title, message, retry) instead of "N/A" placeholders. `EditAccountPage` shows the shared `NotFound` page in that case instead of an empty form.

## Known gaps (kept as is, for the owner to decide)

- Only the cash/bank variant shows an error state for the entries; the other one waits for them and then renders an empty table on failure.
- `CashMapping` is a mock (see `chart-of-accounts`).
- The reconciliation and bank statement queries are disabled (empty id) for the non cash/bank variant, so that variant never calls those endpoints, as before.

## Toasts

Deleting entries or an account toasts once (success and failure), from the shared hooks `useDeleteJournalEntries` and `useDeleteAccount`. The page only closes the modal, clears the selection, invalidates queries and navigates. Archive and restore toast from the page (no shared hook). A failed entry delete now shows the hook's generic message instead of the server message.
