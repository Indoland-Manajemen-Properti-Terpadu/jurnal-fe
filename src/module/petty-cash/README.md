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

Reports and history (`pettyCashReportApi.ts`): `GET /reports/{pending-vouchers,expense-summary,advances-by-user,reconciliation}`, `GET /period-end-check?date=`, `GET /audit-logs?entityType&entityId&action&page&limit` (all optional; no date or user filter, newest first).

## Layers

- `domain/`: `pettyCashEntities` (entities as the app uses them), `pettyCashStatus` (backend statuses, tones, voucher actions per status), `pettyCashAccess` (menu rights, custodian, segregation of duties), `pettyCashView` (variance display, voucher net/tax/total, account summary, cash book type labels). All have tests.
- `infrastructure/`: `pettyCashApi`, `pettyCashDto`, `pettyCashMappers`, `pettyCashErrors`, `queryParams`, `idempotency`, `pettyCashEndpoints`.
- `presentation/`: pages (`PettyCashPage`, `PettyCashDetailPage`, `PettyCashPageFrame`), components (`PettyCashWorkspace`, `FundOverview` (fund identity, available cash, imprest equation, pockets and rules in one card), `FundSelector`, `VoucherList`, `VoucherDetailDrawer`, `CashBookPanel`, `PettyCashStatusBadge`, `QueryErrorState`) and hooks (`usePettyCashQueries`, `usePettyCashAccess`, `useIdempotentMutation`, `useOpenAttachment`, `pettyCashErrorMessage`, `pettyCashKeys`).

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
- **Reports, the audit trail section (global list filterable by document type and action) and the per-document change history** are read-only and shown only with the read right on `JP-PC`; an unknown audit action is shown as a general update.
- **A superadmin counts as custodian** in `isFundCustodian`, because the backend lets a superadmin act as custodian of any fund (open question 1).
- Imprest equation rows come from `imprestEquation` with the sign each carries in `pagu = cash + vouchers + advances - unsettledVariance`: a shortage is added, a surplus is deducted, so the rows shown add up to the ceiling.
- The voucher drawer shows net and tax only when they add up to the server total; otherwise only the server total.
- A malformed `:fundId` is shown as not found without calling the API (the backend answers 400).
- A voucher list item carries `lines[].expenseAccount` as an id only; the list resolves account names through `lookups`. The detail carries the full account.
- The backend keeps `rejectedReason` and `voidReason` after a voucher leaves those states, so the drawer shows them only while the status matches.

## Pockets (balance pockets)

A fund's cash is split into pockets: `TUNAI` (cash box), `BANK` (a petty cash bank account) and `EWALLET`. They share one ledger account, so pocket balances add up to `cashBalance` and only itemize the cash book; a transfer between pockets posts no journal (`POCKET_TRANSFER` in and out). See [ADR 0006](../../../docs/adr/0006-petty-cash-pockets.md).

- **Read side (done):** `FundDto.pockets[]` (`code`, `name`, `type`, `provider`, `accountNumber`, `accountHolder`, `isActive`, `balance`) maps to `PettyCashFund.pockets`; a fund answered without them has none. `PocketBalances` shows one card per pocket under the imprest panel, inactive ones greyed, and warns when the sum differs from `cashBalance`. The cash book takes `?pocket=` (opening and closing follow it), shows the pocket of each entry, and shows the pocket balance instead of the fund balance while one pocket is filtered.
- **Manage and move (done):** a new fund can open non-cash pockets and split the ceiling (`FundPocketsFields`; `pockets[]` and `fundingAllocation[]`, the cash box takes the rest, types from `lookups.pocketTypes`). `PocketFormDialog` adds (`POST /funds/:id/pockets`) and edits (`PATCH /funds/:id/pockets/:code`, only changed fields, switch-off only at balance 0, never the cash box). `PocketTransferDialog` moves cash (`POST /funds/:id/pocket-transfers`, with an `Idempotency-Key`). Pocket writes reload the fund instead of reading the answer. Rules and validation are in `domain/pockets.ts`.
- **Rights:** managing pockets is `JP-PC-FUND` update when the profile carries that menu, otherwise `JP-PC` update (the live permission list of the Demo Site has no `JP-PC-FUND`). Moving cash needs `JP-PC-CST` update and the custodian (a superadmin counts as custodian).
- **Pocket on transactions (done):** `PocketSelect` is shown only when a fund has two or more active pockets; otherwise nothing is sent and the backend uses the cash box. Voucher (`pocket`, kept on edit because PATCH replaces the whole voucher), replenishment create (`pocket`; not sent to the preview) and its payout (`pocket`, default the one chosen at submit), advance payout (`pocket`) and custodian verification (`pocket`, default `disbursePocket`), advance conversion to receivable, and ceiling adjustment (`pocket`, "added to" or "taken from"). A shortage error that names a pocket adds a hint to move funds or pick another pocket.
- **Cash count per pocket (done):** the cash box is counted by denomination; every active non-cash pocket gets a balance field (`nonCashBalances: [{ pocket, balance }]`, required by the backend, otherwise `POCKET_BALANCES_REQUIRED`). The form shows the book balance and the difference per pocket (an estimate), the summary works on the grand total (cash plus pockets), and the detail shows `pocketResults`. Rules and tests: `domain/cashCount.ts`.
- **Balance is checked per pocket only at approval or advance payout** (`reservedAmount` is per fund), so a voucher can pass submit and fail at approve with an insufficient-balance error that carries the pocket. The screens that offer those actions must show it and, for the custodian, point to a transfer.
- **Limit:** the bank reconciliation does not match per bank pocket (shared account); backend has not decided yet.

## Staged approval

A submitted cash count or replenishment carries `pendingApprovers: [{ level, label }]`, the stages still to approve, in order (the first is being waited for). A property management site goes `BM` then `CF`; any other site has one `FINANCE` stage. `domain/approval.ts` maps the active stage to the menu right: `BM` to `JP-PC-APR-BM`, `CF` to `JP-PC-APR-CF`, `FINANCE` to `JP-PC-APR`. Approve and reject are offered only to the holder of that right, on top of the existing separation of duties (not the custodian, not the counter or submitter). Without `pendingApprovers` the finance right applies; an unknown stage offers nothing. `ApprovalProgress` shows "Waiting for X, then Y" in both detail drawers and compactly in the lists. The server still decides: `APPROVAL_LEVEL_FORBIDDEN` and `SOD_VIOLATION` get their own sentence. Voucher and advance approval are unchanged (`JP-PC-APR`).

## Forms

The voucher form, the cash count form and the replenishment wizard share one layout (ui-guidelines Standard B): `SectionCard`s on the left, and on the right a sticky `FormSummaryCard` (`VoucherFormSummary`, `CountSummary`, the wizard's steps and `PayoutSummary`). The card is a title, `AmountRows` ending in the key figure, small notes, one quiet status line (teal check or orange triangle, like the balance line of `FundOverview`), a red line for what blocks saving, and the full-width actions. No alert boxes in the summary. The replenishment voucher table reuses the `DocumentTable` cell styles.

## Lists

Vouchers, cash counts, replenishments, advances and the cash book share `DocumentTable`: filters left and the count (or the opening and closing balance) with the tab's create action right; a quiet uppercase header; figures right aligned with tabular digits; the status in one column with the awaited approver under it; paging inside the card ("Showing 1-10 of 24"); the table shell kept when empty. A whole document row opens its drawer by click, Enter or Space (`DocumentNumber`, `TwoLine` for two-line cells); cash book rows are plain. The cash count list shows `totalCounted`.

## Tags and dates

- **Tags:** a voucher line can carry tags (`lines[].tagIds` on write, `lines[].tags` as ids on read; names come from `lookups.tags`). The line editor offers a multi-select when the site has tags, the drawer shows the names under the line, and an edit sends the stored tags again because an update replaces the lines.
- **Dates:** "today" is the WIB calendar date (`todayWib`, `domain/wibDate.ts`), the backend's time zone for `FUTURE_DATE_NOT_ALLOWED` and period locks, not the browser's.
- **Audit and error wording:** every audit action the backend lists has a sentence (`PAGU_ADJUSTMENT`, `CLOSE`, the pocket actions and `APPROVE_FINANCE`/`BM`/`CF`); an unknown one still reads "Data diperbarui". `INVALID_BANK_ACCOUNT` and `REIMBURSEMENT_AMOUNT_CHANGED` have their own error sentence.
- **Contract and open points:** `docs/petty-cash/API-CONTRACT.md` section 9 and `API-REAL-SHAPES.md` section 11 describe pockets, staged approval and tags; `BACKEND-QUESTIONS.md` holds the backend's answers and the open questions, `FOLLOW-UPS.md` the decisions waiting for the product owner.

## Reports and dialogs

The reports tab lists the six reports in a side menu (a select on a narrow screen). Each report opens with its title and what it shows (`ReportShell`), then its filters and a `DocumentTable` with the totals bar inside the card (`TotalFigure`); figure tiles use `StatTile`, neutral unless a figure needs attention (the oldest pending bucket). The period-end check reuses the drawer cards (`DetailSection`, `LineItems`). The expense share is a display proportion of the server figures.

Every dialog uses `DialogFrame`: title with a one or two sentence explanation under it, the fields, and the actions in a footer. `DecisionDialog` (approve, reject, void, pay out, transfer, ceiling, close, convert) is built on it. `Modal.Content` gets `p={0}` because the theme pads every `Paper` inline.

## Detail drawers

All four drawers (voucher, cash count, replenishment, advance) follow one layout, so a reader learns it once:

1. `DocumentDrawer` frame: document kind, number and status in the header; loading and error states; actions pinned in a sticky footer that disappears when the reader may not act.
2. `AmountSummary`: the one figure the document is about (total, total counted, payout, still to account for) with a quiet line of context.
3. `DocumentNotice`: the only colored block, for a refusal (red), a warning (orange) or a void (gray).
4. Plain `DetailSection` cards with `DetailFacts` (label above value, two columns), `AmountRows` (a calculation ending in its total) or `LineItems` (lines, vouchers, denominations, per-pocket results).
5. `JourneySection`: the document journey from `domain/documentJourney.ts`, built from the record's own timestamps, oldest first, followed while it waits by the approval stages (`pendingApprovers`). Advance steps read as events ("Requested", "Cash handed over"), not as status names.
6. `AuditTimeline`: the change history, folded by default (`CollapsibleSection`), newest first.

`HistoryTimeline` is monochrome on purpose: neutral check markers for what happened, the brand color only for the last step or the stage being waited for (a ring), hollow markers and a dashed line for stages ahead, and a cross for a refusal. Statuses keep their colored badge in the header and lists only. The cash count drawer shows `totalCounted` (cash plus non-cash pockets) and the result per pocket (`pocketResults`).

## State

TanStack Query hooks in `presentation/hooks`; filters and the selected tab are local component state, the selected fund lives in the URL. No server data is mirrored in Zustand.

## i18n

Namespace `pettyCash` (`id` and `en`): `workspace`, `balance`, `vouchers`, `drawer`, `cashBook`, `errors`, `status`, with parity and placeholder tests in `src/i18n/locales/pettyCash.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`. The header breadcrumb reads the `pettyCash` key of the `journal` namespace.

## Known gaps

- Blocking, unblocking and granting an exception to an employee's advance requests lives in Reports > Advances by employee (control right `JP-PC-CTL`, which also needs the read right on `JP-PC` to reach that tab). Block and unblock were verified live; the exception needs an overdue advance and was not.
- Creating a fund and closing one were checked by form validation and a refused request only; the Demo Site has no empty petty cash account to fund from.
- Verified in a browser as the staff member, custodian, approver and superadmin, including the full advance workflow and fund ceiling adjustments.
- Edit-then-submit is coordinated in the form (two sequential mutations); move it to an `application` use case when later phases add similar multi-step workflows.
- The cash book is ordered by transaction date while the running balance follows the entry sequence, so a back-dated voucher recorded later appears early with the latest balance. Its opening and closing balance follow the date filter; a voucher dated before the fund was opened gives a negative balance (backend question 10).
- Superadmin custodian behavior and several accounting questions wait on the backend (`docs/petty-cash/BACKEND-QUESTIONS.md`).
- Component tests cover the action dialog and the form summary; the form, list and drawer were checked in a browser on the Demo Site.
