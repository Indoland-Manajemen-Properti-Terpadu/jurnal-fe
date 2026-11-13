import {
  buildAccountTree,
  collectCategoryNames,
  collectParentIds,
  flattenVisibleRows,
  isFilterActive,
  selectableInTree,
  withClassGroups,
  type AccountFilter,
} from './accountTree';
import type { JournalAccounts } from './journalAccount';

const account = (overrides: Partial<JournalAccounts>): JournalAccounts => ({
  id: 'x',
  name: 'Akun',
  amount: 0,
  debit: 0,
  credit: 0,
  ...overrides,
});

const all: AccountFilter = { tab: 'all', category: null, search: '' };

// Locked cash parent with a mix of locked and open sub accounts, plus an open parent that
// holds one locked sub account.
const accounts = [
  account({
    id: 'kas',
    name: 'Kas Dan Setara Kas',
    accountNumber: '1-10000',
    isLocked: 'true',
    isBankAndCash: true,
    category: { name: 'Kas & Bank' },
    subAccount: [
      account({
        id: 'kecil',
        name: 'Kas Kecil',
        accountNumber: '1-10001',
        isLocked: 'true',
        isBankAndCash: true,
        category: { name: 'Kas & Bank' },
      }),
      account({
        id: 'midtrans',
        name: 'Midtrans',
        accountNumber: '1-10005',
        isBankAndCash: true,
        category: { name: 'Kas & Bank' },
      }),
    ],
  }),
  account({
    id: 'aset',
    name: 'Aset Tetap',
    accountNumber: '1-20000',
    category: { name: 'Aset Tetap' },
    subAccount: [
      account({
        id: 'tanah',
        name: 'Tanah',
        accountNumber: '1-20001',
        isLocked: 'true',
        category: { name: 'Aset Tetap' },
      }),
      account({ id: 'gedung', name: 'Gedung', accountNumber: '1-20002' }),
    ],
  }),
];

const ids = (nodes: { account: { id: string } }[]) => nodes.map((n) => n.account.id);

describe('buildAccountTree', () => {
  it('keeps everything, with every row matched, when no filter is set', () => {
    const tree = buildAccountTree(accounts, all);
    expect(ids(tree)).toEqual(['kas', 'aset']);
    expect(ids(tree[0].children)).toEqual(['kecil', 'midtrans']);
    expect(tree.every((n) => n.matched)).toBe(true);
  });

  it('drops open sub accounts under the locked tab', () => {
    const tree = buildAccountTree(accounts, { ...all, tab: 'locked' });
    expect(ids(tree)).toEqual(['kas', 'aset']);
    expect(ids(tree[0].children)).toEqual(['kecil']);
    expect(ids(tree[1].children)).toEqual(['tanah']);
  });

  it('keeps an open parent only as an unmatched ancestor of a locked sub account', () => {
    const tree = buildAccountTree(accounts, { ...all, tab: 'locked' });
    expect(tree[0].matched).toBe(true);
    expect(tree[1].matched).toBe(false);
    expect(tree[1].children[0].matched).toBe(true);
  });

  it('filters sub accounts by the cash and bank tab too', () => {
    const tree = buildAccountTree(accounts, { ...all, tab: 'kas_bank' });
    expect(ids(tree)).toEqual(['kas']);
    expect(ids(tree[0].children)).toEqual(['kecil', 'midtrans']);
  });

  it('matches category and search on every level, ignoring case and padding', () => {
    expect(ids(buildAccountTree(accounts, { ...all, category: 'Aset Tetap' }))).toEqual(['aset']);
    const bySearch = buildAccountTree(accounts, { ...all, search: '  GEDUNG ' });
    expect(ids(bySearch)).toEqual(['aset']);
    expect(ids(bySearch[0].children)).toEqual(['gedung']);
    expect(ids(buildAccountTree(accounts, { ...all, search: '1-10005' })[0].children)).toEqual([
      'midtrans',
    ]);
  });

  it('is empty when nothing matches', () => {
    expect(buildAccountTree(accounts, { ...all, search: 'zzz' })).toEqual([]);
  });
});

describe('flattenVisibleRows', () => {
  const tree = buildAccountTree(accounts, all);

  it('shows only top level rows while collapsed', () => {
    expect(flattenVisibleRows(tree, new Set()).map((r) => r.node.account.id)).toEqual([
      'kas',
      'aset',
    ]);
  });

  it('inserts children after their parent with the right depth', () => {
    const rows = flattenVisibleRows(tree, new Set(['kas']));
    expect(rows.map((r) => [r.node.account.id, r.depth])).toEqual([
      ['kas', 0],
      ['kecil', 1],
      ['midtrans', 1],
      ['aset', 0],
    ]);
  });
});

describe('selection helpers', () => {
  it('select all reaches open sub accounts of collapsed and locked parents', () => {
    const tree = buildAccountTree(accounts, all);
    expect(selectableInTree(tree).map((a) => a.id)).toEqual(['midtrans', 'aset', 'gedung']);
  });

  it('never offers unmatched context rows or locked rows', () => {
    const tree = buildAccountTree(accounts, { ...all, tab: 'locked' });
    expect(selectableInTree(tree)).toEqual([]);
  });

  it('collects parent ids and category names across levels', () => {
    expect(collectParentIds(buildAccountTree(accounts, all))).toEqual(['kas', 'aset']);
    expect(collectCategoryNames(accounts)).toEqual(['Kas & Bank', 'Aset Tetap']);
  });
});

describe('isFilterActive', () => {
  it('is false only for the all tab with no category and blank search', () => {
    expect(isFilterActive(all)).toBe(false);
    expect(isFilterActive({ ...all, search: '  ' })).toBe(false);
    expect(isFilterActive({ ...all, tab: 'locked' })).toBe(true);
    expect(isFilterActive({ ...all, category: 'Kas & Bank' })).toBe(true);
    expect(isFilterActive({ ...all, search: 'a' })).toBe(true);
  });
});

describe('withClassGroups', () => {
  const node = (id: string, accountNumber: string) => ({
    account: account({ id, accountNumber }),
    children: [],
    matched: true,
  });

  it('puts one heading before each run of top level accounts of a class', () => {
    const entries = withClassGroups([
      { node: node('kas', '1-10000'), depth: 0 },
      { node: node('piutang', '1-10100'), depth: 0 },
      { node: node('hutang', '2-20000'), depth: 0 },
    ]);
    expect(
      entries.map((entry) => (entry.kind === 'group' ? `G${entry.accountClass}` : 'row'))
    ).toEqual(['G1', 'row', 'row', 'G2', 'row']);
  });

  it('keeps a sub account under its parent, without a heading of its own', () => {
    const entries = withClassGroups([
      { node: node('kas', '1-10000'), depth: 0 },
      { node: node('kecil', '1-10001'), depth: 1 },
    ]);
    expect(entries.filter((entry) => entry.kind === 'group')).toHaveLength(1);
  });

  it('gives an unknown code its own heading and nothing for no rows', () => {
    const entries = withClassGroups([{ node: node('x', 'ZZ-1'), depth: 0 }]);
    expect(entries[0]).toEqual({ kind: 'group', accountClass: null });
    expect(withClassGroups([])).toEqual([]);
  });
});
