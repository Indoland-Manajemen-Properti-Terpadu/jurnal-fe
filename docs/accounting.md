# Accounting Rules

How money and ledger rules are handled in the frontend. Product behavior comes from the backend and the approved requirements; the frontend never invents financial rules.

## Correctness

- Never introduce financial rules that are not supported by the existing product or an approved requirement.
- Do not use JavaScript floating-point arithmetic for money calculations. Preserve the API's established decimal or minor-unit representation and use its documented rounding rules. If the contract is unclear, ask before choosing a representation or rounding behavior.
- Keep accounting calculations out of views. Use domain/application code and cover important rules with focused tests when implementation and verification are requested.
- Treat date-only values, timestamps, currency, sign conventions, and period boundaries according to the verified API/product contract. Do not silently convert time zones or round values in presentation code.

## Money

Money math uses integer minor units through `src/lib/money` (`toMinor`, `fromMinor`, `sumMinor`). Convert at the API boundary, sum with `sumMinor`, never add or compare money as floats in views. See [ADR 0005](adr/0005-integer-money-and-localstorage-tokens.md) and [migration/money-audit.md](migration/money-audit.md).

## Ledger rules

Pure ledger rules (normal balance, journal balance, opening-balance and reconciliation gates, chart-of-accounts prefix) live in `src/lib/accounting` with no React or HTTP. Gates are exact and reject sub-cent amounts; display helpers round half up to the cent. A backend category flag or code always wins over a name keyword. See [`src/lib/accounting/README.md`](../src/lib/accounting/README.md).

Per-feature rules (sales totals, depreciation, purchase payments, ...) are documented in each module's README under `src/module/<feature>/`.
