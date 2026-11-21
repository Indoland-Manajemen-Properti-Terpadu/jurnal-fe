import { routes } from '@/router/routes';

/** One bar of the payables aging, in the order the server sends them. */
export interface AgingBucket {
  key: 'current' | 'days1to30' | 'days31to60' | 'days61to90' | 'over90';
  label: string;
  amount: number;
}

export interface FlowStage {
  key: 'request' | 'order' | 'receipt' | 'bill' | 'payment';
  label: string;
  count: number;
}

export interface DashboardSummary {
  /** Decimal digits of money, from the general settings. */
  precision: number;
  flow: FlowStage[];
  procurement: { bidding: number; single: number; pastRequiredDate: number };
  readyToPay: { count: number; amount: number };
  /** Only for people who may read the purchasing report. */
  payables: {
    total: number;
    overdue: number;
    overduePercent: number;
    billCount: number;
    aging: AgingBucket[];
  } | null;
}

export type ActionTargetType =
  | 'purchaseRequest'
  | 'purchaseOrder'
  | 'goodsReceipt'
  | 'purchaseBill'
  | 'paymentRequest'
  | 'purchasePayment'
  | 'purchaseReturn';

export interface DashboardAction {
  key: string;
  /** The server's Indonesian wording; English readers get a generic line from the key. */
  title: string;
  subtitle: string;
  cta: string;
  target: { type: ActionTargetType; id: string };
  /** Days waited and days past the step's usual limit (negative while within it). */
  waiting: number | null;
  late: number | null;
  due: string | null;
}

export interface DashboardActions {
  total: number;
  late: number;
  items: DashboardAction[];
}

export interface DashboardConfig {
  precision: number;
  segregationOfDuties: boolean;
}

const DETAIL: Record<ActionTargetType, string> = {
  purchaseRequest: routes.purchases.requestDetail,
  purchaseOrder: routes.purchases.orderDetail,
  goodsReceipt: routes.purchases.receiptDetail,
  purchaseBill: routes.purchases.billDetail,
  paymentRequest: routes.purchases.paymentRequestDetail,
  purchasePayment: routes.purchases.paymentDetail,
  purchaseReturn: routes.purchases.returnDetail,
};

/** Where an action leads: the document it is about. */
export const actionPath = (target: DashboardAction['target']): string =>
  DETAIL[target.type].replace(':id', target.id);

/** Prefixes of the action keys the service sends today, each with an English wording of its own. */
const KNOWN_PREFIXES = ['p', 'r', 'd', 'fo', 'f', 'fp', 'vb', 'b'] as const;
export type ActionPrefix = (typeof KNOWN_PREFIXES)[number];

/** `p-6b01…` is the prefix `p`; null for a kind this version does not know yet. */
export const actionPrefix = (key: string): ActionPrefix | null => {
  const prefix = key.split('-')[0];
  return (KNOWN_PREFIXES as readonly string[]).includes(prefix) ? (prefix as ActionPrefix) : null;
};

/** Late by N days, or null while the step is still within its limit. */
export const lateDays = (action: DashboardAction): number | null =>
  action.late !== null && action.late > 0 ? action.late : null;
