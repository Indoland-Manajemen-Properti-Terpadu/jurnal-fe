# inventory

Stock keeping: warehouses, stock movements and stock counts. The product catalog that feeds it lives in the `products` module and is shown under the same sidebar group.

| Page                                                                     | Status                                     |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| Warehouses (`/inventory/warehouses`, detail `/inventory/warehouses/:id`) | Built (PRO-103), connected to the API      |
| Stock movements (`/inventory/stock-movements`)                           | Placeholder (`PlannedModulePage`), PRO-105 |
| Stock count (`/inventory/stock-take`)                                    | Placeholder (`PlannedModulePage`), PRO-107 |

- **Routes:** `routes.inventory.warehouses`, `routes.inventory.warehouseDetail`, `routes.inventory.stockMovements`, `routes.inventory.stockTake`.
- **Public API (`index.ts`):** `WarehousesPage`, `WarehouseDetailPage`, `StockMovementsPage`, `StockTakePage`.
- **i18n namespace:** `warehouses` (id and en, parity test in `src/i18n/locales/warehouses.test.ts`).

## Warehouses

A warehouse is a master record of a place. It never holds a stock figure of its own: quantity and value are read from the stock ledger (Stock movements), so nothing on these pages can change stock.

**Endpoints** (`infrastructure/warehouseApi.ts`)

| Use                           | Call                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------- |
| List with summary             | `GET /v1/warehouses?q&status&page&limit`                                                                       |
| Detail                        | `GET /v1/warehouses/:id` (adds `lastOpname`, `codeLocked`, `summary.belowMinCount`)                            |
| Stock of one warehouse        | `GET /v1/warehouses/:id/stock`                                                                                 |
| Latest movements              | `GET /v1/stock/movements?warehouse=<id>&limit=20` (the filter is `warehouse`, not `warehouseId`)               |
| Change history                | `GET /v1/warehouses/:id/audit-log`                                                                             |
| People for "Penanggung jawab" | `GET /v1/warehouses/pic-options`                                                                               |
| Save                          | `POST /v1/warehouses`, `PUT /v1/warehouses/:id` (a blank code is left out so the service numbers it `GDG-00N`) |
| Make main                     | `PATCH /v1/warehouses/:id/default`                                                                             |
| Switch on or off              | `PATCH /v1/warehouses/:id/status` with `{ status: 'active'                                                     | 'inactive' }` |
| Minimum stock                 | `PUT /v1/warehouses/:id/min-stock` with `{ items: [{ productId, minQty }] }`                                   |
| Delete                        | `DELETE /v1/warehouses/:id`                                                                                    |
| Rights                        | `GET /v1/users/me/permissions`, menu `JP-STOCK` (create, read, update, delete)                                 |

**Rules shown** (`domain/warehouse.ts`)

- Exactly one main warehouse; it cannot be switched off or deleted.
- Delete only when `canDelete` (no document ever used the warehouse). The code is read-only when `codeLocked`.
- Switching off is refused with a 409 that lists every reason in `data.reasons[]` (`code`, `message`, extra data). `RUNNING_OPNAME` is confirmed against the service; the main-warehouse, stock and purchase-order codes are matched by name and an unknown code keeps the service's sentence. The screen shows a blocking dialog straight away for what the list already knows (main warehouse, remaining stock, running count) and asks the service for the rest.
- Stock status: `Habis` at zero, `Di bawah minimum` under a set minimum, `Aman` otherwise. Quantities are never added across products; only the value is totalled, and the total is the service's own figure.
- Values (inventory value, average cost, value of a movement) are shown only when the service sends them. A person without that right sees no value column, never `Rp 0`.
- The change history names the person in charge and the product of a minimum-stock change (`domain/warehouseAudit.ts`); the service logs both as ids.

**Figures and pictures:** the three cards above the list and the detail (`components/warehouses/WarehouseMetrics.tsx`) use the card and picture set in `components/metrics/` (icon, number, hint, and a ring or a stacked bar with a legend). Every picture draws real data: the active share, how items and value spread over the active warehouses, how the value spreads over the products, and the stock status split. Slices are ranked in brand blues, with orange and red only for a real shortage (`domain/metricShares.ts`). The same card exists in Purchasing and Sales; promoting it to `src/components` is a separate refactor.

**Tables:** every table sits in `DataTableFrame` (a plain scroller, no gutter under the rows, no line after the last row). The scroll-area table container leaves a 12px gutter under the table, so it is not used here.

**State:** server data in TanStack Query (keys start with the signed-in user, `presentation/hooks/inventoryKeys.ts`); every write invalidates the warehouse queries. Switching off shows a toast with "Batalkan" that switches the warehouse back on.

## Known gaps

- Stock movements and stock count are placeholders until PRO-105 and PRO-107. Until then the warehouse detail has no "Pindah barang" or "Buat opname" button, the product in the stock tab does not open a stock card, the movements tab has no journal column, and the document number is plain text.
- Product detail ("Stok per gudang") is not built here: no API gives the stock of one product per warehouse without a new contract.
- The service logs the person in charge as an id and a minimum as `minQty:<productId>`; the screen resolves both. A name in the log would remove that step (backend wish, not a blocker).
- No endpoint for the open purchase orders of a warehouse, so that blocking reason cannot be told in advance; it shows only when the service refuses.
