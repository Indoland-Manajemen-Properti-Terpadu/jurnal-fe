# sales

Sales invoices (accounts receivable): list and filter invoices, create an invoice, view an invoice, record a payment, generate an online invoice link and download the PDF.

- **Routes:** `routes.sales.main` (`/sales`, `SaleMainPage`) and `routes.sales.detail` (`/sales/:id`, `SaleDetailPage`), both exported from `index.ts`. Both render `AppShellLayout` directly.
- **Public API (`index.ts`):** the two pages, the `Sale` type, `mapSaleDto`, `formatIDR` and `getSaleStatusConfig`. The last three are used by the legacy `Contact` module for a customer's sales.
- **Endpoints** (`infrastructure/saleApi.ts`, `SALE_ENDPOINTS`): `GET/POST /v1/sales`, `GET /v1/sales/:id`, `GET /v1/sales/transaction/:txNumber`, `POST /v1/sales/:id/invoice-link`, `GET /v1/sales/:id/print` (blob), `POST /v1/sale-payments`, `GET /v1/sale-payments/:id`, `GET /v1/payment-methods`, plus lookups for payment terms, taxes and tags, and the per-customer list and export endpoints used by `Contact`. The create payload is `multipart/form-data`.
- **Other modules used:** `Contact` (customer and payment term lookups, deep import until `Contact` has an `index.ts`), `products` (`fetchProducts`, `fetchTaxes`), `chart-of-accounts` (`getJournalAccounts` for the deposit and withholding accounts).

## Layers

- `domain/sale.ts`: entities, form values and payment payloads. `saleFormat.ts`: IDR, date and status formatting, invoice file name. `saleMoney.ts`: cent rounding. `saleTotals.ts`: invoice totals, payment remainder, overdue rule, list summary and tab filter.
- `infrastructure/`: `saleDto.ts` (raw API shapes, no `any`), `saleMapper.ts` (every `Number(...)` parse and money rounding), `saleApi.ts` (calls, create payload).
- `presentation/`: pages, components (`detail/` for the detail page parts and its CSS module), hooks (`useSaleQueries` TanStack Query hooks, `useCreateSaleForm`, `useSaleDisplay`).

## Domain rules

- Money is handled in integer cents through `@/lib/money`. Amounts received from the API are rounded half up to the cent in the mapper (negative adjustments round away from zero, so `-1.005` becomes `-1.01`). Quantity, tax rate, and discount or withholding percentage are not money and are not rounded.
- Create-invoice preview (`calculateSaleTotals`): line subtotal is `quantity x unit price` rounded to the cent, line tax is `subtotal x rate / 100` rounded half up per line, discount and withholding are a percentage of the subtotal or a nominal value, `total = subtotal - discount + tax`, `final = max(0, total - withholding)`. Whole-rupiah input gives the same result as the previous float arithmetic (tested against the old formulas); a tax that has more than two decimals (11 % of 3 x 1500.50 = 495.165) is now 495.17.
- In the create payload the unit price and nominal discount or withholding are rounded to the cent; percentages are sent as typed. The payment amount is rounded to the cent.
- Overdue: an invoice with money outstanding and a due date in the past. The tabs `OVERDUE`, `UNPAID`, `PAID` and `DRAFT` filter client side because the API only knows real statuses.
- Signed adjusted amounts (`adjustedAmount`) keep their sign: a plus sign for positive and a minus sign (U+2212) with the absolute value for negative.

## State

Server data and cache are TanStack Query (`saleKeys`, unchanged). Errors from `saleApi` reach the query hooks; mutations show a notification on failure, the detail page shows a not found state with retry. Local form state is Mantine `useForm`.

## i18n

- Namespace `saleDetail` (existing): the detail page.
- Namespace `sales` (new): the list page, create and pay modals, status labels, validation messages and notifications.
- Both have `id` and `en`; `src/i18n/locales/sales.test.ts` and `saleDetail.test.ts` check identical keys, placeholders and no empty values.

## Known gaps

- `getSaleStatusConfig` still returns the Indonesian `label` because `Contact` uses it; the sales list uses `labelKey` with `sales.status.*`.
- Currency and date formatting on the list and in the modals uses the fixed `id-ID` format; only the detail page follows the selected language.
- The generated invoice PDF file name is `Faktur-<number>.pdf` in both languages.
- The mapper treats non-number amounts as 0 (strings are not parsed) until the backend confirms whether it sends decimal strings.
- The invoice detail does not offer edit, void or delete; there are no endpoints wired for them.

## Totals and statuses (2026-10-31)

- A discount (percentage or nominal) is capped at the subtotal, so the total and the final amount are never negative.
- Draft and void sales are not receivables: `isPastDue` is false for them and `summarizeSales` leaves them out of every figure, like the dashboard does.
