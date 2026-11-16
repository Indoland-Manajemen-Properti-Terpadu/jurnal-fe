import { render, screen, userEvent } from '@test-utils';
import { describe, expect, it, vi } from 'vitest';
import { TransactionSummaryCard } from '@/module/bank-cash/presentation/components/transaction-form/TransactionSummaryCard';

const base = {
  accounts: [{ role: 'Akun penerima', name: 'Kas Besar', balance: 1_000_000, after: 1_500_000 }],
  total: { label: 'Total diterima', amount: 500_000 },
  missing: [] as string[],
  journal: {
    lines: [
      { account: 'Kas Besar', debit: 500_000 },
      { account: 'Pendapatan Bunga', credit: 500_000 },
    ],
    balanced: true,
  },
  submitLabel: 'Simpan penerimaan',
  isPending: false,
  onCancel: () => undefined,
};

describe('TransactionSummaryCard', () => {
  it('says the transaction is ready and enables saving when nothing is missing', () => {
    render(<TransactionSummaryCard {...base} />);
    expect(screen.getByText('Siap dibukukan')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Simpan penerimaan' }).hasAttribute('disabled')).toBe(
      false
    );
  });

  it('shows the first thing that is missing and disables saving', () => {
    render(
      <TransactionSummaryCard {...base} missing={['Pilih akun kas atau bank', 'Isi tanggal']} />
    );
    expect(screen.getByText('Pilih akun kas atau bank')).toBeTruthy();
    expect(screen.queryByText('Siap dibukukan')).toBeNull();
    expect(screen.getByRole('button', { name: 'Simpan penerimaan' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('shows the balance now and after, and "not selected" before an account is chosen', () => {
    const { unmount } = render(<TransactionSummaryCard {...base} />);
    expect(screen.getByText('Kas Besar')).toBeTruthy();
    expect(screen.getByText(/1\.000\.000/)).toBeTruthy();
    expect(screen.getByText(/1\.500\.000/)).toBeTruthy();
    unmount();
    render(
      <TransactionSummaryCard
        {...base}
        accounts={[{ role: 'Akun penerima', name: null, balance: 0, after: null }]}
      />
    );
    expect(screen.getByText('Belum dipilih')).toBeTruthy();
  });

  it('warns when the balance would go negative', () => {
    render(<TransactionSummaryCard {...base} warning="Saldo akun ini akan menjadi minus." />);
    expect(screen.getByText('Saldo akun ini akan menjadi minus.')).toBeTruthy();
  });

  it('keeps the journal closed until asked, then shows debit, credit and the balance check', async () => {
    render(<TransactionSummaryCard {...base} />);
    expect(screen.queryByText('Pendapatan Bunga')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /jurnal yang akan dibukukan/i }));
    expect(await screen.findByText('Pendapatan Bunga')).toBeTruthy();
    expect(screen.getByText('Debit dan kredit seimbang')).toBeTruthy();
  });

  it('cancels without saving', async () => {
    const onCancel = vi.fn();
    render(<TransactionSummaryCard {...base} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
