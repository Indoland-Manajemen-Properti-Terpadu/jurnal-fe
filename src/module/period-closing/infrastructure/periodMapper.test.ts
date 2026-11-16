import { describe, expect, it } from 'vitest';
import { mapDateCheck, mapPeriod, mapPeriodPage } from './periodMapper';

// Shapes copied from the live service (2026-11-12).
const listRow = {
  id: '6af53abb371fc6f98c652e08',
  name: 'Uji Kunci 2099',
  type: 'LOCK',
  startDate: '2099-01-01T00:00:00.000Z',
  endDate: '2099-02-28T00:00:00.000Z',
  isActive: false,
  site: 'site',
  createdBy: { id: 'u1', name: 'Superadmin', email: 'finance2@proapps.id', accessRole: ['r'] },
  closedBy: null,
  closingJournalId: null,
  notes: 'uji',
  deleted: false,
  createdAt: '2026-11-12T04:04:11.034Z',
  updatedAt: '2026-11-12T04:04:11.288Z',
};

describe('periodMapper', () => {
  it('keeps the calendar day of UTC midnight dates', () => {
    const period = mapPeriod(listRow);
    expect(period.startDate).toBe('2099-01-01');
    expect(period.endDate).toBe('2099-02-28');
    expect(period.isActive).toBe(false);
    expect(period.createdBy).toEqual({ id: 'u1', name: 'Superadmin' });
  });

  it('keeps a reopened closing with who and when; the list sends the user as a bare id', () => {
    const period = mapPeriod({
      ...listRow,
      type: 'CLOSE',
      isActive: false,
      reopenedBy: '6aec7353248ac0bdd139d486',
      reopenedAt: '2026-11-12T07:08:19.325Z',
    });
    expect(period.isActive).toBe(false);
    expect(period.reopenedAt).toBe('2026-11-12T07:08:19.325Z');
    expect(period.reopenedBy).toBeNull();
    expect(mapPeriod({ ...listRow, reopenedBy: { id: 'u2', name: 'Rina' } }).reopenedBy).toEqual({
      id: 'u2',
      name: 'Rina',
    });
  });

  it('accepts a bare user id and a closing journal', () => {
    const period = mapPeriod({
      ...listRow,
      type: 'CLOSE',
      createdBy: 'u1',
      closingJournalId: 'j1',
      isActive: undefined,
    });
    expect(period.type).toBe('CLOSE');
    expect(period.createdBy).toBeNull();
    expect(period.closingJournalId).toBe('j1');
    expect(period.isActive).toBe(true);
  });

  it('maps a page and the date check', () => {
    const page = mapPeriodPage(
      { results: [listRow], page: 2, limit: 1, totalPages: 3, totalResults: 3 },
      1
    );
    expect(page.items).toHaveLength(1);
    expect(page.pagination).toEqual({ page: 2, limit: 1, totalPages: 3, total: 3 });
    expect(mapPeriodPage(undefined, 10).pagination.total).toBe(0);
    // The server counts deleted periods too; an empty first page means none.
    expect(
      mapPeriodPage({ results: [], page: 1, limit: 10, totalPages: 1, totalResults: 1 }, 10)
        .pagination
    ).toEqual({ page: 1, limit: 10, totalPages: 1, total: 0 });
    expect(mapDateCheck({ isLocked: false, period: null })).toEqual({
      isLocked: false,
      period: null,
    });
  });
});
