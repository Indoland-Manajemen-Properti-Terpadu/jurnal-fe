import { getCategoryPrefix } from './accountRules';
import type { CategoryAccountModel } from './categoryAccount';

export interface CategoryOptionGroup {
  group: string;
  items: { value: string; label: string }[];
}

/** Category dropdown data grouped into balance sheet (prefix 1-3) and profit and loss (4-8). */
export const groupCategoryOptions = (
  categories: CategoryAccountModel[],
  language: string
): CategoryOptionGroup[] => {
  const neracaItems: { value: string; label: string }[] = [];
  const labaRugiItems: { value: string; label: string }[] = [];

  categories.forEach((cat) => {
    if (!cat.id) return;
    const prefix = getCategoryPrefix(cat);
    const item = {
      value: cat.id,
      label: `${prefix}-XXXX · ${cat.name || 'Unnamed category'}`,
    };
    if (Number(prefix) <= 3) {
      neracaItems.push(item);
    } else {
      labaRugiItems.push(item);
    }
  });

  return [
    {
      group:
        language === 'en'
          ? 'Balance Sheet Accounts (1-XXXX – 3-XXXX)'
          : 'Kelompok Akun Neraca (1-XXXX – 3-XXXX)',
      items: neracaItems,
    },
    {
      group:
        language === 'en'
          ? 'Profit & Loss Accounts (4-XXXX – 8-XXXX)'
          : 'Kelompok Akun Laba Rugi (4-XXXX – 8-XXXX)',
      items: labaRugiItems,
    },
  ].filter((g) => g.items.length > 0);
};
