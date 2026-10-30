import type { AccountOption, ContactGroup, FilteredAccount, PaymentTerm } from './contact';
import type { SelectOption } from './contactRegion';

export type OptionGroup = { group: string; items: SelectOption[] };

/** General chart of accounts grouped by category, first occurrence of an id wins. */
export const groupAccountOptions = (
  accounts: AccountOption[],
  fallbackCategory: string
): OptionGroup[] => {
  const groups = new Map<string, SelectOption[]>();
  const seenIds = new Set<string>();

  accounts.forEach((account) => {
    if (account.id && !seenIds.has(account.id)) {
      seenIds.add(account.id);
      const category = account.category || fallbackCategory;
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category)!.push({ value: account.id, label: account.label });
    }
  });

  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
};

/**
 * Recommended AR/AP accounts first, then the general chart without repeating an id that
 * was already listed.
 */
export const buildAccountSelectData = (
  recommended: FilteredAccount[],
  general: OptionGroup[],
  recommendedLabel: string
): OptionGroup[] => {
  const seenIds = new Set<string>();
  const result: OptionGroup[] = [];

  const recommendedItems: SelectOption[] = [];
  recommended.forEach((account) => {
    if (account.id && !seenIds.has(account.id)) {
      seenIds.add(account.id);
      recommendedItems.push({
        value: account.id,
        label: `${account.accountNumber} - ${account.name}`,
      });
    }
  });
  if (recommendedItems.length > 0) {
    result.push({ group: recommendedLabel, items: recommendedItems });
  }

  general.forEach((group) => {
    const items = group.items.filter((item) => {
      if (!item.value || seenIds.has(item.value)) return false;
      seenIds.add(item.value);
      return true;
    });
    if (items.length > 0) result.push({ group: group.group, items });
  });

  return result;
};

export const buildGroupOptions = (groups: ContactGroup[]): SelectOption[] => {
  const seen = new Set<string>();
  const options: SelectOption[] = [];
  groups.forEach((group) => {
    if (group.name && !seen.has(group.name)) {
      seen.add(group.name);
      options.push({ value: group.name, label: group.name });
    }
  });
  return options;
};

/** One option per distinct number of days; `immediateLabel` replaces "0 days". */
export const buildPaymentTermOptions = (
  terms: PaymentTerm[],
  labels: { immediate: string; days: (count: number) => string }
): SelectOption[] => {
  const seenDays = new Set<number>();
  const options: SelectOption[] = [];
  terms.forEach((term) => {
    if (!seenDays.has(term.days)) {
      seenDays.add(term.days);
      options.push({
        value: String(term.days),
        label: `${term.name} (${term.days === 0 ? labels.immediate : labels.days(term.days)})`,
      });
    }
  });
  return options;
};
