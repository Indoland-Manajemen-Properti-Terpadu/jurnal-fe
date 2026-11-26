export interface RequestListSummary {
  total: number;
  waitingVerification: number;
  waitingProcurement: number;
  inProcurement: number;
}

export interface OrderListSummary {
  total: number;
  waitingReceipt: number;
  partiallyReceived: number;
  completed: number;
}

export interface ReceiptListSummary {
  total: number;
  pendingApproval: number;
  unbilled: number;
  billed: number;
}

export interface BillListSummary {
  total: number;
  unpaid: number;
  overdue: number;
  remainingPayable: number;
}

export interface PaymentRequestListSummary {
  total: number;
  pendingApproval: number;
  waitingVoucher: number;
  waitingPayment: number;
}
