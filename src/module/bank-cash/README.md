# bank-cash

Cash and bank accounts: an overview with the total balance and one account list, and three forms that post a journal: transfer between accounts, receive money and send money. Petty cash is a separate module (`src/module/BankCash/PettyCash` until it migrates).

## Routes (`src/router/routes.ts`)

| Constant                       | Path                            | Page                                                                   |
| ------------------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| `bankCash.main`             | `/bank-cash`                    | `BankAndCashMainPage` (stats, account table, record-transaction menu)  |
| `bankCash.addTransfer` | `/bank-cash/add-transfer-money` | `AddTransferMoneyPage` (`?fromAccountId=` preselects the source)       |
| `bankCash.addReceive`  | `/bank-cash/add-receive-money`  | `AddReceiveMoneyPage` (`?toAccountId=` preselects the deposit account) |
| `bankCash.addSent`     | `/bank-cash/add-sent-money`     | `AddSentMoneyPage` (`?fromAccountId=` preselects the paying account)   |

`index.ts` exports the four pages. The row menu of the account table opens the three forms with the account preselected.

## Endpoint

`POST /v1/journal` (`API_ACCOUNT.POST_TRANSACTION_ACCOUNT`) through the default client, in `infrastructure/bankCashTransactionApi.ts`. The list page reads the account tree (`useJournalAccounts(showArchived)`, `GET /v1/accounts`); the three forms offer the accounts of `GET /v1/accounts/simple?isBankAndCash=true` (flat, postable; the server leaves out headers and the petty cash fund account, and rejects `showArchived`) and read balances from the tree by id. The source and expense select uses the unfiltered simple list.

## Layers

- `domain/`: `transactionPayload` (`buildReceivePayload`, `buildSentPayload`, `buildTransferPayload`, `sumLineAmounts`, `balanceAfter`), `transactionTypes`, `cashBankAccounts` (`flattenCashBankAccounts`, `pettyCashAccountIndex`, `transactionBlock`, `cashBankOptions`), `bankCashSummary` (`summarizeBankCashAccounts`), `accountPrefill` (`withAccountPrefill`, `resolvePrefill`), `transactionForm` (`receiveMissing`, `sentMissing`, `transferMissing`, the journal previews, `balanceAfterReceive`, `todayWib`). All have tests.
- `infrastructure/`: `bankCashTransactionApi` (shapes and posts the payload, throws the server message on a non-2xx answer).
- `presentation/`: pages, components (`stats`, `accounts-table`, `transaction-form`) and hooks: `useBankCashTransactionMutation`, `usePettyCashAccountIndex` (funds to ledger accounts through `@/module/petty-cash`), `useCashBankChoices` (what the forms offer, with `ready` and `isError`), `usePrefilledAccount` (the `?fromAccountId=`/`?toAccountId=` start value).

## Account list

- `GET /v1/accounts` is a tree: a header (for example `1-10000 Kas dan Setara Kas`, `isHead`, not postable) carries its children in `subAccount` and its own `amount` is their sum. `flattenCashBankAccounts` keeps the postable accounts flagged `isBankAndCash`, drops headers and duplicates and names each account's group after its header, so a balance is never counted twice. The page shows the group name as a title row.
- One list, no bank or cash split: the backend has no field for it and the old name heuristic (`isBankAccount`) was wrong (the category "Kas & Bank" contains "bank"), so it is gone.
- The summary is one card: total of the active (not archived) accounts, their count and "balance as of <today, WIB>". Receivables and payables for the next 30 days are not shown: no endpoint provides them and the frontend does not compute accounting figures.
- "Tampilkan akun yang diarsipkan" (`?archived=1`, off by default) calls `useJournalAccounts(true)`; the table also filters on `isArchived` itself, and says "no matching accounts" (not "no accounts yet") when the switch hides every account. An archived account has a badge and only the view action.
- The kind of account is told by the icon in front of its name (with a tooltip and an accessible name): a banknote for a petty cash fund account, a lock for a locked account, a wallet otherwise. No lock or petty cash badge. Locking does not block transactions.
- A petty cash fund account (`GET /v1/petty-cash/funds[].account.id`, closed funds excepted) offers open fund, record voucher and request replenishment in its menu instead of transfer, receive and send, so the imprest control is not bypassed. If the funds cannot be read (no petty cash right, an error) the list renders without that distinction. The server refuses such journals itself: `POST /v1/journal` answers 400 "Akun kas kecil ... tidak boleh dipakai di jurnal manual. Gunakan menu Kas Kecil." (verified live), so the frontend guard is a UX layer.
- Bank connection (module `bank-connection`): the row menu of an active account offers "Hubungkan ke bank" (or "Kelola koneksi bank" when the account carries `bankConnection`). Only when some account carries one does the list add the "Saldo rekening koran" and "Koneksi bank" columns, so nothing changes while the backend has no connections. Petty cash and archived accounts are never offered a connection.
- The forms refuse a `?fromAccountId=`/`?toAccountId=` the simple list does not offer (petty cash, archived, unknown) with a notice and an empty selection, applied once the list has loaded; a failed load shows the load error instead.

## Posting forms

- Receive, send and transfer share one frame (`TransactionFormLayout`, Standard B in `docs/ui-guidelines.md`): header with a way back, two `FormSection` cards on the left, one `TransactionSummaryCard` on the right (sticky). Receive and send are the same form seen from two sides, so both are `CashLinesForm` with `kind="receive" | "sent"` (the pages are thin wrappers); transfer is its own page on the same pieces.
- Field order is the same everywhere: account(s), date, then who or what (receive and send: the party, then lines of account and amount with `AmountLinesEditor`; transfer: the amount), notes last. Labels use plain words ("Masuk ke akun", "Dari akun"); debit and credit appear only in the journal preview.
- The summary shows each account with its balance now and after, the total, one quiet status line (the first thing still missing, or "Siap dibukukan"), Save and Cancel in the same card, and the journal that will be posted behind a disclosure (closed by default, with a check that debit equals credit). Save is disabled until nothing is missing (`*Missing` in `transactionForm`, the single source of the form rules, which now also require a date). A balance that would go negative only shows a warning (orange, the only warm color) and does not block.
- The date starts at today in WIB (`todayWib`), not the browser's or UTC's date. The old "reference number" field of the transfer form was removed: it was never sent to the journal.
- Every form has an optional attachments card (`AttachmentsField`): PDF, PNG or JPG, 30 MB per file, duplicates (same name and size) ignored, each file removable. Without files the request stays JSON; with files `submitBankCashTransaction` sends the multipart shape the manual journal uses (JSON fields as text, each file in `attachments`). Verified live: journal #14596 on the Demo Site carries `uji-lampiran.pdf`.
- After a successful post the mutation waits for the account queries to refresh before returning to the list, so the list never flashes the old balances.

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

- Archived behavior of `GET /v1/accounts` (hidden unless `showArchived=1`, header rollup when a child is archived) is not verified live: the Demo Site has no archived account.
- No statement balance column or bank connection (no backend); no receivables, payables or credit card cards.
- The source and expense select of the forms uses `GET /v1/accounts/simple`, whose `type` is the normal side (`debit`/`credit`), so the label is "code - name" without a category.
- The petty cash distinction on a row appears only after the funds answer; until then the row menu offers the plain actions (the server and the forms refuse the account anyway).
- Currency input uses the Mantine `NumberInput`; amounts with more than two decimals are rounded half up when the journal is built.
- The summary panels keep the Indonesian accounting wording; `en` is a translation of it.
- Component tests cover the account table; the forms need a session and a live API. The mutation hook, the choices and prefill hooks and the API function are covered.
