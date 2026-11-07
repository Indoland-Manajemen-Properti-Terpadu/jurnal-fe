# inventory

Placeholder module for stock keeping: warehouses, stock movements and stock counts. Each page renders the shared `PlannedModulePage` (header and planned scope, copy in the `plannedModules` namespace); there is no domain logic, endpoint or state yet. The product catalog that feeds it lives in the `products` module and is shown under the same sidebar group.

- **Routes:** `routes.inventory.warehouses` (`/inventory/warehouses`), `routes.inventory.stockMovements` (`/inventory/stock-movements`), `routes.inventory.stockTake` (`/inventory/stock-take`).
- **Public API (`index.ts`):** `WarehousesPage`, `StockMovementsPage`, `StockTakePage`.
- **Known gaps:** the service has no warehouse, stock movement or stock count resource yet (`GET /v1/warehouses`, `/v1/stock-movements` and `/v1/inventory` answer 404); replace a placeholder page when its contract exists.
