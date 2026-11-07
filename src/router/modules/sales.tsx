import type { RouteObject } from 'react-router-dom';
import {
  PublicInvoicePage,
  ReceivablesPage,
  SaleDetailPage,
  SaleFormPage,
  SaleMainPage,
  SalesOrdersPage,
  SalesPaymentsPage,
  SalesQuotationsPage,
  SalesReturnsPage,
} from '@/module/sales';
import { routes } from '../routes';

export const salesRoutes: RouteObject[] = [
  { path: routes.sales.main, element: <SaleMainPage /> },
  { path: routes.sales.add, element: <SaleFormPage /> },
  { path: routes.sales.quotations, element: <SalesQuotationsPage /> },
  { path: routes.sales.orders, element: <SalesOrdersPage /> },
  { path: routes.sales.payments, element: <SalesPaymentsPage /> },
  { path: routes.sales.returns, element: <SalesReturnsPage /> },
  { path: routes.sales.receivables, element: <ReceivablesPage /> },
  { path: routes.sales.edit, element: <SaleFormPage /> },
  { path: routes.sales.detail, element: <SaleDetailPage /> },
  { path: routes.sales.publicInvoice, element: <PublicInvoicePage /> },
];
