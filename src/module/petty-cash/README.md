# petty-cash

Petty cash (imprest) prototype: funds with a fixed ceiling, expense vouchers paid from the cash in hand, reimbursement requests that restore the fund, and physical cash counts (opname). There is no backend yet: the state lives in a React context seeded from mock data and resets on reload.

## Routes (`src/router/routes.ts`)

| Constant | Path | Page |
| --- | --- | --- |
| `BankAndCash.PettyCash` | `/bank-cash/petty-cash` | `PettyCashPage` (funds, voucher table, voucher / reimbursement / cash count modals) |
| `BankAndCash.PettyCashDetail` | `/bank-cash/petty-cash/:fundId` | `PettyCashDetailPage` (one fund; an unknown id shows the not-found state) |

Both routes render under `PettyCashRouteScope`, which mounts `PettyCashPrototypeProvider` once so the list and the detail page share state. `index.ts` exports the three. The sidebar links to the first route.

## Layers

- `domain/`: `pettyCashTypes`, `pettyCash` (state transitions), `pettyCashMoney` (cent helpers), `cashCount` (imprest check), `reimbursementSummary` (total and breakdown per expense account). All have tests.
- `infrastructure/`: mock fixtures (`mockPettyCashFunds`, `mockPettyCashVouchers`, `mockPettyCashReimbursements`). No HTTP.
- `presentation/`: pages, components (modals, `VoucherTable`, `VoucherRow`, `VoucherStatusBadge`, `VoucherDetailDrawer`, `ReimbursementJournalPreview`, panels) and `usePettyCashPrototype` (context provider and hook).

## Domain rules

All amounts are compared and added in cents (`@/lib/money`), so `0.1 + 0.2` equals `0.3`.

- `recordPaidVoucher`: the fund must exist (`FUND_NOT_FOUND`) and not be frozen (`FUND_FROZEN`); the amount may not exceed the cash in hand (`INSUFFICIENT_CASH`). The balance falls, the pending reimbursement rises by the same amount, and the fund becomes `LOW_BALANCE` when the balance is at or below the alert threshold.
- `submitReplenishment`: every voucher must belong to the fund and be `PAID` or `PENDING_REIMBURSE` (`INVALID_REIMBURSEMENT_VOUCHER`), and the request total must equal the voucher total to the cent (`REIMBURSEMENT_TOTAL_MISMATCH`). Vouchers become `REIMBURSEMENT_PENDING`; cash is not restored yet.
- `disburseReplenishment`: only an `APPROVED` request is paid out. Vouchers become `REIMBURSED`, cash is restored up to the fund ceiling (`pagu`), the pending reimbursement never goes below 0, and a repeated disbursement changes nothing.
- `calculateCashCount`: cash in hand plus the unreimbursed vouchers of the fund (`PAID`, `PENDING_REIMBURSE`, `REIMBURSEMENT_PENDING`) is compared with the ceiling: equal is `BALANCED`, below is `SHORT`, above is `OVER`. A variance is saved for investigation, not journaled.
- The replenishment preview debits every expense account of the selected vouchers and credits the source bank account for the same total.

## State

`PettyCashPrototypeProvider` holds `funds`, `vouchers`, `reimbursements` and `cashCounts` in component state. `createPaidVoucher`, `submitReimbursement` and `recordCashCount` apply the domain transitions. Nothing is persisted.

## i18n

Namespace `pettyCash` (`id` and `en`) for the modals, drawer and table footer, with parity and placeholder tests in `src/i18n/locales/pettyCash.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`. The page headers, fund panel and voucher table still read their existing `pettyCash*` keys from the `journal` namespace.

## Known gaps

- Prototype only: no API and no persistence. There is no approval or disbursement step in the UI: `disburseReplenishment` (covered by tests) is not wired to any screen, so a submitted request stays pending and its vouchers stay in `REIMBURSEMENT_PENDING`.
- The status vocabulary of the frontend lifecycle differs from `docs/petty-cash/API-SPEC-Petty-Cash-Backend.md` (spec section 11, item 5); it must be reconciled before integration.
- The source bank accounts offered in the replenishment modal are hard-coded sample accounts, and their names are stored in the request.
- `docs/superpowers/plans/petty-cash-prd.md` is an empty file and was left as is (spec section 11, item 9).
- Ids and document numbers (`PCV/…`, `PCR/…`, `BAO/…`) come from `Date.now()`, so they are not unique across tabs or reloads.
- No component tests; the provider is exercised through the domain tests.
