import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent, within } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashLinesForm } from '@/module/bank-cash/presentation/components/transaction-form/CashLinesForm';

const mocks = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/bank-cash/presentation/hooks/useBankCashTransactionMutation', () => ({
  useBankCashTransactionMutation: () => ({ mutate: mocks.mutate, isPending: false }),
}));
vi.mock('@/module/bank-cash/presentation/hooks/useCashBankChoices', () => ({
  useCashBankChoices: () => ({
    ready: true,
    isError: false,
    cashAccounts: [
      { id: 'cash', name: 'Kas Besar', accountNumber: '1-10001', amount: 100_000 },
      { id: 'bank', name: 'Bank BCA', accountNumber: '1-10004', amount: 5_000 },
    ],
    sourceOptions: [
      { value: 'rev', label: '4-10001 - Pendapatan Bunga' },
      { value: 'exp', label: '6-10001 - Beban Listrik' },
    ],
  }),
}));

const renderForm = (kind: 'receive' | 'sent', url = '/x') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <CashLinesForm kind={kind} />
    </MemoryRouter>
  );

const choose = async (label: RegExp, option: RegExp) => {
  await userEvent.click(screen.getByRole('textbox', { name: label }));
  await userEvent.click(await screen.findByRole('option', { name: option, hidden: true }));
};

describe('CashLinesForm', () => {
  beforeEach(() => mocks.mutate.mockReset());

  it('cannot be saved while empty and says what to do first', () => {
    renderForm('receive');
    expect(screen.getByText('Pilih akun kas atau bank')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Simpan penerimaan' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('posts a receipt: cash debited, source credited, once everything is filled', async () => {
    renderForm('receive');
    await choose(/Masuk ke akun/, /Kas Besar/);
    await choose(/Akun sumber/, /Pendapatan Bunga/);
    await userEvent.type(screen.getAllByRole('textbox', { name: 'Nominal' })[0], '25000');

    expect(await screen.findByText('Siap dibukukan')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan penerimaan' }));

    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    const payload = mocks.mutate.mock.calls[0][0];
    expect(payload.transactionDetail[0]).toMatchObject({ account: 'cash', debit: 25_000 });
    expect(payload.transactionDetail[1]).toMatchObject({ account: 'rev', credit: 25_000 });
  });

  it('posts a payment: expense debited, cash credited last, and warns about a negative balance', async () => {
    renderForm('sent');
    await choose(/Dibayar dari akun/, /Bank BCA/);
    await choose(/Akun biaya/, /Beban Listrik/);
    await userEvent.type(screen.getAllByRole('textbox', { name: 'Nominal' })[0], '8000');

    expect(await screen.findByText(/menjadi minus/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan pengeluaran' }));

    const detail = mocks.mutate.mock.calls[0][0].transactionDetail;
    expect(detail[0]).toMatchObject({ account: 'exp', debit: 8_000 });
    expect(detail[detail.length - 1]).toMatchObject({ account: 'bank', credit: 8_000 });
  });

  it('starts with the account named in the link', () => {
    renderForm('sent', '/x?fromAccountId=bank');
    const summary = screen.getByText('Total dibayar').closest('div')?.parentElement as HTMLElement;
    expect(within(summary).getAllByText('Bank BCA').length).toBeGreaterThan(0);
  });

  it('sends the attached files with the receipt, and none when nothing is attached', async () => {
    const { container } = renderForm('receive');
    await choose(/Masuk ke akun/, /Kas Besar/);
    await choose(/Akun sumber/, /Pendapatan Bunga/);
    await userEvent.type(screen.getAllByRole('textbox', { name: 'Nominal' })[0], '25000');

    const nota = new File(['x'], 'nota.pdf', { type: 'application/pdf' });
    await userEvent.upload(container.querySelector('input[type="file"]') as HTMLInputElement, nota);
    expect(await screen.findByText('nota.pdf')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Simpan penerimaan' }));
    expect(mocks.mutate.mock.calls[0][0].attachments).toEqual([nota]);
  });
});
