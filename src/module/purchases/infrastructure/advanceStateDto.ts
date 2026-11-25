export interface AdvanceDocDto {
  id: string;
  transactionNumber?: string | null;
  status?: string | null;
}

export interface AdvanceStateDto {
  mode?: 'BILL' | 'REQUEST' | null;
  amount?: number | null;
  paidAmount?: number | null;
  billed?: boolean | null;
  paid?: boolean | null;
  postedAmount?: number | null;
  recognizedAmount?: number | null;
  heldAmount?: number | null;
  step?: string | null;
  stepLabel?: string | null;
  canCreateBill?: boolean | null;
  receiptAllowed?: boolean | null;
  receiptBlockReason?: string | null;
  bills?: AdvanceDocDto[] | null;
  paymentRequests?: AdvanceDocDto[] | null;
  paymentVouchers?: AdvanceDocDto[] | null;
}
