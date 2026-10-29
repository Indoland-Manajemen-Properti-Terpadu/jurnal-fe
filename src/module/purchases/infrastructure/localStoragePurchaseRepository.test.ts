import { vi } from 'vitest';
import {
  localStoragePurchaseRepository as repository,
  PURCHASE_STORAGE_KEY,
} from './localStoragePurchaseRepository';
import { INITIAL_PURCHASE_BILLS } from './purchaseSeed';

describe('localStoragePurchaseRepository', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('keeps the legacy storage key', () => {
    expect(PURCHASE_STORAGE_KEY).toBe('jurnal_purchase_bills_data');
  });

  it('seeds the initial bills when nothing is stored', () => {
    expect(repository.load()).toEqual(INITIAL_PURCHASE_BILLS);
    expect(JSON.parse(localStorage.getItem(PURCHASE_STORAGE_KEY) ?? '[]')).toEqual(
      INITIAL_PURCHASE_BILLS
    );
  });

  it('falls back to the seed for an empty list or corrupt JSON', () => {
    localStorage.setItem(PURCHASE_STORAGE_KEY, '[]');
    expect(repository.load()).toEqual(INITIAL_PURCHASE_BILLS);

    localStorage.setItem(PURCHASE_STORAGE_KEY, '{not json');
    expect(repository.load()).toEqual(INITIAL_PURCHASE_BILLS);
  });

  it('round-trips saved bills as a plain JSON array', () => {
    repository.save([INITIAL_PURCHASE_BILLS[0]]);

    expect(repository.load()).toEqual([INITIAL_PURCHASE_BILLS[0]]);
  });

  it('lets a failed save reach the caller', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => repository.save([])).toThrow('quota');
  });
});
