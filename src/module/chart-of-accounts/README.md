# chart-of-accounts

Hub API only; the rest of chart-of-accounts moves in Task 6 (see `docs/superpowers/plans/2026-10-29-m3-ledger.md`). The account pages, forms, import/export and stores still live in `src/module/GeneralJournal`.

- **Public API (`index.ts`):** `useJournalAccounts`, `getJournalAccounts`, `JournalAccounts` (type), `useDeleteAccount` (was `useDeleteJurnalAccount`).
- **Endpoints:** `API_ACCOUNT.GET_ALL_ACCOUNT` (list, optional `showArchived=1`), `API_ACCOUNT.DELETE_ACCOUNT` (bulk delete by `accountIds`).
- **State:** query key `['accounts', showArchived]`; delete invalidates `['accounts']` and clears the selection in `store/useAccountLedger`.
- **Domain rules:** the list service throws when `results` is not an array.
- **Shims:** one-line re-exports remain under `GeneralJournal/JournalAccount/{types,services,hooks}` for GeneralJournal-internal callers; removed in the last ledger task.
- **Known gaps:** delete hook keeps its English toast texts and the swallowing `del` helper (R3 fix comes with Task 6); i18n not done.
