import type { RouteObject } from 'react-router-dom';
import {
  OpnameAccountsPage,
  StockCardPage,
  StockMovementsPage,
  StockTakeDetailPage,
  StockTakeFormPage,
  StockTakePage,
  TransferDetailPage,
  TransferFormPage,
  WarehouseDetailPage,
  WarehousesPage,
} from '@/module/inventory';
import { routes } from '../routes';

const { inventory } = routes;

export const inventoryRoutes: RouteObject[] = [
  { path: inventory.warehouses, element: <WarehousesPage /> },
  { path: inventory.warehouseDetail, element: <WarehouseDetailPage /> },
  { path: inventory.stockMovements, element: <StockMovementsPage /> },
  { path: inventory.stockCard, element: <StockCardPage /> },
  { path: inventory.transferNew, element: <TransferFormPage /> },
  { path: inventory.transferDetail, element: <TransferDetailPage /> },
  { path: inventory.stockTake, element: <StockTakePage /> },
  { path: inventory.stockTakeNew, element: <StockTakeFormPage /> },
  { path: inventory.stockTakeDetail, element: <StockTakeDetailPage /> },
  { path: routes.settings.opnameAccounts, element: <OpnameAccountsPage /> },
];
