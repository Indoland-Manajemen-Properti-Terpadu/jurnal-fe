# sales

Sales invoices (accounts receivable): a draft and send workflow, a three step invoice form, receivable statistics, payments with tags and files, the PDF, the invoice link and the public page behind that link.

## Routes (`routes.sales`)

| Key             | Path              | Page                                                                |
| --------------- | ----------------- | ------------------------------------------------------------------- |
| `main`          | `/sales`          | `SaleMainPage` (tabs Draf and Terkirim, filters, statistics)        |
| `add`           | `/sales/new`      | `SaleFormPage` (stepper)                                            |
| `edit`          | `/sales/:id/edit` | `SaleFormPage` (drafts only; any other invoice redirects to detail) |
| `detail`        | `/sales/:id`      | `SaleDetailPage`                                                    |
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

- **Status** comes from the server's `displayStatus` (`DRAFT`, `UNPAID`, `PAID`, `OVERDUE`, `VOID`). Nothing is derived on the client. The Draf tab asks `paymentStatus=DRAFT`; the Terkirim tab asks `paymentStatus=UNPAID,PAID,OVERDUE` (void has no tab) or the one status chosen in the filter.
- **Actions** follow `saleActions`. Edit and delete come from the server flags `canEdit` and `canDelete`; an invoice with `createdByApi` shows delete disabled with a reason. A draft offers Edit, Delete and Send only (no Void). Only a draft is editable. A draft can never be paid. Void needs a reason of at least 3 characters and a voided invoice cannot be deleted.
- **Receivables summary** (`ReceivablesPanel`) is one surface for one equation: total sales = received + not yet due + overdue. The outstanding receivable (not yet due + overdue) is the headline; one segmented bar splits total sales into the three parts, and three columns under it act as the legend with each part's amount, share of sales, invoice count, the oldest overdue age (calendar days) and a link that filters the list. Every amount appears once. Figures come from `receivables/summary` (not the visible page) and follow the date filter. Colours (validated as a set): blue for received, the brand's light blue for not yet due, red only for overdue. Shares are floored, so nothing reads 100% unless it is the whole, and a sliver reads "<1%".
- **Saving**: Simpan sebagai Draf posts `status: DRAFT`; Simpan & Kirim posts `status: SENT, sendEmail: true`. Editing a draft sends no status; its Save & Send updates and then calls `send`. A failed email (`emailSent: false`) is a warning, never an error, and its technical text is never shown.
- **Errors**: Indonesian business messages from the server are shown as written to Indonesian readers; English readers get a generic sentence. Validation text and status codes never show.
- **Money** is integer cents through `@/lib/money`; amounts from the API are rounded half up to the cent in the mapper. The form total is labelled an estimate.
- **Payments** offer only active Cash & Bank accounts (a header account is replaced by its sub-accounts), tags (`tags[]`) and up to 5 files of 5 MB (`attachments`). A payment may not be zero or above what is owed.
- Colour: brand blue and neutrals; red only for overdue and delete, green only for paid.

## Contract facts (verified on the live service, 2026-11-05)

- `paymentStatus` and `status` filters: `paymentStatus` takes a comma list or a repeated key; unknown values are a 400. `excludeDraft=true` also works. Sorting works on `dueDate`.
- `PUT /v1/sales/:id` takes the same multipart as create (JSON works too) and refuses a status change. Paying a draft is a 400.
- `POST /v1/sales/:id/send` and a create with `status: SENT` return the sale with `emailSent` and `emailError` inside `data`. `emailError` is technical text.
- `invoice-link` returns the link's **token** in `invoiceLink`, not a URL; the app builds `<origin>/invoice/<token>` (`buildInvoiceLink`). `GET /v1/sales/public/:token` works without sign-in and answers 404 for an unknown token.
- A product's `unit` is an object (`{ id, name }`); the form shows the name.
- Posting an invoice fails when the product's receivable account is a petty cash account ("Akun kas kecil ... tidak boleh dipakai di jurnal manual"). The message is shown politely and the invoice stays a draft.
- **VAT and PPh base** (confirmed by the product owner, verified live): VAT is charged on each line's full price before the invoice discount, and PPh is a share of the subtotal before the discount. Example: lines 100.000 (11 %) and 50.000, 10 % discount, 2 % PPh give subtotal 150.000, discount 15.000, VAT 11.000, total 146.000, PPh 3.000, final 143.000. With tax-inclusive prices the tax is split out (111.000 at 11 % is subtotal 100.000 plus 11.000 tax) and `total = gross - discount`. `calculateSaleTotals` follows this; `docs/accounting.md` records the rule.

## i18n

Namespace `sales`, assembled from `salesCommon`, `salesList`, `salesForm`, `salesPay`, `salesPublic` and `salesView` (`id` primary, `en`). `saleDetail` still serves the detail page cards. Parity tests: `src/i18n/locales/sales.test.ts` and `saleDetail.test.ts`. UI copy says "Draf" in Indonesian and "Draft" in English.

## Known gaps

- Out of scope: Tukar Faktur, Pemesanan Penjualan and Penawaran Penjualan.
- The customer picker loads the first 100 contacts only.
- `APP_BASE_URL` must be set per environment on the backend, or emails carry no link.
- The public page has no PDF download (the print endpoint needs sign-in); it offers the browser print dialog.
- The detail page cards (`SaleItemsCard`, `SaleSidebar`) still use the older `saleDetail` copy and layout.

## Planned pages

`presentation/pages/planned/` holds the pages of sales documents that are not built yet: quotations (`/sales/quotations`), sales orders (`/sales/orders`), payments received (`/sales/payments`), sales returns (`/sales/returns`) and receivables (`/sales/receivables`). Each renders the shared `PlannedModulePage` (header and planned scope, copy in the `plannedModules` namespace) and has no endpoint or state. The sidebar lists them next to the invoice list so the whole sales cycle is visible.
