import { render, screen, userEvent } from '@test-utils';
import { VoidTransferDialog } from './VoidTransferDialog';

const setup = () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <VoidTransferDialog
      opened
      number="PDH/2026/11/0003"
      fromName="Gudang Utama"
      saving={false}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
  return { onConfirm, onClose };
};

describe('VoidTransferDialog', () => {
  it('names the document and where the stock goes back to', () => {
    setup();

    expect(screen.getByText('Batalkan PDH/2026/11/0003?')).toBeInTheDocument();
    expect(screen.getByText(/Stok kembali ke Gudang Utama/)).toBeInTheDocument();
  });

  it('refuses to cancel without a reason', async () => {
    const { onConfirm } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Batalkan pindah barang' }));

    expect(await screen.findByText('Alasan pembatalan wajib diisi')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not accept a reason of only spaces', async () => {
    const { onConfirm } = setup();

    await userEvent.type(screen.getByRole('textbox', { name: /Alasan pembatalan/ }), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan pindah barang' }));

    expect(await screen.findByText('Alasan pembatalan wajib diisi')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('sends the trimmed reason', async () => {
    const { onConfirm } = setup();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Alasan pembatalan/ }),
      '  Salah memilih gudang  '
    );
    await userEvent.click(screen.getByRole('button', { name: 'Batalkan pindah barang' }));

    expect(onConfirm).toHaveBeenCalledWith('Salah memilih gudang');
  });

  it('goes back without cancelling', async () => {
    const { onConfirm, onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Kembali' }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
