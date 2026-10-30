import { useBankStatement } from '@/module/bank-statements';
import { useReconciliation } from '@/module/reconciliation';
import { countStatements, countUnreconciled } from '../../domain/ledgerSummary';

/**
 * Reconciliation and bank statement figures of a cash/bank account. Both queries are disabled
 * (empty id) for the other variant, so a non cash/bank ledger never calls those endpoints.
 */
export const useCashBankSummary = (idAccount: string, enabled: boolean) => {
  const queryId = enabled ? idAccount : '';
  const { data: reconciliation } = useReconciliation(queryId);
  const { data: bankStatement } = useBankStatement(queryId);

  return {
    unreconciledCount: countUnreconciled(reconciliation),
    statementCount: countStatements(bankStatement),
    bankBalance: reconciliation?.balance,
  };
};
