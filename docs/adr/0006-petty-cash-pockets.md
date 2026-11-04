# ADR 0006: Petty cash pockets itemize the cash book, not the ledger

**Status:** Accepted, 2026-11-04 (backend contract; the bank reconciliation question is open)

## Context

The backend splits a petty cash fund's cash into pockets: the built-in cash box (`TUNAI`), petty cash bank accounts (`BANK`) and e-wallets (`EWALLET`). The change is not in PRD v3.0 or API Spec v2.0; the Postman collection "Jurnal Proapps - Kas Kecil" and the backend answers are the source.

## Decision

- All pockets of a fund share one chart-of-accounts account. Pocket balances add up to the fund's cash balance, and the general ledger balance still equals the ceiling.
- A transfer between pockets posts no journal; the cash book records `POCKET_TRANSFER` out and in.
- The frontend shows pocket balances as received. It warns when they do not add up to the cash balance, and never recomputes them.
- A pocket cannot be deleted, only deactivated (balance must be 0), and the cash box cannot be deactivated.

## Consequences

- A bank pocket's statement does not match the bank reconciliation per account, because the account is shared. Backend is deciding whether to accept this or split the account per bank pocket; if it splits, transfers between bank pockets will post journals and this ADR changes. Frontend work must not depend on per-pocket reconciliation until then.
- Balance is checked per pocket when a voucher is approved or an advance paid out, not at submit, so approval can fail with an insufficient-balance error that names the pocket.
