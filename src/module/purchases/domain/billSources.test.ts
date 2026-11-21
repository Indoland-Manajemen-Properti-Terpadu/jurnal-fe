import {
  compatibleWith,
  incompatibility,
  togglePicked,
  type BillSourceDoc,
} from '@/module/purchases/domain/billSources';

const doc = (id: string, vendor = 'v1', termKey = 'k1'): BillSourceDoc =>
  ({ id, vendor: { id: vendor }, termKey }) as unknown as BillSourceDoc;

describe('billSources', () => {
  it('lets anything start a bill and then only the same vendor and term join it', () => {
    expect(compatibleWith([], doc('a'))).toBe(true);
    expect(compatibleWith([doc('a')], doc('b'))).toBe(true);
    expect(compatibleWith([doc('a')], doc('c', 'v2'))).toBe(false);
    expect(compatibleWith([doc('a')], doc('d', 'v1', 'k2'))).toBe(false);
  });

  it('says why a document cannot join, the vendor first', () => {
    expect(incompatibility([doc('a')], doc('c', 'v2', 'k2'))).toBe('vendor');
    expect(incompatibility([doc('a')], doc('d', 'v1', 'k2'))).toBe('term');
    expect(incompatibility([], doc('x'))).toBeNull();
    expect(incompatibility([doc('a')], doc('b'))).toBeNull();
  });

  it('adds a fitting document, removes one that is picked and ignores one that does not fit', () => {
    const first = togglePicked([], doc('a'), 'RECEIPT');
    expect(first.map((d) => d.id)).toEqual(['a']);
    expect(togglePicked(first, doc('b'), 'RECEIPT').map((d) => d.id)).toEqual(['a', 'b']);
    expect(togglePicked(first, doc('c', 'v2'), 'RECEIPT')).toBe(first);
    expect(togglePicked(first, doc('a'), 'RECEIPT')).toEqual([]);
  });
});
