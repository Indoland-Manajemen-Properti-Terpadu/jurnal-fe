# Petty Cash Backend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking. Work one phase per PR.

**Goal:** Replace the in-memory prototype in `src/module/petty-cash` with the real `/v1/petty-cash` backend (funds, vouchers, cash counts, reimbursements, kasbon, reports), with a calm, role-aware UI that follows imprest accounting.

**Architecture:** Feature module layers per `docs/architecture.md`: `infrastructure/` (HTTP, DTOs, mappers, error normalizer), `domain/` (backend vocabulary, status maps, pure rules), `application/` only where a use case spans calls, `presentation/` (TanStack Query hooks, pages, components). Server is the source of truth for balances, variance and journals; the frontend never recomputes a financial figure it can read.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Vitest, ESLint ratchet (baseline zero), Yarn 4.

**Branch:** `feat/petty-cash-integration` from `develop-frontend`, one PR per phase into `develop-frontend` (squash). The lint-zero commit `7085dfe` is still on `chore/eslint-clean`; rebase when it merges.

**Sources:**

- PRD `docs/petty-cash/PRD-Petty-Cash-Jurnal-ProApps.pdf` (business intent).
- Endpoint list (paths, queries, bodies): `docs/petty-cash/API-CONTRACT.md`. Real entity shapes, statuses, state machines, errors and journals observed on the Demo Site: `docs/petty-cash/API-REAL-SHAPES.md` (wins on any conflict).
- Open questions for the backend team: `docs/petty-cash/BACKEND-QUESTIONS.md`.
- The early draft `API-SPEC-Petty-Cash-Backend` (md and pdf, 4 entities, other statuses, no kasbon) was obsolete and has been deleted; so has the empty `docs/superpowers/plans/petty-cash-prd.md`. Older plans that mention them are historical.

## Global Constraints

Same as earlier module plans: English identifiers, `@/` imports only, no `any`, no `console.*`, files at most 400 lines, money sums with `@/lib/money`, no `Date.now()` ids, bilingual `id`/`en` for every string, ratchet stays at zero. Gate per phase: `yarn typecheck`, `npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`. Do not commit, push or open a PR unless the user asks.

Contract rules (from the live backend):

- Drop undefined and empty query params before sending; only `search` may be empty. Unknown params are a 400.
- Dates are `YYYY-MM-DD` strings; timestamps are ISO UTC. Do not convert time zones in presentation.
- Every mutating POST sends a fresh `Idempotency-Key` (uuid) per user intent and reuses it on retry. Block double submits.
- Two error shapes: validation `data` is an array of `{field, message}`; domain errors carry `data.errorCode`; a 401 has neither. Normalize at the boundary, never show `stack` or raw codes to the user.
- Signed attachment URLs are relative: prefix the API base URL, open without bearer, valid 10 minutes.
- Access token lives 30 minutes: long forms rely on the shared client's refresh queue.
- Money is a JSON number (whole rupiah in every example). Representation and rounding are an open question; keep one mapper function so it can change in one place.

## Findings that change the prototype

| #   | Finding                                                                                                                                                                                                                        | Action                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| F1  | `disburseReplenishment` clamps the balance to `pagu`, which hides variance                                                                                                                                                     | Delete the clamp; the server restores the exact reimbursement total                    |
| F2  | `calculateCashCount` ignores outstanding kasbon and unsettled variance                                                                                                                                                         | Server computes; FE shows a labelled preview from fund fields only                     |
| F3  | Status vocabulary differs (`PAID`, `REIMBURSEMENT_PENDING`, fund `FROZEN`)                                                                                                                                                     | New status types and a mapping table; `LOW_BALANCE` becomes `needsReplenishment`       |
| F4  | Voucher creator is fabricated (`createdBy = custodianName`)                                                                                                                                                                    | Only the fund custodian creates vouchers (`NOT_CUSTODIAN`); gate the action by user id |
| F5  | Source bank is hard-coded per fund                                                                                                                                                                                             | Bank is chosen per reimbursement from `GET /lookups`                                   |
| F6  | Reimbursement total is the voucher sum                                                                                                                                                                                         | Server total = vouchers + shortage - overage; use `POST /reimbursements/preview`       |
| F7  | Prototype has no approval, kasbon, cash book, reports or audit                                                                                                                                                                 | Phases 3-6                                                                             |
| F8  | Voucher tax is added on top of the line amount; `totalAmount` includes it                                                                                                                                                      | Show net, tax and total separately; never treat `amount` as gross                      |
| F9  | Voucher submit already lowers fund cash; reimbursement refills it. Variance is journaled only at disbursement                                                                                                                  | Show "paid out, awaiting refill" wording; never present a refill before disburse       |
| F10 | The open count variance attaches to the first reimbursement created, so `totalAmount` can exceed the selected vouchers                                                                                                         | Always show voucher total, variance and payout total from preview                      |
| F11 | Superadmin bypasses custodian-only rules; other users get `403 Forbidden Access Role`                                                                                                                                          | Gate by fund custodian id and menu rights, not by trying the call                      |
| F12 | Real statuses: count `DRAFT/SUBMITTED/APPROVED/REJECTED/SUPERSEDED/SETTLED`, reimbursement `SUBMITTED/APPROVED/REJECTED/CANCELLED/DISBURSED`, kasbon adds `CONVERTED_TO_RECEIVABLE`; both kasbon rejects return to `DISBURSED` | Use these in `pettyCashStatus.ts`                                                      |

## Phase 0: Unblock (no product code)

- [x] Demo Site seeded: variance account mapped (8-10000), tax `TEST PC PPN 11%`, five roles and users (`pc.custodian`, `pc.approver`, `pc.disburser`, `pc.staff`, `pc.witness` at `@proapps.id`), fund `PC-HQ` (id `6ae5c63fa5fe03e546a002f3`), and a full run of every flow (11 vouchers, 4 counts, 4 reimbursements, 6 kasbon, 4 journals). Not tested: pagu adjust, close fund, OVER count, overdue block.
- [x] Real shapes recorded in `docs/petty-cash/API-REAL-SHAPES.md`; contract copied to `API-CONTRACT.md`; old spec marked superseded.
- [ ] Send `docs/petty-cash/BACKEND-QUESTIONS.md` to the backend team (P1 items 1-5 first); record answers in the contract.
- [ ] Update the module README known gaps when Phase 1 starts.
- [ ] Cleanup note: the seeded test users, roles and fund stay on the Demo Site; remove them when the work ends.

## Phase 1: Foundation

Files under `src/module/petty-cash/`:

- `infrastructure/pettyCashEndpoints.ts`, `pettyCashApi.ts` (one function per endpoint, shared `apiClient`), `pettyCashDto.ts`, `pettyCashMappers.ts`, `pettyCashErrors.ts` (normalizes validation array / `errorCode` / 401 into one `PettyCashError`).
- `domain/pettyCashTypes.ts` rewritten to backend vocabulary; `pettyCashStatus.ts` (labels, allowed actions per status, pure); delete `mockPettyCash*`, `usePettyCashPrototype`, `pettyCashMoney` clamp paths.
- `presentation/hooks/`: `usePettyCashFunds`, `useVouchers`, ... plus a query-key factory and one `useIdempotentMutation` helper (stable key per attempt, replay-safe).
- Permission gating: derive menu-code rights (`JP-PC`, `-VCH`, `-APR`, `-CNT`, `-RMB`, `-DSB`, `-ADV`, `-CST`, `-CTL`) from the auth store; expose `usePettyCashAccess()`.

- [x] RED tests first: error normalizer (all shapes), param cleaner, idempotency key reuse on retry, status-to-action map, access rules, mappers, API calls, error sentences.
- [x] Implement, then run the gate (typecheck, lint ratchet, 1049 tests, build green).
- Scope note: API functions cover funds, cash book, lookups, vouchers (read) and the access profile; mutations and the other entities are added in the phase that uses them. The prototype stays until Phase 2 replaces the pages, then the mock fixtures, `usePettyCashPrototype` and prototype-only domain files are deleted.

## Phase 2: Read-only workspace (done)

- [x] Fund selector (`?fund=`) and fund detail route with one imprest balance panel (cash in hand, vouchers, kasbon and unsettled variance against the ceiling; `needsReplenishment`, `isBalanced` from the server) and a rules strip.
- [x] Voucher list: server search (debounced), multi-status, date range, pagination; detail drawer with lines, tax, attachments (signed link) and history.
- [x] Cash book per fund with opening and closing balance and date range.
- [x] Standard A layout, `<EmptyState>` inside the table shell, loading, error and not-found states. Checked in the browser on the Demo Site at desktop and 390px widths.
- [x] Prototype deleted: mock fixtures, `usePettyCashPrototype`, route scope, all prototype domain files and modals, 62 unused `journal` keys. Voucher create, cash count and reimbursement return in Phases 3 and 4 against the API.
- Real finding: list items carry `lines[].expenseAccount` as an id only (the detail carries the object), so the list resolves names through `lookups`. Cash book entry type `ADVANCE_RECEIVABLE` is real and undocumented.

## Phase 3: Vouchers (done)

- [x] Create (multi-line, optional tax invoice with per-line tax, receipts, draft or submit), edit (DRAFT/REJECTED), submit, approve, reject, void with reasons; receipts added and deleted from the drawer.
- [x] Standard B form pages (`voucherAdd`, `voucherEdit`), a summary panel with the cash and receipt checks, and "Catat pengeluaran" as the one primary action.
- [x] Idempotency matches the real server: failed answers are cached per key, so a key is reused only while the outcome is unknown (connection dropped).
- [x] Checked in a browser with real writes: draft, taxed voucher with receipt (one POST on a double click), edit, submit, void with a required reason, approve and reject by a second user, repair of a rejected voucher, receipt delete and upload, dropped connection versus server error keys.
- Verified as the real custodian account too (role `user`): record button, form, focus on the first invalid field, a retried submit that does not save or upload twice, confirmed receipt deletion.
- Reviewer fixes: tax-aware cash-left and approval hint, no crash on huge or sub-cent amounts, gateway failures keep the idempotency key, keys expire after 10 minutes, save and submit are separate steps, lookups failure shown, same file can be re-picked, voucher and fund in the address must match.
- Not built: a receipt-number duplicate warning on the form before saving (the drawer shows the server warning); voucher number lookups (no endpoint).

## Phase 4: Cash count and reimbursement

- [ ] Opname calculator with denominations (7 notes plus coins), witness picker, live counted total, variance preview labelled as estimate, reason when variance is not zero, submit, approve, reject, `isStale` banner.
- [ ] Reimbursement wizard: choose vouchers, choose bank (lookups) and optional count, call preview, show expense and tax breakdown and journal preview (disclosure), create, then approve, reject, cancel, disburse as separate role actions.
- [ ] Show `cashBalanceAfter` and the posted journal reference after disbursement.

## Phase 5: Kasbon

- [ ] Staff: request, own list, cancel, upload receipts, settlement form (lines, nothing-spent path).
- [ ] Custodian: disburse, set settlement accounts, verify or reject. Finance: verify or reject, convert to receivable.
- [ ] My advance status banner (blocked, overdue, override), control actions (block, unblock, override) for `JP-PC-CTL`.

## Phase 6: Fund administration, reports, audit

- [ ] Fund create wizard (account, pagu, custodian, funding bank, thresholds, advance rules), update, adjust pagu, close with open-items explanation.
- [ ] Reports: pending vouchers aging, expense summary (account, tag, month), advances by user, reconciliation, period-end check.
- [ ] Audit timeline per document from `GET /audit-logs`.

## Phase 7: QA and docs

- [ ] i18n parity tests and hard-coded-text guard for all new namespaces.
- [ ] Accessibility pass: accessible names, keyboard flow, focus, contrast.
- [ ] Browser check at desktop and mobile widths against the Demo Site.
- [ ] README rewrite (routes, endpoints, rules, state, i18n), `docs/modules/README.md`, `migration/STATUS.md`.
- [ ] Independent code review, resolve critical and important findings.

## UI and UX direction

- One workspace under `/bank-cash/petty-cash` with tabs: Overview, Vouchers, Cash counts, Reimbursements, Kasbon, Reports. Primary tabs use the pill style from `ui-guidelines.md`.
- One balance surface for the imprest equation instead of four KPI cards; semantic colors only for real states (shortage orange, available teal).
- A "Needs my action" queue per role (approve, disburse, verify) so each person sees only their next step.
- Status stepper and audit timeline on every document; actions shown only when the user has the right and the status allows it, with the reason when hidden.
- Reimbursement as a three-step wizard; journal preview behind progressive disclosure.
- One primary action per region, empty and error states inside the table shell, no raw codes or stack traces.

## Risks

- Not yet observed: pagu adjustment, close fund, an `OVER` count, `INACTIVE`/`CLOSED` funds, the `OVERDUE` block and `ADVANCE_EXTRA`. Phase 6 and the overdue UI wait for those or for the backend answer.
- The cash-count treatment of `PENDING_APPROVAL` vouchers and the variance-to-first-reimbursement rule are open questions (`BACKEND-QUESTIONS.md` items 4 and 5); they affect Phase 4 copy and layout.
- Response accounting dates are ISO at UTC midnight; map them to the date part only, never through local time zone conversion.
- Seeded users, roles and fund live on the shared Demo Site and need cleanup when work ends.
