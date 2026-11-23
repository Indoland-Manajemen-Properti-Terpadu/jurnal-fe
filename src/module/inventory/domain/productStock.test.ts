import { productStockStatus } from './productStock';

describe('productStockStatus', () => {
  it('is empty when the service says so or nothing is left', () => {
    expect(productStockStatus({ quantity: 0, belowMin: false, status: 'habis' })).toBe('empty');
    expect(productStockStatus({ quantity: 0, belowMin: false, status: '' })).toBe('empty');
  });

  it('is below the minimum when the service flags it, even with some stock left', () => {
    expect(productStockStatus({ quantity: 5, belowMin: true, status: 'menipis' })).toBe('belowMin');
  });

  it('is safe when there is stock and the minimum is met', () => {
    expect(productStockStatus({ quantity: 60, belowMin: false, status: 'aman' })).toBe('safe');
  });

  it('does not call an empty warehouse "below minimum"', () => {
    expect(productStockStatus({ quantity: 0, belowMin: true, status: 'habis' })).toBe('empty');
  });
});
