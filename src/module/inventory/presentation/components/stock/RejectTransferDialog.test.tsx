import { render, screen, userEvent } from '@test-utils';
import { RejectTransferDialog } from './RejectTransferDialog';

const setup = () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <RejectTransferDialog
      opened
      number="PDH/2026/11/0006"
      saving={false}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
  return { onConfirm, onClose };
};

describe('RejectTransferDialog', () => {
  it('asks for a reason and sends nothing without one', async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Tolak pindah barang' }));
    expect(screen.getByText('Alasan penolakan wajib diisi')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('sends the reason without the spaces around it', async () => {
    const { onConfirm } = setup();
    await userEvent.type(screen.getByLabelText(/Alasan penolakan/), '  Stok dipakai  ');
    await userEvent.click(screen.getByRole('button', { name: 'Tolak pindah barang' }));
    expect(onConfirm).toHaveBeenCalledWith('Stok dipakai');
  });
});
