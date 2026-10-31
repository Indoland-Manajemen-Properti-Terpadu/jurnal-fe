# petty-cash

Petty cash (imprest) on the real `/v1/petty-cash` backend. A fund holds a fixed ceiling (`pagu`); the custodian pays small expenses from cash and records vouchers; the ledger is only posted when finance refills the fund. Fund position, the voucher lifecycle, cash counts (opname), replenishments and the cash book are on the real backend. Employee advances (kasbon), fund administration, reports and the change history are on the real backend too (plan: `docs/superpowers/plans/2026-10-31-petty-cash-integration.md`).

Contract and observed behavior: `docs/petty-cash/API-CONTRACT.md` (endpoints) and `docs/petty-cash/API-REAL-SHAPES.md` (shapes, statuses, errors, journals). Open backend questions: `docs/petty-cash/BACKEND-QUESTIONS.md`.

## Routes (`src/router/routes.ts`)

| Constant                     | Path                                                    | Page                                                                             |
| ---------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `pettyCash.main`             | `/bank-cash/petty-cash`                                 | `PettyCashPage` (fund selector kept in `?fund=`, then the fund workspace)        |
| `pettyCash.detail`           | `/bank-cash/petty-cash/:fundId`                         | `PettyCashDetailPage` (one fund; an unknown id shows the not-found state)        |
| `pettyCash.voucherAdd`       | `/bank-cash/petty-cash/:fundId/voucher/add`             | `VoucherAddPage` (custodian with voucher rights, active fund only)               |
| `pettyCash.voucherEdit`      | `/bank-cash/petty-cash/:fundId/voucher/:voucherId/edit` | `VoucherEditPage` (draft or rejected vouchers only)                              |
| `pettyCash.countAdd`         | `/bank-cash/petty-cash/:fundId/count/add`               | `CountAddPage` (someone with the count right who is not the custodian)           |
| `pettyCash.replenishmentAdd` | `/bank-cash/petty-cash/:fundId/replenishment/add`       | `ReplenishmentAddPage` (custodian with the replenishment right; two-step wizard) |

`index.ts` exports the six pages. `?tab=vouchers|counts|replenishments|advances|cashBook|reports` opens a tab (`reports` needs the read right on `JP-PC`); the form pages return to the tab they came from. The sidebar links to the first route.

## Endpoints (reads)

All through the shared `apiClient`, in `infrastructure/pettyCashApi.ts`: `GET /funds`, `/funds/:id`, `/funds/:id/cash-book`, `/lookups`, `/vouchers`, `/vouchers/:id`, `/attachments/:id/url`, plus `GET /v1/users/me/permissions` for the access profile. The user id comes from the `sub` claim of the access token (`accessToken.ts`), because `GET /v1/users/get-id` answers 403 for a user without user-management rights.

## Endpoints (writes)

`POST /vouchers` (JSON, or multipart when receipts travel with it), `PATCH /vouchers/:id` (replaces the whole voucher), `POST /vouchers/:id/{submit,approve,reject,void}` (reject and void carry a `reason`), `POST /vouchers/:id/attachments`, `DELETE /vouchers/:id/attachments/:attachmentId`. Every write answers with the full voucher. POSTs send an `Idempotency-Key`.

`POST /counts` (JSON, `submit` true or false), `POST /counts/:id/{submit,approve,reject}`, `GET /counts`, `GET /counts/:id`; `GET /reimbursements`, `GET /reimbursements/:id`, `POST /reimbursements/preview` (no key, no notes), `POST /reimbursements`, `POST /reimbursements/:id/{approve,reject,cancel,disburse}`. Timeouts are set per request in `pettyCashHttp.ts` (the shared client is not changed).

## Endpoints (advances, funds, reports)

Advances (`pettyCashAdvanceApi.ts`): `GET /advances`, `/advances/:id`, `POST /advances`, `POST /advances/:id/{approve,reject,cancel,disburse,settlement,custodian-verify,custodian-reject,finance-verify,finance-reject,convert-to-receivable}`, `POST /advances/:id/attachments`, `PATCH /advances/:id/settlement-accounts`, `GET /advance-status/me|:userId`, `POST /advance-status/:userId/{block,unblock,override}`. A settlement is JSON, or multipart with receipts (`lines` as JSON text).

Funds (`pettyCashFundApi.ts`): `POST /funds`, `PATCH /funds/:id` (only changed fields; the ceiling cannot be patched), `POST /funds/:id/pagu-adjustments`, `POST /funds/:id/close`.

Reports and history (`pettyCashReportApi.ts`): `GET /reports/{pending-vouchers,expense-summary,advances-by-user,reconciliation}`, `GET /period-end-check?date=`, `GET /audit-logs?entityType&entityId`.

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
- **Idempotency:** `useIdempotentMutation` sends one `Idempotency-Key` per intent (`actionKey`). The backend also caches FAILED answers per key, so a key is kept only while the outcome is unknown (connection dropped, kept across a remount) and replaced after any server answer; otherwise a corrected retry would be refused with 422.
- **Voucher form payload:** only filled fields are sent, because `PATCH` clears omitted optional fields and rejects `null`. Money is typed in whole rupiah (the backend also accepts cents; a stored amount with cents is shown and blocks saving until corrected, never rounded silently). Tax is computed by the server and never in the form; the form shows the net subtotal and says so. A tax code needs the tax invoice number, the date cannot be in the future.
- **Actions follow status, menu rights, custodian and segregation of duties** (`allowedVoucherActions`): a creator is not offered approve or reject on their own voucher unless the fund allows a single user.
- **Gateway failures** (408, 502, 503, 504, or a 5xx without the application's `{ code, message }`) are treated as an unknown outcome, like a dropped connection, so the key is kept. A kept key expires after 10 minutes.
- **Tax and thresholds:** the cash left and the approval hint use the net amount; with a tax code they are labelled "before tax" and approval is shown as possible, because the backend compares the total (net plus tax).
- **Cash count:** the form is a denomination calculator (7 banknotes, 4 coins) with live subtotals; the variance shown is an estimate (`expectedCashEstimate`, same formula as the backend) and the saved count carries the official figure. A reason is required when the estimate is not zero, the witness cannot be the custodian or the counter. Count actions: the counter submits a draft, an independent approver (neither custodian nor counter) approves or rejects.
- **Replenishment:** step 1 chooses the vouchers waiting for replenishment (all preselected) and the approved count that settles with them; step 2 chooses the bank (no default) and shows the server preview: payout = vouchers plus the cash shortage, tax and expense breakdown, journal behind a disclosure and in the wide column. The preview never receives the notes (the backend refuses them). Actions: approve/reject by an approver other than the submitter, cancel by the replenishment right, pay out an approved request by someone who neither submitted nor approved it (the date becomes the journal date).
- **Poka-yoke:** "Ajukan" is disabled above the available cash or when a required receipt is missing (checked on the net amount; the server decides on tax); "Simpan draf" stays available.
- **Advance workflow, one person per step** (`allowedAdvanceActions`): the requester asks, uploads, settles and cancels; an approver other than the requester approves or rejects; the custodian (not the requester) hands over the cash and verifies receipts; finance verification needs an approver who is neither the requester nor the custodian who verified. Expense accounts of settlement lines are chosen by verifiers and are required before finance verification. Converting an unsettled advance to employee receivable belongs to the control right (`JP-PC-CTL`). The user's own standing (`advance-status/me`) is only requested by users with the advance right.
- **Fund administration** is offered by menu right on `JP-PC` (create, update, delete for close). `toFundPatch` sends only what changed; changing the custodian or the status requires a reason. Funding a new fund from a bank needs the petty cash account balance to be 0; otherwise the backend refuses and the form keeps its input.
- **Reports and change history** are read-only and shown only with the read right on `JP-PC`; an unknown audit action is shown as a general update.
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

- No screen yet for blocking, unblocking or granting an exception to an employee's advance requests (hooks `useChangeRestriction` exist).
- Creating a fund and closing one were checked by form validation and a refused request only; the Demo Site has no empty petty cash account to fund from.
- Verified in a browser as the staff member, custodian, approver and superadmin, including the full advance workflow and fund ceiling adjustments.
- Edit-then-submit is coordinated in the form (two sequential mutations); move it to an `application` use case when later phases add similar multi-step workflows.
- The cash book is ordered by transaction date while the running balance follows the entry sequence, so a back-dated voucher recorded later appears early with the latest balance. Its opening and closing balance follow the date filter; a voucher dated before the fund was opened gives a negative balance (backend question 10).
- Superadmin custodian behavior and several accounting questions wait on the backend (`docs/petty-cash/BACKEND-QUESTIONS.md`).
- Component tests cover the action dialog and the form summary; the form, list and drawer were checked in a browser on the Demo Site.
