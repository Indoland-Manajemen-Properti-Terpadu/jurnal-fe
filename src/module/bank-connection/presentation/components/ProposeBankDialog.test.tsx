import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProposeBankDialog } from '@/module/bank-connection/presentation/components/ProposeBankDialog';

const m = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/module/bank-connection/presentation/hooks/useBankConnectionMutations', () => ({
  useProposeBank: () => ({ mutate: m.mutate, isPending: false }),
}));

const renderDialog = (shownCodes: string[] = ['014', '008']) =>
  render(<ProposeBankDialog opened onClose={vi.fn()} shownCodes={shownCodes} />);

describe('ProposeBankDialog', () => {
  beforeEach(() => {
    m.mutate.mockReset();
  });

  it('asks which bank is needed, from the bank master, leaving out the banks already offered', async () => {
    renderDialog(['014']);
    await userEvent.click(screen.getByRole('textbox', { name: /Bank/ }));
    expect(await screen.findByRole('option', { name: /BRI/, hidden: true })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Bank Central Asia/, hidden: true })).toBeNull();
  });

  it('does not send without a bank', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Kirim usulan' }));
    expect(m.mutate).not.toHaveBeenCalled();
    expect(await screen.findByText('Pilih bank yang Anda butuhkan.')).toBeTruthy();
  });

  it('sends the bank code with the note', async () => {
    renderDialog();
    await userEvent.click(screen.getByRole('textbox', { name: /Bank/ }));
    await userEvent.click(await screen.findByRole('option', { name: /BRI/, hidden: true }));
    await userEvent.type(screen.getByRole('textbox', { name: /Catatan/ }), 'Rekening utama kami');
    await userEvent.click(screen.getByRole('button', { name: 'Kirim usulan' }));
    expect(m.mutate.mock.calls[0][0]).toEqual({ bankCode: '002', note: 'Rekening utama kami' });
  });

  it('says in plain words when the proposal cannot be sent now', async () => {
    m.mutate.mockImplementation((_input, options) => options.onError({ kind: 'unavailable' }));
    renderDialog();
    await userEvent.click(screen.getByRole('textbox', { name: /Bank/ }));
    await userEvent.click(await screen.findByRole('option', { name: /BRI/, hidden: true }));
    await userEvent.click(screen.getByRole('button', { name: 'Kirim usulan' }));
    expect(await screen.findByText(/belum bisa dikirim/)).toBeTruthy();
  });
});
