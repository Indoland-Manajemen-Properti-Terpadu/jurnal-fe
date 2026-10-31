# lib/accounting

Pure accounting rules (no React, no HTTP). Amounts go through `@/lib/money` as integer minor units.

- `normalBalance.ts`: `isDebitNormal({ isDebit, isContra, categoryName })`. The backend `isDebit` flag wins; without it the Indonesian keywords (kewajiban, hutang, liabilitas, modal, ekuitas, pendapatan, penjualan) mean credit; `isContra` flips the result.
- `journalBalance.ts`: `isJournalBalanced`, `journalDifference` (decimal string), `canPublishOpeningBalance` (totals equal and above zero), `canConfirmMatch` (selected amount equals the absolute bank amount).
- `accountTypes.ts`: `getCategoryPrefix` (chart of accounts prefix 1 to 8).

## Gates are exact, display rounds

- Gates: `isJournalBalanced`, `canPublishOpeningBalance`, `canConfirmMatch`. Each amount is normalized to 15 significant digits (this absorbs float noise, so `0.1 + 0.2` equals `0.3`) and converted with `toMinor`. An amount with more than two decimals is not valid money: the gate returns false and the action stays blocked (`100.004` against `100` is not balanced, `1500.505` is invalid). `NaN`, `Infinity`, empty and non numeric strings also return false. Gates never round and never throw.
- Display: `isJournalBalancedForDisplay` and `journalDifference` round each amount half up to the cent (`1500.505` becomes `1500.51`), so stored data with extra decimals can be rendered without crashing. Only non finite input is invalid: the boolean returns false, `journalDifference` throws a `RangeError` (no call site uses it today).

## I1 versus I3

Journal create (I1) is a gate; it compared the float sum of debit minus credit with `!== 0` and now uses the exact gate. For data with at most two decimals the outcome is the same, with one improvement: float drift such as debits `0.1` and `0.2` against a credit `0.3` used to block create and now saves. Data with more than two decimals stays blocked, as before.

The journal view (I3) is display; it used `abs(debit - credit) < 0.01` and now uses `isJournalBalancedForDisplay`. Same outcome for two-decimal data and for sub-cent gaps that round away (`100.004` against `100` reads balanced). It differs only when rounding crosses a cent: `100.009` against `100` read as balanced and now reads unbalanced. The reconciliation match (I8) was exact float equality and is now the exact gate, which also accepts `0.1 + 0.2` against `0.3`.

## Rules fixed on 2026-10-31

- `getCategoryPrefix`: a known backend code (BLN, PLN, BEB, HPP, PEN, EKU, AH, KLL, KJP) always wins; the Indonesian name is only the fallback for unknown or missing codes. Before, a keyword in the name could override the code (code `HPP` named "Beban Pokok Penjualan" got prefix 6). A name-based guess can still be wrong for a code the table does not know (for example "Biaya Dibayar Dimuka" is an asset but reads as an expense); that needs the backend category list.
- `isDebitNormal` fallback: "harga pokok", "pokok penjualan", "beban penjualan" and "biaya penjualan" are debit normal even though they contain "penjualan" (a credit keyword). The backend `isDebit` flag still wins when present.
