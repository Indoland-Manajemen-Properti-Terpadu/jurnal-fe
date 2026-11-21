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
