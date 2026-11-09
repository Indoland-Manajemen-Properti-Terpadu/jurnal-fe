import type { RouteObject } from 'react-router-dom';
import { StockMovementsPage, StockTakePage, WarehousesPage } from '@/module/inventory';
import { routes } from '../routes';

const { inventory } = routes;

export const inventoryRoutes: RouteObject[] = [
  { path: inventory.warehouses, element: <WarehousesPage /> },
  { path: inventory.stockMovements, element: <StockMovementsPage /> },
  { path: inventory.stockTake, element: <StockTakePage /> },
];
