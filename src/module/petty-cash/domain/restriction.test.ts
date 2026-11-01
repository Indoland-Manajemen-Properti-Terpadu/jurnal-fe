import {
  availableRestrictionActions,
  validateRestriction,
} from '@/module/petty-cash/domain/restriction';
import type { AdvanceStatusInfo } from '@/module/petty-cash/domain/pettyCashEntities';

const status = (over: Partial<AdvanceStatusInfo> = {}): AdvanceStatusInfo => ({
  user: { id: 'u', name: 'Staf' } as AdvanceStatusInfo['user'],
  isBlocked: false,
  reasons: [],
  overrideUntil: null,
  outstandingAmount: 0,
  ...over,
});
const reason = (type: 'MANUAL' | 'OVERDUE') => ({ type, reason: 'x', since: null });

describe('availableRestrictionActions', () => {
  it('offers only a block to someone in good standing', () => {
    expect(availableRestrictionActions(status())).toEqual(['block']);
  });

  it('offers lifting a block that was set by hand', () => {
    const blocked = status({ isBlocked: true, reasons: [reason('MANUAL')] });
    expect(availableRestrictionActions(blocked)).toEqual(['unblock']);
  });

  it('offers an exception against an overdue block, and withdrawing it once granted', () => {
    const overdue = status({ isBlocked: true, reasons: [reason('OVERDUE')] });
    expect(availableRestrictionActions(overdue)).toEqual(['block', 'override']);
    const excepted = status({
      reasons: [reason('OVERDUE')],
      overrideUntil: '2026-11-10T00:00:00Z',
    });
    expect(availableRestrictionActions(excepted)).toEqual(['block', 'override', 'revoke']);
  });
});

describe('validateRestriction', () => {
  const today = '2026-11-01';

  it('always needs a reason', () => {
    expect(validateRestriction({ kind: 'block', reason: ' ', until: '' }, today)).toEqual([
      { path: 'reason', code: 'REQUIRED' },
    ]);
  });

  it('needs a date that is not in the past for an exception', () => {
    const base = { kind: 'override' as const, reason: 'Dinas luar', until: '' };
    expect(validateRestriction(base, today)).toEqual([{ path: 'until', code: 'REQUIRED' }]);
    expect(validateRestriction({ ...base, until: '2026-10-31' }, today)).toEqual([
      { path: 'until', code: 'PAST_DATE' },
    ]);
    expect(validateRestriction({ ...base, until: '2026-11-01' }, today)).toEqual([]);
  });
});
