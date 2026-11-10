import type { ProfitLossRow, ProfitLossRowType } from './profitLoss.types';
import { assignRoles, marginOf, visibleLines } from './profitLossRows';

const row = (
  type: ProfitLossRowType,
  label: string,
  amount: number | null = null,
  accountNumber = '',
  extra: Partial<ProfitLossRow> = {}
): ProfitLossRow => ({
  type,
  label,
  amount,
  accountNumber,
  isContra: false,
  key: null,
  accountId: '',
  groupId: null,
  parentId: null,
  ...extra,
});

/** The statement in the order the server prints it, with every total and profit line. */
const statement = (): ProfitLossRow[] => [
  row('head', 'Pendapatan', null, '4-10000'),
  row('account', 'Penjualan', 500, '4-10001'),
  row('account', 'Jasa', 0, '4-10002'),
  row('subtotal', 'SUB TOTAL', 500),
  row('head', 'Pend. Lainnya', null, '4-20000'),
  row('account', 'Fitt Out', 0, '4-20001'),
  row('subtotal', 'SUB TOTAL', 0),
  row('total', 'TOTAL PENDAPATAN', 500),
  row('total', 'TOTAL BEBAN LANGSUNG', 0),
  row('profit', 'PROFIT/ LOSS GROSS', 500),
  row('blank', ''),
  row('head', 'Beban Operasional', null, '6-10000'),
  row('account', 'Listrik', 120, '6-10001'),
  row('subtotal', 'SUB TOTAL', 120),
  row('total', 'TOTAL BEBAN OPERASIONAL', 120),
  row('profit', 'PROFIT/LOSS AFTER OPEX', 380),
  row('blank', ''),
  row('total', 'TOTAL OTHER INCOME', 0),
  row('total', 'TOTAL OTHER EXPENSES', 0),
  row('profit', 'PROFIT/ LOSS NETT', 380),
  row('blank', ''),
  row('title', 'TAXES'),
  row('total', 'TOTAL TAXES', 0),
  row('profit', 'PROFIT/LOSS AFTER TAX', 380),
];

describe('assignRoles from the keys the server sends', () => {
  const keyed = (): ProfitLossRow[] => [
    row('total', 'x', 1, '', { key: 'revenue' }),
    row('profit', 'x', 1, '', { key: 'profitNett' }),
    row('title', 'PAJAK', null, '', { key: 'tax' }),
    row('total', 'x', 0, '', { key: 'tax' }),
    row('profit', 'x', 1, '', { key: 'profitAfterTax' }),
  ];

  it('names each line by its key, whatever the order', () => {
    const roles = assignRoles(keyed()).map((line) => line.role);
    expect(roles).toEqual([
      'total.revenue',
      'profit.nett',
      'title.tax',
      'total.tax',
      'profit.afterTax',
    ]);
    expect(assignRoles([...keyed()].reverse())[0].role).toBe('profit.afterTax');
  });

  it('leaves a line with an unknown key to the server caption', () => {
    const [line] = assignRoles([row('total', 'TOTAL BARU', 5, '', { key: 'somethingNew' })]);
    expect(line.role).toBeUndefined();
  });
});

describe('standalone accounts', () => {
  const stream = (): ProfitLossRow[] => [
    row('head', 'Pendapatan', null, '4-10000', { accountId: 'h1', key: null }),
    row('account', 'Penjualan', 5, '4-10001', { parentId: 'h1' }),
    row('subtotal', 'SUB TOTAL', 5, '', { groupId: 'h1' }),
    row('account', 'Pendapatan sewa', 0, '4-20013', { parentId: null }),
    row('total', 'x', 5, '', { key: 'revenue' }),
  ];

  it('flags an account with no parent, and not one under a head', () => {
    const accounts = assignRoles(stream()).filter((line) => line.type === 'account');
    expect(accounts.map((line) => [line.label, line.standalone])).toEqual([
      ['Penjualan', false],
      ['Pendapatan sewa', true],
    ]);
  });

  it('flags nothing for a server that sends no markers', () => {
    const old = stream().map((line) => ({ ...line, key: null }));
    expect(assignRoles(old).some((line) => line.standalone)).toBe(false);
  });
});

describe('assignRoles', () => {
  it('names the six totals and the four profit lines by their place', () => {
    const roles = assignRoles(statement())
      .filter((line) => line.role)
      .map((line) => line.role);
    expect(roles).toEqual([
      'total.revenue',
      'total.directCost',
      'profit.gross',
      'total.opex',
      'profit.afterOpex',
      'total.otherIncome',
      'total.otherExpense',
      'profit.nett',
      'title.tax',
      'total.tax',
      'profit.afterTax',
    ]);
  });

  it('keeps the server captions when the shape is not the known one', () => {
    const odd = statement().filter((line) => line.label !== 'TOTAL TAXES');
    expect(assignRoles(odd).every((line) => line.role === undefined)).toBe(true);
  });
});

describe('visibleLines', () => {
  const lines = () => assignRoles(statement());

  it('shows every account, with or without a balance, under its group', () => {
    const { lines: shown, accountCount } = visibleLines(lines(), { search: '' });
    const labels = shown.map((line) => line.label);
    expect(labels).toEqual(
      expect.arrayContaining(['Pendapatan', 'Penjualan', 'Jasa', 'Pend. Lainnya', 'Fitt Out'])
    );
    expect(shown.filter((line) => line.type === 'subtotal')).toHaveLength(3);
    expect(accountCount).toBe(4);
  });

  it('names the group each subtotal adds up', () => {
    const { lines: shown } = visibleLines(lines(), { search: '' });
    expect(shown.filter((line) => line.type === 'subtotal').map((line) => line.groupLabel)).toEqual(
      ['Pendapatan', 'Pend. Lainnya', 'Beban Operasional']
    );
  });

  it('keeps every total and profit line', () => {
    const { lines: shown } = visibleLines(lines(), { search: '' });
    expect(shown.filter((line) => line.type === 'total')).toHaveLength(6);
    expect(shown.filter((line) => line.type === 'profit')).toHaveLength(4);
  });

  it('finds an account by number or name and keeps only the groups that have a match', () => {
    const byName = visibleLines(lines(), { search: 'jasa' });
    expect(byName.accountCount).toBe(1);
    const labels = byName.lines.map((line) => line.label);
    expect(labels).toEqual(expect.arrayContaining(['Pendapatan', 'Jasa']));
    expect(labels).not.toContain('Pend. Lainnya');
    expect(visibleLines(lines(), { search: '6-10001' }).accountCount).toBe(1);
    expect(visibleLines(lines(), { search: 'tidak ada' }).accountCount).toBe(0);
  });

  it('names a subtotal after the head its groupId points to', () => {
    const grouped = assignRoles([
      row('head', 'Pendapatan', null, '4-10000', { accountId: 'h1' }),
      row('account', 'Penjualan', 5, '4-10001', { parentId: 'h1' }),
      row('subtotal', 'SUB TOTAL', 5, '', { groupId: 'h1' }),
      row('head', 'Pend. Lainnya', null, '4-20000', { accountId: 'h2' }),
      row('account', 'Fitt Out', 7, '4-20001', { parentId: 'h2' }),
      row('subtotal', 'SUB TOTAL', 7, '', { groupId: 'h2' }),
    ]);
    const { lines: shown } = visibleLines(grouped, { search: '' });
    const subtotals = shown.filter((line) => line.type === 'subtotal');
    expect(subtotals.map((line) => line.groupLabel)).toEqual(['Pendapatan', 'Pend. Lainnya']);
  });

  it('does not stack blank lines', () => {
    const { lines: shown } = visibleLines(lines(), { search: 'jasa' });
    shown.forEach((line, index) => {
      if (line.type === 'blank') expect(shown[index - 1]?.type).not.toBe('blank');
    });
  });
});

describe('marginOf', () => {
  it('is the share of revenue in percent, and null without revenue', () => {
    expect(marginOf(250, 1000)).toBe(25);
    expect(marginOf(-100, 1000)).toBe(-10);
    expect(marginOf(100, 0)).toBeNull();
  });
});
