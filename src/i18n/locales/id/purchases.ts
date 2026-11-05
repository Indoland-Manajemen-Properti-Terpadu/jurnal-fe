import { purchasesBills } from './purchasesBills';
import { purchasesCommon } from './purchasesCommon';
import { purchasesHub } from './purchasesHub';
import { purchasesOrders } from './purchasesOrders';
import { purchasesPayments } from './purchasesPayments';
import { purchasesReceipts } from './purchasesReceipts';
import { purchasesReports } from './purchasesReports';
import { purchasesRequests } from './purchasesRequests';
import { purchasesReturns } from './purchasesReturns';

export const purchases = {
  ...purchasesCommon,
  hub: purchasesHub,
  requests: purchasesRequests,
  orders: purchasesOrders,
  receipts: purchasesReceipts,
  bills: purchasesBills,
  payments: purchasesPayments,
  returns: purchasesReturns,
  reports: purchasesReports,
};
