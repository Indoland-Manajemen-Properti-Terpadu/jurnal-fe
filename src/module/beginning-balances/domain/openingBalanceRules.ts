import dayjs from 'dayjs';
import { canPublishOpeningBalance } from '@/lib/accounting/journalBalance';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import type {
  BalanceLog,
  DraftBalance,
  BalanceState,
  DateIssue,
  DraftBalanceEntry,
  OpeningFilter,
  OpeningRow,
  SavedBalance,
  SimpleAccount,
} from './beginningBalance';

type OpeningAmounts = { debit?: unknown; credit?: unknown };

/** Opening balance totals as the page shows them; the publish gate needs equal totals above zero. */
export const summarizeOpeningBalance = (rows: OpeningAmounts[]) => {
  const sumDebit = rows.reduce((sum, acc) => sum + (Number(acc.debit) || 0), 0);
  const sumCredit = rows.reduce((sum, acc) => sum + (Number(acc.credit) || 0), 0);
  return {
    totalDebit: sumDebit,
    totalCredit: sumCredit,
    difference: Math.abs(sumDebit - sumCredit),
    isBalanced: canPublishOpeningBalance([{ debit: sumDebit, credit: sumCredit }]),
  };
};

export const getBalanceState = (
  totalDebit: number,
  totalCredit: number,
  isBalanced: boolean
): BalanceState => {
  if (isBalanced) return 'balanced';
  return totalDebit === 0 && totalCredit === 0 ? 'empty' : 'unbalanced';
};

/**
 * What the buttons may do. A draft is work in progress, so it can be saved unbalanced (or empty,
 * which clears it) as long as something changed; publishing needs a balanced total above zero.
 */
export const openingActions = (state: BalanceState, isDirty: boolean, isPublished = false) => ({
  canSaveDraft: isDirty,
  // A published balance is only published again when something changed.
  canPublish: state === 'balanced' && (!isPublished || isDirty),
});

/**
 * A conversion date is refused when it falls in a locked accounting period (`isLocked` of
 * `GET /v1/accounting-periods/check`) or after the first regular journal (`firstTransactionDate`
 * of the draft, when the server sends it). Both are also checked by the server at publish.
 */
export const conversionDateIssue = (
  date: string | null,
  firstTransactionDate: string | Date | null | undefined,
  isLocked: boolean
): DateIssue => {
  if (!date) return null;
  if (isLocked) return 'locked';
  if (firstTransactionDate && dayjs(date).isAfter(dayjs(firstTransactionDate), 'day')) {
    return 'afterFirstTransaction';
  }
  return null;
};

const hasAmount = (entry: DraftBalanceEntry): boolean =>
  (Number(entry.debit) || 0) > 0 || (Number(entry.credit) || 0) > 0;

const isPublishLog = (log: BalanceLog): boolean =>
  log.action === 'PUBLISH' || log.action === 'UPDATE';

/**
 * What the screen starts from. Before a publish the draft is the source. After one, the draft
 * holds the published amounts, but its `period` is still the one of the last draft save (the
 * server logs the published date in the publish log), so the date comes from the latest publish
 * log (`PUBLISH` for the first publish, `UPDATE` for a later one). If the server empties the
 * draft instead (all lines zero), the amounts come from that log too.
 */
export const resolveSavedBalance = (
  draft: DraftBalance | undefined,
  logs: BalanceLog[] | undefined
): SavedBalance => {
  const fromDraft: SavedBalance = {
    period: draft?.period ?? null,
    entries: draft?.accounts ?? [],
  };
  const isPublished = Boolean(draft?.isPublished || draft?.publishedDate);
  if (!isPublished) return fromDraft;

  const latest = (logs ?? [])
    .filter(isPublishLog)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  if (!latest) return fromDraft;

  const period = latest.period ?? fromDraft.period;
  if (fromDraft.entries.some(hasAmount)) return { period, entries: fromDraft.entries };
  return {
    period,
    entries: (latest.balances ?? []).map((line) => ({
      _id: typeof line.account === 'string' ? line.account : line.account?.id || line.account?._id,
      debit: line.debit,
      credit: line.credit,
    })),
  };
};

/** The class of an account is the first digit of its code (1 asset ... 8 other expense). */
export const accountClassOf = (accountNumber: string): number | null => {
  const digit = Number(accountNumber.trim().charAt(0));
  return digit >= 1 && digit <= 8 ? digit : null;
};

const toRow = (account: SimpleAccount): OpeningRow => ({
  id: account.id,
  name: account.name,
  accountNumber: account.accountNumber,
  normalSide: isDebitNormal({ isDebit: account.type === 'debit', isContra: account.isContra })
    ? 'debit'
    : 'credit',
  isContra: account.isContra,
  debit: 0,
  credit: 0,
});

const entryId = (entry: DraftBalanceEntry): string => entry._id || entry.id || '';

/** Classes 1, 5, 6 and 8 grow on the debit side; it is only a fallback for an account the list lacks. */
const fallbackSide = (accountNumber: string): 'debit' | 'credit' =>
  [1, 5, 6, 8].includes(accountClassOf(accountNumber) ?? 0) ? 'debit' : 'credit';

/**
 * The table rows: every account of the simple list, with the amounts of the saved draft laid over
 * it. A draft line with an amount for an account the list does not have is kept, so the totals
 * the user sees are the totals that are saved.
 */
export const buildOpeningRows = (
  accounts: SimpleAccount[],
  entries: DraftBalanceEntry[]
): OpeningRow[] => {
  const byId = new Map(entries.map((entry) => [entryId(entry), entry]));
  const rows = accounts.map((account) => {
    const saved = byId.get(account.id);
    return {
      ...toRow(account),
      debit: Number(saved?.debit) || 0,
      credit: Number(saved?.credit) || 0,
    };
  });
  const known = new Set(accounts.map((account) => account.id));
  entries.forEach((entry) => {
    const id = entryId(entry);
    const debit = Number(entry.debit) || 0;
    const credit = Number(entry.credit) || 0;
    if (!id || known.has(id) || (debit === 0 && credit === 0)) return;
    const accountNumber = entry.accountNumber || '';
    rows.push({
      id,
      name: entry.name || accountNumber,
      accountNumber,
      normalSide: fallbackSide(accountNumber),
      isContra: false,
      debit,
      credit,
    });
  });
  return rows;
};

/** Search by code or name, one class, and only the rows with an amount. */
export const filterOpeningRows = (rows: OpeningRow[], filter: OpeningFilter): OpeningRow[] => {
  const query = filter.query.toLowerCase().trim();
  return rows.filter((row) => {
    if (query && !`${row.accountNumber} ${row.name}`.toLowerCase().includes(query)) return false;
    if (filter.accountClass !== null && accountClassOf(row.accountNumber) !== filter.accountClass) {
      return false;
    }
    if (filter.onlyFilled && row.debit === 0 && row.credit === 0) return false;
    return true;
  });
};

/**
 * Parses an amount typed or pasted in the Indonesian format into a number rounded to the cent.
 * A comma is the decimal mark and dots group thousands (`1.500,50` is 1500.5); a dot followed by
 * one or two final digits is read as a decimal point (`1500.5`); any other dot is a thousands
 * separator (`1.500.000`). Everything else that is not a digit is dropped, and a negative sign is
 * ignored because the side (debit or credit) carries the direction.
 */
export const parseAmountEntry = (raw: string): number => {
  const text = raw.replace(/[^\d.,]/g, '');
  let normalized: string;
  if (text.includes(',')) {
    normalized = text.replace(/\./g, '').replace(',', '.');
  } else if (/^\d+\.\d{1,2}$/.test(text)) {
    normalized = text;
  } else {
    normalized = text.replace(/\./g, '');
  }
  const value = Number(normalized.replace(/(\..*)\./g, '$1'));
  if (!Number.isFinite(value)) return 0;
  return Math.round(Number((value * 100).toPrecision(15))) / 100;
};

/**
 * The text of an amount field while it is typed: thousands grouped with dots, the decimal part
 * after a comma and cut to two digits (`200000` becomes `200.000`, `1500,5` becomes `1.500,5`).
 * A trailing comma is kept so a decimal can be typed. Anything that is not a digit or a comma is
 * dropped, so a dot the user types or leaves behind after a delete is never read as a decimal.
 */
export const formatAmountInput = (raw: string): string => {
  const cleaned = raw.replace(/[^\d,]/g, '');
  if (cleaned === '') return '';
  const comma = cleaned.indexOf(',');
  const integerDigits = (comma === -1 ? cleaned : cleaned.slice(0, comma)).replace(/^0+(?=\d)/, '');
  const integer = (integerDigits || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (comma === -1) return integer;
  const decimals = cleaned
    .slice(comma + 1)
    .replace(/,/g, '')
    .slice(0, 2);
  return `${integer},${decimals}`;
};

/** Typed entry: parsed to the cent; entering a positive value clears the other side. */
export const applyAmountEntry = (
  rows: OpeningRow[],
  accountId: string,
  field: 'debit' | 'credit',
  raw: string
): OpeningRow[] => {
  const value = parseAmountEntry(raw);
  const opposite = field === 'debit' ? 'credit' : 'debit';
  return rows.map((row) =>
    row.id === accountId
      ? { ...row, [field]: value, [opposite]: value > 0 ? 0 : row[opposite] }
      : row
  );
};

export const clearAccountRow = (rows: OpeningRow[], accountId: string): OpeningRow[] =>
  rows.map((row) => (row.id === accountId ? { ...row, debit: 0, credit: 0 } : row));

export const clearAllRows = (rows: OpeningRow[]): OpeningRow[] =>
  rows.map((row) => ({ ...row, debit: 0, credit: 0 }));

export interface BalanceLine {
  account: string;
  debit?: number;
  credit?: number;
}

/** Only the accounts with an amount, and for each only the side that has one. */
export const buildBalanceLines = (rows: OpeningRow[]): BalanceLine[] =>
  rows
    .filter((row) => row.debit > 0 || row.credit > 0)
    .map((row) => ({
      account: row.id,
      ...(row.debit > 0 ? { debit: row.debit } : {}),
      ...(row.credit > 0 ? { credit: row.credit } : {}),
    }));

/** Same body for the draft and for the publish. */
export const buildBalancePayload = (rows: OpeningRow[], period: string) => ({
  period,
  balances: buildBalanceLines(rows),
});

/** A stable text of what would be saved, to tell whether the screen differs from the saved draft. */
export const balanceSignature = (rows: OpeningRow[], period: string | null): string =>
  JSON.stringify({ period, lines: buildBalanceLines(rows) });
