# bank-statements

Imports a bank statement file for a cash/bank account and lists the imported rows on the account's "Rekening Koran" tab.

## Routes

- `/general-journal/bank-statement/:idAccount/import` (`routes.bankStatements.importDraft`): the draft page where the parsed rows are checked before the import is confirmed.
- No route of its own for the list: `BankStatementTable` and `ImportBankStatementModal` render inside the account detail page (`account-ledger`, `CashBankTabs`) and the reconciliation table.

## Public API (`index.ts`)

`ImportBankStatementDraftPage`, `ImportBankStatementModal`, `BankStatementTable`, `useBankStatement`, type `BankStatementRow`.

## Endpoints

- `GET /v1/bank-statements?accountId=` list. The answer has several shapes; `toStatementRows` accepts all of them.
- `POST /v1/bank-statements/import` multipart (`accountId`, `file`): the server parses the file and answers with preview rows.
- `POST /v1/bank-statements/import/confirm` `{accountId, statements[]}`: confirm the import.
- `POST /v1/bank-statement//:id` (`useSubmitImportBankStatement`): not used by any page.

## Flow and state

1. The modal (3 steps: template, guide, upload) accepts csv, xls, xlsx up to 30 MB. The progress bar is cosmetic.
2. The upload response is written to `localStorage['bankStatementData']` (key and shape unchanged, behind `infrastructure/importDraftStorage.ts`) and the user is sent to the draft page.
3. The draft page reads it into `useBankStatementStore` (Zustand): all, correct and wrong rows, edit and delete of rows.
4. Confirm sends ALL rows (valid or not) with empty sides as `"0"`; the server decides.

## Domain rules

- Sign split of the list (`bankStatementMapper.ts`): positive bank amount = received (`debit`), negative = spent (`credit`, shown as a positive number). Zero or missing goes to neither side. Tested.
- One row holds one side only in the edit modal: filling Received disables Spent and the other way round.

## i18n

Namespace `bankStatements` (`id` and `en`, parity test in `src/i18n/locales/bankStatements.test.ts`).

## Known gaps (documented, not changed)

- Not enforced: invalid rows are warned about but still sent; no duplicate-statement check; the 1,000-row limit named in the guide is not checked.
- `POST_COMMIT_IMPORT_BANK_STATEMENT` ends with a slash, so the URL becomes `/v1/bank-statement//:id`. The hook that uses it is unused.
- The list "Saldo" column shows the received amount, not a running balance; the draft table shows `Rp 0` as balance. The delete button on a list row does nothing.
- The `id` helper text of the confirm dialog reads "setelahproses" (kept verbatim) and the badge "Inreconciled" (kept verbatim in `id`; `en` says "Unreconciled").
- `useFileStore` (the dropped file) now lives in `journal-entries` (exported from its index).
