import type { PartyRef } from '@/module/purchases/domain/purchaseCommon';
import { offeredVendors } from './LookupSelects';

const vendor = (id: string): PartyRef => ({
  id,
  name: `Vendor ${id}`,
  paymentTermDays: null,
  npwp: null,
});

describe('offeredVendors', () => {
  const found = [vendor('a'), vendor('b'), vendor('c')];

  it('offers every vendor when nothing is excluded', () => {
    expect(offeredVendors(found, null, null).map((v) => v.id)).toEqual(['a', 'b', 'c']);
  });

  it('leaves out the vendors that already have a quote', () => {
    expect(offeredVendors(found, null, null, ['a', 'c']).map((v) => v.id)).toEqual(['b']);
  });

  it('keeps the vendor being edited even though it is on the exclusion list', () => {
    expect(offeredVendors(found, vendor('a'), 'a', ['a', 'b']).map((v) => v.id)).toEqual([
      'a',
      'c',
    ]);
  });

  it('lists the vendor chosen elsewhere when the search did not return it', () => {
    expect(offeredVendors(found, vendor('z'), 'z').map((v) => v.id)).toEqual(['z', 'a', 'b', 'c']);
  });
});
