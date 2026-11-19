# sales

Sales invoices (accounts receivable): a draft and send workflow, a three step invoice form, receivable statistics, payments with tags and files, the PDF, the invoice link and the public page behind that link.

## Routes (`routes.sales`)

| Key               | Path                         | Page                                                                |
| ----------------- | ---------------------------- | ------------------------------------------------------------------- |
| `main`            | `/sales`                     | `SaleMainPage` (tabs Draf and Terkirim, filters, statistics)        |
| `add`             | `/sales/new`                 | `SaleFormPage` (stepper)                                            |
| `edit`            | `/sales/:id/edit`            | `SaleFormPage` (drafts only; any other invoice redirects to detail) |
| `detail`          | `/sales/:id`                 | `SaleDetailPage`                                                    |
| `payments`        | `/sales/payments`            | `SalePaymentsPage` (list of received payments)                      |
| `quotations`      | `/sales/quotations`          | `QuoteListPage` (tabs, summary, search, row menu)                   |
| `quotationAdd`    | `/sales/quotations/new`      | `QuoteFormPage` (three steps)                                       |
| `quotationEdit`   | `/sales/quotations/:id/edit` | `QuoteFormPage` (drafts only; others open the detail)               |
| `quotationDetail` | `/sales/quotations/:id`      | `QuoteDetailPage`                                                   |
| `returns`         | `/sales/returns`             | `ReturnListPage` (tabs, summary, invoice picker)                    |
| `returnAdd`       | `/sales/returns/new?sale=id` | `ReturnFormPage` (one card form for the chosen invoice)             |
| `returnEdit`      | `/sales/returns/:id/edit`    | `ReturnFormPage` (drafts only; others open the detail)              |
| `returnDetail`    | `/sales/returns/:id`         | `ReturnDetailPage`                                                  |
| `publicInvoice`   | `/invoice/:token`            | `PublicInvoicePage` (no sign-in, no app shell)                      |

`index.ts` exports the pages, the `Sale` type, `mapSaleDto`, `formatIDR` and `getSaleStatusConfig`. The last three are used by the `contacts` module for a customer's sales.

## Endpoints (`infrastructure/saleApi.ts`, `saleReceivablesApi.ts`)

`GET|POST /v1/sales` (create is multipart), `GET|PUT|DELETE /v1/sales/:id` (update is multipart and never carries a status), `POST /v1/sales/:id/send`, `PUT /v1/sales/:id/void`, `POST /v1/sales/:id/invoice-link`, `GET /v1/sales/:id/print` (PDF blob), `GET /v1/sales/public/:token`, `GET /v1/sales/receivables/summary`, `GET /v1/sales/status-counts`, `POST /v1/sale-payments` (multipart), `GET /v1/sale-payments/:id`, `GET /v1/payment-methods`, `/v1/tags`, plus the per customer list and export used by `contacts`.

Other modules used: `contacts` (customers, payment terms), `products` (`fetchProducts`, `fetchTaxes`; `Product.unit` was added for the unit column), `chart-of-accounts` (`getJournalAccounts`).

## Layers

- `domain/`: `sale.ts` types; `saleStatus.ts` (tab queries, badge tone, timeline); `saleReceivables.ts` (statistic view, paid percent); `saleActions.ts` (what an invoice offers); `saleListState.ts` (list reducer and query params); `saleForm.ts` (steps, validation, due date from term, draft to form values); `salePayment.ts`, `saleFiles.ts`, `saleDeposit.ts`; `saleTotals.ts` (estimate), `saleFormat.ts`, `saleMoney.ts`.
- `infrastructure/`: DTOs, mappers (`displayStatus`, `canEdit`, `canDelete`, `createdByApi`, item `unit`), multipart builders (`salePayloads.ts`), endpoints, error classification (`saleErrors.ts`).
- `presentation/`: pages; `components/list`, `form`, `detail`, `public`, `shared` (`SegmentBar`, badge, confirm and reason modals); hooks (`useSaleQueries`, `useSaleMutations`, `useSaleForm`, `useSaleNotifier`, `saleErrorMessage`).

## Rules the screens follow

- A void invoice owes nothing: `mapSaleDto` sets `remainingAmount` to 0 for it, whatever the server still sends, so the list, the detail and the public page agree.
- An invoice whose lines bill nothing cannot be issued (`validateLines`, `validation.totalZero`); a draft of it can still be saved.
- A failed email after issuing names the reason the server gave (`emailError`, `sendNotices`, key `emailNotSentReason`); without a reason the generic hint is shown.

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

## Sales cycle (quotes, orders, returns): contract facts

Source: the backend's sales API guide and its Postman collection ("All Features" > Sale). Verified on the live service on 2026-11-19 (finance2, Demo Site; the endpoints answered 404 earlier that day and 200 after the backend deployed). A transient 502 right after the deploy cleared on retry.

- **Menus and rights:** `JP-SALES-QUOTE`, `JP-SALES-ORDER` and `JP-SALES-RETURN` (ids in `domain/saleMenu.ts`), read through `useMyGrants().can(menuId, 'create' | 'read' | 'update' | 'delete')`.
- **Lists** (`GET /v1/sale-quotes|sale-orders|sale-returns`) answer `data: { results, page, limit, totalPages, totalResults, summary, precision }`; `limit` above 100 is a 400. Tabs: quotes `running|accepted|finished`, orders `running|finished|cancelled`, returns `draft|issued|completed|cancelled`. The invoice and payment lists keep the older `data.data` plus `data.pagination`.
- **Money** comes in currency units with decimals (a return shows 13656.88) and `precision` 2 on every document seen so far; the mapper converts to cents like the invoice mapper. The totals follow the invoice rule (discount first, VAT per line on the discounted amount).
- **Status fields differ per document:** a quote and a return send `displayStatus` as a plain string (`DRAFT`, `SENT`, `ACCEPTED`, ...), an order sends no `displayStatus` (use `status`: `DRAFT`, `WAITING_CONFIRMATION`, `CONFIRMED`, `COMPLETED`), an invoice sends `{ code, label }`.
- **Links are bare ids:** a quote's `order`, an order's `quote` and `sale`, a return's `sale` (plus `saleNumber`). Items carry the whole embedded product.
- **Numbers:** `PNW-2026-00001` (quote), `SO-2026-00001` (order), `RTR-2026-00001` (return).
- **Rules seen working:** `validUntil` before the date, an empty `items`, a percentage above 100 and a reject without `reason` are 400s; accept on a draft, edit after sending, an order from a quote that is not accepted and a void of a quote that has an active order are 400s; a second order from the same quote and a second invoice from the same order are 409s; an invoice for another customer than its order is a 400; a return above the remaining quantity ("sisa 5"), dated before the invoice, with an invalid reason or on a draft invoice is a 400. Void, apply and refund on a draft return are 400s.
- **Invoice fields now sent:** `saleOrder`, `returnedAmount`, `creditAppliedAmount`, `items[]._id` and `items[].returnedQty`. An invoice made from an order moves the order to `COMPLETED` and the order's `sale` points back.
- **Error text:** business messages are Indonesian and safe to show; validation messages are English and quoted (`"items" must contain at least 1 items`) and must not reach the user.
- **Also live:** `GET /v1/sale-payments/summary` and `GET /v1/sale-payments/by-sale/:saleId`. The summary is `thisMonth { amount, count, monthStart }`, `total { amount, count }`, a plain `withholding` number and `precision`. The Pembayaran Masuk page shows the three figures in a strip above the list (`SalePaymentSummaryStrip`); the "PPh dipotong" label is our reading of `withholding`, so confirm it with the backend.
- **Not exercised yet** (they post journals): issuing a return, applying its credit to another invoice, refunding it, and the email send of a quote.

## i18n

Namespaces `salesQuotes` and `salesOrders` (`id` primary and `en`; parity tests `salesQuotes.test.ts` and `salesOrders.test.ts`) and namespace `sales`, assembled from `salesCommon`, `salesList`, `salesForm`, `salesPay`, `salesPublic` and `salesView` (`id` primary, `en`). `saleDetail` still serves the detail page cards. Parity tests: `src/i18n/locales/sales.test.ts` and `saleDetail.test.ts`. UI copy says "Draf" in Indonesian and "Draft" in English.

## Known gaps

- Out of scope: Tukar Faktur.
- The customer picker loads the first 100 contacts only.
- `APP_BASE_URL` must be set per environment on the backend, or emails carry no link.
- The public page has no PDF download (the print endpoint needs sign-in); it offers the browser print dialog.
- The detail page cards (`SaleItemsCard`, `SaleSidebar`) still use the older `saleDetail` copy and layout.

## Payments list (`/sales/payments`)

`GET /v1/sale-payments` (page, limit, `search`, `startDate`/`endDate` once both are set, `hasOverpayment` true or false; the server sorts by payment date). One table: date, payment number, invoice, customer, method and account, amount received, excess. A row opens its invoice. Filters: search, overpayment (all, with, without) and date range. More filters: customer (`CustomerPicker`), payment method and deposit account. The Tanggal, No. Pembayaran, Diterima and Kelebihan headers sort on the server (`sortBy`, `sortOrder`; a new column starts newest or largest first, and the sort survives "reset filters").

## Quotes (Penawaran)

`GET|POST /v1/sale-quotes`, `GET|PUT|DELETE /v1/sale-quotes/:id`, `GET :id/print` (PDF) and `POST :id/send|resend|revise|accept|reject|void|duplicate` (`infrastructure/saleQuoteApi.ts`; the contract is in "Sales cycle: contract facts" above).

- **Layers:** `domain/saleQuote.ts` (types, tabs, `quoteActions` per status, `allowedQuoteActions` by rights), `saleQuoteForm.ts` (form values, validation, a 14 day default for valid-until), `saleDocument.ts` (what quotes and orders share); `infrastructure/saleQuoteDto|Mapper|Payloads|Api.ts` and the shared `saleDocMapper.ts`; hooks `useQuoteQueries`, `useQuoteMutations`, `useQuoteActions` (the actions and their dialogs for rows and the detail alike), `useQuoteForm`, `useQuoteRights`; screens under `presentation/components/quotes`.
- **Status** is the server's `displayStatus` string (`EXPIRED` for a sent quote past its day); nothing is derived on the client. Tabs: Berjalan (draft and waiting), Diterima, Selesai (rejected, expired, cancelled).
- **Actions** follow the API guide per status: draft = edit, send, duplicate, delete; waiting = accept, reject, revise, resend, duplicate, cancel; expired = revise, duplicate, cancel; accepted = resend, duplicate (and Buat Pesanan, see below); rejected and cancelled = duplicate. They are hidden, not disabled, when the status forbids them or the user lacks the right (`JP-SALES-QUOTE`: create copies, update changes, sends and answers, delete cancels and deletes); nothing is hidden before the rights have loaded.
- **Send dialog:** up to 10 addresses (prefilled from the quote, else the customer) and a message of up to 2000 characters; without an address the quote is only marked as sent ("Tandai Terkirim Tanpa Email"). The status changes before the email goes, so a failed email is a warning, never an error. Resend uses the typed addresses, else the saved ones or the customer's.
- **Reject and cancel** need a reason of at least three characters (the shared `ReasonModal`).
- **Totals** in the form are the estimate of `calculateSaleTotals` without withholding; the detail shows the server's figures.
- **Buat Pesanan / Lihat Pesanan** on an accepted quote: the first asks for an optional target date and calls `POST /v1/sale-orders/from-quote/:id`, then opens the new order; the second opens the order. They need `JP-SALES-ORDER` create and read (`QuoteRights.orderCreate`, `orderRead`).

## Orders (Pesanan)

`GET|POST /v1/sale-orders`, `GET|PUT|DELETE /v1/sale-orders/:id`, `POST /from-quote/:quoteId` and `POST :id/send|confirm|cancel|duplicate` (`infrastructure/saleOrderApi.ts`).

- **Layers** mirror quotes: `domain/saleOrder.ts` (types, tabs, `orderActions`, `allowedOrderActions`), `saleOrderForm.ts` (a target date a month on by default), `saleOrderInvoice.ts`; `infrastructure/saleOrderDto|Mapper|Payloads|Api.ts`; hooks `useOrderQueries|Mutations|Actions|Form|Rights`; screens under `presentation/components/orders`. The line table, the discount and notes step and the lines card are shared with quotes (`components/docs`, copy from each document's own namespace).
- **Status** is the stored `status` (`DRAFT`, `WAITING_CONFIRMATION`, `CONFIRMED`, `COMPLETED`, `CANCELLED`); the API sends no display status for orders. `COMPLETED` is set by making an invoice, never by an order endpoint. Tabs: Berjalan, Selesai, Dibatalkan. The list has search but no status filter (the guide documents none).
- **Actions:** draft = edit, send, duplicate, delete; waiting = edit, confirm, duplicate, cancel; confirmed = Buat Faktur, edit, duplicate, cancel; completed = Lihat Faktur, duplicate; cancelled = duplicate. Rights: orders by `JP-SALES-ORDER` (create copies, update changes, sends and confirms, delete cancels and deletes), invoices by `JP-SALES` (create for Buat Faktur, read for Lihat Faktur). Cancel needs a reason of at least three characters.
- **Invoice from an order:** Buat Faktur opens `/sales/new?order=<id>`. `SaleFormPage` fetches the order (only a confirmed one; any other opens on its own page), and `orderToSaleFormValues` fills the customer, lines, prices, discount, term and notes; the invoice is dated today. `saleOrder` is sent in the multipart body when the invoice is created (never on an edit). The API refuses a customer other than the order's (400) and an order that is already invoiced (409); a line without a product must get one in the form. Saving the invoice moves the order to `COMPLETED`; voiding it or deleting the draft puts the order back to `CONFIRMED`.
- An order shows its quote and invoice only as ids; the pages link by id and do not fetch the numbers.

## Form shell (invoice, quote, order, return)

All four create/edit forms share one shell in `presentation/components/wizard/`, matching the reference design: `WizardStepper` (icon orbs with "LANGKAH n", done steps filled, current outlined), one `WizardCard` (header with icon and title, the fields, a grey totals band, and the action bar inside the same card) and `WizardActionBar` (Batal or Langkah sebelumnya on the left; Simpan sebagai Draf, Lanjut and the final action on the right). `WizardTotals` renders subtotal rows and the total; on the invoice's last step its left side carries the readiness note (`SaleReviewNote`). Surfaces use `radius="lg"` and elements inside them `md`; the theme gives `Paper` a default padding, so the card sets `p={0}` and pads its own sections. New forms use these components instead of their own Paper and Stepper.

## Invoice list and form

- Tabs: Draf, Terbit (unpaid, overdue and paid) and Dibatalkan (void, counted from `status-counts.VOID`). The status filter lives inside Terbit. "Dibayar sebagian" and "Diretur" are not offered: the API has no such status or filter (asked of the backend). A paid invoice's badge and amounts are green, not teal.
- Rows show "Total Faktur" with "Diskon: -Rp" under it when there is one, and "Terbayar: Rp" in green under the balance.
- The form has "Ambil dari Pesanan" (create only): once a customer is picked it lists that customer's confirmed orders (`GET /v1/sale-orders?customer=`); choosing one fills lines, discount, term and notes like the "Buat Faktur" button on an order, and clearing it only drops the link. A different customer cuts the link. The reference also offers quotes here; the API has no invoice-from-quote, so only orders are listed.

## List summaries

Every list but the invoice list (which keeps its receivables panel) opens with three separate `StatCard`s (`presentation/components/shared/StatCard.tsx`): an uppercase label, a short amount (`formatCompactIDR`, "Rp 1,6 jt"), a line of context and a tinted icon tile on the right, as in the reference design. No bars or rings: a visual that only some cards have says nothing.

## Quote and order forms

- The quote detail header shows Unduh PDF, Tandai ditolak and the main action (Tandai diterima, Buat Pesanan, Kirim) side by side; the rest sits in the menu.
- The order form has "Ambil dari Penawaran" (create only): accepted quotes of the chosen customer with no order yet. `POST /v1/sale-orders` takes no quote link; only `POST /v1/sale-orders/from-quote/:id` (a `targetDate` and nothing else) makes an order that knows its quote. So picking a quote opens the same dialog as "Buat Pesanan" on the quote instead of filling the form.
- The payments list says how much the rows on screen brought in and where a new payment is recorded.

## Date filter

The invoice list and the payments list filter by period through `DateRangeFilter`: a dropdown (Semua tanggal, Hari ini, Minggu ini, Bulan ini, Tahun ini, Kustom) that fills `startDate` and `endDate` itself, and choosing Kustom opens a calendar under the same field (no second control); the chosen days replace the field's label. The presets are worked out in local time (`presetRange`, weeks run Monday to Sunday). The payments list filters by search, customer, method and period only; the account and the excess filters were dropped.

## Dialogs

Every dialog uses `ModalFrame` (`src/components/Modals/ModalFrame.tsx`): a header with the title and description, a footer with the actions, both separated from the body by a 1px line that runs edge to edge, and a body that pads its own content. A search box or filter goes in the header (`headerExtra`) so it stays put; a table that should run edge to edge sets `bodyPadding={0}`. A table header that must stay in view uses `stickyHeader` inside the element that scrolls (the theme lets such a table overflow so the header sticks). In a list picker the row is the click target, with the customer under the document number; there is no select button.

## Bulk recurring billing

- A dialog (`BulkRecurringDialog`, `ModalFrame`) opened by the "Tagihan Rutin" button on the invoice list (shown with `JP-SALES` create); the result per customer shows in the same dialog. `POST /v1/sales/bulk-recurring` with `product`, `period` (`YYYY-MM`, from a month input), `transactionDate`, `dueDate`, `unitPrice` and 1 to 200 `customers`. One **draft** invoice per customer, no journal; the user issues them from the list.
- The answer is always 201 with `summary { created, skipped, failed }` and `results[]` (`customer`, `name`, `status`, `saleId`, `transactionNumber` on `created`, `message` otherwise). Verified live: a customer already billed for the product and month is `skipped` ("Sudah ditagih untuk periode ..."), an unknown id is `failed` ("Pelanggan tidak ditemukan"). The dialog shows each row and links created drafts to their invoice.
- Price fills from the product's selling price and can be changed. The customer picker searches 20 at a time and keeps the names of the ones already chosen.

## Returns

- **Create:** "Buat Retur" opens a picker of issued invoices (`GET /v1/sales?paymentStatus=UNPAID,OVERDUE,PAID` plus search, each row with its open balance), then `/sales/returns/new?sale=<id>`. The form is three steps like the reference design: Informasi (date, reason, note), Baris Diretur (return quantity per invoice line, "Retur semua", net price, tax and line total) and Penyelesaian (reduce the invoice or keep as credit, with "Nilai retur dibagi"). A banner names the invoice; the estimated totals show under every step. "Simpan sebagai Draf" saves; "Terbitkan Retur" (last step) saves and issues in one go, and a failed issue leaves the saved draft. Totals are an estimate (`estimateReturn`, `splitReturn`); the server prices the draft on save and its figure wins. A draft or void invoice opens a notice instead of the form.
- **Settlement:** `REDUCE_INVOICE` takes the amount off the invoice balance (any excess becomes credit); `CUSTOMER_CREDIT` leaves the invoice and keeps all of it as credit. Reasons are the five Indonesian strings the API accepts, sent as written.
- **Detail:** "Nota kredit atas <invoice> · reason", customer, date and settlement, lines with net price, tax and total, the credit card, and "Riwayat aktivitas" built from `createdAt`, `postedAt` and each credit application's `appliedAt` (the API gives no actor name, so none is shown).
- **Status:** the API's `displayStatus` (`DRAFT`, `ISSUED`, `COMPLETED`, `VOID`). Tabs: Draf, Terbit, Selesai, Dibatalkan; search by number, invoice or customer. Green is used only for `COMPLETED`.
- **Actions:** draft = edit, issue (Terbitkan), delete; issued = apply credit (Pakai Kredit), refund (Kembalikan Dana), cancel refund, cancel return. Cancel is disabled with a reason while credit has been used or refunded; each use of credit has its own "Batalkan Pemakaian". Rights come from `JP-SALES-RETURN` (create/update/delete).
- **Credit:** `creditRemaining` is what can still be applied to another invoice of the same customer or refunded; the detail page lists every application. Applying credit was verified live (and cancelled again).
- **Not verified live:** the cash refund. The request body is `depositAccount`, `refundDate` and an optional `memo` (it pays the whole remaining credit, per the Postman contract); money movement was not exercised, so check the first real refund.

## Invoices and returns (what the invoice shows)

- `Sale.returnedAmount`, `items[].returnedQty` and `saleOrder` are read by the mapper (0 or none when the API omits them). `hasIssuedReturn` (`domain/saleLocks.ts`) is the lock rule: a return amount above 0, or any returned quantity (a credit-only return leaves the amount at 0).
- **Void** is disabled, with a reason ("Faktur ini punya retur terbit..."), for an invoice with an issued return (`saleActions` gives `voidBlockedBy: 'return'`; an integration invoice gives `'api'`). Paying stays possible. The server also refuses it (400).
- The **detail page** shows a note for an invoice with a return, "Diretur n" under a line's quantity, a "Dipotong retur" row under the invoice total, and a "Pesanan asal" button to the order the invoice came from.
- An invoice that has an issued return is never an editable draft, so the form's own lock (lines, discount, withholding and tax mode) cannot be reached from the screens; the server enforces it for API callers.

## Waiting on the backend

Things the screens could use that the API does not offer yet (checked on the live service, 2026-11-19). Add to this list as new ones turn up and delete a line when it ships.

| Wanted                                                                             | Why                                                                              | Seen                                    |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| `GET /v1/sale-orders/:id/print` (PDF)                                              | The reference design has "Unduh PDF" on an order; quotes have it                 | 404                                     |
| An email for orders (`send` with addresses and a `resend`)                         | The reference menu has "Kirim ulang email"; today `send` only changes the status | `resend`, `send-email`, `email` all 404 |
| `quote` and `sale` on an order, `order` on a quote, as `{ id, transactionNumber }` | The pages show only ids today; showing the number costs one more fetch           | bare ids                                |
| `displayStatus` on orders                                                          | Quotes and returns send one, invoices send `{ code, label }`, orders none        | absent                                  |
| No `stack` in error answers                                                        | Production errors carry the server's stack trace and file paths                  | present on every 4xx                    |
| PDF for returns                                                                    | Same as orders; the guide lists none                                             | not in the guide                        |

## Planned pages

`presentation/pages/planned/` holds the sales pages that are not built yet: receivables (`/sales/receivables`). It renders the shared `PlannedModulePage` (header and planned scope, copy in the `plannedModules` namespace) and has no endpoint or state. The sidebar lists it next to the invoice list so the whole sales cycle is visible.
