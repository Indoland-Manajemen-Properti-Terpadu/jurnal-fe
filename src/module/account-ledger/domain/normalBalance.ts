import { isDebitNormal } from '@/lib/accounting/normalBalance';

export type NormalSide = 'Debit' | 'Kredit';

/**
 * I5 as shown on the ledger screen: the category name (or the account type when the name is
 * empty) goes through the kernel keyword fallback. The screen passes neither the backend `isDebit`
 * flag nor `isContra`, so a contra account or a category the keywords do not know can show the
 * wrong side. Kept as is and pinned by `normalBalance.test.ts`; feeding the flags in is an open
 * decision (see the README).
 */
export function getNormalBalance(categoryName?: string, type?: string): NormalSide {
  return isDebitNormal({ categoryName: categoryName || type }) ? 'Debit' : 'Kredit';
}
