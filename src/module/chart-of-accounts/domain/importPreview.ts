import type { AccountImportItem, WrongDataItem } from './settingAccount';

export type ImportFilter = 'all' | 'valid' | 'invalid';

export interface ImportPreviewRow {
  item: AccountImportItem;
  isValid: boolean;
  errors?: string[];
}

/** Valid rows first, then invalid ones, filtered by status and by a code, name or category search. */
export const buildImportPreviewRows = (
  correct: AccountImportItem[],
  wrong: WrongDataItem[],
  filter: ImportFilter,
  searchQuery: string
): ImportPreviewRow[] => {
  const rows: ImportPreviewRow[] = [
    ...correct.map((item) => ({ item, isValid: true })),
    ...wrong.map((entry) => ({ item: entry.item, isValid: false, errors: entry.errorItem })),
  ];

  return rows.filter((row) => {
    if (filter === 'valid' && !row.isValid) return false;
    if (filter === 'invalid' && row.isValid) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const code = String(row.item.accountNumber || '').toLowerCase();
      const name = String(row.item.name || '').toLowerCase();
      const category = String(row.item.categoryName || '').toLowerCase();
      return code.includes(query) || name.includes(query) || category.includes(query);
    }
    return true;
  });
};
