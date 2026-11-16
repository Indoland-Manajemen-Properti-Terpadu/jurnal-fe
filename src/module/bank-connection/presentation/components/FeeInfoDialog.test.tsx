import { render, screen } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import { FeeInfoDialog } from '@/module/bank-connection/presentation/components/FeeInfoDialog';

const rule = {
  monthly: 50_000,
  includedRefreshes: 500,
  extraRefreshFee: 100,
  autoRefreshes: 180,
  autoDebit: true,
};

describe('FeeInfoDialog', () => {
  it('explains the charge: paid by automatic debit, the quota, the extra price and the automatic share', () => {
    render(<FeeInfoDialog rule={rule} opened onClose={vi.fn()} />);
    expect(screen.getByText('Biaya layanan koneksi bank')).toBeTruthy();
    expect(screen.getByText(/auto-debit oleh bank/)).toBeTruthy();
    expect(screen.getByText(/50\.000.*500 kali/)).toBeTruthy();
    expect(screen.getByText(/100 untuk setiap penyegaran/)).toBeTruthy();
    expect(screen.getByText(/180 kali/)).toBeTruthy();
  });

  it('leaves out the automatic debit line when the bank does not bill that way', () => {
    render(<FeeInfoDialog rule={{ ...rule, autoDebit: false }} opened onClose={vi.fn()} />);
    expect(screen.queryByText(/auto-debit/)).toBeNull();
  });

  it('shows nothing when closed', () => {
    render(<FeeInfoDialog rule={rule} opened={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Biaya layanan koneksi bank')).toBeNull();
  });
});
