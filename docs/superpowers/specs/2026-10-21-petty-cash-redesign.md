# Petty Cash Product and Interaction Design

**Status:** Approved for implementation on 2026-10-21  
**Scope:** Jurnal ProApps frontend prototype and canonical agent design rules  
**Accounting method:** Fixed fund / imprest

## Outcome

Petty Cash becomes an operational workspace inside Kas & Bank, not a sibling top-level module. The interface must let a non-accountant record and control small cash expenses without exposing journal mechanics as the primary workflow, while preserving traceable accounting events and segregation between request, payment, replenishment approval, disbursement, and cash count.

## Information Architecture

- The sidebar has one `Kas & Bank` entry. `/bank-cash/petty-cash` keeps that entry active.
- Kas & Bank exposes Petty Cash as an internal destination and recognizes petty-cash GL accounts in its account list.
- Petty Cash uses three task views: `Pengeluaran`, `Pengisian Kembali`, and `Opname`.
- Fund detail remains available at `/bank-cash/petty-cash/:fundId`, but an unknown fund ID renders a not-found state and never falls back to another fund.

## Accounting Model

### Fund lifecycle

Establishing a fund posts `Dr Petty Cash / Cr Bank`. Increasing, decreasing, freezing, transferring custody, and closing a fund are explicit events; editing a ceiling is not an ordinary field update.

### Expense lifecycle

`DRAFT -> SUBMITTED -> APPROVED -> PAID -> REIMBURSEMENT_PENDING -> REIMBURSED`, with `REJECTED` and `VOID` as controlled terminal paths. Only `PAID` reduces physical cash. Under imprest, paying a voucher does not post expense to the general ledger.

### Replenishment lifecycle

`DRAFT -> SUBMITTED -> APPROVED -> DISBURSED`, with `REJECTED` as a terminal path. Submitting or approving a batch does not restore physical cash and does not mark vouchers reimbursed. `DISBURSED` posts grouped expenses against the source bank, restores physical cash, and marks included vouchers `REIMBURSED`.

### Cash count

Accountability is `counted physical cash + paid unreimbursed vouchers + recognized accountable items`. A variance first creates an investigation state. Cash over/short is posted as part of an approved resolution or replenishment; the petty-cash GL account remains at its authorized ceiling unless a separate ceiling-change event occurs.

### Money and numbering

The frontend prototype uses integer IDR values only. The production API must define money representation, rounding, currency, server-generated sequential document numbers, idempotency, period locks, and posting IDs before backend integration.

## Interaction Design

- One primary action per region: `Catat Pengeluaran`.
- `Ajukan Pengisian Kembali` and `Lakukan Opname` are contextual secondary actions.
- A compact fund selector replaces large repeated fund cards.
- One balance surface presents available cash, fixed ceiling, unreimbursed amount, and a single utilization visualization.
- Tables and task content are the visual center. Accounting explanations use progressive disclosure.
- Normal spending is neutral/blue, not red. Green is success, amber is warning, and red is shortage, failure, or destructive action.
- Desktop uses dense but breathable panels inspired by the supplied Payvora reference. Mobile prioritizes balance, primary action, and task list; controls wrap without horizontal action overflow.

## Visual Language

- Primary brand: Jurnal ProApps `primary` (`#053079`) on white.
- Secondary cyan is a restrained accent, not a default gradient.
- Surfaces use white, neutral gray canvas, thin borders, consistent medium/large radii, and minimal shadow.
- Numbers and labels establish hierarchy. Decorative icon orbs, uppercase labels, badges, and gradients are not repeated mechanically.
- Figtree remains the typeface and project theme tokens remain authoritative.

## Architecture

- Domain functions own eligibility, balance, variance, and lifecycle transitions.
- Presentation pages render a single prototype state and call domain operations; accounting calculations are not duplicated across list and detail pages.
- Components receive explicit state and callbacks. Modal state synchronizes whenever the selected fund changes.
- The prototype remains local/mock-backed until an approved API contract exists; UI must not imply persistence or successful ledger posting that did not occur.

## Accessibility and States

- Controls have accessible names, visible focus, keyboard behavior, and explicit disabled reasons.
- Loading, empty, error, invalid-route, frozen-fund, insufficient-cash, locked-period, and permission-denied states are designed.
- Status is communicated with text and icon, never color alone.
- Modal defaults must be empty or derived from current data; no fabricated witness, attachment, receipt, or denomination values may be silently submitted.

## Acceptance Criteria

1. Only Kas & Bank is active on every Petty Cash route.
2. Petty Cash is reachable from the Kas & Bank workspace without a duplicate sidebar entry.
3. Submitting replenishment leaves physical balance and voucher reimbursement state unchanged.
4. Disbursement restores exactly the selected eligible voucher total and marks only those vouchers reimbursed.
5. Changing the action's fund updates every modal to that fund.
6. Unknown fund routes show an explicit not-found state.
7. The page has one primary CTA, one compact balance surface, and no decorative four-card KPI strip.
8. User-facing Petty Cash copy is available in Indonesian and English.
9. Focused domain and navigation tests, typecheck, lint, formatting check, build, and browser desktop/mobile review are performed.
