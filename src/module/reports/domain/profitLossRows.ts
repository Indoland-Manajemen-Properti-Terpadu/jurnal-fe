import type { ProfitLossRow } from './profitLoss.types';

/** What a total or profit line is, found from its place in the statement. */
export type ProfitLossRole =
  | 'total.revenue'
  | 'total.directCost'
  | 'total.opex'
  | 'total.otherIncome'
  | 'total.otherExpense'
  | 'total.tax'
  | 'profit.gross'
  | 'profit.afterOpex'
  | 'profit.nett'
  | 'profit.afterTax'
  | 'title.tax';

export interface ProfitLossLine extends ProfitLossRow {
  /** Set when the line is one of the known totals, so the screen can use its own wording. */
  role?: ProfitLossRole;
  /** On a subtotal: the group (parent account) it adds up, so the line can say what it totals. */
  groupLabel?: string;
  /** On an account with no parent: it stands alone, outside any group above it. */
  standalone?: boolean;
}

const TOTAL_ROLES: ProfitLossRole[] = [
  'total.revenue',
  'total.directCost',
  'total.opex',
  'total.otherIncome',
  'total.otherExpense',
  'total.tax',
];
const PROFIT_ROLES: ProfitLossRole[] = [
  'profit.gross',
  'profit.afterOpex',
  'profit.nett',
  'profit.afterTax',
];

const TOTAL_BY_KEY: Record<string, ProfitLossRole> = {
  revenue: 'total.revenue',
  directCost: 'total.directCost',
  opex: 'total.opex',
  otherIncome: 'total.otherIncome',
  otherExpense: 'total.otherExpense',
  tax: 'total.tax',
};
const PROFIT_BY_KEY: Record<string, ProfitLossRole> = {
  grossProfit: 'profit.gross',
  profitAfterOpex: 'profit.afterOpex',
  profitNett: 'profit.nett',
  profitAfterTax: 'profit.afterTax',
};

/**
 * What a total, profit or title line is, from the `key` the server puts on it. Returns `null`
 * when no line carries a key (an older server), so the order is used instead.
 */
const rolesFromKeys = (rows: ProfitLossRow[]): ProfitLossLine[] | null => {
  const keyed = rows.some((row) => row.type !== 'blank' && row.key !== null);
  if (!keyed) return null;
  return rows.map((row) => {
    if (row.type === 'account') return { ...row, standalone: row.parentId === null };
    if (row.type === 'total' && row.key) return { ...row, role: TOTAL_BY_KEY[row.key] };
    if (row.type === 'profit' && row.key) return { ...row, role: PROFIT_BY_KEY[row.key] };
    if (row.type === 'title' && row.key === 'tax') return { ...row, role: 'title.tax' as const };
    return { ...row };
  });
};

/**
 * The server marks each total and profit line with a `key`, and that is what names them. An
 * older server sends no key; then the fixed order is read instead: six totals (revenue, direct cost, operating
 * expense, other income, other expense, tax) and four profit lines (gross, after operating
 * expense, nett, after tax). Reading them by position lets the screen use its own wording instead
 * of the server's mixed-language captions. If the counts differ, the server's captions are kept.
 */
export const assignRoles = (rows: ProfitLossRow[]): ProfitLossLine[] => {
  const keyed = rolesFromKeys(rows);
  if (keyed) return keyed;
  const totals = rows.filter((row) => row.type === 'total');
  const profits = rows.filter((row) => row.type === 'profit');
  const titles = rows.filter((row) => row.type === 'title');
  const known =
    totals.length === TOTAL_ROLES.length &&
    profits.length === PROFIT_ROLES.length &&
    titles.length <= 1;
  if (!known) return rows.map((row) => ({ ...row }));

  const next = { total: 0, profit: 0 };
  return rows.map((row) => {
    if (row.type === 'total') {
      const role = TOTAL_ROLES[next.total];
      next.total += 1;
      return { ...row, role };
    }
    if (row.type === 'profit') {
      const role = PROFIT_ROLES[next.profit];
      next.profit += 1;
      return { ...row, role };
    }
    if (row.type === 'title') return { ...row, role: 'title.tax' as const };
    return { ...row };
  });
};

export interface VisibleLines {
  lines: ProfitLossLine[];
  /** Accounts shown. */
  accountCount: number;
}

const matches = (row: ProfitLossRow, term: string) =>
  row.accountNumber.toLowerCase().includes(term) || row.label.toLowerCase().includes(term);

/**
 * The lines to draw: every account, with or without a balance. A search keeps the accounts that
 * match; a group head shows only with an account under it, and a subtotal only after a group that
 * has one. Totals and profit lines always stay: they are the statement itself.
 */
export const visibleLines = (
  lines: ProfitLossLine[],
  options: { search: string }
): VisibleLines => {
  const term = options.search.trim().toLowerCase();
  const out: ProfitLossLine[] = [];
  const headLabels = new Map(
    lines
      .filter((line) => line.type === 'head' && line.accountId)
      .map((l) => [l.accountId, l.label])
  );
  let head: ProfitLossLine | null = null;
  let groupLabel = '';
  let groupAccounts = 0;
  let accountCount = 0;

  for (const line of lines) {
    switch (line.type) {
      case 'head':
        head = line;
        groupLabel = line.label;
        groupAccounts = 0;
        break;
      case 'account':
        if (term && !matches(line, term)) break;
        if (head) {
          out.push(head);
          head = null;
        }
        out.push(line);
        groupAccounts += 1;
        accountCount += 1;
        break;
      case 'subtotal':
        if (groupAccounts > 0) {
          out.push({ ...line, groupLabel: headLabels.get(line.groupId ?? '') ?? groupLabel });
        }
        head = null;
        groupLabel = '';
        groupAccounts = 0;
        break;
      default:
        head = null;
        groupAccounts = 0;
        out.push(line);
    }
  }

  // A search leaves the totals as they are but drops blank lines that no longer separate anything.
  const compact = out.filter((line, index) => {
    if (line.type !== 'blank') return true;
    const previous = out[index - 1];
    return Boolean(previous) && previous.type !== 'blank';
  });
  return { lines: compact, accountCount };
};

/** A profit as a share of revenue, in percent; `null` when there is no revenue to compare to. */
export const marginOf = (profit: number, revenue: number): number | null =>
  revenue > 0 ? (profit / revenue) * 100 : null;
