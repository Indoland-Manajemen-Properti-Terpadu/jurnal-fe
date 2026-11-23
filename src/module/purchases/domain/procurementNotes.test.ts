import type { Procurement } from '@/module/purchases/domain/procurement';
import { neededNotes, noteFields } from '@/module/purchases/domain/procurementNotes';

const quote = (vendorId: string, finalPrice: number | null = null, unitPrice = 100) => ({
  vendor: { id: vendorId },
  lines: [{ finalPrice, unitPrice }],
});

const procurement = (overrides: Record<string, unknown> = {}): Procurement =>
  ({
    route: 'BIDDING',
    winnerId: 'v1',
    cheapestVendorId: 'v1',
    minQuotes: 2,
    quotes: [quote('v1'), quote('v2')],
    totals: { q1: { complete: true }, q2: { complete: true } },
    singleReason: '',
    belowMinQuotesReason: '',
    reason: '',
    negotiationNote: '',
    ...overrides,
  }) as unknown as Procurement;

const keys = (p: Procurement) => noteFields(p).map((field) => field.key);

describe('neededNotes', () => {
  it('asks for a reason only when the winner is not the cheapest', () => {
    expect(neededNotes(procurement()).notCheapest).toBe(false);
    expect(neededNotes(procurement({ cheapestVendorId: 'v2' })).notCheapest).toBe(true);
  });

  it('asks why there are fewer quotes than required', () => {
    expect(neededNotes(procurement()).belowMin).toBe(false);
    expect(neededNotes(procurement({ totals: { q1: { complete: true } } })).belowMin).toBe(true);
  });

  it('asks about a negotiated price only when the winning price went up', () => {
    const up = procurement({ quotes: [quote('v1', 120, 100)] });
    expect(neededNotes(up).negotiated).toBe(true);
    expect(neededNotes(procurement({ quotes: [quote('v1', 90, 100)] })).negotiated).toBe(false);
  });
});

describe('noteFields, bidding', () => {
  it('always has the one reason-and-negotiation field, required only when not the cheapest', () => {
    expect(noteFields(procurement())).toEqual([{ key: 'reason', needed: false }]);
    expect(noteFields(procurement({ cheapestVendorId: 'v2' }))).toEqual([
      { key: 'reason', needed: true },
    ]);
  });

  it('never shows the single-vendor reason or the negotiation note, even when an old one is stored', () => {
    const stale = procurement({ singleReason: 'Hanya satu vendor', negotiationNote: 'Naik' });
    expect(keys(stale)).toEqual(['reason']);
  });

  it('adds the fewer-quotes reason while it is needed or already written', () => {
    const short = procurement({ totals: { q1: { complete: true } } });
    expect(keys(short)).toEqual(['belowMinQuotesReason', 'reason']);
    const written = procurement({ belowMinQuotesReason: 'Hanya dua vendor' });
    expect(keys(written)).toEqual(['belowMinQuotesReason', 'reason']);
  });
});

describe('noteFields, single vendor', () => {
  const single = (overrides: Record<string, unknown> = {}) =>
    procurement({ route: 'SINGLE', quotes: [quote('v1')], minQuotes: 1, ...overrides });

  it('asks why only this vendor', () => {
    expect(noteFields(single())).toEqual([{ key: 'singleReason', needed: true }]);
  });

  it('adds the negotiation note when the price went up, and never the bidding reason', () => {
    const negotiated = single({ quotes: [quote('v1', 130, 100)], reason: 'sisa lama' });
    expect(noteFields(negotiated)).toEqual([
      { key: 'singleReason', needed: true },
      { key: 'negotiationNote', needed: true },
    ]);
  });
});
