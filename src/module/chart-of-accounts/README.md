# chart-of-accounts

Chart of accounts: account list, add/edit account forms, account detail query, settings (import, export, restore) and the cash mapping tab. Task 6 PR (a) moved everything here from `GeneralJournal`; rules extraction, form split, i18n and the throwing calls follow in PRs (b) and (c).

- **Public API (`index.ts`):** `useJournalAccounts`, `getJournalAccounts`, `JournalAccounts`, `useDeleteAccount` (was `useDeleteJurnalAccount`), `useDetailAccount`, `archiveAccount`, `accountDetailData`, `DetailAccountModel`, `useAccountStore` and `CashMapping`. The three route pages are imported by the router from `presentation/pages/*` directly (exporting them from the index creates a cycle with `beginning-balances`).
- **Layout:** `domain/` (types), `infrastructure/` (`accountApi`, `accountDetailApi`, `accountSettingApi`), `presentation/{pages,components,hooks}`.
- **Routes:** unchanged; the router imports the three pages from the index.
- **Endpoints:** `API_ACCOUNT.*` (list, detail, archive, delete, category, create, update, import/export/restore).
- **State:** query keys `['accounts', showArchived]` and `['detail_account', id]`; selection store `useAccountStore` (zustand).
- **Cash mapping:** `CashMapping` is a mock (static data), kept as is.
- **Known gaps:** `AddAccountPage` (about 1370 lines), `EditAccountPage` (about 800), `AccountListPage` (482), `ImportAccountWizardModal` (495) and `SettingAccountModal` (432) exceed 400 lines; actions still use the swallowing `post/patch/del` helpers (R3); `download` error-body bug (R7); i18n not done. `CashMapping` types file was unused and left in `GeneralJournal/DetailAccount/CashMapping/types`.
