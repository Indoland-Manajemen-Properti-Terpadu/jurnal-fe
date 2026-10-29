# journal-entries

Creates, lists and shows manual general journal entries (double entry). It is the core accounting module: every other ledger screen reads what is posted here.

## Routes

- `/general-journal/add-transaction-journal` (`routes.generalJournal.addTransactionJournal`): `AddJournalEntryPage`.
- `/general-journal/detail-transaction-journal/:idTransaction` (`routes.generalJournal.detailTransactionJournal`): `JournalEntryDetailPage` (view, print, delete).
- The per-account list of entries (`JournalEntriesTable`) renders inside the account detail page (`GeneralJournal/DetailAccount/Main`).

## Public API (`index.ts`)

`AddJournalEntryPage`, `JournalEntryDetailPage`, `DeleteJournalEntryModal`, `JournalEntriesTable`, `useJournalEntriesByAccount`, `useDeleteJournalEntries`, `useTransactionStore` (the form draft), `useFileStore` (the dropped file, also used by the bank statement import), `useFilterTransaction` (search and date filter of the list), type `JournalEntryByAccount`.

## Endpoints

- `POST /v1/journal` create. Body built by `toCreateBody`. Only HTTP 200 counts as success.
- `GET /v1/journal/account/:idAccount` entries of an account (several response shapes, `toEntriesByAccount`).
- `GET /v1/journal/detail/:id` one entry.
- `DELETE /v1/journal/:id` delete. Bulk delete sends N parallel DELETE requests.
- `GET /v1/tags?page=` and `POST /v1/tags` tags used by the form.

## Domain rules (`domain/journalRules.ts`, tested)

- I1: a new journal saves only if every row has an account and an amount and total debit equals total credit exactly (`isJournalBlocked`, through `@/lib/accounting`). The two-row minimum is enforced by the remove button of the form, not by the gate (as before).
- I2: a row holds one side only. The opposite input is disabled while one side has an amount; the validation card flags a row with both (`holdsBothSides`, `validateDraft`).
- I3: the detail view shows "balanced" when debit and credit are equal after rounding to the cent (`isDetailBalanced`). Create is exact, the view is tolerant: kept, documented.
- I7: opening-balance rows (`transactionNumber === 0`) cannot be selected for deletion in the list.
- Amounts typed in the form are rounded half up to the cent (`parseAmountInput`, was `Number(value) || 0`) and summed on integer minor units, so totals have no float drift.

## State

`useTransactionStore` (rows, notes, totals), `useFileStore`, `useFilterTransaction`: Zustand, in `presentation/store`. TanStack Query keys: `['transaction_by_account', id, {sortBy}]` (list), `['detail_transaction', id]`, `['tags', page]`.

## i18n

Namespace `journalEntries` (`id` and `en`, parity test in `src/i18n/locales/journalEntries.test.ts`).

## Behavior changes of the migration

- R3: the default `apiClient` is used, so failures reach TanStack Query. Before, failed deletes and tag calls showed a green success toast because the legacy helpers swallowed the error. Bulk delete refreshes the lists on success and on failure, because some requests may have gone through.
- R5: the dead invalidation `journal_transactions` after create now refreshes `transaction_by_account`; the reconciliation candidate list got its own key `transaction_by_account_reconcile` (and the match mutation invalidates it).
- `CustomDropzone` no longer reads `useFileStore` itself (shared components must not depend on modules): the page passes `files` and `onRemoveFile`.
- Form totals no longer concatenate strings when a field was focused while empty; they sum on minor units.

## Known gaps (documented, not changed)

- Create succeeds only on HTTP 200: a 201 would be reported as a failure.
- `attachments` go inside a JSON body as `File` objects, which serialize to `{}`. Whether the backend accepts multipart or a separate upload is undocumented.
- Bulk delete is not atomic: if one DELETE fails the others may already be deleted.
- Not enforced: closed-period check, future date guard, posting to header or archived accounts, journal edit or reversal.
- The dropzone accepts 5 MB (the component default) while the hint says 30 MB.
- Typing a decimal point can clear the field: the controlled NumberInput maps a zero value to an empty string.
- `/general-journal/detail-transaction-journal` ignores `?tab=`.
- Ambient type `JournalTransactionTable` (used by the mock `CashMapping`) lives in `GeneralJournal/DetailAccount/CashMapping/types`.
