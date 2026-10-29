import type { Result } from '../domain/bankStatement';

type RawStatement = Record<string, unknown>;

const asRows = (value: unknown): RawStatement[] | null => (Array.isArray(value) ? value : null);

/** The list endpoint answers in several shapes; the first one that holds an array wins. */
const pickRows = (response: unknown): RawStatement[] => {
  const root = (response ?? {}) as Record<string, unknown>;
  const data = (root.data ?? {}) as Record<string, unknown>;
  return (
    asRows(data.results) ??
    asRows(data.resultTransaction) ??
    asRows(root.results) ??
    asRows(root.data) ??
    asRows(response) ??
    []
  );
};

/**
 * The bank amount is signed: a positive amount is money received (debit side), a negative one is
 * money spent (credit side, stored as a positive number).
 */
export const toStatementRows = (response: unknown): Result[] =>
  pickRows(response).map((item) => {
    const amount = Number(item.amount);
    return {
      ...item,
      transactionName: item.description || item.transactionName,
      transactionDate: item.date || item.transactionDate,
      debit: amount > 0 ? amount : 0,
      credit: amount < 0 ? Math.abs(amount) : 0,
      reconciled: item.isReconciled ?? item.reconciled,
    } as Result;
  });
