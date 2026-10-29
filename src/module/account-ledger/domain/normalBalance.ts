import { isDebitNormal } from '@/lib/accounting/normalBalance';

export type NormalSide = 'Debit' | 'Kredit';

export interface NormalBalanceSource {
  categoryName?: string;
  /** Account type, used as the keyword source when the category name is empty. */
  type?: string;
  /** Backend category flag; wins over the keywords when present. */
  isDebit?: boolean;
  /** Contra accounts take the opposite side. */
  isContra?: boolean;
}

/**
 * I5 as shown on the ledger screen: the backend category `isDebit` flag decides when the backend
 * sends it, otherwise the category name (or the account type when the name is empty) goes through
 * the kernel Indonesian keyword fallback. A contra account flips the result.
 */
export function getNormalBalance({
  categoryName,
  type,
  isDebit,
  isContra,
}: NormalBalanceSource): NormalSide {
  return isDebitNormal({ isDebit, isContra, categoryName: categoryName || type })
    ? 'Debit'
    : 'Kredit';
}
