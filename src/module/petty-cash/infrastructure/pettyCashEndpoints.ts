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
  myPermissions: '/v1/users/me/permissions',
};
