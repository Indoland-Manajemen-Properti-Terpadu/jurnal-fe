import { activeApprover, approvalMenuFor } from '@/module/petty-cash/domain/approval';
import {
  allowedCountActions,
  allowedReimbursementActions,
  type PettyCashAccessProfile,
} from '@/module/petty-cash/domain/pettyCashAccess';

const right = (update: boolean) => ({ create: false, read: true, update, delete: false });
const profile = (userId: string, menus: string[]): PettyCashAccessProfile => ({
  userId,
  isSuperAdmin: false,
  rights: Object.fromEntries(menus.map((menu) => [menu, right(true)])),
});

const bm = { level: 'BM', label: 'Building Manager' };
const cf = { level: 'CF', label: 'Chief Finance' };
const finance = { level: 'FINANCE', label: 'Finance' };

const buildingManager = profile('u-bm', ['JP-PC-APR-BM']);
const chiefFinance = profile('u-cf', ['JP-PC-APR-CF']);
const financeApprover = profile('u-fin', ['JP-PC-APR']);

const count = (pendingApprovers: Array<{ level: string; label: string }>) => ({
  status: 'SUBMITTED' as const,
  countedById: 'u-counter',
  custodianId: 'u-custodian',
  pendingApprovers,
});

describe('approvalMenuFor', () => {
  it('maps the stage being waited for to its menu', () => {
    expect(approvalMenuFor([bm, cf])).toBe('JP-PC-APR-BM');
    expect(approvalMenuFor([cf])).toBe('JP-PC-APR-CF');
    expect(approvalMenuFor([finance])).toBe('JP-PC-APR');
  });

  it('falls back to the finance right when the server sends no stages', () => {
    expect(approvalMenuFor([])).toBe('JP-PC-APR');
  });

  it('offers nothing for a stage the app does not know', () => {
    expect(approvalMenuFor([{ level: 'GM', label: 'General Manager' }])).toBeNull();
  });

  it('reads the first pending stage as the active one', () => {
    expect(activeApprover([bm, cf])).toEqual(bm);
    expect(activeApprover([])).toBeNull();
  });
});

describe('staged approval of a count', () => {
  it('lets only the Building Manager approve in the BM stage', () => {
    expect(allowedCountActions(buildingManager, count([bm, cf]))).toEqual(['approve', 'reject']);
    expect(allowedCountActions(chiefFinance, count([bm, cf]))).toEqual([]);
    expect(allowedCountActions(financeApprover, count([bm, cf]))).toEqual([]);
  });

  it('moves to Chief Finance once the BM stage is done', () => {
    expect(allowedCountActions(chiefFinance, count([cf]))).toEqual(['approve', 'reject']);
    expect(allowedCountActions(buildingManager, count([cf]))).toEqual([]);
  });

  it('keeps the single finance stage for a site without property management', () => {
    expect(allowedCountActions(financeApprover, count([finance]))).toEqual(['approve', 'reject']);
  });

  it('still keeps the counter and the custodian out of the decision', () => {
    const counterAsBm = profile('u-counter', ['JP-PC-APR-BM']);
    expect(allowedCountActions(counterAsBm, count([bm, cf]))).toEqual([]);
  });
});

describe('staged approval of a replenishment', () => {
  const record = (pendingApprovers: Array<{ level: string; label: string }>) => ({
    status: 'SUBMITTED' as const,
    submittedById: 'u-custodian',
    approvedById: null,
    pendingApprovers,
  });

  it('offers approve and reject only to the holder of the active stage', () => {
    expect(allowedReimbursementActions(buildingManager, record([bm, cf]))).toEqual([
      'approve',
      'reject',
    ]);
    expect(allowedReimbursementActions(chiefFinance, record([bm, cf]))).toEqual([]);
    expect(allowedReimbursementActions(chiefFinance, record([cf]))).toEqual(['approve', 'reject']);
  });

  it('does not let the submitter approve their own request', () => {
    const submitter = profile('u-custodian', ['JP-PC-APR-BM']);
    expect(allowedReimbursementActions(submitter, record([bm, cf]))).toEqual([]);
  });
});
