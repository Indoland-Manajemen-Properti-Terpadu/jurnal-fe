import type { RouteObject } from 'react-router-dom';
import { PublicInvoicePage, SaleDetailPage, SaleFormPage, SaleMainPage } from '@/module/sales';
import { routes } from '../routes';

export const salesRoutes: RouteObject[] = [
  { path: routes.sales.main, element: <SaleMainPage /> },
  { path: routes.sales.add, element: <SaleFormPage /> },
  { path: routes.sales.edit, element: <SaleFormPage /> },
  { path: routes.sales.detail, element: <SaleDetailPage /> },
  { path: routes.sales.publicInvoice, element: <PublicInvoicePage /> },
];
