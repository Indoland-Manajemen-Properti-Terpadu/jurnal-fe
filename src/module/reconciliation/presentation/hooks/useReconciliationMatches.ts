import { useState } from 'react';
import { blockedBySharedJournal } from '../../domain/matchGuards';
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
        dayDifference: bankStatement.recommendations[0].dayDifference,
      };
    }
    return { bankStatement, journalTransactions: [], isRecommendation: false };
  });

  const toggleSelection = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

  /** Hides a suggestion on this screen only; nothing is changed on the server. */
  const dismissSuggestion = (bankStatementId: string) => {
    setRemovedRecommendations((prev) => [...prev, bankStatementId]);
    setSelectedIds((prev) => prev.filter((id) => id !== bankStatementId));
  };

  const clearSelection = () => setSelectedIds([]);

  const restoreSuggestions = () => setRemovedRecommendations([]);

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
    // A journal line backs one statement row only; a second row that suggests it is left out
    // here (the screen blocks it too), because the server fails the whole request otherwise.
    const blocked = blockedBySharedJournal(rows, selectedIds, idAccount);
    const matches = rows
      .filter(
        (r) =>
          selectedIds.includes(r.bankStatement.id) &&
          !blocked.has(r.bankStatement.id) &&
          r.journalTransactions.length > 0
      )
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
    dismissedCount: removedRecommendations.length,
    toggleSelection,
    dismissSuggestion,
    clearSelection,
    restoreSuggestions,
    matchManual,
    matchSelected,
  };
};
