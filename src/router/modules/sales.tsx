import type { RouteObject } from 'react-router-dom';
import { SaleDetailPage, SaleMainPage } from '@/module/sales';
import { routes } from '../routes';

export const salesRoutes: RouteObject[] = [
  { path: routes.sales.main, element: <SaleMainPage /> },
  { path: routes.sales.detail, element: <SaleDetailPage /> },
];
