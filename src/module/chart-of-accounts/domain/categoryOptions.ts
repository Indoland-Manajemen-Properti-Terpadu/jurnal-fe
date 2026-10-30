import { getCategoryPrefix } from './accountRules';
import type { CategoryAccountModel } from './categoryAccount';

export interface CategoryOptionGroup {
  group: string;
  items: { value: string; label: string }[];
}

/** Category dropdown data grouped into balance sheet (prefix 1-3) and profit and loss (4-8). */
export interface CategoryGroupLabels {
  balanceSheet: string;
  profitLoss: string;
  unnamed: string;
}

export const groupCategoryOptions = (
  categories: CategoryAccountModel[],
  labels: CategoryGroupLabels
): CategoryOptionGroup[] => {
  const neracaItems: { value: string; label: string }[] = [];
  const labaRugiItems: { value: string; label: string }[] = [];

  categories.forEach((cat) => {
    if (!cat.id) return;
    const prefix = getCategoryPrefix(cat);
    const item = {
      value: cat.id,
      label: `${prefix}-XXXX · ${cat.name || labels.unnamed}`,
    };
    if (Number(prefix) <= 3) {
      neracaItems.push(item);
    } else {
      labaRugiItems.push(item);
    }
  });

  return [
    {
      group: labels.balanceSheet,
      items: neracaItems,
    },
    {
      group: labels.profitLoss,
      items: labaRugiItems,
    },
  ].filter((g) => g.items.length > 0);
};
