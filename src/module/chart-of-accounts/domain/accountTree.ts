import { isAccountSelectable } from './accountRules';
import type { JournalAccounts } from './journalAccount';

export interface AccountFilter {
  tab: string;
  category: string | null;
  search: string;
}

/**
 * `matched` is false for an ancestor that only stays in the tree to give a matching
 * descendant its place; such a row is shown muted and cannot be selected.
 */
export interface AccountNode {
  account: JournalAccounts;
  children: AccountNode[];
  matched: boolean;
}

export interface VisibleAccountRow {
  node: AccountNode;
  depth: number;
}

export const isFilterActive = (filter: AccountFilter): boolean =>
  filter.tab !== 'all' || Boolean(filter.category) || filter.search.trim() !== '';

const matchesFilter = (account: JournalAccounts, filter: AccountFilter): boolean => {
  if (filter.tab === 'kas_bank' && !account.isBankAndCash) return false;
  if (filter.tab === 'locked' && !account.isLocked) return false;
  if (filter.category && account.category?.name !== filter.category) return false;
  const query = filter.search.trim().toLowerCase();
  if (!query) return true;
  return [account.accountNumber, account.name].some((field) =>
    field?.toLowerCase().includes(query)
  );
};

/**
 * Applies tab, category and search to every level. A sub account stays only when it matches
 * (or leads to a match), so an open sub account never shows up under the locked tab.
 */
export const buildAccountTree = (
  accounts: JournalAccounts[],
  filter: AccountFilter
): AccountNode[] =>
  accounts.flatMap((account) => {
    const children = buildAccountTree(account.subAccount ?? [], filter);
    const matched = matchesFilter(account, filter);
    return matched || children.length > 0 ? [{ account, children, matched }] : [];
  });

/** Rows in display order: a node's children follow it only while it is expanded. */
export const flattenVisibleRows = (
  nodes: AccountNode[],
  expandedIds: ReadonlySet<string>,
  depth = 0
): VisibleAccountRow[] =>
  nodes.flatMap((node) => [
    { node, depth },
    ...(expandedIds.has(node.account.id)
      ? flattenVisibleRows(node.children, expandedIds, depth + 1)
      : []),
  ]);

/** A heading above the accounts of one class, or one account row. */
export type AccountListEntry =
  | { kind: 'group'; accountClass: number | null }
  | ({ kind: 'row' } & VisibleAccountRow);

/** The class of an account is the first digit of its code (1 assets ... 8 other expense). */
const classOfCode = (accountNumber: string | undefined): number | null => {
  const digit = Number((accountNumber ?? '').trim().charAt(0));
  return digit >= 1 && digit <= 8 ? digit : null;
};

/**
 * Puts a heading before each run of top level accounts of the same class. A sub account follows
 * its parent, so it never starts a group of its own.
 */
export const withClassGroups = (rows: VisibleAccountRow[]): AccountListEntry[] => {
  const entries: AccountListEntry[] = [];
  let current: number | null | undefined;
  for (const row of rows) {
    if (row.depth === 0) {
      const accountClass = classOfCode(row.node.account.accountNumber);
      if (accountClass !== current) {
        entries.push({ kind: 'group', accountClass });
        current = accountClass;
      }
    }
    entries.push({ kind: 'row', ...row });
  }
  return entries;
};

export const collectParentIds = (nodes: AccountNode[]): string[] =>
  nodes.flatMap((node) =>
    node.children.length > 0 ? [node.account.id, ...collectParentIds(node.children)] : []
  );

/** Selectable accounts of a node and all its descendants, collapsed or not. */
export const selectableInSubtree = (node: AccountNode): JournalAccounts[] => [
  ...(node.matched && isAccountSelectable(node.account) ? [node.account] : []),
  ...node.children.flatMap(selectableInSubtree),
];

export const selectableInTree = (nodes: AccountNode[]): JournalAccounts[] =>
  nodes.flatMap(selectableInSubtree);

/** Distinct category names across all levels, for the category filter. */
export const collectCategoryNames = (accounts: JournalAccounts[]): string[] => {
  const names = new Set<string>();
  const visit = (list: JournalAccounts[]) =>
    list.forEach((account) => {
      if (account.category?.name) names.add(account.category.name);
      visit(account.subAccount ?? []);
    });
  visit(accounts);
  return Array.from(names);
};
