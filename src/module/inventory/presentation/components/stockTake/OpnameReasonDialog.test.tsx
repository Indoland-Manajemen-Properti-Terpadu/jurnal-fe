import { render, screen, userEvent } from '@test-utils';
import { OpnameReasonDialog } from './OpnameReasonDialog';

const setup = () => {
  const onConfirm = vi.fn();
  render(
    <OpnameReasonDialog
      opened
      title="Tolak SO/2026/11/0009?"
      body="Hitungan dikembalikan."
      label="Alasan penolakan"
      required="Alasan penolakan wajib diisi."
      confirmLabel="Tolak"
      keepLabel="Kembali"
      saving={false}
      onConfirm={onConfirm}
      onClose={vi.fn()}
    />
  );
  return { onConfirm };
};

describe('OpnameReasonDialog', () => {
  it('refuses to go on without a reason, also one of only spaces', async () => {
    const { onConfirm } = setup();

    await userEvent.type(screen.getByRole('textbox', { name: /Alasan penolakan/ }), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Tolak' }));

    expect(await screen.findByText('Alasan penolakan wajib diisi.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('sends the trimmed reason', async () => {
    const { onConfirm } = setup();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Alasan penolakan/ }),
      '  Hitung ulang rak B  '
    );
    await userEvent.click(screen.getByRole('button', { name: 'Tolak' }));

    expect(onConfirm).toHaveBeenCalledWith('Hitung ulang rak B');
  });
});
