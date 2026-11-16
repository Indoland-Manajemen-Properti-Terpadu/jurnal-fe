import { useMemo } from 'react';
import { usePettyCashFunds } from '@/module/petty-cash';
import {
  pettyCashAccountIndex,
  type PettyCashAccountIndex,
} from '@/module/bank-cash/domain/cashBankAccounts';

const EMPTY: PettyCashAccountIndex = new Map();

/**
 * Which ledger accounts belong to a petty cash fund. A user without the petty cash right, a slow
 * answer or a failed request all give an empty index, so the list still renders (without badges).
 */
export const usePettyCashAccountIndex = (): { index: PettyCashAccountIndex; isReady: boolean } => {
  const funds = usePettyCashFunds({ limit: 100, sortBy: 'code:asc' });
  const items = funds.isSuccess ? funds.data?.items : undefined;
  const index = useMemo(() => (items ? pettyCashAccountIndex(items) : EMPTY), [items]);
  return { index, isReady: Boolean(items) };
};
