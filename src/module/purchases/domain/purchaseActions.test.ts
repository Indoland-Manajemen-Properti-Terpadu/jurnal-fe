import type { PaymentVoucher } from './purchaseDocuments';
import { voucherActions } from './purchaseActions';

const voucher = (status: PaymentVoucher['status'], kind: 'DP' | 'SETTLEMENT') =>
  ({ status, items: [{ kind }] }) as unknown as PaymentVoucher;

describe('voucherActions', () => {
  it('does not offer to void a paid voucher that contains a DP', () => {
    expect(voucherActions(voucher('PAID', 'DP')).void).toBe(false);
  });

  it('keeps the current void options for unpaid DP and paid settlement vouchers', () => {
    expect(voucherActions(voucher('DRAFT', 'DP')).void).toBe(true);
    expect(voucherActions(voucher('PAID', 'SETTLEMENT')).void).toBe(true);
  });
});
