# inventory

Stock keeping: warehouses, stock movements and stock counts. The product catalog that feeds it lives in the `products` module and is shown under the same sidebar group.

| Page                                                                     | Status                                |
| ------------------------------------------------------------------------ | ------------------------------------- |
| Warehouses (`/inventory/warehouses`, detail `/inventory/warehouses/:id`) | Built (PRO-103), connected to the API |
| Stock movements (`/inventory/stock-movements`, card, transfers)          | Built (PRO-105), connected to the API |
| Stock count (`/inventory/stock-take`, new, detail)                       | Built (PRO-107), connected to the API |

- **Routes:** `routes.inventory.warehouses`, `warehouseDetail`, `stockMovements`, `stockCard`, `transferNew`, `transferDetail`, `stockTake`, `stockTakeNew`, `stockTakeDetail`, and `settings.opnameAccounts`. The card and the transfer pages sit under `/inventory/stock-movements/...` so the sidebar keeps "Mutasi Stok" as the one active item.
- **Public API (`index.ts`):** `WarehousesPage`, `WarehouseDetailPage`, `StockMovementsPage`, `StockCardPage`, `TransferFormPage`, `TransferDetailPage`, `StockTakePage`, `StockTakeFormPage`, `StockTakeDetailPage`, `OpnameAccountsPage`.
- **i18n namespaces:** `warehouses`, `stockMovements` and `stockTake` (id and en, parity tests in `src/i18n/locales`).

## Warehouses

A warehouse is a master record of a place. It never holds a stock figure of its own: quantity and value are read from the stock ledger (Stock movements), so nothing on these pages can change stock.

**Endpoints** (`infrastructure/warehouseApi.ts`)

| Use                           | Call                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------- |
| List with summary             | `GET /v1/warehouses?q&status&page&limit`                                                                       |
| Detail                        | `GET /v1/warehouses/:id` (adds `lastOpname`, `codeLocked`, `summary.belowMinCount`)                            |
| Stock of one warehouse        | `GET /v1/warehouses/:id/stock`                                                                                 |
| Latest movements              | the same movements call as Stock movements below, with `warehouse=<id>&limit=20`                               |
| Change history                | `GET /v1/warehouses/:id/audit-log`                                                                             |
| People for "Penanggung jawab" | `GET /v1/warehouses/pic-options`                                                                               |
| Save                          | `POST /v1/warehouses`, `PUT /v1/warehouses/:id` (a blank code is left out so the service numbers it `GDG-00N`) |
| Make main                     | `PATCH /v1/warehouses/:id/default`                                                                             |
| Switch on or off              | `PATCH /v1/warehouses/:id/status` with `{ status: 'active'                                                     | 'inactive' }` |
| Minimum stock                 | `PUT /v1/warehouses/:id/min-stock` with `{ items: [{ productId, minQty }] }`                                   |
| Delete                        | `DELETE /v1/warehouses/:id`                                                                                    |
| Stock of one product          | `GET /v1/products/:id/stock` (quantity, `minQty`, status, `lastOpname` per warehouse; no money)                |
| Rights                        | `GET /v1/users/me/permissions`, menu `JP-STOCK` (create, read, update, delete)                                 |

**Rules shown** (`domain/warehouse.ts`)

- Exactly one main warehouse; it cannot be switched off or deleted.
- Delete only when `canDelete` (no document ever used the warehouse). The code is read-only when `codeLocked`.
- Switching off is refused with a 409 that lists every reason in `data.reasons[]` (`code`, `message`, extra data). The codes follow the QA spec (the backend renamed `DEFAULT` and `OPEN_PURCHASE_ORDER`, PRO-102, 2026-11-24; seen live): `IS_DEFAULT`, `HAS_STOCK` (`count` of products, and `inventoryValue` only for a role with the value right `JP-STOCK-VAL`; for any other role the field is absent, never 0, and the dialog then names the items without a rupiah figure), `OPEN_PO` (`count`), `OPEN_TRANSFER` (`count` and `transfers: [{ id, number }]`, for transfers waiting for approval) and `RUNNING_OPNAME` (`opname: { id, number, status }`). The screen still matches the earlier spellings, and an unknown code keeps the service's sentence. The dialog names up to five waiting transfers with a link to each, and sends the rest to the transfer list narrowed to this warehouse and `PENDING_APPROVAL`. The screen shows a blocking dialog straight away for what the list already knows (main warehouse, remaining stock, running count) and asks the service for the rest.
- Stock status: `Habis` at zero, `Di bawah minimum` under a set minimum, `Aman` otherwise. Quantities are never added across products; only the value is totalled, and the total is the service's own figure.
- Values (inventory value, average cost, value of a movement) are shown only when the service sends them. A person without that right sees no value column, never `Rp 0`.
- The change history names the person in charge and the product of a minimum-stock change (`domain/warehouseAudit.ts`); the service logs both as ids.

**Figures and pictures:** the three cards above the list and the detail (`components/warehouses/WarehouseMetrics.tsx`) use the card and picture set in `components/metrics/` (icon, number, hint, and a ring or a stacked bar with a legend). Every picture draws real data: the active share, how items and value spread over the active warehouses, how the value spreads over the products, and the stock status split. Slices are ranked in brand blues, with orange and red only for a real shortage (`domain/metricShares.ts`). The same card exists in Purchasing and Sales; promoting it to `src/components` is a separate refactor.

**Tables:** every table sits in `DataTableFrame` (a plain scroller, no gutter under the rows, no line after the last row). The scroll-area table container leaves a 12px gutter under the table, so it is not used here.

**State:** server data in TanStack Query (keys start with the signed-in user, `presentation/hooks/inventoryKeys.ts`); every write invalidates the warehouse queries. Switching off shows a toast with "Batalkan" that switches the warehouse back on.

## Stock movements

The stock ledger, read-only: nothing here adds, edits or deletes a movement. The only document made from here is a transfer. The tab and its filters live in the address (`?tab=history&warehouse=<id>&from&to&product&type&category&doc&page`), so a link from a warehouse opens the right view (`components/stock/stockFilters.ts`).

**Endpoints** (`infrastructure/stockApi.ts`, `transferApi.ts`)

| Use                               | Call                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Balances (matrix, reconciliation) | `GET /v1/stock/balances?asOf&warehouse&q&categoryId` (the reconciliation is inside this answer; there is no separate endpoint)                                                                                                                                                              |
| Movement history                  | `GET /v1/stock/movements?startDate&endDate&warehouse&product&types&categoryId&search&page&limit` (`types` is a comma list, `search` is part of a document number; answers `totals` over the whole filter)                                                                                   |
| Stock card                        | `GET /v1/stock/card?product=<id>&warehouse&startDate&endDate`                                                                                                                                                                                                                               |
| Export                            | `GET /v1/stock/export?scope=balances                                                                                                                                                                                                                                                        | movements` (a workbook) |
| Transfers                         | `GET /v1/stock/transfers`, `GET /:id`, `POST` with `{transactionDate, fromWarehouse, toWarehouse, items:[{product, quantity}], memo}`, `POST /:id/approve`, `POST /:id/reject` with `{reason}`, `POST /:id/void` with `{reason}`; status `PENDING_APPROVAL`, `POSTED`, `REJECTED` or `VOID` |
| Journal of a movement             | the journal detail page, by the movement's `journalTransaction`                                                                                                                                                                                                                             |
| Rights                            | menus `JP-STOCK-CARD` (read) and `JP-STOCK-TRF` (create, read, delete)                                                                                                                                                                                                                      |

**Behaviour**

- A transfer is asked for, not saved (QA, PRO-104, 2026-11-23): it starts as `PENDING_APPROVAL` and moves no stock until an approver agrees (the approvers come from Settings > Alur Persetujuan; Building Manager by default). The detail page shows Setujui and Tolak only when the service says `canDecide`; rejecting needs a reason, and a rejected or waiting transfer produces no movement. A posted transfer can still be cancelled with a reason, which records a reversing movement; the original rows stay in the history. There is no journal. The backend confirmed (PRO-104, 2026-11-23, tried on its local API) that `/approve` takes `{}` (`note` optional) and `/reject` takes `{ reason }` of at least 3 letters, and that the answer carries `rejectionReason`, `rejectedAt` and `rejectedByUser`; `approvalHistory` holds approvals only (`{ level, by, at, note }`). None of it was run against the sandbox from here, because a decision changes a document of someone else. `canDecide` comes from the approval engine, while the route is guarded by the menu right `JP-STOCK-TRF-APR`; on 2026-11-23 the test account had `canDecide: true` but that right set to false, which the backend traced to the menu sync script not yet run on the Demo Site.
- The balances page shows a matrix of products by warehouse when no warehouse is chosen, and a list when one is. The minimum and the status of a product come from the warehouse's own stock figures, so they show only for today's balance.
- Only the value is totalled, never quantities across products. Values show only when the service sends them. The menu `JP-STOCK-VAL` (money values of stock) decides the export: without it the service leaves the rupiah fields out and answers 403 on `/v1/stock/export`, so the Ekspor button is not offered.
- A refused decision (approve, reject or cancel of a transfer: stock short, a warehouse being counted, a locked period) keeps its dialog open and shows the server's sentence in a message, so the person reads why and can try again (the backend's spec asks for this on the cancel dialog; the same is done for approve and reject).
- A price that carries freight or tax (`costBreakdown`) is explained by a tooltip in the history; the number of a stock count links to its page.
- The transfer form lists only products the source warehouse holds on that date, checks the quantity against it, asks before changing the source while rows are filled, and `?from=<id>&fill=all` opens it with everything the warehouse still holds.

## Known gaps (stock movements)

- The history and the balances filter by category; the history also searches a document number and takes several types. A filter by stock status over all warehouses is still not in the service and is not faked in the screen.
- "Diserahkan kepada" is not needed for now (QA decision); the creator's name comes from `createdByUser`.
- Print of the stock card and the transfer hand-over sheet is not built; there is no agreed print format.
- Revisions of acquisition cost that belong to Purchasing and Settings (freight and tax settings, "PPN tidak dapat dikreditkan", "Ongkir ikut dikembalikan", freight per unit on the order) are not part of this screen; only the price tooltip is.

## Known gaps (warehouses)

- "Stok per gudang" in the product detail (`ProductWarehouseStock`) reads `GET /v1/products/:id/stock` and shows only for a stock-tracked product. The Products module does not import this module (a cycle); the router passes the section in through the `renderStock` prop of `ProductDetailPage`. A person without the stock right sees no section.
- The service logs the person in charge as an id and a minimum as `minQty:<productId>`; the screen resolves both. A name in the log would remove that step (backend wish, not a blocker).
- No endpoint for the open purchase orders or the waiting transfers of a warehouse, so those two blocking reasons cannot be told in advance; they show only when the service refuses.

## Stock count

Count the stock on the shelves, compare it with the book balance, and adjust the difference through a journal once approved. Rights are menus `JP-STOCK-OPN` (warehouse staff, blind count), `JP-STOCK-OPN-REV` (Accounting: values, reasons, submit, cancel) and `JP-STOCK-OPN-APR` (Building Manager: approve or reject). The screen only hides buttons; the service answers 403.

| Need                | Call                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| List                | `GET /v1/stock/opnames?warehouse&status&startDate&endDate&q&page&limit` (answers `summary {running, pending, diffThisMonth}` and `canSeeValues`) |
| One count           | `GET /v1/stock/opnames/:id` (lines carry `bookQty`, `diffQty`, `unitCost`, `costEditable`, `allowedReasons`, `isFound`, `needsRecount`)          |
| Create / header     | `POST /v1/stock/opnames` and `PUT /:id` with `{warehouse, date, scope:{type, categoryIds, productIds}, counterUser, notes}`                      |
| Fill counts         | `PUT /:id` with `{lines:[{product, countedQty, reason\|null, note, unitCost, needsRecount}]}`; a product outside the list becomes a "found" line |
| Flow                | `POST /:id/start`, `/submit`, `/approve`, `/reject {reason}`, `/cancel {reason}`                                                                 |
| Journal preview     | `GET /:id/journal-preview` → `{entries[{accountNumber, accountName, reasons, count, debit, credit}], missing[]}`                                 |
| Running count       | `GET /v1/stock/opnames/running?warehouseId=` (`data` is null when there is none)                                                                 |
| Difference accounts | `GET` and `PUT /v1/settings/opname-accounts` with `{accounts:{<reason>:<accountId>}}`                                                            |

**Behaviour**

- The scope of a count is all products, a category list, or hand-picked products.
- Blind count: for a person without review or approve rights the service omits the book balance, difference, price and value. The screen draws no such column or card (never zero) and hides the difference tab.
- Every field of a line saves by itself when it is left; the answer replaces the count so the difference and the allowed reasons stay the server's. The reasons offered follow the direction of the difference (a shortage can be lost, a surplus found). A reason "Lainnya" needs a note; a surplus of a product with no price needs a unit cost.
- Submit stays off until every product is counted (0 is a count) and every difference is complete, and says how many are missing. Reject and cancel need a reason; the dialog refuses blank or spaces.
- A count freezes its warehouse while it is counting or waiting for approval: the transfer, receipt and return forms disable that warehouse, and the transfer detail hides "Batalkan" with a banner. The warehouse detail links to its running and last count and offers "Buat opname".
- The number of a stock count in the movement history links to the count.
- Difference accounts are one row per reason in Settings ("Akun Selisih Opname"); the preview warns, with a link, when a reason still has no account.

## Known gaps (stock count)

- A draft can be deleted (PRO-106, 2026-11-24): `DELETE /v1/stock/opnames/:id`, only while the status is `draft` (the service answers 400 for a started count, which is cancelled instead). The menu entry "Hapus draf" shows only with the delete right on the stock count menu (`JP-STOCK-OPN`, held by the Warehousing role) and asks for confirmation; deleting returns to the list.
- Print is built as a browser print window (count sheet without book balance; minutes with differences, journal and signatures). The minutes list the journal by account, not an account per line.
- The freeze is enforced by the service: transfers, goods receipts (and their cancelling) and changes to tracking or the base unit of a counted product are refused with 409. Purchase returns do not make a stock movement yet, so nothing is refused there. The warehouse pickers of purchase receipts and returns also mark a counted warehouse and cannot choose it, and the product form locks "Lacak stok" and the base unit while `GET /v1/products/:id` carries `countingOpname: { id, number }` (see the products README).
- "Opname berjalan" and the frozen warehouses for the pickers come from `GET /v1/stock/opnames` with a repeated `status` (`counting` and `pending_approval` for frozen, plus `draft` for busy), so they no longer depend on reading the newest 100 counts. The query is sent as `status=a&status=b` (`paramsSerializer: { indexes: null }`).
- Blind count was checked against the service with a warehouse-staff account (role Warehousing): book balance, difference, price, value and `summary` are absent, and submit answers 403.
