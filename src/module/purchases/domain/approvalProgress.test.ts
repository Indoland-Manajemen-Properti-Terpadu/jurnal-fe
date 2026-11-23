import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';
import { approvalStep, levelRule } from '@/module/purchases/domain/approvalProgress';

const role = (name: string, approved = false) => ({ id: name, name, approved });

const state = (overrides: Partial<ApprovalState> = {}): ApprovalState => ({
  plan: [
    { name: 'Chief Finance', mode: 'ALL', roles: [{ id: 'cf', name: 'Chief Finance' }] },
    { name: 'Building Manager', mode: 'ALL', roles: [{ id: 'bm', name: 'Building Manager' }] },
  ],
  entries: [],
  pending: [{ level: 0, name: 'Chief Finance', mode: 'ALL', roles: [role('Chief Finance')] }],
  canDecide: true,
  rejectionReason: null,
  rejectedAt: null,
  ...overrides,
});

describe('approvalStep', () => {
  it('is the first of two levels while the first is waiting', () => {
    expect(approvalStep(state())).toMatchObject({ current: 1, total: 2 });
  });

  it('is the second of two once the first has signed', () => {
    const second = state({
      pending: [
        { level: 1, name: 'Building Manager', mode: 'ALL', roles: [role('Building Manager')] },
      ],
    });
    expect(approvalStep(second)).toMatchObject({ current: 2, total: 2 });
  });

  it('is nothing once no level is waiting', () => {
    expect(approvalStep(state({ pending: [] }))).toBeNull();
  });
});

describe('levelRule', () => {
  it('says nothing about a level with a single role, whatever its mode', () => {
    expect(levelRule({ mode: 'ANY', roles: [role('A')] })).toBeNull();
    expect(levelRule({ mode: 'ALL', roles: [role('A')] })).toBeNull();
  });

  it('says one role is enough, or all must sign, for a level with several roles', () => {
    expect(levelRule({ mode: 'ANY', roles: [role('A'), role('B')] })).toBe('any');
    expect(levelRule({ mode: 'ALL', roles: [role('A'), role('B')] })).toBe('all');
  });
});
