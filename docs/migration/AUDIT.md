# Final Audit (end of Milestone 4)

Audited 2026-10-31 on `develop-frontend` after the last module merge. Method: `git ls-files`, `git grep`, the ESLint ratchet and the module README of each module.

## Result

All 26 feature modules under `src/module/` follow the feature-first layout (`domain`, `infrastructure`, `presentation`), expose a public `index.ts`, have a README and tests, and use English kebab-case folders. No PascalCase legacy module folder is left. STATUS.md is `done` for every module row.

| Check | Result |
|---|---|
| Legacy PascalCase module folders | none |
| Modules without `README.md` or `index.ts` | none |
| Lint baseline total | 529 (start of M2) down to 159 |
| Files over 400 lines | `src/constants/regionsIndonesia.ts` (data, 627), `src/router/index.tsx` (416); `AddSentMoneyPage.tsx` has 404 raw lines but is under the limit the rule counts (blank lines and comments are skipped) |
| `console.*` outside tests | 8, all in `src/lib/http/apiClient.ts` (legacy helpers) and `src/i18n/store.ts` |
| `any` outside tests | 33 (baseline: 36 `no-explicit-any` entries) |
| Deep imports into module internals from outside | 3 pages of `chart-of-accounts` in `src/router/index.tsx` (exporting them through the module index creates import cycles with the router: 6 to 74 `import/no-cycle`, so it was reverted) |

## Not done, needs a decision

- **Ratchet rules to `error` repo-wide** (the last row of Milestone 4): not changed. Flipping them fails CI for the 159 remaining baseline entries, so it needs approval (spec section 11, item 6). The remaining entries are: `no-explicit-any` 36, `no-unused-vars` 36, `import/order` 14, `import/no-named-as-default` 13, `arrow-body-style` 12, `no-restricted-exports` 9, `react/jsx-boolean-value` 8, `import/no-cycle` 6, `import/no-restricted-paths` 6, and a few single digits.
- **Legacy HTTP helpers** (`get`, `post`, `put`, `del`, `patch`, `download` in `apiClient.ts`) still swallow errors. They are used by `reports` (business overview), `user-management`, `authentication`, `bank-cash`, `chart-of-accounts` and others. Changing them is a behavior change (spec section 11, item 2).

## Findings kept as documented gaps (not fixed by the migration)

- `authentication`: forgot-password is simulated (no request, a fake "link sent" message).
- `user-management`: Add Role, Add User and delete do not call the API (dummy UI).
- `petty-cash`: prototype only, status vocabulary differs from the backend spec, and `disburseReplenishment` has no screen.
- `bank-cash`: `isBankAccount` counts every account in the "Kas & Bank" category as bank.
- `settings`: tax rate has no upper bound.
- `reports`: cash flow, business summary and the budget pages show sample numbers.

## Accounting review (separate from the migration)

An accounting-logic review is recorded in the conversation that produced this milestone and is not part of the restructure: sales tax computed before discount, two different double-declining depreciation results, net working capital using all liabilities, "this month's revenue" using the invoice total with tax, chart-of-accounts prefix and normal-balance keyword mismatches, overpayment marked paid, opening balance input dropping decimals. None of it was changed. It needs the business decisions listed there before any fix.
