# journal-entries

Creates, lists and shows manual general journal entries (double entry). It is the core accounting module: every other ledger screen reads what is posted here.

## Routes

- `/result-reports/business-overview/journal-entry` (`routes.journalEntries.main`): opens from the report center (Laporan Keuangan, section Buku & Jurnal); it has no sidebar item of its own. The old `/journal-entries` address redirects here (`legacyPaths.journalEntries`). Page:: `JournalHistoryPage`, the **Jurnal Umum** (general journal): every posted journal across all accounts, in date order. Needs the read right of menu `JP-GL`. Server-side filters, sort and paging; the filters live in the address (`page`, `limit`, `sort`, `from`, `to`, `status`, `type`, `source`, `account`, `tag`, `q`) so a view can be shared and reloaded (`filtersFromParams` / `filtersToParams` in `domain/journalHistory.ts`). Row click opens the detail; the chevron expands the debit and credit lines; the row's action menu holds "view details" and, only when the entry can be voided (`voidGate`: not `VOID`, not `REVERSAL`, `canVoid` true) and the person holds the delete right of `JP-GL`, "void"; otherwise the void item is not shown (the detail page still explains `voidBlockedReason`).
- `/general-journal/add-transaction-journal` (`routes.journalEntries.add`): `AddJournalEntryPage`.
- `/general-journal/detail-transaction-journal/:idTransaction` (`routes.journalEntries.detail`): `JournalEntryDetailPage` (view, print, void).
- The per-account list of entries (`JournalEntriesTable`) renders inside the account detail page (`account-ledger`, `LedgerTransactionsPanel`).

## Public API (`index.ts`)

`AddJournalEntryPage`, `JournalEntryDetailPage`, `JournalEntriesTable`, `useJournalEntriesByAccount`, `useVoidJournalEntries`, `useTransactionStore` (the form draft), `useFileStore` (the dropped file, also used by the bank statement import), `useFilterTransaction` (search and date filter of the list), type `JournalEntryByAccount`.

## Endpoints

- `POST /v1/journal` create. Multipart body built by `toCreateFormData`; transaction details and tags are JSON fields, and each file is sent in an `attachments` field. Any HTTP 2xx response counts as success.
- `GET /v1/journal` the general journal list. Query: `page`, `limit` (1-100), `sortBy` (`transactionDate|transactionNumber|createdAt[:asc|desc]`), `startDate`, `endDate` (`YYYY-MM-DD`), `status` (`ACTIVE|VOID|REVERSAL`, repeated), `transactionType` (`DEFAULT|OPENING_BALANCE|EXPENSE|CLOSING`), `source` (`manual|system`), `account` (id, repeated; a head account covers its sub accounts, the picker lists only postable ones), `tags` (id, repeated), `search`. Answer `data: { results, page, limit, totalPages, totalResults }`; each result has `transactionDetail` lines, `totalDebit`, `totalCredit`, `sourceType` (`null` = manual), `canVoid`, `voidBlockedReason` (`journalHistoryMapper.ts`). Query key `['journal_history', filters]`, refreshed after a void.
- `GET /v1/journal/account/:idAccount` entries of an account (several response shapes, `toEntriesByAccount`). The server pages it (10 by default), so the client asks `?limit=100` and reads every page (`toTotalPages`); it used to stop at page 1, which hid older entries and made the ledger's journal count and the table wrong for any account with more than 10 entries. The endpoint accepts only `page`, `limit` and `sortBy` (no search, date or status filter: the validator rejects them), so the search and the date filter stay in the browser (`filterEntries`) and the table pages the filtered list on the client (`paginate`, 25 rows by default, 10/25/50/100; the footer shows only above 10 rows). Moving to server paging needs the backend to accept those filters first.
- `GET /v1/journal/detail/:id` one entry.
- `POST /v1/journal/:id/void` void: the original becomes status `VOID` and a `REVERSAL` entry is written. The detail response carries `canVoid` and `voidBlockedReason`.
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

- R3: the default `apiClient` is used, so failures reach TanStack Query. Before, failed deletes and tag calls showed a green success toast because the legacy helpers swallowed the error. Bulk void refreshes the lists on success and on failure, because part of the batch may have gone through.
- R5: the dead invalidation `journal_transactions` after create now refreshes `transaction_by_account`; the reconciliation candidate list got its own key `transaction_by_account_reconcile` (and the match mutation invalidates it).
- `CustomDropzone` no longer reads `useFileStore` itself (shared components must not depend on modules): the page passes `files` and `onRemoveFile`.
- Form totals no longer concatenate strings when a field was focused while empty; they sum on minor units.

## Known gaps (documented, not changed)

- Bulk void is not atomic: the entries are voided one after the other (a parallel batch that partly fails makes the backend answer 500), a failure does not stop the rest, and the toast says how many went through. The list rows carry `canVoid`; a row the server will not void (reconciled, already void, a reversal, petty cash) has no checkbox (`voidGate`).
- Not enforced: closed-period check, future date guard, posting to header or archived accounts, journal edit (the backend has no update endpoint; an entry can only be voided).
- The dropzone accepts 5 MB (the component default) while the hint says 30 MB.
- Typing a decimal point can clear the field: the controlled NumberInput maps a zero value to an empty string.
- `/general-journal/detail-transaction-journal` ignores `?tab=`.
- Ambient type `JournalTransactionTable` (used by the mock `CashMapping`) moved into `chart-of-accounts` (`CashMapping.tsx`) when `GeneralJournal` was removed.

## Detail screen

`JournalEntryDetailPage`: the shared `ModuleHeader` (number as title, a meta line with date, entity, type, balanced state and tags; back, print, void), one `SummaryBar` (total debit, total credit, balance state, number of lines), the lines table and the memo on the left, the facts of the entry (including the system id, shortened with a copy button) and the attachments on the right. Debit and credit share one neutral colour; red is only for a real difference.

There is no edit: the backend has no update endpoint, so a wrong entry is corrected by voiding it and posting a new one. "Batalkan Jurnal" shows only when `canVoid === true` (`voidGate` in `domain/journalVoid.ts`); otherwise a notice shows `voidBlockedReason`, or says the entry is already cancelled (`VOID`, linking to its reversal) or is itself a reversal (`REVERSAL`). The confirm modal states that nothing is deleted. `useVoidJournalEntry` refreshes the ledger lists, details, `['accounts']` and `['detail_account']`. `JournalEntryDetailPage.test.tsx` pins the gate and the confirm step.

`GET /v1/journal/detail/:id` sends `tags` as a LIST OF TAG OBJECTS (`{ id, site, name, color, ... }`, `[]` when none), not a string. The screen used to render `entry.tags` directly and crashed with "Objects are not valid as a React child" on any entry that had a tag (a cash/bank one among them); `domain/journalTags.ts` (`tagNames`) turns the list, a string or the old "-" into names and `JournalEntryTags.test.tsx` pins it.

## Add screen layout

Standard B page: header with the back button, then a form column (transaction info, journal lines, memo and attachments, all flat cards with one icon colour) and a sticky right column with the verification checklist and, under it, the save button (one primary action; the header already has the way back, so there is no second cancel button). The four metric cards above the form were removed: they repeated the totals. The totals sit in the footer of the lines table, under their columns, with a dot and a word for the state (balanced / difference / empty); debit and credit share one neutral colour, red is kept for the difference and its hint only. The double-entry guide is a closed accordion. Column widths (account 6, description 6, debit 5, credit 5 of 24) are the same in the header row, the rows and the totals so amounts do not get cut.
