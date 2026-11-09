import { describe, expect, it } from 'vitest';
import {
  emptyHistoryFilters,
  filtersFromParams,
  filtersToParams,
  hasActiveFilters,
  summarizeAccounts,
  toHistoryQuery,
} from './journalHistory';

describe('journal history filters', () => {
  it('reads defaults from an empty address', () => {
    expect(filtersFromParams(new URLSearchParams())).toEqual(emptyHistoryFilters());
  });

  it('round-trips every filter through the address', () => {
    const filters = {
      ...emptyHistoryFilters(),
      page: 3,
      limit: 50,
      sortBy: 'transactionNumber' as const,
      order: 'asc' as const,
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      status: ['ACTIVE' as const, 'VOID' as const],
      type: 'EXPENSE' as const,
      source: 'system' as const,
      accounts: ['a1', 'a2'],
      tags: ['t1'],
      search: 'sewa',
    };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it('leaves defaults out of the address', () => {
    expect(filtersToParams(emptyHistoryFilters()).toString()).toBe('');
  });

  it('drops malformed values', () => {
    const filters = filtersFromParams(
      new URLSearchParams(
        'page=-2&limit=7&sort=bogus:asc&from=31-01-2026&status=NOPE&type=X&source=Y'
      )
    );
    expect(filters).toEqual(emptyHistoryFilters());
  });

  it('builds the API query with repeated keys', () => {
    const query = toHistoryQuery({
      ...emptyHistoryFilters(),
      status: ['ACTIVE', 'VOID'],
      accounts: ['a1', 'a2'],
      type: 'DEFAULT',
      search: 'kas',
    });
    expect(query.getAll('status')).toEqual(['ACTIVE', 'VOID']);
    expect(query.getAll('account')).toEqual(['a1', 'a2']);
    expect(query.get('transactionType')).toBe('DEFAULT');
    expect(query.get('sortBy')).toBe('transactionDate:desc');
    expect(query.get('search')).toBe('kas');
  });

  it('tells filters from paging', () => {
    expect(hasActiveFilters({ ...emptyHistoryFilters(), page: 4, limit: 100 })).toBe(false);
    expect(hasActiveFilters({ ...emptyHistoryFilters(), search: 'x' })).toBe(true);
  });

  it('summarizes the accounts of an entry', () => {
    const line = (accountName: string) => ({
      id: accountName,
      accountId: accountName,
      accountNumber: '1',
      accountName,
      description: '',
      debit: 0,
      credit: 0,
    });
    expect(summarizeAccounts([line('Kas'), line('Kas'), line('Sewa'), line('Listrik')])).toEqual({
      names: ['Kas', 'Sewa'],
      more: 1,
    });
  });
});
