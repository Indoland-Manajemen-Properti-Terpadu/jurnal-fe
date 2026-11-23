import { render, screen, userEvent } from '@test-utils';
import { VerifyRequestDialog } from './VerifyRequestDialog';

const setup = (loading = false) => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(<VerifyRequestDialog opened loading={loading} onConfirm={onConfirm} onClose={onClose} />);
  return { onConfirm, onClose };
};

describe('VerifyRequestDialog', () => {
  it('asks to verify without a note field', () => {
    setup();
    expect(screen.getByText('Verifikasi permintaan')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/Catatan verifikasi/)).not.toBeInTheDocument();
  });

  it('verifies when confirmed', async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Verifikasi' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes without verifying', async () => {
    const { onConfirm, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
