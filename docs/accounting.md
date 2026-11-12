# Accounting Rules

How money and ledger rules are handled in the frontend. Product behavior comes from the backend and the approved requirements; the frontend never invents financial rules.

## Correctness

- Never introduce financial rules that are not supported by the existing product or an approved requirement.
- Do not use JavaScript floating-point arithmetic for money calculations. Preserve the API's established decimal or minor-unit representation and use its documented rounding rules. If the contract is unclear, ask before choosing a representation or rounding behavior.
- Keep accounting calculations out of views. Use domain/application code and cover important rules with focused tests when implementation and verification are requested.
- Treat date-only values, timestamps, currency, sign conventions, and period boundaries according to the verified API/product contract. Do not silently convert time zones or round values in presentation code.

## Money

Money math uses integer minor units through `src/lib/money` (`toMinor`, `fromMinor`, `sumMinor`). Convert at the API boundary, sum with `sumMinor`, never add or compare money as floats in views. See [ADR 0005](adr/0005-integer-money-and-localstorage-tokens.md) and [migration/money-audit.md](migration/money-audit.md).

## Tax, discount and depreciation

- **VAT (PPN) and withholding (PPh) base (sales invoices):** the discount is spread over the lines in proportion to their amount; VAT is charged on each line after its share of the discount (rounded to the cent per line), and PPh is a share of the subtotal after the discount: `total = subtotal - discount + VAT`, `final = total - withholding`. With tax-inclusive prices each line is first reduced to its price without tax and follows the same rule. The form estimate (`calculateSaleTotals`) follows this rule; the server changed it on 2026-11-11 (it used to charge VAT on the full price and PPh on the subtotal before the discount) and it was verified against the live service. A discount never exceeds the amount it applies to.
- **Receivables:** draft and void sales are not receivables (never overdue, not in receivable totals). A payment may not be zero, negative or above what is still owed.
- **Revenue:** monthly sales are net sales before VAT and withholding, not the invoice total.
- **Working capital:** current assets minus current liabilities only.
- **Depreciation:** list and schedule share one rule per method; the final year closes to the residual value.

## Petty cash pockets

A petty cash fund's pockets (cash box, bank account, e-wallet) share one ledger account and only itemize the cash book. The general ledger balance equals the ceiling, a transfer between pockets posts no journal, and the screens never recompute pocket balances. Per-pocket bank reconciliation is not supported; see [ADR 0006](adr/0006-petty-cash-pockets.md).

## Ledger rules

Pure ledger rules (normal balance, journal balance, opening-balance and reconciliation gates, chart-of-accounts prefix) live in `src/lib/accounting` with no React or HTTP. Gates are exact and reject sub-cent amounts; display helpers round half up to the cent. A backend category flag or code always wins over a name keyword. See [`src/lib/accounting/README.md`](../src/lib/accounting/README.md).

Per-feature rules (sales totals, depreciation, purchase payments, ...) are documented in each module's README under `src/module/<feature>/`.
