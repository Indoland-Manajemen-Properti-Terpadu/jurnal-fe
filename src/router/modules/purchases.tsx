import type { RouteObject } from 'react-router-dom';
import {
  BillDetailPage,
  BillFormPage,
  OrderDetailPage,
  OrderFormPage,
  PayablesReportPage,
  PaymentDetailPage,
  PaymentFormPage,
  PurchasesPage,
  ReceiptDetailPage,
  ReceiptFormPage,
  RequestDetailPage,
  RequestFormPage,
  ReturnDetailPage,
  ReturnFormPage,
} from '@/module/purchases';
import { routes } from '../routes';

const { purchases } = routes;

export const purchasesRoutes: RouteObject[] = [
  { path: purchases.main, element: <PurchasesPage /> },
  { path: purchases.payables, element: <PayablesReportPage /> },
  { path: purchases.requestAdd, element: <RequestFormPage /> },
  { path: purchases.requestDetail, element: <RequestDetailPage /> },
  { path: purchases.requestEdit, element: <RequestFormPage /> },
  { path: purchases.orderAdd, element: <OrderFormPage /> },
  { path: purchases.orderDetail, element: <OrderDetailPage /> },
  { path: purchases.orderEdit, element: <OrderFormPage /> },
  { path: purchases.receiptAdd, element: <ReceiptFormPage /> },
  { path: purchases.receiptDetail, element: <ReceiptDetailPage /> },
  { path: purchases.billAdd, element: <BillFormPage /> },
  { path: purchases.billDetail, element: <BillDetailPage /> },
  { path: purchases.billEdit, element: <BillFormPage /> },
  { path: purchases.paymentAdd, element: <PaymentFormPage /> },
  { path: purchases.paymentDetail, element: <PaymentDetailPage /> },
  { path: purchases.paymentEdit, element: <PaymentFormPage /> },
  { path: purchases.returnAdd, element: <ReturnFormPage /> },
  { path: purchases.returnDetail, element: <ReturnDetailPage /> },
  { path: purchases.returnEdit, element: <ReturnFormPage /> },
];
