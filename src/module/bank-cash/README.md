# bank-cash

Cash and bank accounts: an overview with totals and an account table, and three forms that post a journal: transfer between accounts, receive money and send money. Petty cash is a separate module (`src/module/BankCash/PettyCash` until it migrates).

## Routes (`src/router/routes.ts`)

| Constant                       | Path                            | Page                                                                   |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| `bankCash.main`             | `/bank-cash`                    | `BankAndCashMainPage` (stats, account table, record-transaction menu)  |
| `bankCash.addTransfer` | `/bank-cash/add-transfer-money` | `AddTransferMoneyPage` (`?fromAccountId=` preselects the source)       |
| `bankCash.addReceive`  | `/bank-cash/add-receive-money`  | `AddReceiveMoneyPage` (`?toAccountId=` preselects the deposit account) |
| `bankCash.addSent`     | `/bank-cash/add-sent-money`     | `AddSentMoneyPage` (`?fromAccountId=` preselects the paying account)   |

`index.ts` exports the four pages. The row menu of the account table opens the three forms with the account preselected.

## Endpoint

`POST /v1/journal` (`API_ACCOUNT.POST_TRANSACTION_ACCOUNT`) through the default client, in `infrastructure/bankCashTransactionApi.ts`. The accounts come from `@/module/chart-of-accounts` (`useJournalAccounts`); only accounts with `isBankAndCash` are offered as cash or bank.

## Layers

- `domain/`: `transactionPayload` (`buildReceivePayload`, `buildSentPayload`, `buildTransferPayload`, `sumLineAmounts`, `balanceAfter`), `transactionTypes`, `bankCashSummary` (`summarizeBankCashAccounts`, `isBankAccount`), `accountPrefill`. All have tests.
- `infrastructure/`: `bankCashTransactionApi` (shapes and posts the payload, throws the server message on a non-2xx answer).
- `presentation/`: pages, components (`stats`, `accounts-table`, `transaction-form`) and `useBankCashTransactionMutation`.

## Domain rules

- Each typed amount is rounded half up to the cent once; the debit line of a receipt (or the credit line of a payment) is the cent-exact sum of the other lines, so the journal always balances (`0.1 + 0.2` against `0.3`). Missing or non-finite amounts count as 0.
- Receive: the cash account is debited first, the source accounts are credited. Send: the expense accounts are debited, the cash account is credited last. Transfer: the destination is debited and the source credited with the same amount; the same account on both sides blocks the form.
- A form is valid only with an account, at least one row with an account and a positive amount, and (transfer) different accounts. Sending more than the balance only shows an overdraft warning, it does not block.
- Default notes and line descriptions (for example `Penerimaan kas masuk ke Kas Kecil dari PT Maju`) are stored memo text in Indonesian, not UI copy, so they are not translated.

## State

TanStack Query. A successful post invalidates `accounts`, `journal_transactions` and `detail_account`, shows a notification and returns to `/bank-cash`; a failure shows the server message and keeps the form. Form fields are local component state.

## i18n

Namespace `bankCash` (`id` and `en`) for the forms, summaries, table footer and mutation messages, with key and placeholder parity tests in `src/i18n/locales/bankCash.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`. The overview page and the account table still read their existing keys from the `journal` namespace.

## Known gaps

- `isBankAccount` treats every account whose category name contains "bank" as a bank account. The standard category is named "Kas & Bank" (the table even skips it as a subtitle), so cash accounts in that category are counted as bank and the cash total can read 0. Kept as is until the category list is confirmed.
- Currency input uses the Mantine `NumberInput`; amounts with more than two decimals are rounded half up when the journal is built.
- The summary panels keep the Indonesian accounting wording; `en` is a translation of it.
- No component tests; the forms need a session and a live API. The mutation hook and the API function are covered.
