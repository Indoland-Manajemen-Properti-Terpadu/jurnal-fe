# Sales (Faktur Penjualan) revamp: design

Branch `feat/sales-revamp`, based on `develop-frontend`. Scope: UI/UX revamp of `src/module/sales` plus the backend sales fixes of 2026-11 (draft, send, display status, receivables summary, payment tags and attachments).

## Decisions (agreed)

1. Wording follows accounting usage (see Glossary). "Jatuh Tempo" is the status; "Lewat Jatuh Tempo" only titles the statistic card.
2. A draft offers Edit and Delete only. No Void on a draft.
3. Out of scope: Tukar Faktur, Pemesanan Penjualan, Penawaran Penjualan.
4. Public invoice page path is `/invoice/:token` (the backend email link is `{APP_BASE_URL}/invoice/{token}`).
5. Only a draft can be edited. A sent invoice is not editable.

## Verified contract (live API, 2026-11-05)

- Create (`POST /v1/sales`, multipart) accepts `status` = `DRAFT | SENT` (default `SENT`) and `sendEmail`. `DRAFT` with `sendEmail: true` is refused.
- `POST /v1/sales/:id/send` `{ sendEmail }` issues a draft; on a non-draft it only resends the email. Responses carry `emailSent` and `emailError`. A failed email is a warning, never an error: the invoice is saved.
- `PUT /v1/sales/:id` with a different `status` is a 400. `PUT /v1/sales/:id/void` voids.
- Paying a draft is a 400. `DELETE /v1/sales/:id` works on a draft.
- Every sale has `displayStatus { code, label }`, code in `DRAFT | UNPAID | PAID | OVERDUE | VOID`. List filter is `paymentStatus`.
- `GET /v1/sales/receivables/summary` gives `{ overdue, notDue, total }`, each `{ amount, count }`. Draft, void and paid are excluded.
- `POST /v1/sale-payments` is multipart: `tags[]`, `attachments` (max 5).
- Sale has `createdByApi` and `externalId`. A sale from ProApps has `createdByApi: true`.
- Accounts have `isBankAndCash`; products may have `unit`.

Added by the backend fix, verified live on 2026-11-05:

- `GET /v1/sales/receivables/summary` also returns `billed` (final amount of sent invoices, paid ones included) and `received`, and `overdue.oldestDueDate` (null when none). It accepts `startDate` and `endDate` (on `transactionDate`), and all figures follow them.
- `GET /v1/sales/status-counts` returns `DRAFT, UNPAID, PAID, OVERDUE, VOID, sent, all`; it accepts `search`, `customer`, `tags`, `startDate`, `endDate`.
- Every sale carries `canEdit` and `canDelete` (true for a draft without payments; false for sent, void and ProApps-created sales). The UI reads these flags and holds no copy of the rule. A voided sale cannot be deleted.
- `send` runs the journal, so it can fail on account mapping: a product whose receivable account is a petty-cash account gets a 400 with an Indonesian business message. That message is shown as written (Indonesian users) and a generic sentence for English users, as in purchases.

Still to confirm while building: why the PDF download and invoice link fail today, the exact `unit` shape, and the public invoice endpoint.

## Glossary (id / en)

| id | en |
|---|---|
| Faktur Penjualan | Sales Invoice |
| Piutang Usaha / Sisa Tagihan | Accounts Receivable / Outstanding |
| Draf | Draft |
| Terkirim | Sent |
| Belum Lunas / Lunas / Jatuh Tempo / Void | Unpaid / Paid / Overdue / Void |
| Simpan sebagai Draf / Simpan & Kirim | Save as Draft / Save & Send |
| Catat Pembayaran | Record Payment |
| Setor ke Akun (Kas & Bank) | Deposit To (Cash & Bank) |
| Diskon, DPP, PPN, Pemotongan PPh | Discount, Tax Base, VAT, Withholding Tax |
| Total Tagihan Akhir | Final Amount Due |

The repo glossary writes "Draf"; the backend label is "Draft". The UI follows the repo.

## List page `/sales` (Standard A)

- Header: title, one primary action "Buat Faktur", refresh.
- Tabs (pills): **Draf** and **Terkirim**, each with its count from `GET /sales/status-counts` (`DRAFT` and `sent`; the counts follow the search and date filters). Draf = `paymentStatus=DRAFT`. Terkirim = `excludeDraft=true`, or the chosen status. Verified 2026-11-05: `paymentStatus` takes a comma list or a repeated key and rejects unknown values with a 400; `excludeDraft=true` is accepted. "Semua" on Terkirim therefore uses `paymentStatus=UNPAID,PAID,OVERDUE` (Void is not shown in either tab; it has no tab by design).
- Sorting (`sortBy`, `sortOrder`) works on `dueDate`; verified.
- Filters: status (Belum Lunas, Lunas, Jatuh Tempo; hidden on the Draf tab), transaction date range, search. All server side.
- Badge from `displayStatus`; tone: Lunas green, Jatuh Tempo red, Belum Lunas neutral/blue, Void gray, Draf gray outline.
- Row actions by status: Draf = Edit, Hapus, Kirim. Terkirim = Lihat, Unduh PDF, Salin Tautan, Kirim Ulang Email, Catat Pembayaran (hidden when Lunas or Void).
- Edit and Hapus follow `canEdit` and `canDelete`. When `createdByApi` is true, Hapus is shown disabled with a reason ("Dibuat dari ProApps, tidak bisa dihapus dari sini"); otherwise a false flag hides the action.

### Statistics (from the summary endpoint, not from the visible page)

1. **Lewat Jatuh Tempo**: amount is the main number; subtext "3 faktur · tertua 45 hari". Red only when amount > 0.
2. **Sisa Tagihan (Piutang Usaha)**: total amount; a two-segment bar (jatuh tempo, belum jatuh tempo); subtext "Rp 14,2 jt belum jatuh tempo". No double counting.
3. **Sudah Diterima**: amount plus "25% dari total penjualan" with a ring/bar. Percentage = `received / billed` from the summary, computed in `domain` in integer minor units; below 1% it shows "<1%", and with `billed = 0` the card shows no percentage. The date filter of the list also drives the summary.

Colour: blue and neutrals; red and green carry meaning only. Components reuse `MetricCard`, `SegmentBar`, `RingStat` style from purchases (copied into the sales module where the import rule forbids cross-feature use; promoted to `src/components` only if two features need identical code).

## Create / edit page (Standard B, stepper)

Routes `/sales/new` and `/sales/:id/edit` (edit only for drafts; any other status redirects to detail). Local form state is Mantine `useForm`; step validation lives in `domain`.

1. **Informasi Umum**: customer, billing address, emails, transaction date, payment term, due date (auto from term), transaction number, customer reference, tags.
2. **Rincian Produk & Jasa**: lines table (product, description, qty, unit auto-filled and disabled, price, tax, amount). The "harga sudah termasuk pajak" switch sits here. Live totals panel beside the table, labelled as estimate.
3. **Diskon & Tambahan**: discount, withholding (account, type, value), message, memo, attachments, then the final bill breakdown (Subtotal, Diskon, DPP, PPN, Pemotongan PPh, Total Tagihan Akhir) and a review.

Bottom bar: back, **Simpan sebagai Draf** (secondary), **Simpan & Kirim** (the only primary, last step only; earlier steps show "Lanjut"). Draft save is allowed from any step once customer and one line are valid. Save & Send posts `status: SENT, sendEmail: true`; an `emailError` shows a warning notification, not an error. Edit mode sends no `status`.

Prevention rules: no submit with zero lines, qty ≤ 0, or a discount above the subtotal (existing cap); the send button explains what is missing.

## Detail page `/sales/:id`

Status timeline (Draf, Terkirim, Lunas), payment progress bar, key facts row. Actions by status: Draf = Edit, Hapus, Kirim; Terkirim = Catat Pembayaran, Unduh PDF, Salin Tautan, Kirim Ulang, Void (reason of 3+ characters); Lunas = PDF, link; Void = PDF only. Payment tags and attachments show in the payments list.

## Payment modal

Deposit accounts limited to `isBankAndCash`; tags; attachments (max 5, 5 MB each, multipart `attachments`). Never offered for DRAFT, PAID or VOID. Amount may not be zero or above the outstanding.

## Public invoice page `/invoice/:token`

Outside the app shell, no login, `GET /v1/sales/public/:linkToken`. Shows number, customer, lines, totals, status, and a PDF download if the endpoint offers it. Loading, not-found and error states. Calm, print-friendly.

## Architecture

- `domain/`: status mapping from `displayStatus`, receivables view model (percentages, segments), step validation, action availability per status and `createdByApi`, totals (existing).
- `infrastructure/`: new endpoints in `SALE_ENDPOINTS`, DTO and mapper changes (`displayStatus`, `createdByApi`, `emailSent/emailError`, `unit`), multipart payload builders for sale and payment.
- `presentation/`: pages `SaleMainPage`, `SaleFormPage`, `SaleDetailPage`, `PublicInvoicePage`; components split to stay under 400 lines; hooks keep keys starting with the user id like purchases. Mutations never optimistic; any mutation invalidates all sales queries.
- Routes added to `routes.ts` (`sales.add`, `sales.edit`, `sales.publicInvoice`), registered in `router/modules`, listed in the module README. The create modal files are removed.
- i18n: namespace `sales` (id primary, en) with the parity test; keep `saleDetail` for the detail page. No technical wording in UI copy (no "server", "API").
- `Contact` still imports `Sale`, `mapSaleDto`, `formatIDR`, `getSaleStatusConfig`; the public API in `index.ts` stays compatible.

## Testing and verification

Vitest for domain (status, receivables percentages, action availability, step validation), mapper, and payload builders; i18n parity test; routes test updated. Then `tsc`, `eslint`, lint ratchet and Prettier on changed files, and a browser check with the live API (list, create draft, send, edit, delete, pay with tag and file, public page) at desktop and phone widths. Test data created on the demo site is deleted afterwards.

## Risks

- The demo site has about 3,200 overdue invoices, so layout must hold with large amounts and long lists.
- `APP_BASE_URL` must be set per environment or emails carry no link (backend/ops task, not in this repo).
- Unknown server rule for deleting `createdByApi` sales: the UI disables it either way.
