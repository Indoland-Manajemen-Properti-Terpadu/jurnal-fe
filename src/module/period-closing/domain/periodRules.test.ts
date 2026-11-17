import { describe, expect, it } from 'vitest';
import type { AccountingPeriod } from './accountingPeriod';
import {
  addDays,
  addYear,
  closingRangeIssue,
  canDeletePeriod,
  canEditDates,
  canReopenPeriod,
  countDays,
  describeRange,
  findOverlap,
  gapAfterLatestClosing,
  latestActiveClosing,
  isDeletedPeriod,
  lockPresetRange,
  matchesStatusFilter,
  suggestClosingRange,
  validatePeriodValues,
} from './periodRules';

const period = (overrides: Partial<AccountingPeriod>): AccountingPeriod => ({
  status: overrides.isActive === false ? 'INACTIVE' : 'ACTIVE',
  id: 'p1',
  name: 'Periode',
  type: 'LOCK',
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  isActive: true,
  notes: '',
  createdBy: null,
  closingJournalId: null,
  reopenedAt: null,
  reopenedBy: null,
  deactivatedAt: null,
  deactivatedBy: null,
  deletedAt: null,
  deletedBy: null,
  activities: [],
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

describe('calendar day arithmetic', () => {
  it('moves across month, year and leap days without a time zone', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts both ends of a range', () => {
    expect(countDays({ startDate: '2026-01-01', endDate: '2026-01-31' })).toBe(31);
    expect(countDays({ startDate: '2026-01-01', endDate: '2026-01-01' })).toBe(1);
  });
});

describe('findOverlap', () => {
  const lock = period({ id: 'lock', startDate: '2026-01-01', endDate: '2026-01-31' });
  const closing = period({
    id: 'close',
    type: 'CLOSE',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  });

  it('finds an active period of the same type sharing a day', () => {
    expect(findOverlap({ startDate: '2026-01-31', endDate: '2026-02-10' }, 'LOCK', [lock])).toBe(
      lock
    );
  });

  it('ignores the other type, inactive periods and the period being edited', () => {
    const range = { startDate: '2025-06-01', endDate: '2026-01-15' };
    expect(findOverlap(range, 'LOCK', [closing])).toBeUndefined();
    expect(
      findOverlap(range, 'LOCK', [{ ...lock, isActive: false, status: 'INACTIVE' }])
    ).toBeUndefined();
    expect(findOverlap(range, 'LOCK', [lock], 'lock')).toBeUndefined();
  });

  it('accepts a range that starts the day after another ends', () => {
    expect(
      findOverlap({ startDate: '2026-02-01', endDate: '2026-02-28' }, 'LOCK', [lock])
    ).toBeUndefined();
  });
});

describe('reopen and edit rights', () => {
  const older = period({
    id: 'c2024',
    type: 'CLOSE',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });
  const newer = period({
    id: 'c2025',
    type: 'CLOSE',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
  });
  const reopened = period({ id: 'c2026', type: 'CLOSE', endDate: '2026-06-30', isActive: false });

  it('only the active closing with the latest end date can be reopened', () => {
    const latest = latestActiveClosing([older, newer, reopened]);
    expect(latest?.id).toBe('c2025');
    expect(canReopenPeriod(newer, latest)).toBe(true);
    expect(canReopenPeriod(older, latest)).toBe(false);
    expect(canReopenPeriod(reopened, latest)).toBe(false);
  });

  it('a lock is never reopened; it is deleted or edited instead', () => {
    const lock = period({});
    expect(canReopenPeriod(lock, lock)).toBe(false);
    expect(canDeletePeriod(lock)).toBe(true);
    expect(canEditDates(lock)).toBe(true);
    expect(canDeletePeriod(newer)).toBe(false);
    expect(canEditDates(newer)).toBe(false);
  });
});

describe('suggestClosingRange', () => {
  it('suggests last year when the books were never closed', () => {
    expect(suggestClosingRange(undefined, '2026-11-12')).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });
  });

  it('continues the day after the latest closing', () => {
    const latest = period({ type: 'CLOSE', startDate: '2024-01-01', endDate: '2024-12-31' });
    expect(suggestClosingRange(latest, '2026-11-12')).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });
  });

  it('stops at the end of last month when the year is not over', () => {
    const latest = period({ type: 'CLOSE', startDate: '2025-01-01', endDate: '2025-12-31' });
    expect(suggestClosingRange(latest, '2026-11-12')).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-10-31',
    });
  });

  it('leaves the end empty when no whole month has passed since the latest closing', () => {
    const latest = period({ type: 'CLOSE', startDate: '2026-01-01', endDate: '2026-10-31' });
    expect(suggestClosingRange(latest, '2026-11-12')).toEqual({
      startDate: '2026-11-01',
      endDate: '',
    });
  });
});

describe('gapAfterLatestClosing', () => {
  const latest = period({ type: 'CLOSE', startDate: '2025-01-01', endDate: '2025-12-31' });

  it('is zero when the new closing starts the next day', () => {
    expect(gapAfterLatestClosing('2026-01-01', latest)).toBe(0);
    expect(gapAfterLatestClosing('2026-01-01', undefined)).toBe(0);
  });

  it('counts the days no closing covers', () => {
    expect(gapAfterLatestClosing('2026-02-01', latest)).toBe(31);
  });
});

describe('lockPresetRange', () => {
  it('gives last month, quarter and year relative to today', () => {
    expect(lockPresetRange('lastMonth', '2026-01-15')).toEqual({
      startDate: '2025-12-01',
      endDate: '2025-12-31',
    });
    expect(lockPresetRange('lastQuarter', '2026-11-12')).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-09-30',
    });
    expect(lockPresetRange('lastQuarter', '2026-02-01')).toEqual({
      startDate: '2025-10-01',
      endDate: '2025-12-31',
    });
    expect(lockPresetRange('lastYear', '2026-11-12')).toEqual({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    });
    expect(lockPresetRange('thisMonth', '2024-02-10')).toEqual({
      startDate: '2024-02-01',
      endDate: '2024-02-29',
    });
  });
});

describe('describeRange', () => {
  it('recognises a whole year, quarter or month', () => {
    expect(describeRange({ startDate: '2025-01-01', endDate: '2025-12-31' })).toEqual({
      kind: 'year',
      year: 2025,
    });
    expect(describeRange({ startDate: '2026-04-01', endDate: '2026-06-30' })).toEqual({
      kind: 'quarter',
      year: 2026,
      quarter: 2,
    });
    expect(describeRange({ startDate: '2026-02-01', endDate: '2026-02-28' })).toEqual({
      kind: 'month',
      year: 2026,
      month: 2,
    });
    expect(describeRange({ startDate: '2026-02-03', endDate: '2026-02-28' })).toEqual({
      kind: 'custom',
    });
  });
});

describe('validatePeriodValues', () => {
  it('requires a name and both dates, in order', () => {
    expect(validatePeriodValues({ name: ' ', startDate: '', endDate: '' })).toEqual({
      name: 'nameRequired',
      startDate: 'startRequired',
      endDate: 'endRequired',
    });
    expect(
      validatePeriodValues({ name: 'Kunci', startDate: '2026-02-01', endDate: '2026-01-31' })
    ).toEqual({ endDate: 'endBeforeStart' });
    expect(
      validatePeriodValues({ name: 'Kunci', startDate: '2026-01-31', endDate: '2026-01-31' })
    ).toEqual({});
  });
});

describe('closingRangeIssue (PRO-81)', () => {
  const today = '2026-11-16';

  it('refuses an end date that has not come yet, but not today itself', () => {
    expect(closingRangeIssue({ startDate: '2025-01-01', endDate: '2026-12-31' }, today)).toBe(
      'endFuture'
    );
    expect(closingRangeIssue({ startDate: '2026-01-01', endDate: '2026-11-17' }, today)).toBe(
      'endFuture'
    );
    expect(closingRangeIssue({ startDate: '2026-01-01', endDate: today }, today)).toBeNull();
  });

  it('refuses a range longer than a year, as the trial balance of step 2 does', () => {
    expect(closingRangeIssue({ startDate: '2024-01-01', endDate: '2025-06-30' }, today)).toBe(
      'tooLong'
    );
    expect(closingRangeIssue({ startDate: '2025-01-01', endDate: '2026-01-02' }, today)).toBe(
      'tooLong'
    );
    expect(closingRangeIssue({ startDate: '2025-01-01', endDate: '2026-01-01' }, today)).toBeNull();
    expect(closingRangeIssue({ startDate: '2025-01-01', endDate: '2025-12-31' }, today)).toBeNull();
  });

  it('says nothing about a range that is not filled in yet', () => {
    expect(closingRangeIssue({ startDate: '', endDate: '2030-01-01' }, today)).toBeNull();
    expect(addYear('2024-02-29')).toBe('2025-03-01');
  });
});

describe('deleted periods', () => {
  it('is a record only: it can not be deleted again and does not take part in overlaps', () => {
    const deleted = period({ status: 'DELETED', isActive: true });
    expect(isDeletedPeriod(deleted)).toBe(true);
    expect(canDeletePeriod(deleted)).toBe(false);
    expect(
      findOverlap({ startDate: '2026-01-10', endDate: '2026-01-20' }, 'LOCK', [deleted])
    ).toBeUndefined();
  });

  it('filters by status, with a reopened closing counted as inactive', () => {
    const active = period({});
    const reopened = period({ type: 'CLOSE', status: 'REOPENED', isActive: false });
    const deleted = period({ status: 'DELETED', isActive: true });
    expect(matchesStatusFilter(active, 'active')).toBe(true);
    expect(matchesStatusFilter(deleted, 'active')).toBe(false);
    expect(matchesStatusFilter(reopened, 'inactive')).toBe(true);
    expect(matchesStatusFilter(deleted, 'inactive')).toBe(false);
    expect(matchesStatusFilter(deleted, 'deleted')).toBe(true);
  });
});
