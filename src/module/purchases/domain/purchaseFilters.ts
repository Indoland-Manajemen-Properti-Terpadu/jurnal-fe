import { PurchaseBill } from './purchase';

export type PurchaseTab = 'all' | 'unpaid' | 'overdue' | 'paid';
export type PurchaseSort = 'newest' | 'highestAmount' | 'highestRemaining';

export interface PurchaseFilter {
  tab: string;
  query: string;
  sortBy: string;
}

const isUnpaid = (bill: PurchaseBill) => bill.status === 'UNPAID' || bill.status === 'PARTIAL';

export const countByTab = (bills: PurchaseBill[]): Record<PurchaseTab, number> => ({
  all: bills.length,
  unpaid: bills.filter(isUnpaid).length,
  overdue: bills.filter((bill) => bill.status === 'OVERDUE').length,
  paid: bills.filter((bill) => bill.status === 'PAID').length,
});

export const filterPurchases = (bills: PurchaseBill[], filter: PurchaseFilter): PurchaseBill[] => {
  let result = [...bills];

  if (filter.tab === 'unpaid') {
    result = result.filter(isUnpaid);
  } else if (filter.tab === 'overdue') {
    result = result.filter((bill) => bill.status === 'OVERDUE');
  } else if (filter.tab === 'paid') {
    result = result.filter((bill) => bill.status === 'PAID');
  }

  if (filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    result = result.filter(
      (bill) =>
        bill.billNumber.toLowerCase().includes(q) ||
        bill.vendorName.toLowerCase().includes(q) ||
        (bill.notes && bill.notes.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => {
    if (filter.sortBy === 'newest') {
      return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
    }
    if (filter.sortBy === 'highestAmount') return b.totalAmount - a.totalAmount;
    if (filter.sortBy === 'highestRemaining') return b.remainingAmount - a.remainingAmount;
    return 0;
  });

  return result;
};
