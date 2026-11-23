# purchases

Procure-to-pay: purchase requests, purchase orders, goods receipts, vendor bills, Payment Requests, payment vouchers, purchase returns, vendor credit and the payables aging report. Every screen talks to the live purchasing API; there is no local data.

The backend rules are in the backend's `PURCHASE_MODULE.md`; this file records what the frontend relies on.

## Routes (`routes.purchases`)

| Key                                                                   | Path                                                                              | Page                                                             |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `main`                                                                | `/purchases`                                                                      | `PurchasesPage` (overview: attention list, pipeline, aging)      |
| `requests` / `orders` / `receipts` / `bills` / `payments` / `returns` | `/purchases/requests`, `/orders`, `/receipts`, `/bills`, `/payments`, `/returns`  | `PurchaseListPage tab=...` (one page per document list, no tabs) |
| `payables`                                                            | `/purchases/payables`                                                             | `PayablesReportPage`                                             |
| `requestAdd` / `requestDetail` / `requestEdit`                        | `/purchases/requests/new`, `/:id`, `/:id/edit`                                    | `RequestFormPage`, `RequestDetailPage`                           |
| `orderDetail`                                                         | `/purchases/orders/:id`                                                           | `OrderDetailPage` (a PO is never created by hand, see below)     |
| `receiptAdd` / `receiptDetail`                                        | `/purchases/receipts/new?order=<id>`, `/:id`                                      | `ReceiptFormPage`, `ReceiptDetailPage`                           |
| `billAdd` / `billDetail` / `billEdit`                                 | `/purchases/bills/new?order=<id>`, `/:id`, `/:id/edit`                            | `BillFormPage`, `BillDetailPage`                                 |
| `paymentRequests`                                                     | `/purchases/payment-requests`                                                     | `PurchaseListPage tab=paymentRequests`                           |
| `paymentRequestAdd` / `Detail` / `Edit`                               | `/purchases/payment-requests/new?bill=<id>` or `?order=<id>`, `/:id`, `/:id/edit` | `PaymentRequestFormPage`, `PaymentRequestDetailPage`             |
| `paymentAdd` / `paymentDetail`                                        | `/purchases/payments/new?request=<id>`, `/:id` (a voucher is never edited)        | `PaymentFormPage`, `PaymentDetailPage`                           |
| `returnAdd` / `returnDetail` / `returnEdit`                           | `/purchases/returns/new?bill=<id>`, `/:id`, `/:id/edit`                           | `ReturnFormPage`, `ReturnDetailPage`                             |

The old `/pembelian` (`routes.legacyPaths.purchases`) still redirects to the overview, and the old `/purchases?tab=bills` style links redirect to the matching list page. Each sidebar sub-menu item is its own page; the hub has no tabs. Orders, receipts and bills are always created from the previous document, never from an empty form.

## Menus and rights (revamp, 2026-11-20)

The backend rebuilt purchasing around the prototype flow (FPPBJ, Accounting verification, procurement with approval, PO/SPK, FPB/BAPP, bills, Payment Request, Payment Voucher, returns). `PURCHASE_MENU` in `domain/purchaseAccess.ts` holds the eleven menu ids; each sidebar page opens on its own menus (`NAV_MENU` in `navigationMenus.ts`), so a requester sees only their requests and an approver only the list of the document they approve. The approval menus are granted by Settings > Alur Persetujuan, not by hand in Roles. `JP-PURCH-APR-PR` and `JP-PURCH-APR-PO` no longer exist.

The revamp lands one slice per PR, following the backend hand-over note. All nine slices are in: every purchasing screen now talks to the new endpoints.

## Layers

- `domain/` pure rules: entity types per document, status tones, allowed actions per status (`purchaseActions`), menu access (`purchaseAccess`), the live totals estimate (`purchaseTotals`, integer minor units through `@/lib/money`), form mapping and validation per document, the dashboard and document chain shapes (`dashboard`, `documentChain`).
- `infrastructure/` endpoints, DTOs as captured from the live service, mappers (DTO to entity), `purchaseApi` (one resource per document), `purchaseLookupApi` (suppliers, purchasable products, taxes, payment methods and terms, the signed-in user's rights) and one error type (`PurchaseError`).
- `presentation/hooks` TanStack Query hooks. Every key starts with the signed-in user's id. Any successful or failed mutation invalidates all purchasing queries, because documents feed each other. Mutations are never optimistic and block a second submit while pending.
- `presentation/components/shared` the building blocks every screen reuses: `MetricCard`/`MetricGrid` (number plus a small picture of the same data), `visuals` (`SegmentBar`, `Legend`, `MiniBars`, `RingStat`, the aging colour scale), `InfoGrid` (label over value), `MoneyRows` (one money breakdown), `StatusNote` (the single page-level note), `DetailHighlights`/`DocumentHighlights` (four key facts above a detail page), `Timeline` (document journey and approval steps), plus status badge, list shell, approval panel, attachments, reason modal, supplier and product selects, page frame. Per-document components live in `requests/`, `orders/`, `receipts/`, `bills/`, `payments/`, `returns/`, `reports/`, `hub/`, `lists/`.

## Rules the screens follow

- Colour: brand blue and neutrals. Pictures of data use the primary scale; red appears only for real lateness or refusal (payables aging uses one red hue getting stronger). Icon orbs are always primary light.
- Type: Figtree on the type scale, no pixel sizes, no monospace. Amounts use tabular figures, right aligned.

- Amounts shown after saving are the server's; the form estimate (`calculateTotals`) is labelled as an estimate.
- Actions are hidden, not disabled, when the user lacks the right (`usePurchaseAccess`, rights from `/v1/users/me/permissions`) or the status forbids them (`purchaseActions`). The server remains the authority and its refusal is shown politely.
- Approval buttons come from the document's `approval.canDecide`. Submitting or approving never looks like paying: money moves only at `PAID`.
- Reject, cancel and void need a reason of at least 3 characters.
- Files: up to 5 per document, 5 MB each, multipart field `attachments`.
- Error copy never shows server text for validation or unknown failures. Indonesian business messages from the server are shown as written in Indonesian; English readers get a generic sentence.

## FPPBJ (purchase request), revamp 3/9

Verified live on 2026-11-21 (Demo Site). The old request (`procurementMode`, quotations, approve/reject) is gone.

- Flow: `DRAFT` -> `SUBMITTED` -> `VERIFIED` or `RETURNED` (-> edit, resubmit) -> `IN_PROCUREMENT` -> `COMPLETED`; `CANCELLED`. The requester edits, submits and cancels their own request (`JP-PURCH-FPPBJ` u/d plus `isOwner`); Accounting verifies, returns and may cancel any request (`JP-PURCH-FPPBJ-VER` u/d). `domain/requestAccess` holds these rules and `domain/purchaseActions.requestActions` the status gates; both have tests.
- Create body: `transactionDate`, `requiredDate`, `department` (id), `purpose`, `iom { number, date }`, `memo`, `items[] { product?, kind GOODS|SERVICE, description, specification, quantity, unit (id) }`. `unit` must be a unit id from `/v1/units` (at most 100 per page); a text unit is a 400. A line needs a product or a description. An FPPBJ takes no price (`estimatedPrice` is a 400).
- The service is looser than the screen: it accepts a missing department, a blank purpose, a needed-by date before the request date, a fractional quantity and any quantity above 0.01. The form requires the department, the purpose and the needed-by date, rejects a date before the request date and keeps the quantity at 0.01 or more. Limits (a longer text is a 400): purpose 1000, memo 2000, IOM number 100, description 500, specification 1000.
- `PUT` keeps what it leaves out, so the form sends every field: `memo: ''`, `iom: { number: '', date: null }` and a changed line list replace the old values (line ids change on every PUT). Editing needs `DRAFT` or `RETURNED` (400 otherwise).
- Actions: `POST /:id/submit`; `/verify` (no body: the screen has no verification note since PRO-108, 2026-11-23, so nothing is appended to `memo`; the service still accepts an optional `note`); `/return` (`note` required, kept as `returnNote` after the requester resubmits; only a `SUBMITTED` request, a verified one answers 400 "Hanya permintaan yang diajukan ... yang bisa dikembalikan", changed by the backend on PRO-108 and checked 2026-11-23); `/cancel` (`reason` required, the screen asks for 3 or more characters). A department that is inactive is refused on save (400); the department select lists only active ones plus the one the request already has.
- Files: `POST /:id/attachments` with the multipart `target` = `request` or `iom` (a missing target means `request`; `quote` is for procurement) and the field `attachments`. Only a `DRAFT` or `RETURNED` request accepts files (400 otherwise). 5 MB per file is refused in Indonesian; the service accepts any file type. Request files come back in `attachments`, IOM files in `iom.attachments`, as `{ id, fileName, filePath, mimeType }`; a file is served at `<api address>/<filePath>` without a token.
- List: `page`, `limit` (1 to 100), `search` (number, purpose and item description, not the IOM), `status` (one value, or several as `status[]=A&status[]=B`; a comma list is a 400), `department`, `mine`, `sortBy`, `sortOrder`, `startDate`, `endDate`, `procurementStatus`, `route`, `readyForOrder`. An unknown parameter is a 400. A list row has `statusLabel`, `requesterInfo`, `returnNote`, `cancelReason`; only the detail adds `verifiedByInfo` and `returnedByInfo`.
- The status text comes from the service's own `statusLabel` for Indonesian readers; English readers get the translated key.
- Not built here (no endpoint in the hand-over note): a PDF of the FPPBJ, which the prototype offers, and a delivery location on the request.
- A purchase order is never created by hand any more, so the order form, `orderAdd` and `orderEdit` are removed; the draft PO fields are edited from the PO detail (slice 5).

## Procurement (slice 4/9)

Part of the FPPBJ detail (`PUT /purchase-requests/:id/procurement`, `components/procurement/`), verified live on 2026-11-21.

- Choosing the route (`{ route }`) is itself a save: it moves a `VERIFIED` request to `IN_PROCUREMENT`. After that the procurement is `DRAFT` -> `SUBMITTED` -> `APPROVED` (or `REJECTED`, editable and resubmittable). The last approval makes the request `COMPLETED` and creates one draft PO/SPK per winning vendor (`purchaseOrderRefs`); the approval answer carries them and the screen opens the "Pengadaan disetujui" dialog with a link.
- A save is always accepted; what blocks submitting comes back as `procurementView.submitErrors` (Indonesian sentences, shown as written): bidding needs 2 complete quotes (3 when the winner's value is above Rp10 million, otherwise `belowMinQuotesReason` is required), a single vendor needs `singleReason`, a winner that is not the cheapest needs `reason`, a `finalPrice` above `unitPrice` needs `negotiationNote`, and the winner's quote must price every item. Submit, a second submit, a PUT while submitted, and a reject without `reason` are 400.
- `PUT` takes the whole procurement and keeps what it leaves out, so every change (add, edit or remove a quote, choose the winner, notes, switch the route) rebuilds the full body from the saved state (`procurementToInput`). **Quote ids change on every save and the files of a quote are dropped unless the quote is sent back with its `id`** (not `_id`, which is refused); `quoteToInput` always sends it. Quote files are uploaded after the save with `target=quote` and the new `quoteId` (found by vendor).
- Quote fields: `vendor`, `quotationNumber` (100), `validUntil` (null clears it; an empty string is a 400), `description`, `paymentTerm`, `termOverrides`, `leadDays` (integer, 0 or more, required as a number), `warranty` (100), `withReceipt`, `isPriceIncludeTax`, `discountAmount` and `shippingAmount` (0 or more), `lines[] { requestItem, unitPrice, finalPrice (null clears), specification (1000), tax (null for none) }`, `scores { price, spec, delivery, term }` (integers 1 to 5; the service weighs them 45/30/15/10 and returns `score`). One vendor has one quote; a single-vendor procurement takes one.
- `termOverrides` only has the figures of the term's own mechanism: `advancePercent` (1 to 99) on a partial advance, `installments` (2 or more) and `installmentPercents` (one per installment, positive, adding up to 100) on a milestone split, `periods` on a recurring one, `dueDays`, `retentionPercent` and `maintenanceMonths`. An advance of 0 on a term without an advance is a 400, so `termOverridesOf` leaves those out. The term options (`/v1/payment-terms`, active only, 100 per page) say which figures apply.
- The service is looser than the screen here too: it accepts a unit price of 0, a discount above the value of the items (the total becomes 0), an expired `validUntil` and a quote without a term. The modal requires a price above 0 and a term, refuses a discount above the items (checked in minor units, as an estimate only) and marks an expired quote. A quote file is required for a new quote, as in the prototype; the service does not require it.
- Totals and scores come from the service (`procurementView.quotes[]`); the screen never adds up money itself.
- Not tested live: the "Buat pesanan" backup (`POST .../procurement/orders`, only when `readyForOrder`), because an approved procurement always had its order. A removed winner's quote is sent without `winner` (the service answers 400 if the old winner stays).

## PO / SPK (slice 5/9)

Verified live on 2026-11-21. A PO is never created by hand: the last procurement approval drafts one per winning vendor, so there is no order form and no `POST /purchase-orders`. It is an SPK (`documentLabel`, `isService`) when every line is a service.

- Status: `DRAFT` -> `SENT` -> `PARTIAL_RECEIVED` -> `RECEIVED` -> `COMPLETED`; `CLOSED`, `VOID`. The service's `statusLabel` is shown to Indonesian readers.
- Draft only: `PUT` takes `transactionDate`, `expectedDate` (null clears), `warehouse` (id, null clears), `deliveryAddress` (500) and `memo` (2000); any other field (`items`, prices) is a 400, and a sent order answers 400. The service accepts an expected date before the order date; the dialog refuses it. Prices follow the procurement.
- Send: `POST /:id/send` with `{ sendEmail: false, note? }` only marks it `SENT` (the note is kept as `sentNote`), or `{ sendEmail: true, to?, cc?, note? }` mails the PDF to the vendor's email in Contacts (or `to`) and then marks it (`sentByEmail`, `sentTo`, `sentCc`). **A test with `sendEmail: true` really sends the mail**, so it was run once on 2026-11-21 against a seeded vendor address (sales@teknologinusantara.co.id) by mistake and is not repeated; the failure answer for a vendor without an email was therefore not run live. A second send, an edit after sending, and closing a draft are 400.
- `GET /:id/print` answers a PDF (`application/pdf`). `POST /:id/close` needs `note` (a one-character note was accepted; the screen asks for 3) and works on a sent order, not a draft, a closed or a voided one. `POST /:id/void` needs `reason` and works on a draft or a sent order with no receipt or bill; it returns the FPPBJ to a draft procurement (`IN_PROCUREMENT`, procurement `DRAFT`). Attachments take any status, the screen hides adding on a voided order.
- An SPK splits the lines by term: `items[].schedule { kind FULL|ADVANCE|TERM|PERIOD|RETENTION, seq, of, percent, ... }` with the amount and the wording in `description`; the advance and shipping lines have `billOnly: true` (nothing is received for them). `advance { amount, requested, paid, used, available }` drives the Payment Request for the advance (slice 8).
- List: `status` one or several (`status[]=`), `vendor`, `purchaseRequest`, `search` (the number only, not the vendor name), `sortBy`, `sortOrder`; an unknown parameter is a 400.
- Receiving: only a sent or partly received order with `withReceipt: true` takes an FPB / BAPP (400 otherwise, so the button is hidden); with `withReceipt: false` the bill is made straight from the order.
- Not tested live: the sendEmail failure above, and warehouses (the sandbox had none; one named "Gudang Utama" and one "Gudang Cadangan" were created for the tests; the inventory README still says `/v1/warehouses` is 404, but it answers now).

## FPB / BAPP (slice 6/9)

Verified live on 2026-11-21 (`/v1/goods-receipts`). `kind` is `GOODS` (an FPB) or `SERVICE` (a BAPP); `documentLabel` says which.

- Create: `purchaseOrder`, `transactionDate`, `deliveryNote`, `warehouse`, `memo`, `items[] { purchaseOrderItem, receivedQty, rejectedQty }`. Only a sent or partly received PO/SPK with `withReceipt: true` takes one (400 otherwise). Refused with Indonesian messages: no quantity, a quantity above what is left (`sisa N`, fractions are fine), an unknown item, a billing-only line (an advance or shipping is "langsung difaktur", never received). `rejectedQty` is kept on the line and is not counted as received.
- **A warehouse is required once more than one is active** ("Gudang wajib dipilih karena ada lebih dari satu gudang aktif"); with one active warehouse, or the PO's own, it is the default. The form follows that rule for stocked goods (`product.isInventory`) and never asks for one on a service.
- An FPB is `POSTED` at once (the label "Dikonfirmasi"), adds stock for stocked products and journals the accrual (`accrualAmount` per line, `amount`, `journalTransaction`). A BAPP is `PENDING_APPROVAL`, then approved level by level (`JP-PURCH-APR-BAPP`, default Chief Finance then Building Manager) to `POSTED` and journaled, or `REJECTED` with a `reason` (400 without), after which `POST /:id/resubmit` returns it to approval. Approve on a rejected or posted one, and resubmit twice, are 400.
- `POST /:id/void` needs `reason`; it reverses the receipt and lowers `receivedQty` on the order. The screen offers it on a `POSTED` receipt. Not tested live: voiding a pending BAPP, and voiding a receipt that is already billed (slice 7).
- List: `kind`, `billable=true` (receipts not fully billed yet), `purchaseOrder`, `vendor`, `status` (one or several), `search` (the number); an unknown parameter is a 400. Rows carry `purchaseOrderRef`, `billRefs` and `amount`.
- Receipts are recorded from the PO/SPK detail ("Catat Penerimaan"), never from an empty list.

## Bills (slice 7/9)

A bill has three sources, chosen on the form (`BillSource`): `RECEIPT` (one or more FPB/BAPP), `ORDER` (one or more PO/SPK) and `MANUAL` (no PO: vendor plus lines). Verified live on the Demo Site (2026-11-21).

- Documents picked together must share one vendor and one payment term (`compatibleWith` in `domain/billSources`); the picker disables the others.
- The server compares the bill with the order. A price difference answers 400 with an Indonesian message and a data list without `field` (`type`, `expected`, `actual`). `toApiError` keeps it as a business refusal with `details`; the form shows `BillVarianceDialog`, and confirming resends the same body with `acknowledgeVariance: true`.
- `PUT` keeps omitted fields, so the edit form sends the full header. A saved draft is edited on its header only (`validateBillForm(..., { headerOnly: true })`); its lines are not on the form.
- A bill's `displayStatus`, `noMatch`, `heldAmount` and `requestableAmount` come from the server and are shown as they are.
- Probe note: a request with `sendEmail: true` on a PO really sent an email to a seeded vendor address (slice 5). It cannot be undone.

## Payment Request and Payment Voucher (slice 8/9)

Verified live on the Demo Site (2026-11-21), positive and negative.

- **Payment Request** (`/v1/purchase-payment-requests`, menu `JP-PURCH-PAYREQ`, approval `JP-PURCH-APR-PAY`). `kind` `DP` takes `purchaseOrder`, `amount` and an optional `advanceAccount` (the server picks one when it is left out); `SETTLEMENT` takes `items[{bill, amount}]` of one vendor. `transactionDate` is required for both. Statuses `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `PROCESSED` (inside a voucher), `PAID`, `CANCELLED`; labels come from `statusLabel` / `kindLabel`.
- Limits the server enforces with Indonesian business messages (shown to Indonesian readers only): a settlement amount may not exceed the bill's `requestableAmount` (a draft already holds its own amount, so an edit may ask for that part again); all bills share one vendor; a DP cannot exceed `advance.available` of the order and the order's term must use an advance. Zero, empty `items` and a missing `reason` are English field errors (never shown). The form checks the same limits first (`validatePaymentRequestForm`).
- `PUT` rejects `kind` and `purchaseOrder` (400) and keeps omitted fields, so `toPaymentRequestUpdate` sends the whole body without them. Submit, approve (`note`), reject (`reason`) and cancel (`reason`, allowed until a voucher takes the request) are `POST /:id/<action>`. `canDecide` and `pendingApprovers` drive the approve buttons (the shared `ApprovalPanel`); `segregationOfDuties` is off on the Demo Site. A request has no attachments endpoint.
- List filters: `kind`, `ready=true` (approved and not yet in a voucher), `status` (one or several), `search` (number). `useOrders` takes `vendor`; the advance form lists the vendor's orders that still have `advance.available`.
- **Payment Voucher** (`/v1/purchase-payments`, menu `JP-PURCH-PAY`): `POST` takes `transactionDate` and `paymentRequests[]` of one vendor, optional `paymentMethod`, `depositAccount`, `referenceNumber`, `memo`. A request that is not approved, or already processed, is refused (400). The voucher has no approval and is `DRAFT`, `PAID` or `VOID`; it cannot be edited (no screen, no route).
- `POST /:id/pay` takes `paidAt`, `depositAccount`, `paymentMethod`, `adminFee`, `referenceNumber`. **Without a deposit account the server pays from a default cash account without a word**, so the pay dialog requires one (bank and cash accounts come from `useSimpleAccounts({ isBankAndCash: true })`). The server refuses a payment date before any settled bill's date, so the dialog starts at the latest bill date (`useVoucherMinDate`). Paying a paid voucher is a 400.
- `POST /:id/void` needs a `reason`; voiding a paid voucher reverses the journal and puts its requests back to `APPROVED`. `GET /:id/print` is a PDF; files go to `/:id/attachments`.
- Entry points: the bill detail has "Ajukan Pembayaran" (`?bill=`), the order detail menu has "Ajukan Uang Muka" (`?order=`), an approved request opens the voucher form (`?request=`). The sidebar has two entries, Payment Request and Payment Voucher.
- Files: `domain/paymentRequest` (types, form, validation, payloads), `domain/paymentForm` (voucher form, pay form), `infrastructure/purchaseDto` / `purchaseDocumentMappers` / `purchaseApi`, `components/paymentRequests/`, `components/payments/`, `lists/PaymentRequestList`, `lists/PaymentList`, locales `purchasesPaymentRequests` and `purchasesPayments`.
- Test data kept on the Demo Site: PP/2026/11/0001 (approved, back from a voided voucher), 0002 (cancelled DP), 0003 (approved), 0004 (paid by PV/2026/11/0003); PV/2026/11/0001 (voided after paying), 0002 (voided draft).

## Returns and the overview (slice 9/9)

Verified live on the Demo Site (2026-11-21), positive and negative.

- **Return** (`/v1/purchase-returns`, menu `JP-PURCH-RET`: create `c`, post and refund `u`, void `d`; the screens used `JP-PURCH` before). The body takes `settlement` `DEDUCT` (cut the bill), `CREDIT` (vendor credit) or `REFUND` (money back) and an optional `warehouse`; `PUT` carries the whole body without `bill`. `settlementLabel` and `statusLabel` come from the server. The service accepts a return **dated before its bill** and a return of a bill with a missing settlement (it defaults to `DEDUCT`), so the form blocks the early date itself and always sends the settlement. A quantity above what is left, and a missing or short `reason`, are refused; a bill that is already paid starts on `CREDIT` and cannot be deducted. `post` is for drafts only, `void` needs a `reason` (a posted return can be voided too).
- **Refund** (`POST /:id/refund`): `transactionDate` and `depositAccount` are required, `amount` defaults to what is left and may not exceed `creditRemaining` (400 otherwise). It can be paid back in parts; `refundAmount` and `creditRemaining` track it. The dialog requires the receiving account (`useSimpleAccounts({ isBankAndCash: true })`).
- **Vendor credit** (`GET /purchase-bills/vendor-credits?vendor=`): `returns` lists posted returns with credit left, `advances` is empty now that advances go through Payment Requests and are cut at verification. The service lets the remaining credit of a `REFUND` return be applied to a bill too (`POST /purchase-bills/:id/credit-applications`), which lowers what can still be refunded; the screen does not forbid it.
- **Overview** reads the service's own figures: `GET /purchase-dashboard/summary` (counts per stage, procurement routes, ready to pay, and with `JP-PURCH-RPT` the payables with aging), `/actions` ("Perlu tindakan": `title`, `subtitle`, `target {type, id}`, `waiting`, `late`, `due`, already sorted, late first; it holds only what the user may act on) and `/config`. The action wording is Indonesian only, so English readers get a line of ours from the key prefix (`actionPrefix`) and a generic line for a kind that is not known yet.
- **Money precision**: `config.precision` (the decimals of the general settings) is stored in `format.ts` by `useDashboardConfig`, which `PageFrame` calls, so every amount in the purchasing pages follows it. Amount inputs still accept two decimals, and the money maths stays in minor units of two decimals (`@/lib/money`); a site set to more than two decimals would need that library widened first.
- **Document chain** (`GET /purchase-dashboard/chain?type=&id=`, type `purchaseRequest`, `purchaseOrder`, `goodsReceipt`, `purchaseBill`, `paymentRequest`, `purchasePayment` or `purchaseReturn`) replaces the old `usePurchaseJourney` (which stitched the chain from several list calls). Every detail page shows it through `useDocumentChain` and the shared `DocumentJourney`; the return step appears only when a return exists.
- Removed: `usePurchaseJourney`, `useOverviewData`, `usePipelineCounts` and `purchaseOverview` (the client side guess of "what needs action").
- Test data kept: returns RB/2026/11/0001, 0002 and 0003 (voided), RB/2026/11/0004 (posted, `REFUND`, 1.000.000 paid back, 100.000 applied to FKT/2026/11/0004 as credit).

## Screens: shared layout (slice 10)

All purchasing screens share one set of building blocks in `presentation/components/shared/`: `DocumentFrame` (back link, header card, facts strip, two columns), `SectionCard` (icon tile, title, hairline, body), `InfoGrid`, `AmountsCard`, `RelatedDocsCard`, `DocumentJourney` and `ApprovalTrail` (the approval history sits inside the Persetujuan card, vertical), `ListShell`, `SourcePickerDialog` (the "Buat baru" pickers), `ReasonModal`, and `wizard/*` for the step forms (`WizardCard`, `WizardStepper`, `WizardActionBar`, `ChoiceCard`). Rules every screen follows: tables use `Table.module.css` (no line or empty space under the last row) and rows are the link; a badge is only for a status; notices sit full width under the header; dialogs use `ModalFrame`.

- **Procurement** (FPPBJ detail): route card, steps card (cells follow the route: single vendor has no winner step), quotes card, then reasons and submit. The winner can be picked only when the complete quotes reach the minimum; the reasons and submit cards appear from that point; switching a request to bidding clears a winner kept from the single-vendor route by sending `winner: null` (the service keeps what a PUT omits, so leaving it out changed nothing; `null` is accepted and clears it, verified 2026-11-22). Steps count a winner as done only with enough quotes.
- **Delivery location ("Lokasi kirim") on a request** (QA decision on PRO-108, backend delivered on PRO-116, 2026-11-23): a warehouse select under the department, shown only while a line is goods and required then. It starts on the main warehouse (the warehouse list marks it with `isDefault`; an older request without one gets the main warehouse in the field too) and lists active warehouses plus the one the request already has. The body sends `deliveryWarehouseId` only for goods; for services only it is left out and the service clears the value (checked by editing a draft). The service refuses an inactive warehouse (400 "... tidak aktif") and, when the field is missing on goods, fills the main warehouse itself. The detail page and the submit dialog show it, and the order takes it over (the order draft dialog can still change it before the order goes to the vendor).
- **Request form**: one column "Deskripsi / spesifikasi" (the product picker, then the specification), `Qty`, `Satuan`. The picker lists only goods (stock-tracked products) or only services, following the line's kind, and labels each option Barang or Jasa; a product of the other kind is cleared when the kind changes. There is no free-text name any more, so goods that are not in the catalog are added on the Produk page first (a "Tambah produk" action in the picker was left out on purpose).
- **Bill form** (3 steps): step 1 vendor select (the first vendor is preselected, changing it clears the picks) and a table of receipts or orders with a merge note; step 2 data and two upload boxes (vendor invoice, tax invoice), one file each, sent to `POST /purchase-bills/:id/attachments` once the bill is saved (the service has one bucket, no kind); step 3 lines with the three-way matching reminder and a DPP / PPN / payable preview from `estimateBill` (the service works out the real figures on save). Quantity is read only: the create body carries document ids, not quantities. "Total faktur vendor" stays: with it the service compares the vendor's total with its own (tolerance Rp1) when verifying.
- **Verifying a bill** (QA decision on PRO-111, 2026-11-23): saving a draft stays free, but Verify needs the vendor invoice number, the vendor invoice file, the vendor invoice total on a bill from a receipt, and the tax invoice file when the bill carries VAT (`taxAmount > 0`). `billVerifyMissing` (`domain/billVerify.ts`) lists the gaps; the verify dialog shows them and keeps the button off. Whether the service enforces the same is not confirmed yet (asked on PRO-116); verifying a bill changes data, so it was not tried against the sandbox.
- Summary column of the request, receipt, payment and return forms is 3 of 12 columns.

## Contract facts that differ from the backend document (older documents, to be replaced slice by slice)

Verified against the live service on 2026-11-04:

- `PUT` bodies are not the create bodies. Bill: no `purchaseOrder`; `dueDate: null` is refused. Payment Request: no `kind` or `purchaseOrder`. Return: no `bill`. Each has its own update hook next to its pages (`useUpdateBill`, `useUpdatePurchaseReturn`).
- Reject, cancel and void take `{ reason }`; approve takes an optional `{ note }`.
- Bill variances arrive as `{ type, expected, actual }`; credit applications as `{ source, sourceId, amount, appliedAt, voided }`.
- The payables aging rows carry `vendor: { id, name }`; `usePayablesReport` normalizes them locally.
- A bill does not store its payment term, so editing a draft cannot restore the chosen term.
- Lists sort with `sortBy` (per document) and `sortOrder`. Returns do not accept `endDate`.

## i18n

Namespace `purchases`, assembled from `purchasesCommon`, `purchasesHub`, `purchasesRequests`, `purchasesOrders`, `purchasesReceipts`, `purchasesBills`, `purchasesPayments`, `purchasesReturns` and `purchasesReports` (`id` primary, `en`). `src/i18n/locales/purchases.test.ts` checks identical keys, placeholders and no empty values.

## Known gaps

- Who may approve each step (Settings > Alur Persetujuan) is configured elsewhere and is not part of this module.
- Workaround adapters (`billExtras`, the aging normalizer) can be deleted once the shared mappers read those fields directly.
- Request item editor has no "Tambah produk" action (products are added on the Produk page); the barang/jasa split relies on `inventoryInfo.isTracked`, which the service may not mean as goods vs service.
- Bill form: no due date column or preview (the service sends only the term name), quantity cannot be partial, and the vendor invoice and tax invoice files are not told apart after saving. Open questions are on PRO-116.
