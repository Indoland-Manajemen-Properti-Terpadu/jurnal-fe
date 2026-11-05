import { routes } from '@/router/routes';

export type DocumentKind = 'request' | 'order' | 'receipt' | 'bill' | 'payment' | 'return';

const DETAIL = {
  request: routes.purchases.requestDetail,
  order: routes.purchases.orderDetail,
  receipt: routes.purchases.receiptDetail,
  bill: routes.purchases.billDetail,
  payment: routes.purchases.paymentDetail,
  return: routes.purchases.returnDetail,
} as const;

export const detailPath = (kind: DocumentKind, id: string): string =>
  DETAIL[kind].replace(':id', id);
