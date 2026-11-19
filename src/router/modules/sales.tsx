import type { RouteObject } from 'react-router-dom';
import {
  PublicInvoicePage,
  QuoteDetailPage,
  QuoteFormPage,
  QuoteListPage,
  ReceivablesPage,
  SaleDetailPage,
  SaleFormPage,
  SaleMainPage,
  SalePaymentsPage,
  SalesOrdersPage,
  SalesReturnsPage,
} from '@/module/sales';
import { routes } from '../routes';

export const salesRoutes: RouteObject[] = [
  { path: routes.sales.main, element: <SaleMainPage /> },
  { path: routes.sales.add, element: <SaleFormPage /> },
  { path: routes.sales.quotations, element: <QuoteListPage /> },
  { path: routes.sales.quotationAdd, element: <QuoteFormPage /> },
  { path: routes.sales.quotationEdit, element: <QuoteFormPage /> },
  { path: routes.sales.quotationDetail, element: <QuoteDetailPage /> },
  { path: routes.sales.orders, element: <SalesOrdersPage /> },
  { path: routes.sales.payments, element: <SalePaymentsPage /> },
  { path: routes.sales.returns, element: <SalesReturnsPage /> },
  { path: routes.sales.receivables, element: <ReceivablesPage /> },
  { path: routes.sales.edit, element: <SaleFormPage /> },
  { path: routes.sales.detail, element: <SaleDetailPage /> },
  { path: routes.sales.publicInvoice, element: <PublicInvoicePage /> },
];
