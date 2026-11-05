# purchases

Procure-to-pay: purchase requests, purchase orders, goods receipts, vendor bills, payment vouchers (including advances), purchase returns, vendor credit and the payables aging report. Every screen talks to the live purchasing API; there is no local data.

The backend rules are in the backend's `PURCHASE_MODULE.md`; this file records what the frontend relies on.

## Routes (`routes.purchases`)

| Key                                            | Path                                                                            | Page                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| `main`                                         | `/purchases?tab=overview\|requests\|orders\|receipts\|bills\|payments\|returns` | `PurchasesPage` (hub, one tab per document) |
| `payables`                                     | `/purchases/payables`                                                           | `PayablesReportPage`                        |
| `requestAdd` / `requestDetail` / `requestEdit` | `/purchases/requests/new`, `/:id`, `/:id/edit`                                  | `RequestFormPage`, `RequestDetailPage`      |
| `orderAdd` / `orderDetail` / `orderEdit`       | `/purchases/orders/new?request=<id>`, `/:id`, `/:id/edit`                       | `OrderFormPage`, `OrderDetailPage`          |
| `receiptAdd` / `receiptDetail`                 | `/purchases/receipts/new?order=<id>`, `/:id`                                    | `ReceiptFormPage`, `ReceiptDetailPage`      |
| `billAdd` / `billDetail` / `billEdit`          | `/purchases/bills/new?order=<id>`, `/:id`, `/:id/edit`                          | `BillFormPage`, `BillDetailPage`            |
| `paymentAdd` / `paymentDetail` / `paymentEdit` | `/purchases/payments/new?bill=<id>` or `?type=advance`, `/:id`, `/:id/edit`     | `PaymentFormPage`, `PaymentDetailPage`      |
| `returnAdd` / `returnDetail` / `returnEdit`    | `/purchases/returns/new?bill=<id>`, `/:id`, `/:id/edit`                         | `ReturnFormPage`, `ReturnDetailPage`        |

The old `/pembelian` (`routes.legacyPaths.purchases`) still redirects to the hub. Orders, receipts and bills are always created from the previous document, never from an empty form.

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

## Contract facts that differ from the backend document

Verified against the live service on 2026-11-04:

- A purchase request item has only `product`, `description` and `quantity`. `estimatedPrice` is rejected.
- List filters accept a single `status` (a comma list is a 400). Lists sort with `sortBy` (per document) and `sortOrder`. Returns do not accept `endDate`.
- `PUT` bodies are not the create bodies. Order: no `purchaseRequest`, items also carry `quantity`. Bill: no `purchaseOrder`; `dueDate: null` is refused. Voucher: no `vendor` or `type`. Return: no `bill`. Each has its own update hook next to its pages (`useUpdateOrder`, `useUpdateBill`, `useUpdatePaymentVoucher`, `useUpdatePurchaseReturn`).
- Reject, cancel and void take `{ reason }`; approve takes an optional `{ note }`.
- Bill variances arrive as `{ type, expected, actual }`; credit applications as `{ source, sourceId, amount, appliedAt, voided }`.
- The payables aging rows carry `vendor: { id, name }`; `usePayablesReport` normalizes them locally.
- A bill does not store its payment term, so editing a draft cannot restore the chosen term.

## i18n

Namespace `purchases`, assembled from `purchasesCommon`, `purchasesHub`, `purchasesRequests`, `purchasesOrders`, `purchasesReceipts`, `purchasesBills`, `purchasesPayments`, `purchasesReturns` and `purchasesReports` (`id` primary, `en`). `src/i18n/locales/purchases.test.ts` checks identical keys, placeholders and no empty values.

## Known gaps

- Who may approve each step (Settings > Alur Persetujuan) is configured elsewhere and is not part of this module.
- The overview counts only the first 10 documents per status, so "waiting for your decision" can undercount.
- Workaround adapters (`billExtras`, the aging normalizer) can be deleted once the shared mappers read those fields directly.
