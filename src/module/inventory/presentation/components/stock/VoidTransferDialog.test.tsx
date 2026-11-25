import { render, screen, userEvent } from '@test-utils';
import { VoidTransferDialog } from './VoidTransferDialog';

const renderDialog = (mode?: 'cancel' | 'withdraw') => {
  const onConfirm = vi.fn();
  render(
    <VoidTransferDialog
      opened
      mode={mode}
      number="PDH/2026/11/0016"
      fromName="Utama"
      saving={false}
      onConfirm={onConfirm}
      onClose={vi.fn()}
    />
  );
  return { onConfirm };
};

describe('VoidTransferDialog', () => {
  it('asks to cancel a posted transfer by default', () => {
    renderDialog();

    expect(screen.getByText('Batalkan PDH/2026/11/0016?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Batalkan pindah barang' })).toBeInTheDocument();
  });

  it('asks to withdraw a request that still waits, in its own words', () => {
    renderDialog('withdraw');

    expect(screen.getByText('Tarik pengajuan PDH/2026/11/0016?')).toBeInTheDocument();
    expect(screen.getByLabelText('Alasan penarikan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tarik pengajuan' })).toBeInTheDocument();
  });

  it('needs a reason before it withdraws', async () => {
    const { onConfirm } = renderDialog('withdraw');

    await userEvent.click(screen.getByRole('button', { name: 'Tarik pengajuan' }));

    expect(screen.getByText('Alasan penarikan wajib diisi')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('sends the trimmed reason', async () => {
    const { onConfirm } = renderDialog('withdraw');

    await userEvent.type(screen.getByLabelText('Alasan penarikan'), '  salah produk ');
    await userEvent.click(screen.getByRole('button', { name: 'Tarik pengajuan' }));

    expect(onConfirm).toHaveBeenCalledWith('salah produk');
  });
});
