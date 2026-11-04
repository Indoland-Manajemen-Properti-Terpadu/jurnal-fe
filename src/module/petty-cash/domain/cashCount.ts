import { sumMinor, toMinor } from '@/lib/money/money';
import type { VarianceType } from '@/module/petty-cash/domain/pettyCashEntities';

/** Denominations the backend accepts; any other key is refused. */
export const NOTE_VALUES = [100000, 50000, 20000, 10000, 5000, 2000, 1000] as const;
export const COIN_VALUES = [1000, 500, 200, 100] as const;

/** More pieces than this cannot be a real count and would overflow the arithmetic. */
export const MAX_PIECES = 1_000_000;

export interface CountDraft {
  notes: Record<string, number | ''>;
  coins: Record<string, number | ''>;
  /** Balance typed per non-cash pocket (pocket code to rupiah), taken from the statement or app. */
  nonCash: Record<string, number | ''>;
  witnessId: string | null;
  reason: string;
}

export interface CountInput {
  witnessedBy?: string;
  denominations: Record<string, number | Record<string, number>> & {
    coins: Record<string, number>;
  };
  /** One balance per active non-cash pocket; left out when the fund has none. */
  nonCashBalances?: { pocket: string; balance: number }[];
  reason?: string;
}

const blank = (values: readonly number[]) =>
  Object.fromEntries(values.map((value) => [String(value), '' as number | '']));

export const emptyCountDraft = (pocketCodes: string[] = []): CountDraft => ({
  notes: blank(NOTE_VALUES),
  coins: blank(COIN_VALUES),
  nonCash: Object.fromEntries(pocketCodes.map((code) => [code, '' as number | ''])),
  witnessId: null,
  reason: '',
});

const usablePieces = (pieces: number | ''): number =>
  typeof pieces === 'number' && Number.isInteger(pieces) && pieces >= 0 && pieces <= MAX_PIECES
    ? pieces
    : 0;

const sumGroup = (group: Record<string, number | ''>) =>
  sumMinor(
    Object.entries(group).map(([value, pieces]) => toMinor(Number(value) * usablePieces(pieces)))
  );

/** Subtotal of one denomination row; a quantity that is not usable counts as nothing. */
export const pieceSubtotal = (value: number, pieces: number | ''): number =>
  toMinor(value * usablePieces(pieces)) / 100;

/** Money in the box: pieces times denomination. A quantity that is not usable counts as nothing. */
export const countedTotal = (draft: CountDraft): number =>
  (sumGroup(draft.notes) + sumGroup(draft.coins)) / 100;

/**
 * What the box should hold, the way the backend works it out: the ceiling minus the vouchers
 * waiting for replenishment and the advances still out. Only an estimate for the form; the saved
 * count carries the backend's own figure.
 */
export const expectedCashEstimate = (fund: {
  pagu: number;
  pendingVoucherAmount: number;
  outstandingAdvanceAmount: number;
}): number =>
  (toMinor(fund.pagu) -
    toMinor(fund.pendingVoucherAmount) -
    toMinor(fund.outstandingAdvanceAmount)) /
  100;

/** A typed pocket balance that can be counted: a finite, non-negative whole rupiah amount. */
const usableBalance = (balance: number | ''): number =>
  typeof balance === 'number' && Number.isSafeInteger(balance) && balance >= 0 ? balance : 0;

/** Money found in the non-cash pockets, as typed. Unusable entries count as nothing. */
export const nonCashTotal = (draft: CountDraft): number =>
  sumMinor(Object.values(draft.nonCash).map((balance) => toMinor(usableBalance(balance)))) / 100;

/** Cash in the box plus the balances of the other pockets. */
export const countedGrandTotal = (draft: CountDraft): number =>
  (toMinor(countedTotal(draft)) + toMinor(nonCashTotal(draft))) / 100;

/** Typed balance of one pocket against the balance in the books (an estimate until saved). */
export const pocketVariance = (
  typed: number | '',
  bookBalance: number
): { amount: number; type: VarianceType } => variancePreview(usableBalance(typed), bookBalance);

export const variancePreview = (
  counted: number,
  expected: number
): { amount: number; type: VarianceType } => {
  const amount = (toMinor(counted) - toMinor(expected)) / 100;
  if (amount < 0) {
    return { amount, type: 'SHORT' };
  }
  return { amount, type: amount > 0 ? 'OVER' : 'BALANCED' };
};

export type CountIssueCode =
  | 'REQUIRED'
  | 'INVALID_QUANTITY'
  | 'NEGATIVE'
  | 'WHOLE_RUPIAH'
  | 'NOTHING_COUNTED'
  | 'REASON_REQUIRED';

export interface CountDraftIssue {
  path: string;
  code: CountIssueCode;
}

const invalidQuantity = (pieces: number | '') =>
  pieces !== '' && !(Number.isInteger(pieces) && pieces >= 0 && pieces <= MAX_PIECES);

export const validateCountDraft = (
  draft: CountDraft,
  options: { witnessRequired: boolean; varianceNonZero: boolean; nonCashPockets?: string[] }
): CountDraftIssue[] => {
  const issues: CountDraftIssue[] = [];
  if (options.witnessRequired && !draft.witnessId) {
    issues.push({ path: 'witnessId', code: 'REQUIRED' });
  }

  Object.entries(draft.notes).forEach(([value, pieces]) => {
    if (invalidQuantity(pieces)) {
      issues.push({ path: `notes.${value}`, code: 'INVALID_QUANTITY' });
    }
  });
  Object.entries(draft.coins).forEach(([value, pieces]) => {
    if (invalidQuantity(pieces)) {
      issues.push({ path: `coins.${value}`, code: 'INVALID_QUANTITY' });
    }
  });
  (options.nonCashPockets ?? []).forEach((code) => {
    const balance = draft.nonCash[code];
    if (balance === '' || balance === undefined) {
      issues.push({ path: `nonCash.${code}`, code: 'REQUIRED' });
    } else if (balance < 0) {
      issues.push({ path: `nonCash.${code}`, code: 'NEGATIVE' });
    } else if (!Number.isSafeInteger(balance)) {
      issues.push({ path: `nonCash.${code}`, code: 'WHOLE_RUPIAH' });
    }
  });
  const typedNonCash = Object.values(draft.nonCash).some((balance) => balance !== '');
  if (
    issues.every((issue) => issue.code !== 'INVALID_QUANTITY') &&
    !typedNonCash &&
    countedGrandTotal(draft) === 0
  ) {
    issues.push({ path: 'notes', code: 'NOTHING_COUNTED' });
  }
  if (options.varianceNonZero && draft.reason.trim() === '') {
    issues.push({ path: 'reason', code: 'REASON_REQUIRED' });
  }
  return issues;
};

const piecesOf = (group: Record<string, number | ''>) =>
  Object.fromEntries(Object.entries(group).map(([value, pieces]) => [value, usablePieces(pieces)]));

/** Every denomination is sent (zero when nothing was counted); witness and reason only when filled in. */
export const toCountInput = (draft: CountDraft, nonCashPockets: string[] = []): CountInput => {
  const input: CountInput = {
    denominations: { ...piecesOf(draft.notes), coins: piecesOf(draft.coins) },
  };
  if (nonCashPockets.length > 0) {
    input.nonCashBalances = nonCashPockets.map((pocket) => ({
      pocket,
      balance: usableBalance(draft.nonCash[pocket] ?? ''),
    }));
  }
  if (draft.witnessId) input.witnessedBy = draft.witnessId;
  if (draft.reason.trim()) input.reason = draft.reason.trim();
  return input;
};

export interface DenominationRow {
  kind: 'note' | 'coin';
  value: number;
  pieces: number;
  subtotal: number;
}

/** The pieces of a stored count as rows (banknotes first, largest value first), skipping empty ones. */
export const denominationRows = (denominations: {
  notes: Record<string, number>;
  coins: Record<string, number>;
}): DenominationRow[] => {
  const rows = (group: Record<string, number>, kind: DenominationRow['kind']) =>
    Object.entries(group)
      .map(([value, pieces]) => ({
        kind,
        value: Number(value),
        pieces,
        subtotal: toMinor(Number(value) * pieces) / 100,
      }))
      .filter((row) => row.pieces > 0)
      .sort((a, b) => b.value - a.value);
  return [...rows(denominations.notes, 'note'), ...rows(denominations.coins, 'coin')];
};
