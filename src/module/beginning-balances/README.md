# beginning-balances

Opening balances of the general ledger: the user picks a conversion (cut-off) date, enters a debit or credit amount per account, saves a draft, and publishes when the totals match.

- **Route** (unchanged): `routes.beginningBalances.main` (`/general-journal/beginning-balance`).
- **Public API (`index.ts`):** `BeginningBalancePage` (router), `BeginningBalanceModal` (a start modal that nothing opens now: the account list no longer repeats Opening Balances, which has its own sidebar entry and opens straight on the page) and `useDraftAccount`.
- **Endpoints** (`API_ACCOUNT`): `GET /v1/accounts/simple` (every account: id, name, code, `type`, `isContra`), `GET get/draft-start-amount`, `GET get/draft-start-amount/logs`, `POST set/draft-start-amount`, `POST set/save-start-amount`.
- **Layers:** `domain/` (types, `openingBalanceRules.ts`), `infrastructure/` (`draftBalanceApi.ts`, `draftBalanceMapper.ts`), `presentation/` (page, components, hooks, `useInitialBalanceStore`).

## Accounts

The table lists every account of `GET /v1/accounts/simple` (it used to use the paged account list and showed only part of the chart). `normalBalance` is the side the account grows on, contra accounts included (live data of 2026-11-13: it equals `type` for every account, e.g. Cadangan Kerugian Piutang is credit, Diskon Penjualan debit), so the row uses it as it is. Only an answer without `normalBalance` falls back to the old rule, `isDebitNormal({ isDebit: type === 'debit', isContra })`, which flips a contra account; applying that flip to the new answer showed contra accounts on the wrong side. The class filter reads the first digit of the code (1 assets ... 8 other expenses). A saved draft line for an account the list lacks (the server's `Pembulatan` master account) is kept when it has an amount, so the totals shown are the totals saved.

## Payload (draft and publish are the same body)

```json
{
  "period": "2026-04-07",
  "balances": [
    { "account": "<id>", "debit": 100000 },
    { "account": "<id>", "credit": 102000 }
  ]
}
```

Only the accounts with an amount are sent, each with only the side that has one (`buildBalancePayload`). The old duplicate keys (`accounts`, `account`/`accounts` per line) and the zero lines are gone. A saved draft replaces the previous one as a whole, so an account left out is zero.

## Domain rules

- **A draft needs no balance; a publish does.** Save Draft is enabled when something changed (an unbalanced draft is allowed, it is work in progress); Publish when the totals balance above zero, or when they differ and the chart has the opening equity account (`openingActions`): the confirm dialog then says the gap is recorded to Ekuitas Saldo Awal, and the payload is built from `balanceToEquity` (the account's amount is set to what balances, in cents). Without that account a gap cannot be published. A disabled button has a tooltip with the reason. Checked 2026-11-13: the server now accepts an unbalanced draft (200).
- **Published.** Save Draft is not shown once `isPublished` is true. Update & Publish is enabled only after a change.
- **Conversion date window** (`buildConversionWindow`, checked 2026-11-13 against the live service): the server refuses a date that is not after the end of the latest active closing (`Tanggal saldo awal tidak boleh sebelum akhir periode Tutup Buku`, even for days that `GET /check` reports as not locked) and a date after the first journal. The page reads the closing through `useLatestClosingEnd` (public API of `period-closing`) and the first journal day from the draft, or, while no draft exists (the answer is then only `{ status: false }`), from `GET /v1/journal?limit=1&sortBy=transactionDate:asc`. The date picker gets both as `minDate` and `maxDate`. When the closing ends after the first journal no day fits (`conflict`) and the first-visit screen sends the user to Closing Books instead of a date picker. The suggested day is the day before the first journal (capped at today, raised to the first allowed day), so reports that start on the first journal open with this balance.
- **Conversion date** (`conversionDateIssue`): refused when it falls in a locked accounting period (`GET /v1/accounting-periods/check?date=` answers `{ isLocked, period }`) or after the first regular journal (`firstTransactionDate` of `GET draft`, `null` without one; the date picker uses it as `maxDate`). Either one shows an error under the date and blocks Save Draft and Publish. `firstTransactionDate` is optional until the BE releases it; before that the server's own refusal at publish (`Tanggal saldo awal tidak boleh setelah transaksi pertama (...)`) is shown as it is. The check against a locked period was not tried against real data (the dev tenant has no accounting period).
- Amounts: typed with live thousands dots (`200000` shows as `200.000`, decimals after a comma, `formatAmountInput`) and the caret stays after the digit typed; read in the Indonesian format (`parseAmountEntry`), rounded to the cent; a row holds one side (typing a positive value clears the other side); a value on the non normal side only gets a small note.
- Tests: `domain/openingBalanceRules.test.ts`, `TableBeginningBalance.test.tsx`, `BeginningBalancePage.test.tsx` (payload, gates, published state).

## Server validation (checked 2026-11-13, draft endpoint, after reopening the closing)

Refused (400): a negative amount, an unknown account id (`Invalid account data`), the same account twice (`Invalid account data`), a date after the first journal, a date before the end of the latest closing. Accepted (200), so only this screen guards them: a line with both debit and credit, and an amount with more than two decimals (`1000.005`). The screen sends one side per line and rounds to the cent, so neither reaches the server from here. Publishing an unbalanced or odd body was not tried: it would post a real opening journal on the shared Demo Site.

## What the screen starts from

`GET draft` answers `{ data: draft }`, `{ data: { status: false } }` (no draft) or, on an HTTP error body, the same. After a publish the draft holds the published amounts, but its `period` is still the one of the last draft save (the published date is only in the log), so `resolveSavedBalance` takes the date of the latest publish log (`action` `PUBLISH` for the first publish, `UPDATE` for a later one). If a server version empties the published draft (all lines zero), the amounts come from that log too. Before a publish the draft is the source. The saved state is laid over the account list, and "unsaved changes" compares the screen with it. A refetch only replaces the table while nothing was changed on screen.

## First visit

With no saved amounts (no draft, an empty draft, nothing published) the page opens `OpeningIntro` before the table: hero, the conversion date card (or the conflict card), what to prepare (cash and bank, receivables and payables, inventory and fixed assets, equity), and the four steps. "Mulai isi saldo awal" opens the table with the chosen date. Once a draft with amounts or a publish exists the intro is skipped. Drawings are in `OpeningIllustration` (own copy of the line style, the other modules' components are private).

## State

`useInitialBalanceStore` (Zustand) keeps the chosen conversion date between the start modal and the page. Query keys unchanged: `draftAccounts`, `draftBalanceLogs`.

## i18n

Namespace `beginningBalances` (`id` text verbatim from the old code and the `journal` keys, `en` added), parity test in `src/i18n/locales/beginningBalances.test.ts`. The old `journal` keys for this page stay because other screens share some of them.

## Known gaps

- No guard against double counting a parent and its children, and no cut-off versus earliest journal check on the client (the server checks the date at publish).
- Amounts are plain numbers summed with floats; the gates normalise to cents.

## UI

Standard A page: `ModuleHeader` with one primary action, one `SummaryBar` (debit, credit, balance, filled accounts), then one panel with the toolbar (search, class, filled only, conversion date, clear values) and the table. The table shows every filtered account on one page that the page scrolls (no paging, no inner scroll). Accounts sit under a header row per class that shows only the category name (`groupOpeningRows`: Aset, Kewajiban, ... Beban Lain-lain; no number, count or subtotal); the column titles stay under the app bar while scrolling (`overflow: clip` on the wrapper, because the theme's table hides overflow and that stops `position: sticky`; on a phone the table scrolls sideways and the titles do not stick). Neutral inputs, no per-side colours; the publish confirm uses `illustrations/publish-balance.svg` and the primary button.
