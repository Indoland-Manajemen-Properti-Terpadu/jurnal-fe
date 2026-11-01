import { PurchaseBill } from '@/module/purchases/domain/purchase';
import { PurchaseRepository } from '@/module/purchases/domain/purchaseRepository';
import { INITIAL_PURCHASE_BILLS } from './purchaseSeed';

export const PURCHASE_STORAGE_KEY = 'jurnal_purchase_bills_data';

export const localStoragePurchaseRepository: PurchaseRepository = {
  load(): PurchaseBill[] {
    if (typeof window === 'undefined') return INITIAL_PURCHASE_BILLS;
    try {
      const raw = localStorage.getItem(PURCHASE_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(INITIAL_PURCHASE_BILLS));
        return INITIAL_PURCHASE_BILLS;
      }
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0
        ? (parsed as PurchaseBill[])
        : INITIAL_PURCHASE_BILLS;
    } catch {
      return INITIAL_PURCHASE_BILLS;
    }
  },

  save(bills: PurchaseBill[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(bills));
  },
};
