const BASE = '/v1/petty-cash';

export const PETTY_CASH_API = {
  funds: `${BASE}/funds`,
  fund: (fundId: string) => `${BASE}/funds/${fundId}`,
  cashBook: (fundId: string) => `${BASE}/funds/${fundId}/cash-book`,
  lookups: `${BASE}/lookups`,
  attachmentUrl: (attachmentId: string) => `${BASE}/attachments/${attachmentId}/url`,
  vouchers: `${BASE}/vouchers`,
  voucher: (voucherId: string) => `${BASE}/vouchers/${voucherId}`,
  myPermissions: '/v1/users/me/permissions',
};
