import type { JournalEntryDetail } from './journalEntry';
import { voidGate } from './journalVoid';

const entry = (overrides: Partial<JournalEntryDetail>): JournalEntryDetail => ({
  id: 'j1',
  status: 'ACTIVE',
  canVoid: true,
  ...overrides,
});

describe('voidGate', () => {
  it('allows an active entry the server says can be voided', () => {
    expect(voidGate(entry({}))).toEqual({ allowed: true });
  });

  it('blocks an entry the server will not void and keeps its reason', () => {
    expect(
      voidGate(entry({ canVoid: false, voidBlockedReason: 'Dibuat oleh modul Kas Kecil' }))
    ).toEqual({ allowed: false, kind: 'blocked', reason: 'Dibuat oleh modul Kas Kecil' });
  });

  it('names an entry that is already void or is itself a reversal, even if canVoid is true', () => {
    expect(voidGate(entry({ status: 'VOID', canVoid: false }))).toMatchObject({ kind: 'void' });
    expect(voidGate(entry({ status: 'REVERSAL', canVoid: true }))).toMatchObject({
      kind: 'reversal',
    });
  });

  it.each(['SALE', 'SALE_PAYMENT'])(
    'blocks a journal posted by a sales document (%s) even if the server allows it',
    (sourceType) => {
      expect(voidGate(entry({ sourceType, canVoid: true }))).toEqual({
        allowed: false,
        kind: 'source',
      });
    }
  );

  it('still reports a void sales journal as void', () => {
    expect(voidGate(entry({ sourceType: 'SALE', status: 'VOID' }))).toMatchObject({ kind: 'void' });
  });

  it('does not allow a void when the server sent no flag', () => {
    expect(voidGate(entry({ canVoid: undefined }))).toMatchObject({ allowed: false });
  });
});
