# reconciliation

The "Rekonsiliasi Bank" tab of a cash/bank account: pairs imported bank statement rows with journal lines and confirms the pairs on the server.

## Routes

None of its own. `ReconciliationTable` renders inside the account detail page (`account-ledger`, `CashBankTabs`), at `/general-journal/detail-account-cb/:idAccount`.

## Public API (`index.ts`)

`ReconciliationTable` (the tab content) and `useReconciliation(idAccount)` (the detail page reads the unreconciled count and the balance from it).

## Endpoints

- `GET /v1/reconciliation/:idAccount`: ONLY the statement rows that are not reconciled yet (with `recommendations`), `unreconciledJournalDetails` (journal lines of the account with no statement row) and `balance`, which is the net of those unreconciled rows, not a bank balance. A matched row leaves this list.
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

## Screen

- Summary of the two open sides (statement rows with no journal, journal lines with no statement row, and the difference), then one row per statement: tick box and bank item on the left, the suggested journal line(s) on the right with "same day / n days apart", then a bar with the selection count and the single primary action. Journal lines that wait for a statement are listed below (`UnmatchedJournals`).
- One journal line can back one statement row. Two imported rows that are alike suggest the same line and the server then fails the whole request (a request that mixes valid and invalid matches even ends in a 500: "Cannot call abortTransaction twice"). `matchGuards.ts` blocks the second ticked row (disabled box with a hint), warns on rows that share a suggestion, and `matchSelected` leaves a blocked row out.
- The X on a suggestion hides it on this screen only ("restore" brings it back); there is no unmatch on the server (no endpoint), which the confirm dialog says.
- A failed match shows a reason (`infrastructure/matchErrors.ts`: amount mismatch, already reconciled, row gone, server error), never the raw server text.
- The empty state tells "nothing imported" (ask to import) from "all rows matched" (the statement list still has rows), because this list drops matched rows.

## Known gaps (documented, not changed)

- No unmatch: a reconciled pair cannot be undone from the app.
- The backend 500 on a partly failing request is a server defect; the screen avoids sending such a request.
