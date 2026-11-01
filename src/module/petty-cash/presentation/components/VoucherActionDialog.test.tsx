import { render, screen, userEvent } from '@test-utils';
import { VoucherActionDialog } from '@/module/petty-cash/presentation/components/VoucherActionDialog';

const setup = (kind: 'approve' | 'reject' | 'void') => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <VoucherActionDialog
      kind={kind}
      voucherNumber="PCV/202610/0019"
      loading={false}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
  return { onConfirm, onClose };
};

describe('VoucherActionDialog', () => {
  it('confirms an approval without asking for a reason', async () => {
    const { onConfirm } = setup('approve');
    await userEvent.click(screen.getByRole('button', { name: 'Setujui' }));
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('does not reject or void without a reason, and says why', async () => {
    const { onConfirm } = setup('reject');
    await userEvent.click(screen.getByRole('button', { name: 'Tolak' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(await screen.findByText('Alasan wajib diisi')).toBeInTheDocument();
  });

  it('sends the trimmed reason once it is filled in', async () => {
    const { onConfirm } = setup('void');
    await userEvent.type(
      screen.getByRole('textbox', { name: /Alasan pembatalan/ }),
      '  salah input  '
    );
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan voucher' }));
    expect(onConfirm).toHaveBeenCalledWith('salah input');
  });

  it('closes through the go-back button without confirming', async () => {
    const { onConfirm, onClose } = setup('void');
    await userEvent.click(screen.getByRole('button', { name: 'Kembali' }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
