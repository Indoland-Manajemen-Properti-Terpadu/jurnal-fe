# chart-of-accounts

Chart of accounts: account list, add/edit account forms, account detail query, settings (import, export, restore) and the cash mapping tab. Task 6 PR (a) moved everything here from `GeneralJournal`; PR (b) extracted the account rules and split the add/edit forms; i18n and the throwing calls follow in PR (c).

- **Public API (`index.ts`):** `useJournalAccounts`, `getJournalAccounts`, `JournalAccounts`, `useDeleteAccount` (was `useDeleteJurnalAccount`), `useDetailAccount`, `archiveAccount`, `accountDetailData`, `DetailAccountModel`, `useAccountStore` and `CashMapping`. The three route pages are imported by the router from `presentation/pages/*` directly (exporting them from the index creates a cycle with `beginning-balances`).
- **Layout:** `domain/` (types), `infrastructure/` (`accountApi`, `accountDetailApi`, `accountSettingApi`), `presentation/{pages,components,hooks}`.
- **Routes:** unchanged; the router imports the three pages from the index.
- **Endpoints:** `API_ACCOUNT.*` (list, detail, archive, delete, category, create, update, import/export/restore).
- **State:** query keys `['accounts', showArchived]` and `['detail_account', id]`; selection store `useAccountStore` (zustand).
- **Cash mapping:** `CashMapping` is a mock (static data), kept as is.
- **Domain rules (`domain/accountRules.ts`, pure, tested):**
  - I5 normal balance: `resolveEffectiveDebit` goes through the kernel `isDebitNormal` (`@/lib/accounting`): category `isDebit` (debit when unset), flipped for a contra account. No keyword fallback on the create form.
  - I6 create: name at least 3 characters (`validateCreateName`), code and category required, a Sub account requires `headAccountId`, a single account with a restricted scope needs members (`isHierarchyAndAccessValid`). Edit keeps a weaker name rule (non-empty, `validateEditName`): the 3-character rule is create only, kept as is. `isCashBankCategory` auto-sets `isBankAndCash` from category `KB` or a name with "kas"/"bank"; `getCategoryPrefix` (kernel `accountTypes`, re-exported) is the code prefix map by category.
  - I7 locked accounts: `isAccountSelectable` (used by the account table), `canDeleteAccount`, `canArchiveAccount` and `canChangeCategory` (the edit form disables the category and hides the hierarchy card). Delete and archive are only reachable through the selection, so the predicates are not called there yet.
  - Also pure: `buildAccountPayload` (one payload for create and update), `mapAccountDetailToFormState`, `groupCategoryOptions`, `ACCOUNT_PRESETS` (quick templates; the short keyword `ap` also matches "Pendapatan", kept).
- **Form layout:** `presentation/components/account-form/` holds the sections of both pages (`AddAccount*Section`, `EditAccount*Section`, `AccountPresetPicker`, `AccessMemberSelects`); `hooks/useAccountFormOptions` and `hooks/useAccountPlacementState` are shared. The two pages render different markup (add is the stepped layout, edit the compact one), so only logic and the member selects are shared.
- **Known gaps:** `AccountListPage` (484), `ImportAccountWizardModal` (495) and `SettingAccountModal` (432) exceed 400 lines (PR c); actions still use the swallowing `post/patch/del` helpers (R3); `download` error-body bug (R7); i18n not done. `CashMapping` types file was unused and left in `GeneralJournal/DetailAccount/CashMapping/types`.
