# purchases

Procure-to-pay: purchase requests, purchase orders, goods receipts, vendor bills, payment vouchers (including advances), purchase returns, vendor credit and the payables aging report. Every screen talks to the live purchasing API; there is no local data.

The backend rules are in the backend's `PURCHASE_MODULE.md`; this file records what the frontend relies on.

## Routes (`routes.purchases`)

| Key                                                                   | Path                                                                             | Page                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `main`                                                                | `/purchases`                                                                     | `PurchasesPage` (overview: attention list, pipeline, aging)      |
| `requests` / `orders` / `receipts` / `bills` / `payments` / `returns` | `/purchases/requests`, `/orders`, `/receipts`, `/bills`, `/payments`, `/returns` | `PurchaseListPage tab=...` (one page per document list, no tabs) |
| `payables`                                                            | `/purchases/payables`                                                            | `PayablesReportPage`                                             |
| `requestAdd` / `requestDetail` / `requestEdit`                        | `/purchases/requests/new`, `/:id`, `/:id/edit`                                   | `RequestFormPage`, `RequestDetailPage`                           |
| `orderDetail`                                                         | `/purchases/orders/:id`                                                          | `OrderDetailPage` (a PO is never created by hand, see below)     |
| `receiptAdd` / `receiptDetail`                                        | `/purchases/receipts/new?order=<id>`, `/:id`                                     | `ReceiptFormPage`, `ReceiptDetailPage`                           |
| `billAdd` / `billDetail` / `billEdit`                                 | `/purchases/bills/new?order=<id>`, `/:id`, `/:id/edit`                           | `BillFormPage`, `BillDetailPage`                                 |
| `paymentAdd` / `paymentDetail` / `paymentEdit`                        | `/purchases/payments/new?bill=<id>` or `?type=advance`, `/:id`, `/:id/edit`      | `PaymentFormPage`, `PaymentDetailPage`                           |
| `returnAdd` / `returnDetail` / `returnEdit`                           | `/purchases/returns/new?bill=<id>`, `/:id`, `/:id/edit`                          | `ReturnFormPage`, `ReturnDetailPage`                             |

The old `/pembelian` (`routes.legacyPaths.purchases`) still redirects to the overview, and the old `/purchases?tab=bills` style links redirect to the matching list page. Each sidebar sub-menu item is its own page; the hub has no tabs. Orders, receipts and bills are always created from the previous document, never from an empty form.

## Menus and rights (revamp, 2026-11-20)

The backend rebuilt purchasing around the prototype flow (FPPBJ, Accounting verification, procurement with approval, PO/SPK, FPB/BAPP, bills, Payment Request, Payment Voucher, returns). `PURCHASE_MENU` in `domain/purchaseAccess.ts` holds the eleven menu ids; each sidebar page opens on its own menus (`NAV_MENU` in `navigationMenus.ts`), so a requester sees only their requests and an approver only the list of the document they approve. The approval menus are granted by Settings > Alur Persetujuan, not by hand in Roles. `JP-PURCH-APR-PR` and `JP-PURCH-APR-PO` no longer exist.

The revamp lands one slice per PR, following the backend hand-over note. Until the last slice lands, pages that have not been rebuilt still talk to the removed endpoints and fail.

## Layers

- `domain/` pure rules: entity types per document, status tones, allowed actions per status (`purchaseActions`), menu access (`purchaseAccess`), the live totals estimate (`purchaseTotals`, integer minor units through `@/lib/money`), form mapping and validation per document, overview ordering.
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
- Actions: `POST /:id/submit`; `/verify` (`note` optional; the note is appended to `memo`); `/return` (`note` required, kept as `returnNote` after the requester resubmits); `/cancel` (`reason` required, the screen asks for 3 or more characters). A department that is inactive is refused on save (400); the department select lists only active ones plus the one the request already has.
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

## Contract facts that differ from the backend document (older documents, to be replaced slice by slice)

Verified against the live service on 2026-11-04:

- `PUT` bodies are not the create bodies. Bill: no `purchaseOrder`; `dueDate: null` is refused. Voucher: no `vendor` or `type`. Return: no `bill`. Each has its own update hook next to its pages (`useUpdateBill`, `useUpdatePaymentVoucher`, `useUpdatePurchaseReturn`).
- Reject, cancel and void take `{ reason }`; approve takes an optional `{ note }`.
- Bill variances arrive as `{ type, expected, actual }`; credit applications as `{ source, sourceId, amount, appliedAt, voided }`.
- The payables aging rows carry `vendor: { id, name }`; `usePayablesReport` normalizes them locally.
- A bill does not store its payment term, so editing a draft cannot restore the chosen term.
- Lists sort with `sortBy` (per document) and `sortOrder`. Returns do not accept `endDate`.

## i18n

Namespace `purchases`, assembled from `purchasesCommon`, `purchasesHub`, `purchasesRequests`, `purchasesOrders`, `purchasesReceipts`, `purchasesBills`, `purchasesPayments`, `purchasesReturns` and `purchasesReports` (`id` primary, `en`). `src/i18n/locales/purchases.test.ts` checks identical keys, placeholders and no empty values.

## Known gaps

- Who may approve each step (Settings > Alur Persetujuan) is configured elsewhere and is not part of this module.
- The overview counts only the first 10 documents per status, so "waiting for your decision" can undercount.
- Workaround adapters (`billExtras`, the aging normalizer) can be deleted once the shared mappers read those fields directly.
