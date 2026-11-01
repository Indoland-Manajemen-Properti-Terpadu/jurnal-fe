import { render, screen, userEvent } from '@test-utils';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { VoucherFormSummary } from '@/module/petty-cash/presentation/components/VoucherFormSummary';

const fund = {
  id: 'f1',
  code: 'PC-HQ',
  name: 'Kas Kecil HQ',
  settings: { attachmentRequiredThreshold: 100000, voucherApprovalThreshold: 1000000 },
  balance: { availableCash: 500000 },
} as unknown as PettyCashFund;

const setup = (net: number, hasAttachment = false, hasTax = false) => {
  const handlers = { onCancel: vi.fn(), onSaveDraft: vi.fn(), onSubmit: vi.fn() };
  render(
    <VoucherFormSummary
      fund={fund}
      net={net}
      hasTax={hasTax}
      hasAttachment={hasAttachment}
      pending={false}
      showIssues={false}
      {...handlers}
    />
  );
  return handlers;
};

describe('VoucherFormSummary', () => {
  it('shows the cash left and lets the voucher be submitted', async () => {
    const { onSubmit } = setup(50000);
    expect(screen.getByText('Rp 450.000')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ajukan' }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('blocks submitting an amount above the available cash but still allows a draft', async () => {
    const { onSaveDraft } = setup(600000, true);
    expect(screen.getByText('Nominal melebihi kas tersedia')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajukan' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Simpan draf' }));
    expect(onSaveDraft).toHaveBeenCalled();
  });

  it('asks for a receipt from the threshold upward and unblocks once one is attached', () => {
    setup(100000, false);
    expect(screen.getByText(/Bukti wajib dilampirkan untuk nominal/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajukan' })).toBeDisabled();
  });

  it('does not ask for a receipt below the threshold', () => {
    setup(99999, false);
    expect(screen.queryByText(/Bukti wajib dilampirkan/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajukan' })).toBeEnabled();
  });

  it('notes that a large amount needs approval', () => {
    setup(1000000, true);
    expect(screen.getByText(/perlu disetujui sebelum bisa diganti/)).toBeInTheDocument();
  });

  it('labels the cash left as before tax when a tax code is used', () => {
    setup(100000, true, true);
    expect(screen.getByText('Sisa kas sebelum pajak')).toBeInTheDocument();
    expect(screen.queryByText('Sisa kas setelah ini')).not.toBeInTheDocument();
  });

  it('says approval is possible when a tax code could lift a net below the threshold over it', () => {
    setup(950000, true, true);
    expect(screen.getByText(/bisa melewati batas/)).toBeInTheDocument();
    expect(screen.queryByText(/atau lebih perlu disetujui/)).not.toBeInTheDocument();
  });
});
