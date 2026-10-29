import type { JournalEntryPayload } from '../domain/journalEntry';
import { toCreateBody, toEntriesByAccount, toEntryDetail } from './journalEntryMapper';

const payload = (over: Partial<JournalEntryPayload> = {}): JournalEntryPayload => ({
  transactionDate: '2026-05-01',
  transactionDetail: [
    { account: 'a', description: 'x', debit: 1000, credit: 0 },
    { account: 'b', description: 'y', debit: 0, credit: 1000 },
  ],
  notes: '',
  attachments: [],
  tags: [],
  ...over,
});

describe('toCreateBody', () => {
  it('leaves out a zero side and the optional fields', () => {
    expect(toCreateBody(payload())).toEqual({
      transactionDate: '2026-05-01',
      transactionDetail: [
        { account: 'a', description: 'x', debit: 1000 },
        { account: 'b', description: 'y', credit: 1000 },
      ],
    });
  });

  it('adds number, trimmed-nonblank notes, tags and files when present', () => {
    const file = new File(['x'], 'a.pdf');
    const body = toCreateBody(
      payload({ transactionNumber: 7, notes: 'memo', tags: ['t1'], attachments: [file] })
    );
    expect(body).toMatchObject({ transactionNumber: 7, notes: 'memo', tags: ['t1'] });
    expect(body.attachments).toEqual([file]);
  });

  it('skips a NaN number and blank notes', () => {
    const body = toCreateBody(payload({ transactionNumber: NaN, notes: '   ' }));
    expect(body).not.toHaveProperty('transactionNumber');
    expect(body).not.toHaveProperty('notes');
  });
});

describe('toEntriesByAccount', () => {
  const rows = [{ id: '1' }];
  it('accepts every known response shape', () => {
    expect(toEntriesByAccount({ data: { results: rows } })).toEqual(rows);
    expect(toEntriesByAccount({ results: rows })).toEqual(rows);
    expect(toEntriesByAccount({ data: rows })).toEqual(rows);
    expect(toEntriesByAccount(rows)).toEqual(rows);
  });

  it('answers an empty list for anything else', () => {
    expect(toEntriesByAccount(null)).toEqual([]);
    expect(toEntriesByAccount({ data: {} })).toEqual([]);
  });
});

describe('toEntryDetail', () => {
  it('unwraps the data field', () => {
    expect(toEntryDetail({ data: { id: 'j1' } })).toEqual({ id: 'j1' });
  });
});
