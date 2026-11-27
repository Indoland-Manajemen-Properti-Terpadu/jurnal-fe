import { render, screen, userEvent, waitFor } from '@test-utils';
import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';
import { ApprovalPanel } from './ApprovalPanel';

const role = (name: string, approved = false) => ({ id: name, name, approved });

const twoLevels = (overrides: Partial<ApprovalState> = {}): ApprovalState => ({
  plan: [
    { name: 'Chief Finance', mode: 'ANY', roles: [{ id: 'cf', name: 'Chief Finance' }] },
    { name: 'Building Manager', mode: 'ANY', roles: [{ id: 'bm', name: 'Building Manager' }] },
  ],
  entries: [],
  pending: [{ level: 0, name: 'Chief Finance', mode: 'ANY', roles: [role('Chief Finance')] }],
  canDecide: true,
  rejectionReason: null,
  rejectedAt: null,
  ...overrides,
});

const setup = (approval: ApprovalState, onApprove = vi.fn()) =>
  render(
    <ApprovalPanel
      approval={approval}
      status="SUBMITTED"
      waitingStatus="SUBMITTED"
      canApprove
      onApprove={onApprove}
      onReject={vi.fn()}
    />
  );

describe('ApprovalPanel, levels in order', () => {
  it('shows which level is waiting and numbers the approve button', () => {
    setup(twoLevels());
    expect(screen.getByText('Tingkat 1 dari 2')).toBeInTheDocument();
    expect(screen.getByText('Menunggu persetujuan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Setujui (1/2)' })).toBeInTheDocument();
  });

  it('moves to the second level once the first signed', () => {
    setup(
      twoLevels({
        entries: [{ level: 0, roleId: 'cf', byId: 'u1', at: '2026-11-23T05:00:00.000Z' }],
        pending: [
          { level: 1, name: 'Building Manager', mode: 'ANY', roles: [role('Building Manager')] },
        ],
      })
    );
    expect(screen.getByText('Tingkat 2 dari 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Setujui (2/2)' })).toBeInTheDocument();
  });

  it('never says one role is enough for the whole approval', () => {
    setup(twoLevels());
    expect(screen.queryByText(/Cukup satu role menyetujui/)).not.toBeInTheDocument();
  });

  it('says one of the roles is enough only inside a level that has several roles', () => {
    setup(
      twoLevels({
        pending: [
          {
            level: 0,
            name: 'Keuangan',
            mode: 'ANY',
            roles: [role('Chief Finance'), role('Finance Manager')],
          },
        ],
      })
    );
    expect(screen.getByText('Cukup salah satu role di tingkat ini')).toBeInTheDocument();
  });

  it('keeps a plain "Setujui" when there is only one level', () => {
    setup(
      twoLevels({
        plan: [
          { name: 'Chief Finance', mode: 'ANY', roles: [{ id: 'cf', name: 'Chief Finance' }] },
        ],
      })
    );
    expect(screen.getByRole('button', { name: 'Setujui' })).toBeInTheDocument();
    expect(screen.queryByText(/Tingkat 1 dari 1/)).not.toBeInTheDocument();
  });
});

describe('ApprovalPanel, confirming an approval', () => {
  it('asks first and approves nothing until it is confirmed', async () => {
    const onApprove = vi.fn();
    setup(twoLevels(), onApprove);

    await userEvent.click(screen.getByRole('button', { name: 'Setujui (1/2)' }));

    expect(await screen.findByText('Setujui approval ke 1 dari 2?')).toBeInTheDocument();
    expect(screen.getByText(/menunggu persetujuan Building Manager/)).toBeInTheDocument();
    expect(onApprove).not.toHaveBeenCalled();
  });

  it('approves with the typed note after the question is confirmed', async () => {
    const onApprove = vi.fn();
    setup(twoLevels(), onApprove);

    await userEvent.type(screen.getByLabelText(/Catatan/), 'sesuai anggaran');
    await userEvent.click(screen.getByRole('button', { name: 'Setujui (1/2)' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Ya, setujui' }));

    expect(onApprove).toHaveBeenCalledWith('sesuai anggaran');
  });

  it('leaves the document alone when the question is answered with "Kembali"', async () => {
    const onApprove = vi.fn();
    setup(twoLevels(), onApprove);

    await userEvent.click(screen.getByRole('button', { name: 'Setujui (1/2)' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Kembali' }));

    expect(onApprove).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByText('Setujui approval ke 1 dari 2?')).not.toBeInTheDocument()
    );
  });

  it('says the document becomes approved on the last level', async () => {
    setup(
      twoLevels({
        pending: [
          { level: 1, name: 'Building Manager', mode: 'ANY', roles: [role('Building Manager')] },
        ],
      })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Setujui (2/2)' }));

    expect(await screen.findByText('Setujui approval ke 2 dari 2?')).toBeInTheDocument();
    expect(screen.getByText(/Ini approval terakhir/)).toBeInTheDocument();
  });

  it('asks a single-level approval in plain words', async () => {
    setup(
      twoLevels({
        plan: [
          { name: 'Chief Finance', mode: 'ANY', roles: [{ id: 'cf', name: 'Chief Finance' }] },
        ],
      })
    );

    await userEvent.click(screen.getByRole('button', { name: 'Setujui' }));

    expect(await screen.findByText('Setujui dokumen ini?')).toBeInTheDocument();
  });
});
