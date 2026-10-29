# reconciliation

The "Rekonsiliasi Bank" tab of a cash/bank account: pairs imported bank statement rows with journal lines and confirms the pairs on the server.

## Routes

None of its own. `ReconciliationTable` renders inside the account detail page (`GeneralJournal/DetailAccount/Main`, tab host `ReconciliationTabs`), at `/general-journal/detail-account-cb/:idAccount`.

## Public API (`index.ts`)

`ReconciliationTable` (the tab content) and `useReconciliation(idAccount)` (the detail page reads the unreconciled count and the balance from it).

## Endpoints

- `GET /v1/reconciliation/:idAccount`: statements with `matchedJournalDetail` and `recommendations`, optional `balance`.
- `GET /v1/reconciliation/bank-statements/:bankStatementId/journal-details`: candidates for the manual modal (`data.results`, other shapes accepted).
- `POST /v1/reconciliation/match-multiple` `{ matches: [{ bankStatementId, journalDetailIds }] }`. A failed request throws (status >= 400) and the error toast shows the server message.

## Domain rules (`domain/matchRules.ts`)

- I8: the manual modal confirms only when the selected total equals the absolute bank amount (`canConfirmMatch` of `@/lib/accounting`, exact to the cent, float noise absorbed).
- Direction filter: a positive bank amount (received) lists journal lines with a debit, a negative one (sent) lists lines with a credit, zero lists all.
- `journalDetailId` per account: a row with `transactionDetail` sends the line whose `account` equals the open account (falls back to the row id); other rows send their id.
- Display balance when the server sends none: debit minus credit of the top recommendation of each statement, in cents (plain float fallback above two decimals).
- Auto-match (checkboxes on rows showing a match or recommendation, then "Rekonsiliasi") keeps accepting the server recommendation: NO client check of amounts or direction. Only the manual modal enforces I8.

## State

TanStack Query keys: `['get_reconciliation', idAccount]`, `['journal_details_for_recon', bankStatementId]`. After a match it refreshes those plus `bank_statement`, `transaction_by_account`, `detail_account`. Selection and removed recommendations are local state (`useReconciliationMatches`).

## i18n

Namespace `reconciliation` (`id` verbatim, `en` added, parity test in `src/i18n/locales/reconciliation.test.ts`).

## Known gaps (documented, not changed)

- The trash button only hides a recommendation locally; it does not unmatch anything on the server. The "Rekonsiliasi" success dialog says the action cannot be undone, and there is no undo screen.
- The bank balance in the header is derived from recommendations when the server omits it, so it is not a statement balance.
- A failed list request now shows the not-found page instead of the empty state (the old shared `get` returned the error body as data).
- Removed: dead service `GetTransactionByAccountRecon` and its types, the page wrapper with a commented-out modal, and the never-filled `manualMatches` state.
