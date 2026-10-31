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
  myPermissions: '/v1/users/me/permissions',
};
