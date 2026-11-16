# Cash & Bank accounts list and petty cash guard: design

Status: draft for review. Date: 2026-11-12. Modules: `bank-cash`, `petty-cash` (link only).

## Goal

The Cash & bank page lists every postable account of the Cash & Bank category in one list, can show or hide archived accounts, and keeps the petty cash imprest controlled: money in or out of a petty cash fund account goes through the petty cash flow, never a plain journal.

## Verified facts (Demo Site, finance2, read-only requests, 2026-11-12)

- `GET /v1/accounts` is hierarchical. The only top-level account with `isBankAndCash` is the header `1-10000 Kas dan Setara Kas` (`isPostable: false`, amount = sum of its children). Six real accounts sit in its `subAccount` (1-10001 to 1-10005, 1-10099), all `isBankAndCash: true`, `isPostable: true`.
- The page filters only the top level, so it shows the header and none of the real accounts. Flattening without dropping headers would count balances twice.
- `?showArchived=1` is accepted; the site has no archived account, so the hide-by-default behavior of the server is not proven live. The UI must not depend on it: it filters on `isArchived` itself.
- `GET /v1/petty-cash/funds[].account.id` equals the id of `1-10002 Kas Kecil Kasir`. The fund's `cashBalance` (390.000) differs from the ledger balance (500.000) because of pending items the server computes.
- There is no field that tells bank from cash. The name heuristic `isBankAccount` is unreliable ("Kas & Bank" contains "bank").

- `GET /v1/accounts/simple?isBankAndCash=true` returns 5 flat postable accounts without `1-10002` or the header; without the filter it returns 175. The reason the server omits `1-10002` is not confirmed (ask the backend team).

## Decisions (agreed)

1. Petty cash accounts stay in the list with a "Kas kecil" badge and a link to their fund. Receive, send and transfer for them are disabled and point to voucher, replenishment and count.
2. Bank and cash are not told apart. One list, no Bank/Cash tabs or cards.

## Design

### Domain (`bank-cash/domain`)

- `flattenCashBankAccounts(accounts)`: walks `subAccount` recursively, keeps accounts with `isBankAndCash && isPostable !== false`, drops headers, de-duplicates by id, keeps the header name as `groupName`.
- `summarizeBankCashAccounts`: active (not archived) accounts only; returns `total` and `accountCount`; money through `@/lib/money` (`toMinor`, `sumMinor`, `fromMinor`). Remove `isBankAccount` and the bank/cash fields.
- `pettyCashAccountIndex(funds)`: map `account.id -> { fundId, fundName, status }`.
- `transactionBlock(account, index)`: `'archived' | 'pettyCash' | null`, used by the list row menu only; the forms rely on the simple accounts endpoint.

### Data

- Page calls `useJournalAccounts(showArchived)`. A new read hook in `bank-cash/presentation/hooks` reads the petty cash funds through the petty-cash public API (`@/module/petty-cash` export, no deep import). If the user has no petty cash right or the call fails, the list still renders without badges and the guard falls back to the server answer on post.
- Archived accounts are hidden unless the toggle is on, whatever the server returns.

### UI

- Header: title, "Catat transaksi" menu, "Tambah akun" (as today).
- Summary: Cash & bank balance with account count, and "saldo per <tanggal hari ini>". Receivables/payables 30 days only if an endpoint exists; otherwise omitted (no frontend-computed figures). Open point, see below.
- Toggle "Tampilkan akun yang diarsipkan" (off by default), state in the URL (`?archived=1`).
- Table grouped under the header account name: Kode, Nama, Saldo di Jurnal, Aksi. Red figure for a negative cash balance. Search stays; the sort select stays; the bank/cash tabs go. Archived rows carry a badge and only the view action.
- Petty cash rows: badge and link; menu offers "Buka kas kecil", "Catat voucher", "Ajukan penggantian" instead of receive/send/transfer.
- Forms (`add-receive`, `add-sent`, `add-transfer`): options come from `GET /v1/accounts/simple?isBankAndCash=true` (flat, postable, and verified live to omit the petty cash account `1-10002` and headers; it rejects `showArchived`), with balances read from the account tree by id. The source and expense select uses the unfiltered simple list, which also fixes missing sub accounts there. A `?fromAccountId=`/`?toAccountId=` not offered by that list shows a notice and clears the preselection. The petty cash funds query is not needed in the forms.
- No bank statement column or "Connect to bank" button (no backend). "Import bank statement" only if the `bank-statements` module already has the flow; decided at planning.

### Petty cash

No change to the imprest flow. Add a link back to the ledger account and show "Saldo buku vs saldo kas fund" when they differ, as server figures.

### Error handling

- Accounts load failure: existing alert. Funds load failure: no badges, no block.
- A post that the server refuses keeps the form and shows the server message (unchanged).

### i18n

New keys in `bankCash` (`id`, `en`), parity tests extended. Wording is professional and business-facing: no server, API or code terms.

### Tests

- Flatten: header dropped, no double count, nested depth, archived, duplicate ids.
- Summary: excludes archived, cent-exact sum.
- Guard: petty cash and archived accounts rejected; others allowed.
- i18n parity and hard-coded-text guard.
- Browser check on the Demo Site as finance2: six accounts visible, 1-10002 badged and linked, toggle works, forms reject 1-10002.

## Out of scope

Bank connection, statement balance column, backend changes, bank vs cash classification, changing the petty cash workflow.

## Open points for the product owner

- Receivables/payables 30-day cards: is there an endpoint to read, or leave them out for now? Default: leave out.
- Archived-by-default behavior of `GET /v1/accounts` needs a backend answer; not blocking.
