# sales

Sales invoices (accounts receivable): a draft and send workflow, a three step invoice form, receivable statistics, payments with tags and files, the PDF, the invoice link and the public page behind that link.

## Routes (`routes.sales`)

| Key             | Path              | Page                                                                |
| --------------- | ----------------- | ------------------------------------------------------------------- |
| `main`          | `/sales`          | `SaleMainPage` (tabs Draf and Terkirim, filters, statistics)        |
| `add`           | `/sales/new`      | `SaleFormPage` (stepper)                                            |
| `edit`          | `/sales/:id/edit` | `SaleFormPage` (drafts only; any other invoice redirects to detail) |
| `detail`        | `/sales/:id`      | `SaleDetailPage`                                                    |
| `payments`      | `/sales/payments` | `SalePaymentsPage` (list of received payments)                      |
| `publicInvoice` | `/invoice/:token` | `PublicInvoicePage` (no sign-in, no app shell)                      |

`index.ts` exports the four pages, the `Sale` type, `mapSaleDto`, `formatIDR` and `getSaleStatusConfig`. The last three are used by the `contacts` module for a customer's sales.

## Endpoints (`infrastructure/saleApi.ts`, `saleReceivablesApi.ts`)

`GET|POST /v1/sales` (create is multipart), `GET|PUT|DELETE /v1/sales/:id` (update is multipart and never carries a status), `POST /v1/sales/:id/send`, `PUT /v1/sales/:id/void`, `POST /v1/sales/:id/invoice-link`, `GET /v1/sales/:id/print` (PDF blob), `GET /v1/sales/public/:token`, `GET /v1/sales/receivables/summary`, `GET /v1/sales/status-counts`, `POST /v1/sale-payments` (multipart), `GET /v1/sale-payments/:id`, `GET /v1/payment-methods`, `/v1/tags`, plus the per customer list and export used by `contacts`.

Other modules used: `contacts` (customers, payment terms), `products` (`fetchProducts`, `fetchTaxes`; `Product.unit` was added for the unit column), `chart-of-accounts` (`getJournalAccounts`).

## Layers

- `domain/`: `sale.ts` types; `saleStatus.ts` (tab queries, badge tone, timeline); `saleReceivables.ts` (statistic view, paid percent); `saleActions.ts` (what an invoice offers); `saleListState.ts` (list reducer and query params); `saleForm.ts` (steps, validation, due date from term, draft to form values); `salePayment.ts`, `saleFiles.ts`, `saleDeposit.ts`; `saleTotals.ts` (estimate), `saleFormat.ts`, `saleMoney.ts`.
- `infrastructure/`: DTOs, mappers (`displayStatus`, `canEdit`, `canDelete`, `createdByApi`, item `unit`), multipart builders (`salePayloads.ts`), endpoints, error classification (`saleErrors.ts`).
- `presentation/`: pages; `components/list`, `form`, `detail`, `public`, `shared` (`SegmentBar`, badge, confirm and reason modals); hooks (`useSaleQueries`, `useSaleMutations`, `useSaleForm`, `useSaleNotifier`, `saleErrorMessage`).

## Rules the screens follow

- **Status** comes from the server's `displayStatus` (`DRAFT`, `UNPAID`, `PAID`, `OVERDUE`, `VOID`). Nothing is derived on the client. The Draf tab asks `paymentStatus=DRAFT`; the Terkirim tab asks `paymentStatus=UNPAID,PAID,OVERDUE` (void is not in the default list) or the one status chosen in the filter, which now includes Void.
- **Actions** follow `saleActions`. Edit and delete come from the server flags `canEdit` and `canDelete`; an invoice with `createdByApi` shows delete disabled with a reason. A draft offers Edit, Delete and Send only (no Void). Only a draft is editable. A draft can never be paid. Void needs a reason of at least 3 characters and a voided invoice cannot be deleted.
- **Detail page**: every card opens with `DetailCardHeader` (icon, title, short line; an optional button on the right, never an icon alone). The header lays actions out with `headerActions`, left to right by use: one filled primary (Kirim for a draft, Catat Pembayaran for an open invoice), then quiet buttons (Edit, Unduh PDF), then "Aksi lainnya" with the rest (Salin Tautan, Kirim Ulang Email, then Void or Hapus after a divider). A menu item that cannot be used yet stays visible but disabled, with the reason as a tooltip: Kirim Ulang Email without an email address (`billingEmail`: the invoice's own, else the customer's), and Void for an invoice created from ProApps (the rule Hapus used to follow). The list row menu follows the same rules (`saleActions`). Kirim for a draft still issues an invoice whose customer has no email, but then sends nothing and says so in the confirmation ("Terbitkan" instead of "Terbitkan & Kirim"). Hapus exists only for drafts; an issued invoice is voided, never deleted. Card headers are tight (title, then the short line 2px below), as on the product detail page. A paid or void invoice has no filled button. The link card is "Tautan dan lampiran" and offers "Buat dan salin tautan" when there is no link yet.
- **Receivables summary** (`ReceivablesPanel`) is one surface for one equation: total sales = received + not yet due + overdue. The outstanding receivable (not yet due + overdue) is the headline; one segmented bar splits total sales into the three parts, and three columns under it act as the legend with each part's amount, share of sales, invoice count, the oldest overdue age (calendar days) and a link that filters the list. Every amount appears once. Figures come from `receivables/summary` (not the visible page) and follow the date filter. Colours (validated as a set): blue for received, the brand's light blue for not yet due, red only for overdue. Shares are floored, so nothing reads 100% unless it is the whole, and a sliver reads "<1%".
- **Invoice form layout**: the content card follows the step (general and lines use the full width, the last step is eight columns beside the totals and readiness panel), but the action bar (`FormActionBar`) is always one full-width bar below all content. Unit price and quantity inputs are empty while 0 and refuse leading zeros. Tags use the shared `TagSelect` (`@/components/TagSelect`) through `SaleTagField`, so a new tag is added from the dropdown's footer (`POST /v1/tags`) and selected at once; the payment form uses the same field.
- **Customer picker** (`CustomerPicker`): searches the server 20 at a time (300 ms debounce), so it works with any number of contacts (the sandbox has 1,083). The chosen customer is fetched by id when it is not in the results, which is how a reopened draft shows its customer. The invoice form takes the billing address and emails from the pick; the payments filter uses the same picker.
- **Email rule**: an email can go out when the invoice has an address of its own or its customer has one (`billingEmail`, `canEmail` in the form). Without one, "Simpan & Kirim" becomes "Simpan & Terbitkan" and issues the invoice without sending it.
- **Payment history**: the detail page of an issued invoice puts everything below the overview in one card with two pill tabs. "Rincian faktur" holds the lines, notes and the side cards (customer, link and attachments, extras); "Riwayat pembayaran (n)" holds only the payment history. The tab lives in the URL (`?tab=payments`, plus `&payment=<id>` to mark one payment), so a row of `/sales/payments` opens its invoice on the history with that payment highlighted. Pill tabs on the invoice list and detail have the same grey line and 12px gap below them as the ledger pages (`TAB_DIVIDER`). The history reads `GET /v1/sale-payments?sale=<id>` and lists date, payment number with method and account, where each payment went (invoice lines and late fee, named from the invoice's lines) and the amount received with any excess. A draft or void invoice has no tabs.
- **List tabs** show the count inside the label ("Draf (3)"), the same pill tabs as Daftar Akun.
- **Public invoice** (`PublicInvoiceView`): a read-only document with a blue top band, a tinted strip for customer, date and due date, a table with a numbered first column (hidden on phones), notes on the left and totals on the right with the outstanding amount in its own box. Print removes the border and shadow and keeps the colours. It shows no company name or logo, because the public endpoint does not return the issuer.
- **Saving**: Simpan sebagai Draf posts `status: DRAFT`; Simpan & Kirim posts `status: SENT, sendEmail: true`. Editing a draft sends no status; its Save & Send updates and then calls `send`. A failed email (`emailSent: false`) is a warning, never an error, and its technical text is never shown.
- **Errors**: Indonesian business messages from the server are shown as written to Indonesian readers; English readers get a generic sentence. Validation text and status codes never show.
- **Money** is integer cents through `@/lib/money`; amounts from the API are rounded half up to the cent in the mapper. The form total is labelled an estimate.
- **Payments** offer only active Cash & Bank accounts (a header account is replaced by its sub-accounts), tags (`tags[]`) and up to 5 files of 5 MB (`attachments`). A payment may not be zero. The amount is compared with `remainingAmount` (`paymentKind`):
  - **Equal**: sent without `items`; the server spreads it.
  - **Above**: also sent without `items`. The excess is booked by the server to the `sales_overpayment` mapping (read from `GET /v1/settings/account-mappings` by `fetchOverpaymentAccount`). The form shows where it goes; with no mapping set it shows a link to Account Mapping and disables Save (the server would answer 400).
  - **Below**: needs an allocation. Manual sends `items[n][saleItem]` (the line's id), `items[n][amount]` and `lateFeeAmount`; the allocation is checked as it is typed: a line above its `outstandingAmount` (or the fee above `outstandingLateFee`) shows its message at once, a live status line says "Seluruh pembayaran sudah dialokasikan" (green), "Belum teralokasi Rp X" (amber) or "Alokasi melebihi pembayaran Rp X" (red), and Save stays disabled, with a tooltip, until everything is valid (`allocationGap`). Automatic sends `autoAllocate=true` only and afterwards lists where the server put the money. `autoAllocate` is ignored by the server for equal or larger payments, so it is never sent for them.
  - The form reads the lines from `GET /v1/sales/:id` (not the list row) when it opens.
- Colour: brand blue and neutrals; red only for overdue and delete, green only for paid.

## Contract facts (verified on the live service, 2026-11-05)

- `paymentStatus` and `status` filters: `paymentStatus` takes a comma list or a repeated key; unknown values are a 400. `excludeDraft=true` also works. Sorting works on `dueDate`.
- `PUT /v1/sales/:id` takes the same multipart as create (JSON works too) and refuses a status change. Paying a draft is a 400.
- `POST /v1/sales/:id/send` and a create with `status: SENT` return the sale with `emailSent` and `emailError` inside `data`. `emailError` is technical text.
- `invoice-link` returns the link's **token** in `invoiceLink`, not a URL; the app builds `<origin>/invoice/<token>` (`buildInvoiceLink`). `GET /v1/sales/public/:token` works without sign-in and answers 404 for an unknown token.
- A product's `unit` is an object (`{ id, name }`); the form shows the name.
- Posting an invoice fails when the product's receivable account is a petty cash account ("Akun kas kecil ... tidak boleh dipakai di jurnal manual"). The message is shown politely and the invoice stays a draft.
- **Totals rule** (changed on the server 2026-11-11, verified live with draft invoices): the invoice discount (percentage of the subtotal, or nominal, never above the subtotal) is spread over the lines in proportion to their amount, to the cent, the leftover cents going to the largest fractions and the first line on a tie. Each line's VAT is taken on its amount after its share of the discount and rounded to the cent per line. Withholding (PPh) is a percentage of (subtotal - discount), or a nominal amount. `total = subtotal - discount + VAT`, `final = total - withholding` (no floor at zero). With tax-inclusive prices each line is first reduced to its price without tax and then follows the same rule. Example: lines 100.000 (11 %) and 50.000, 10 % discount, 2 % PPh give subtotal 150.000, discount 15.000, VAT 9.900, total 144.900, PPh 2.700, final 142.200. `calculateSaleTotals` mirrors this for the form's estimate; the screens show the server's figures everywhere else. Each item of a response also carries `discountAmount` and `withholdingAmount` (its share; 0 or missing on older invoices, read as 0 and never recomputed).
- **Discount and withholding input**: a percentage is capped at 100 in the input and in validation, and a nominal discount is capped at the subtotal (the server would silently cut it). The withholding account is optional: without one the server uses its default mapping (`sales_withholding_receivable`), so the form sends the withholding type and value alone. A server refusal such as a missing `sales_discount` mapping or withholding account is shown as the server worded it to Indonesian readers.

## i18n

Namespace `sales`, assembled from `salesCommon`, `salesList`, `salesForm`, `salesPay`, `salesPublic` and `salesView` (`id` primary, `en`). `saleDetail` still serves the detail page cards. Parity tests: `src/i18n/locales/sales.test.ts` and `saleDetail.test.ts`. UI copy says "Draf" in Indonesian and "Draft" in English.

## Known gaps

- Out of scope: Tukar Faktur, Pemesanan Penjualan and Penawaran Penjualan.
- The customer picker loads the first 100 contacts only.
- `APP_BASE_URL` must be set per environment on the backend, or emails carry no link.
- The public page has no PDF download (the print endpoint needs sign-in); it offers the browser print dialog.
- The detail page cards (`SaleItemsCard`, `SaleSidebar`) still use the older `saleDetail` copy and layout.

## Payments list (`/sales/payments`)

`GET /v1/sale-payments` (page, limit, `search`, `startDate`/`endDate` once both are set, `hasOverpayment` true or false; the server sorts by payment date). One table: date, payment number, invoice, customer, method and account, amount received, excess. A row opens its invoice. Filters: search, overpayment (all, with, without) and date range. More filters: customer (`CustomerPicker`), payment method and deposit account. The Tanggal, No. Pembayaran, Diterima and Kelebihan headers sort on the server (`sortBy`, `sortOrder`; a new column starts newest or largest first, and the sort survives "reset filters").

## Planned pages

`presentation/pages/planned/` holds the pages of sales documents that are not built yet: quotations (`/sales/quotations`), sales orders (`/sales/orders`), sales returns (`/sales/returns`) and receivables (`/sales/receivables`). Each renders the shared `PlannedModulePage` (header and planned scope, copy in the `plannedModules` namespace) and has no endpoint or state. The sidebar lists them next to the invoice list so the whole sales cycle is visible.
