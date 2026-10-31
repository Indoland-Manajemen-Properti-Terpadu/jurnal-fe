# petty-cash

Petty cash (imprest) on the real `/v1/petty-cash` backend. A fund holds a fixed ceiling (`pagu`); the custodian pays small expenses from cash and records vouchers; the ledger is only posted when finance refills the fund. This phase is read-only: fund position, vouchers and the cash book. Creating and approving documents arrives in the next phases (`docs/superpowers/plans/2026-10-31-petty-cash-integration.md`).

Contract and observed behavior: `docs/petty-cash/API-CONTRACT.md` (endpoints) and `docs/petty-cash/API-REAL-SHAPES.md` (shapes, statuses, errors, journals). Open backend questions: `docs/petty-cash/BACKEND-QUESTIONS.md`.

## Routes (`src/router/routes.ts`)

| Constant           | Path                            | Page                                                                      |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------- |
| `pettyCash.main`   | `/bank-cash/petty-cash`         | `PettyCashPage` (fund selector kept in `?fund=`, then the fund workspace) |
| `pettyCash.detail` | `/bank-cash/petty-cash/:fundId` | `PettyCashDetailPage` (one fund; an unknown id shows the not-found state) |

`index.ts` exports the two pages. The sidebar links to the first route.

## Endpoints

All through the shared `apiClient`, in `infrastructure/pettyCashApi.ts`: `GET /funds`, `/funds/:id`, `/funds/:id/cash-book`, `/lookups`, `/vouchers`, `/vouchers/:id`, `/attachments/:id/url`, plus `GET /v1/users/me/permissions` for the access profile. The user id comes from the `sub` claim of the access token (`accessToken.ts`), because `GET /v1/users/get-id` answers 403 for a user without user-management rights.

## Layers

- `domain/`: `pettyCashEntities` (entities as the app uses them), `pettyCashStatus` (backend statuses, tones, voucher actions per status), `pettyCashAccess` (menu rights, custodian, segregation of duties), `pettyCashView` (variance display, voucher net/tax/total, account summary, cash book type labels). All have tests.
- `infrastructure/`: `pettyCashApi`, `pettyCashDto`, `pettyCashMappers`, `pettyCashErrors`, `queryParams`, `idempotency`, `pettyCashEndpoints`.
- `presentation/`: pages (`PettyCashPage`, `PettyCashDetailPage`, `PettyCashPageFrame`), components (`PettyCashWorkspace`, `ImprestBalancePanel`, `FundInfoStrip`, `FundSelector`, `VoucherList`, `VoucherDetailDrawer`, `CashBookPanel`, `PettyCashStatusBadge`, `QueryErrorState`) and hooks (`usePettyCashQueries`, `usePettyCashAccess`, `useIdempotentMutation`, `useOpenAttachment`, `pettyCashErrorMessage`, `pettyCashKeys`).

## Rules the screens follow

- **The server owns every financial figure.** Balances, the imprest equation (`pagu = cash + pending vouchers + advances - unsettled variance`), `isBalanced`, `needsReplenishment` and totals are shown as received, never recomputed. The drawer only splits a voucher into net, tax and total with `@/lib/money`.
- **Tax is added on top of each line amount.** A voucher total is the sum of net amounts plus tax.
- **Dates:** requests use `YYYY-MM-DD`; accounting dates come back as ISO at UTC midnight and are cut to the calendar date, never converted through the local time zone.
- **Every query key starts with the signed-in user** (`usePettyCashScope`, the token subject), so the cache of one user is never shown to the next user in the same session.
- **Empty query params are dropped** (the backend rejects them); several statuses are sent comma separated.
- **One error type.** `PettyCashError` normalizes Joi arrays, `data.errorCode`, message-only errors, 401, 403 and network failures; the server `stack` is never kept. Indonesian readers see the specific server sentence, English readers a translation of the code; Joi text and raw codes are never shown.
- **Idempotency:** `useIdempotentMutation` sends one `Idempotency-Key` per intent and reuses it on retry (used from Phase 3, when the first POST arrives).
- **A superadmin counts as custodian** in `isFundCustodian`, because the backend lets a superadmin act as custodian of any fund (open question 1).
- Imprest equation rows come from `imprestEquation` with the sign each carries in `pagu = cash + vouchers + advances - unsettledVariance`: a shortage is added, a surplus is deducted, so the rows shown add up to the ceiling.
- The voucher drawer shows net and tax only when they add up to the server total; otherwise only the server total.
- A malformed `:fundId` is shown as not found without calling the API (the backend answers 400).
- A voucher list item carries `lines[].expenseAccount` as an id only; the list resolves account names through `lookups`. The detail carries the full account.
- The backend keeps `rejectedReason` and `voidReason` after a voucher leaves those states, so the drawer shows them only while the status matches.

## State

TanStack Query hooks in `presentation/hooks`; filters and the selected tab are local component state, the selected fund lives in the URL. No server data is mirrored in Zustand.

## i18n

Namespace `pettyCash` (`id` and `en`): `workspace`, `balance`, `vouchers`, `drawer`, `cashBook`, `errors`, `status`, with parity and placeholder tests in `src/i18n/locales/pettyCash.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`. The header breadcrumb reads the `pettyCash` key of the `journal` namespace.

## Known gaps

- Read-only: no create, approve, cash count, reimbursement or kasbon screens yet (Phases 3-6).
- The cash book is ordered by transaction date while the running balance follows the entry sequence, so a back-dated voucher recorded later appears early with the latest balance. Its opening and closing balance follow the date filter; a voucher dated before the fund was opened gives a negative balance (backend question 10).
- Superadmin custodian behavior and several accounting questions wait on the backend (`docs/petty-cash/BACKEND-QUESTIONS.md`).
- No component tests; the domain, mappers, API calls and error messages are covered, and the screens were checked in a browser on the Demo Site.
