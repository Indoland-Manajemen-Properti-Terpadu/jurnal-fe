import { resolveJournalDetailId } from './matchRules';
import type { ReconciliationRow } from './reconciliation';

/**
 * A journal line can back only one statement row. When two selected rows suggest the same line,
 * the server fails the whole request, so the screen keeps the first selected row and blocks the
 * others. Returns the ids of the rows that are blocked.
 */
export const blockedBySharedJournal = (
  rows: readonly ReconciliationRow[],
  selectedIds: readonly string[],
  idAccount: string | undefined
): Set<string> => {
  const taken = new Map<string, string>();
  const blocked = new Set<string>();
  selectedIds.forEach((selectedId) => {
    const row = rows.find((item) => item.bankStatement.id === selectedId);
    if (!row) return;
    const ids = row.journalTransactions.map((journal) =>
      resolveJournalDetailId(journal, idAccount)
    );
    if (ids.some((id) => taken.has(id) && taken.get(id) !== selectedId)) {
      blocked.add(selectedId);
      return;
    }
    ids.forEach((id) => taken.set(id, selectedId));
  });
  return blocked;
};

/** Rows that suggest a journal line another row also suggests, so the user can see the overlap. */
export const rowsSharingSuggestion = (
  rows: readonly ReconciliationRow[],
  idAccount: string | undefined
): Set<string> => {
  const owners = new Map<string, string[]>();
  rows.forEach((row) =>
    row.journalTransactions.forEach((journal) => {
      const id = resolveJournalDetailId(journal, idAccount);
      owners.set(id, [...(owners.get(id) ?? []), row.bankStatement.id]);
    })
  );
  const shared = new Set<string>();
  owners.forEach((statementIds) => {
    if (statementIds.length > 1) statementIds.forEach((id) => shared.add(id));
  });
  return shared;
};
