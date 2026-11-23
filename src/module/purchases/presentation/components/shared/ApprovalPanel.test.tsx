import { render, screen } from '@test-utils';
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

const setup = (approval: ApprovalState) =>
  render(
    <ApprovalPanel
      approval={approval}
      status="SUBMITTED"
      waitingStatus="SUBMITTED"
      canApprove
      onApprove={vi.fn()}
      onReject={vi.fn()}
    />
  );

describe('ApprovalPanel, levels in order', () => {
  it('shows which level is waiting and numbers the approve button', () => {
    setup(twoLevels());
    expect(screen.getByText('Tingkat 1 dari 2')).toBeInTheDocument();
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
