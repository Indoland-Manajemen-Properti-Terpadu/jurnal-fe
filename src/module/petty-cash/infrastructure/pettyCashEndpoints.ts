const BASE = '/v1/petty-cash';

export const PETTY_CASH_API = {
  funds: `${BASE}/funds`,
  fund: (fundId: string) => `${BASE}/funds/${fundId}`,
  cashBook: (fundId: string) => `${BASE}/funds/${fundId}/cash-book`,
  lookups: `${BASE}/lookups`,
  attachmentUrl: (attachmentId: string) => `${BASE}/attachments/${attachmentId}/url`,
  vouchers: `${BASE}/vouchers`,
  voucher: (voucherId: string) => `${BASE}/vouchers/${voucherId}`,
  voucherAction: (voucherId: string, action: 'submit' | 'approve' | 'reject' | 'void') =>
    `${BASE}/vouchers/${voucherId}/${action}`,
  voucherAttachments: (voucherId: string) => `${BASE}/vouchers/${voucherId}/attachments`,
  voucherAttachment: (voucherId: string, attachmentId: string) =>
    `${BASE}/vouchers/${voucherId}/attachments/${attachmentId}`,
  counts: `${BASE}/counts`,
  count: (countId: string) => `${BASE}/counts/${countId}`,
  countAction: (countId: string, action: 'submit' | 'approve' | 'reject') =>
    `${BASE}/counts/${countId}/${action}`,
  reimbursements: `${BASE}/reimbursements`,
  reimbursementPreview: `${BASE}/reimbursements/preview`,
  reimbursement: (reimbursementId: string) => `${BASE}/reimbursements/${reimbursementId}`,
  reimbursementAction: (
    reimbursementId: string,
    action: 'approve' | 'reject' | 'cancel' | 'disburse'
  ) => `${BASE}/reimbursements/${reimbursementId}/${action}`,
  fundPaguAdjustments: (fundId: string) => `${BASE}/funds/${fundId}/pagu-adjustments`,
  fundPockets: (fundId: string) => `${BASE}/funds/${fundId}/pockets`,
  fundPocket: (fundId: string, code: string) =>
    `${BASE}/funds/${fundId}/pockets/${encodeURIComponent(code)}`,
  fundPocketTransfers: (fundId: string) => `${BASE}/funds/${fundId}/pocket-transfers`,
  fundClose: (fundId: string) => `${BASE}/funds/${fundId}/close`,
  reportPendingVouchers: `${BASE}/reports/pending-vouchers`,
  reportExpenseSummary: `${BASE}/reports/expense-summary`,
  reportAdvancesByUser: `${BASE}/reports/advances-by-user`,
  reportReconciliation: `${BASE}/reports/reconciliation`,
  periodEndCheck: `${BASE}/period-end-check`,
  auditLogs: `${BASE}/audit-logs`,
  advances: `${BASE}/advances`,
  advance: (advanceId: string) => `${BASE}/advances/${advanceId}`,
  advanceAction: (
    advanceId: string,
    action:
      | 'approve'
      | 'reject'
      | 'cancel'
      | 'disburse'
      | 'settlement'
      | 'custodian-verify'
      | 'custodian-reject'
      | 'finance-verify'
      | 'finance-reject'
      | 'convert-to-receivable'
  ) => `${BASE}/advances/${advanceId}/${action}`,
  advanceAttachments: (advanceId: string) => `${BASE}/advances/${advanceId}/attachments`,
  advanceSettlementAccounts: (advanceId: string) =>
    `${BASE}/advances/${advanceId}/settlement-accounts`,
  myAdvanceStatus: `${BASE}/advance-status/me`,
  advanceStatus: (userId: string) => `${BASE}/advance-status/${userId}`,
  restrictionAction: (userId: string, action: 'block' | 'unblock' | 'override') =>
    `${BASE}/advance-status/${userId}/${action}`,
  myPermissions: '/v1/users/me/permissions',
};
