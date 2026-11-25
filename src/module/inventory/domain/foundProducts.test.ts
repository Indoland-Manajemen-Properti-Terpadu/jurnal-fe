import { foundProductOptions } from './foundProducts';

const product = (id: string, name: string, tracked: boolean, sku = '') => ({
  id,
  name,
  sku,
  inventoryInfo: { isTracked: tracked },
});

describe('foundProductOptions', () => {
  const products = [
    product('a', 'Kertas A4', true, 'KRT'),
    product('b', 'Jasa Cleaning Service', false),
    product('c', 'Map plastik', true),
    product('d', 'Pulpen', true, 'PLP'),
  ];

  it('offers only products whose stock is tracked, never services', () => {
    expect(foundProductOptions(products, []).map((option) => option.value)).toEqual([
      'a',
      'c',
      'd',
    ]);
  });

  it('leaves out products already on the count list', () => {
    expect(foundProductOptions(products, ['a', 'd']).map((option) => option.value)).toEqual(['c']);
  });

  it('labels a product with its code when it has one', () => {
    expect(foundProductOptions(products, [])).toEqual([
      { value: 'a', label: 'Kertas A4 · KRT' },
      { value: 'c', label: 'Map plastik' },
      { value: 'd', label: 'Pulpen · PLP' },
    ]);
  });

  it('treats a product without stock information as not tracked', () => {
    expect(foundProductOptions([{ id: 'x', name: 'X', sku: '' }], [])).toEqual([]);
  });
});
