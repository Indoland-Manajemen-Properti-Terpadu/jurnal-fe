# ADR 0005: Integer money in the frontend; refresh tokens stay in localStorage

**Status:** Accepted, 2026-10-29 (money helper); token storage unchanged

## Money
JavaScript floats cannot represent most decimals (`0.1 + 0.2 = 0.30000000000000004`), which can make debit and credit totals look unequal. Money math uses integer hundredths through `src/lib/money`: `toMinor` converts at the API boundary and rejects more than two decimals (no rounding rule is invented), `sumMinor` adds integers, `fromMinor` returns a two-decimal string. No dependency is added. Call sites are migrated per feature; the audit is in [migration/money-audit.md](../migration/money-audit.md). The representation the backend sends and the rounding rule for tax and discounts are open questions for the backend team.

## Token storage
Access and refresh tokens live in `localStorage` so users stay signed in across tabs and reloads. The trade-off is that a cross-site scripting flaw could read them. Changing storage (for example an HTTP-only cookie) needs backend support and is out of scope; this ADR records the risk so it is a decision, not an accident. Mitigation until then: no `dangerouslySetInnerHTML` with untrusted input, and the dependency list stays small.
