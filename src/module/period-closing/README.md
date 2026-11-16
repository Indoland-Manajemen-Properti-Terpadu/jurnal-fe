# period-closing

Period locks and closing the books, on `/v1/accounting-periods` (backend `main-backend` commit `7e48227`). One list holds both kinds; closing the books is a four-step wizard.

- **Lock (`LOCK`)**: freezes transaction dates. No journal; its name, notes, dates and on/off state can change, and it can be deleted.
- **Closing (`CLOSE`)**: freezes the dates and has the server post a closing journal that moves every revenue and expense balance to retained earnings (`transactionType: CLOSING`). Afterwards only its name and notes change. It is never deleted: the latest active closing is undone with **Buka kembali** (`POST /:id/reopen`), which voids the closing journal and lifts the lock in one request. The period stays in the list as inactive ("Dibuka kembali") with `closedBy`, `reopenedBy` and `reopenedAt`, so the trail of who closed and reopened it is kept; the row shows the reopen date.

## Routes

| Constant                          | Path                                            | Page             |
| --------------------------------- | ----------------------------------------------- | ---------------- |
| `routes.periodClosing.main`       | `/settings/general-journal/closing-books`       | `PeriodListPage` |
| `routes.periodClosing.closeBooks` | `/settings/general-journal/closing-books/close` | `CloseBooksPage` |

Old addresses redirect to the list: the prototype pages (`.../closing-books/list/period-lock`, `.../period-lock/financial-statement`) and the planned settings page `/settings/accounting-periods`, which this module replaces (one place per task).

## List page layout

`PeriodListPage` reads top to bottom: header, `PeriodHero` (what closing does), `PeriodStatusSummary` (the `BooksTimeline` strip of closed, locked and open dates, then three facts), `PeriodGuide` (fold: lock vs close, `PeriodSteps`), and the period table. Drawings are in `PeriodIllustration` (line style shared with the bank connection screens; the module keeps its own copy because that component is private to `bank-connection`). The strip's parts come from `domain/booksTimeline.ts`: widths are fixed weights, not to scale, and the dates under each part say where it ends.

## Access

Menu `JP-GL-PC` "Tutup Buku & Lock Period" (`usePeriodAccess`, from `useMyGrants`): `read` opens the pages, `create` locks and closes, `update` edits and turns a lock on or off, `delete` deletes a lock and reopens a closing. The sidebar entry uses `NAV_MENU.periodClosing`. Without `read` (or on a 403) the page shows the no-access state instead of an empty list. Nothing is hidden before the rights have loaded.

## Endpoints

`infrastructure/periodApi.ts`: `GET /` (list), `GET /:id`, `GET /check`, `POST /`, `PATCH /:id` (a closing sends only `name` and `notes`), `DELETE /:id` (locks only), `POST /:id/reopen`. Dates go out and come back as calendar days (`YYYY-MM-DD`); the server's UTC midnight timestamps are cut to the day, never shifted to a time zone.

Data borrowed for the wizard, through public module APIs:

- Trial balance of the closing range: `trialBalanceApi` from `@/module/reports` (same query key as the report, so the cache is shared). Its totals give the "balanced" check, its profit and loss column the closing journal preview, its `KB` (cash and bank) accounts the reconciliation links.
- Retained earnings account: `useAccountMappings` from `@/module/settings`, key `retained_earnings`.

## Domain rules

- `periodRules.ts`: overlap only between active periods of the same type (the server answers 409 on the same rule; the form says so before saving). Only the active closing with the latest end date can be reopened. The next closing is suggested from the day after the latest closing (or 1 January last year when there is none) to the end of that year, cut back to the end of last month while the year is still running. A gap between the latest closing and a new start date is shown as a warning, not blocked (the server does not require closings to follow each other). Lock quick picks: last month, last quarter, last year, this month. Names are suggested from what the range covers ("Tutup Buku 2025", "Kunci Oktober 2026") until the user types one.
- `closingReadiness.ts`: closing is blocked without a retained earnings account (the server refuses it); an unbalanced trial balance is a warning; three steps only the user can confirm (bank accounts reconciled, adjusting entries recorded, every transaction recorded) must be ticked to go on. Changing the range clears the confirmations.
- `closingPreview.ts`: one line per revenue or expense account with a balance in the trial balance's profit and loss column, on the opposite side, plus retained earnings for the net. Money is added in minor units. It is a preview: the server computes the journal (from the start of the data to the end date) and the page says the final figures may differ.
- The closing journal of the latest closing opens from its row and from the success screen (`routes.journalEntries.detail`).

## Closing wizard guards and lock warning (PRO-81, PRO-83)

- Step 1 of the closing wizard refuses a range whose end has not come yet (`closingRangeIssue` = `endFuture`; today itself is allowed with the old warning) and one longer than a year (`tooLong`): the trial balance of step 2 answers 400 "Rentang waktu maksimal adalah 1 tahun" when the end is later than the same day a year after the start (checked 2026-11-16: 2025-01-01 to 2026-01-01 passes, to 2026-01-02 fails). The Lanjutkan button stays disabled and the message is shown live.
- Step 2 stays blocked while the trial balance could not be loaded (`fail`, `isReadyToReview`); an unbalanced one still only warns. The reason the server gave (a 400 message, `readPeriodError`) is shown next to the check.
- The lock dialog warns when the end date of an active lock has not passed (the "Bulan ini" quick pick); it does not forbid it.

## Server behaviour worked around (checked 2026-11-12)

- `isActive=true` and `isActive=false` both return no rows. `fetchPeriods` does not send `isActive`: with a status filter it reads up to 100 periods of the type and filters and pages them itself. Send `isActive` again once the server filter works.
- `totalResults` once counted a deleted period (`results: []` with `totalResults: 1`); it matched on a later check. With `includeDeleted=true` the count includes the deleted rows it now returns. Reopening used to delete the period; since the backend change of 2026-11-12 it stays as inactive.
- `reopenedBy` (and `closedBy`) come as a bare user id on the list, unlike `createdBy` (an object), so the row shows the reopen date and adds the name only when the server sends one. A page that is not full is the last one, so its rows give the total either way.
- The 409 on `POST` is English and technical ("There is already an active locked period..."), while the 409 on `PATCH` is Indonesian. The screen shows its own text for 403, 404 and 409; 400 messages (Indonesian) are shown as they are.

## Status, deleted locks and change log (PRO-83)

- The list asks `includeDeleted=true` (the table only; the summary and overlap checks read active periods and never ask for deleted ones). Without it the response is unchanged.
- The label is read from `status` alone: `ACTIVE`, `INACTIVE`, `DELETED`, `REOPENED` (`PeriodStatus`). `isActive` is not used for display: a deleted row can keep `isActive: true`. A row without `status` (older response) gets one from its flags in `periodMapper`.
- Under the badge: "Dihapus {date} oleh {name}" (`deletedAt`, `deletedBy`), "Dinonaktifkan {date} oleh {name}" (`deactivatedAt`, `deactivatedBy`), or the reopen date. The name is left out when the server sends none.
- A `DELETED` row has no action menu. The status filter has a "Dihapus" option; `fetchPeriods` filters by `status` (`matchesStatusFilter`), and "Tidak aktif" covers `INACTIVE` and `REOPENED`.
- `activities` (oldest first) open from the history icon of a row (`PeriodHistoryModal`). An `UPDATE` change shows `from` (the stored ISO date) and `to` (the sent `YYYY-MM-DD`) as calendar days. An unknown action shows as "Perubahan".
- Locks deleted or turned off before this backend change have `deletedBy`/`deactivatedBy` null and no `activities`; they do not appear with `includeDeleted=true`, and no history icon is shown for a row without a log.
- Checked on the live service 2026-11-16 (Demo Site, lock "Uji Riwayat FE 2099", create, change end date, off, on, off, delete): `status`, `includeDeleted` and `activities` work. Differences from the ticket's example: `deletedBy` comes `null` while `deletedAt` is set (the name is then read from the last `DELETE` log line), and an `UPDATE` change's `to` is also an ISO timestamp. Rows deleted before the deploy (for example "QA Kunci Uji") have an empty log and no names, so they show only the date.

## State

Server data in TanStack Query (`presentation/hooks/usePeriodQueries.ts`, keys under `accounting-periods`). A write refreshes the periods and the date checks; a closing or reopening also refreshes the reports and journal lists it changes. The list filters and the wizard state are local React state.

## i18n

Namespace `periodClosing` (`id` primary, `en`), in `src/i18n/locales/{id,en}/periodClosing.ts`, with the key and placeholder parity test (`src/i18n/locales/periodClosing.test.ts`) and a hard-coded text guard (`presentation/hardcodedText.test.ts`).

## Known gaps

- There is no endpoint for the last reconciled date of a bank account (the reconciliation endpoint answered 502 when checked), so reconciliation is a confirmation with links to each cash and bank account.
- Transaction forms of other modules do not ask `GET /check` yet; the server still refuses a transaction dated in a locked period.
- Checked against the live service on 2026-11-12 (Demo Site): lock create, overlap 409, turn off, edit; closing create with and without a closing journal (the journal's six lines and totals equal the wizard preview), 400 on changing dates or status of a closing, 400 on deleting one, 400 on reopening an older closing or a lock (messages in Indonesian), date check inside a closed range. Reopening the latest closing (200; the period stays inactive with `reopenedBy` and `reopenedAt`, the date check afterwards is open, an older closing answers 400) was checked on 2026-11-12. The 403 for a role without `delete` was checked too (a role with read, create and update on `JP-GL-PC`: create 201 and edit 200, while deleting a lock and reopening a closing both answer 403 "Forbidden Access Role"), and a transaction posted inside a locked range was not tried.
