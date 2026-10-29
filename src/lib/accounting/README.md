# lib/accounting

Pure accounting rules (no React, no HTTP). Amounts go through `@/lib/money` as integer minor units.

- `normalBalance.ts`: `isDebitNormal({ isDebit, isContra, categoryName })`. The backend `isDebit` flag wins; without it the Indonesian keywords (kewajiban, hutang, liabilitas, modal, ekuitas, pendapatan, penjualan) mean credit; `isContra` flips the result.
- `journalBalance.ts`: `isJournalBalanced`, `journalDifference` (decimal string), `canPublishOpeningBalance` (totals equal and above zero), `canConfirmMatch` (selected amount equals the absolute bank amount).
- `accountTypes.ts`: `getCategoryPrefix` (chart of accounts prefix 1 to 8).

## Rounding policy

Every amount is rounded half up to the cent (decided on its 15 significant digit decimal value, so `1500.505` becomes `1500.51` and `0.1 + 0.2` becomes `0.30`), then summed and compared as integers. `NaN`, `Infinity`, empty and non numeric strings are invalid: the boolean functions return `false`, `journalDifference` throws a `RangeError`.

## I1 versus I3

Before the kernel, journal create (I1) compared the float sum of debit minus credit with `!== 0`, and the journal view (I3) used `abs(debit - credit) < 0.01`. Both now use integer cent equality. For data with at most two decimals the outcome is the same, with one improvement: float drift such as debits `0.1` and `0.2` against a credit `0.3` used to block create and now saves. For data with more than two decimals the view differs: `100.009` against `100` read as balanced (difference below 0.01) and now reads as unbalanced (`100.01` versus `100.00`). The same applies to the reconciliation match gate, which compared floats exactly.
