import {
  summarizeStatements,
  useBankStatement,
  type BankStatementRow,
} from '@/module/bank-statements';
import { useReconciliation } from '@/module/reconciliation';
import { countStatements, countUnreconciled } from '../../domain/ledgerSummary';

/**
 * Reconciliation and bank statement figures of a cash/bank account. Both queries are disabled
 * (empty id) for the other variant, so a non cash/bank ledger never calls those endpoints.
 *
 * The reconciliation list holds only the rows that are not matched yet, so "no statements at
 * all" comes from the statement list, which keeps the matched rows too.
 */
export const useCashBankSummary = (idAccount: string, enabled: boolean) => {
  const queryId = enabled ? idAccount : '';
  const { data: reconciliation } = useReconciliation(queryId);
  const { data: bankStatement } = useBankStatement(queryId);
  const rows = (bankStatement?.results || bankStatement?.resultTransaction || []).filter(
    (row): row is BankStatementRow => Boolean(row)
  );

  return {
    unreconciledCount: countUnreconciled(reconciliation),
    unreconciledJournals: reconciliation?.unreconciledJournalDetails?.length ?? 0,
    statementCount: countStatements(bankStatement),
    statementNet: summarizeStatements(rows).net,
  };
};
