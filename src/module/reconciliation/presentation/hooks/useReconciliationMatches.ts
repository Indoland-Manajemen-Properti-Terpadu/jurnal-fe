import { useState } from 'react';
import { buildMatch } from '../../domain/matchRules';
import type {
  BankStatementData,
  GetReconciliationModel,
  JournalDetail,
  ReconciliationRow,
} from '../../domain/reconciliation';
import { useMatchReconciliation } from './useMatchReconciliation';

/**
 * Selection and match state of the reconciliation table.
 * A statement shows its matched journal, else the server recommendations (until the user removes
 * them), else nothing. Auto-match (`matchSelected`) sends the shown rows with no client check.
 */
export const useReconciliationMatches = (
  idAccount: string | undefined,
  data: GetReconciliationModel | undefined,
  refetch: () => unknown
) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removedRecommendations, setRemovedRecommendations] = useState<string[]>([]);
  const { mutate: matchRecon, isPending: isMatching } = useMatchReconciliation();

  const rows: ReconciliationRow[] = (data?.bankStatements ?? []).map((bankStatement) => {
    if (bankStatement.matchedJournalDetail) {
      return {
        bankStatement,
        journalTransactions: [bankStatement.matchedJournalDetail],
        isRecommendation: false,
      };
    }
    if (
      bankStatement.recommendations?.length &&
      !removedRecommendations.includes(bankStatement.id)
    ) {
      return {
        bankStatement,
        journalTransactions: bankStatement.recommendations.map((rec) => rec.journalDetail),
        isRecommendation: true,
      };
    }
    return { bankStatement, journalTransactions: [], isRecommendation: false };
  });

  const toggleSelection = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  const removeMatch = (bankStatementId: string) => {
    setRemovedRecommendations((prev) => [...prev, bankStatementId]);
    setSelectedIds((prev) => prev.filter((id) => id !== bankStatementId));
  };

  const reset = () => {
    setSelectedIds([]);
    setRemovedRecommendations([]);
  };

  const matchManual = (bankStatement: BankStatementData, journals: JournalDetail[]) => {
    matchRecon(
      { matches: [buildMatch(bankStatement, journals, idAccount)] },
      {
        onSuccess: () => {
          setSelectedIds([]);
          refetch();
        },
      }
    );
  };

  const matchSelected = () => {
    const matches = rows
      .filter((r) => selectedIds.includes(r.bankStatement.id) && r.journalTransactions.length > 0)
      .map((r) => buildMatch(r.bankStatement, r.journalTransactions, idAccount));
    if (matches.length === 0) return;
    matchRecon(
      { matches },
      {
        onSuccess: () => {
          setRemovedRecommendations([]);
          setSelectedIds([]);
          refetch();
        },
      }
    );
  };

  return {
    rows,
    selectedIds,
    isMatching,
    toggleSelection,
    removeMatch,
    reset,
    matchManual,
    matchSelected,
  };
};
