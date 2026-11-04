# bank-statements

Imports a bank statement file for a cash/bank account and lists the imported rows on the account's "Rekening Koran" tab.

## Routes

- `/general-journal/bank-statement/:idAccount/import` (`routes.bankStatements.importDraft`): the draft page where the parsed rows are checked before the import is confirmed.
- No route of its own for the list: `BankStatementTable` and `ImportBankStatementModal` render inside the account detail page (`account-ledger`, `CashBankTabs`) and the reconciliation table.

## Public API (`index.ts`)

`ImportBankStatementDraftPage`, `ImportBankStatementModal`, `BankStatementTable` (no props), `useBankStatement`, `summarizeStatements`, type `BankStatementRow`.

## Endpoints

- `GET /v1/bank-statements?accountId=` list. The answer has several shapes; `toStatementRows` accepts all of them.
- `POST /v1/bank-statements/import` multipart (`accountId`, `file`): the server parses the file and answers with preview rows.
- `POST /v1/bank-statements/import/confirm` `{accountId, statements[]}`: confirm the import.
- `DELETE /v1/bank-statements/:id` (`useDeleteBankStatement`): deletes an imported row; the server refuses a row that is already reconciled (400).
- `POST /v1/bank-statement//:id` (`useSubmitImportBankStatement`): not used by any page.

## Flow and state

1. The modal (3 steps: template, guide, upload) accepts csv, xls, xlsx up to 30 MB. The progress bar is cosmetic.
2. The upload response is written to `localStorage['bankStatementData']` (key and shape unchanged, behind `infrastructure/importDraftStorage.ts`) and the user is sent to the draft page.
3. The draft page reads it into `useBankStatementStore` (Zustand): all, correct and wrong rows, edit and delete of rows.
4. Confirm sends only the VALID rows (empty sides as `"0"`). The server accepts a row with an empty description or with both sides filled, so the screen is the gate. The confirm dialog says how many rows are skipped.

## Domain rules

- `importValidation.ts`: `validateImportRow` applies the preview rules again after a row is edited (description, a real `dd/mm/yyyy` date, one side greater than 0, plain numbers), so an edited row is never marked valid just because it was edited; the edit modal blocks Save while a rule fails. `parseServerImportError` maps the English server messages to codes the screen translates (`importDraft.errors.*`).
- `statementSummary.ts`: `summarizeStatements` (cents), `sortStatementsNewestFirst`, `findDuplicateRows` (same day, signed amount and description; the first occurrence in the file is never flagged; the server does not check this). The draft page warns and offers "remove duplicates".

- Sign split of the list (`bankStatementMapper.ts`): positive bank amount = received (`debit`), negative = spent (`credit`, shown as a positive number). Zero or missing goes to neither side. Tested.
- One row holds one side only in the edit modal: filling Received disables Spent and the other way round.

## i18n

Namespace `bankStatements` (`id` and `en`, parity test in `src/i18n/locales/bankStatements.test.ts`).

## Template

`public/templates/csv/bank-statement-template.csv` uses the header `Description,TransactionDate,Received,Spent`. It used to say `Transaction`, which the server rejects ("Unexpected field(s): Transaction", empty description), so every row of a file made from the old template was invalid; the draft page now explains that and asks for the latest template.

## List tab

One table (date, description, received, sent, status, action), newest first, with a summary line (rows, received, sent, unmatched). Status is a dot and a word, not a badge. Delete works for an unmatched row (confirm dialog) and is disabled for a matched one. The old "Saldo" column repeated the received amount and is gone; so is the row selection nobody used and the link to `/transaction/:id` that went nowhere. Loading, error (with retry), empty and no-match states are separate.

## Known gaps (documented, not changed)

- Not enforced on the server: duplicate rows and the 1,000-row limit named in the guide.
- `POST_COMMIT_IMPORT_BANK_STATEMENT` ends with a slash, so the URL becomes `/v1/bank-statement//:id`. The hook that uses it is unused.
- The number format of the file is strict (`1000000.50`, no thousands separator); `1.000.000,50` is rejected by the preview.
- `useFileStore` (the dropped file) now lives in `journal-entries` (exported from its index).
