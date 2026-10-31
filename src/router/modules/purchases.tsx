import type { RouteObject } from 'react-router-dom';
import { PurchasesPage } from '@/module/purchases';
import { routes } from '../routes';

export const purchasesRoutes: RouteObject[] = [
  { path: routes.purchases.main, element: <PurchasesPage /> },
];
