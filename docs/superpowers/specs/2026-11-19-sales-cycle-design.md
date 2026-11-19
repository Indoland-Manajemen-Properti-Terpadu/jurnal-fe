# Sales cycle: quotes, orders, returns (design)

Status: approved by the product owner on 2026-11-19 ("gas" on scope, delivery plan left to the developer).

## Intent

Finish the Penjualan menu: Penawaran, Pesanan, Retur, plus what the new API adds to Faktur and Pembayaran Masuk. Today those three documents are placeholders (`presentation/pages/planned`). The backend deployed them on 2026-11-19; the verified contract is in `src/module/sales/README.md` ("Sales cycle: contract facts").

## Scope

In: quotes, orders, invoice from an order, invoice lock after an issued return, returns with issue and cancel, applying return credit to another invoice, cash refund of credit, bulk recurring billing (`POST /v1/sales/bulk-recurring`), the payments summary strip.

Out: Piutang Usaha page (the receivables panel on the invoice list stays), PDF and attachments for orders and returns (the API has none), public pages for quotes.

## Approaches considered

1. One generic "document" engine for quote, order and return. Rejected: the three differ in statuses, tabs, summaries and actions, and the repo guidance says no speculative generic frameworks.
2. Three sibling feature areas inside `src/module/sales`, sharing only small pieces that have a real second use (status badge, document totals, line editor, list shell). Chosen: it follows how `purchases` is built and keeps each document's rules in its own `domain` file.
3. Three new modules (`sale-quotes`, ...). Rejected: they share the customer picker, totals rule, money handling and menu rights with invoices, and cross-module imports would go through `index.ts` for no gain.

## Design

- **Routes** (`routes.sales`): `quotations`, `quotationAdd`, `quotationDetail`, `quotationEdit`, the same for orders and returns. Orders are created from a quote (`/sales/orders/new?quote=<id>`) or empty; invoices from an order (`/sales/new?order=<id>`); returns from an invoice (`/sales/returns/new?sale=<id>`). Each list is its own sidebar page.
- **Layers per document:** `domain/<doc>.ts` (types, status, tab, actions per status), `domain/<doc>Form.ts` (form values, validation, payload), `infrastructure/<doc>Api.ts` plus DTOs and a mapper, `presentation/hooks`, `presentation/pages`, `presentation/components/<doc>/`.
- **Actions** follow the API guide's per-status table, hidden (not disabled) when the status forbids them or the right is missing (`useMyGrants().can(SALE_MENU.x, ...)`). The server stays the authority and its refusal is shown politely; validation text never reaches the user.
- **Money:** the API sends currency units with decimals and `precision` 2; mappers convert to minor units through `@/lib/money`. The form total is an estimate; every figure after saving is the server's.
- **Status:** quotes and returns send `displayStatus` as a string, orders send none (use `status`), invoices send `{ code, label }`. Each mapper normalizes to one `DocStatus` shape so screens do not branch on it.
- **Lists:** `limit` is capped at 100; customer and product pickers search the server 20 at a time (existing `CustomerPicker`, with `contactType=Pelanggan,Unit,Lainnya`).
- **i18n:** one namespace per document (`salesQuotes`, `salesOrders`, `salesReturns`), `id` primary and `en`, with the parity tests the other namespaces have. Planned-page copy for these three is removed.

## Delivery management

- One branch and one PR per phase, cut from `origin/main-frontend`, Conventional Commits with scope `sales`. Later phases are stacked on the previous branch locally and rebased after each squash merge.
- A phase with a screen is shown to the product owner (screenshots from the running app) before it is committed or pushed; a phase without a screen is committed as soon as typecheck, lint, tests and prettier pass.
- No push, merge or deploy unless asked. Test records created on the Demo Site stay.

| Phase | Content                                                                          | Screen |
| ----- | -------------------------------------------------------------------------------- | ------ |
| 1     | Invoice fields, menu ids, lock rule, contract facts                              | no     |
| 2     | Quotes: list, form, detail, send dialog, actions, quote to order                 | yes    |
| 3     | Orders: list, form, detail, actions; invoice from an order (`?order=`)           | yes    |
| 4     | Invoice: returned amount and quantity, lock after an issued return, order link   | yes    |
| 5     | Returns: list, invoice picker, form, detail, issue, cancel; apply credit; refund | yes    |
| 6     | Bulk recurring billing                                                           | yes    |
| 7     | Payments summary strip, README and module index, nav and i18n cleanup            | yes    |

## Open items for the builder

- Whether a quote email needs a "mark as sent without email" path in the dialog (the API answers 503 when SMTP is not set up and emails were given).
- Whether to show an order's quote number: the API sends only the id, so it costs one extra fetch.
