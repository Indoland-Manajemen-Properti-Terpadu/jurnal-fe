import type { AccountOption, Product, ProductFormValues, Tax } from './product';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Defaults for a new product; an existing product keeps its own settings. */
export const toInitialValues = (product?: Product): ProductFormValues => ({
  name: product?.name ?? '',
  sku: product?.sku ?? '',
  productCategory: product?.category?.id ?? null,
  unit: product?.unitId ?? null,
  image: null,
  buyingInfo: product?.buyingInfo ?? {
    isPurchased: true,
    unitPrice: null,
    purchaseAccount: null,
    purchaseTax: null,
  },
  sellingInfo: product?.sellingInfo ?? {
    isSold: true,
    unitPrice: null,
    salesAccount: null,
    accountReceivable: null,
    salesTax: null,
  },
  inventoryInfo: product?.inventoryInfo ?? {
    isTracked: false,
    inventoryAccount: null,
    minStock: 0,
  },
});

/** A section's fields are only required while the section is switched on. */
export const requiredWhen = (enabled: boolean, value: unknown, message: string) =>
  enabled && (value === null || value === '') ? message : null;

export const formatTaxLabel = (tax: Pick<Tax, 'name' | 'rate'>): string =>
  `${tax.name} (${tax.rate}%)`;

export const buildAccountLabelMap = (accounts: AccountOption[]): Map<string, string> =>
  new Map(accounts.map((account) => [account.id, account.label]));

export const buildTaxLabelMap = (taxes: Tax[]): Map<string, string> =>
  new Map(taxes.map((tax) => [tax.id, formatTaxLabel(tax)]));

/**
 * Account reference as the API may return it: an id, or an embedded account object.
 * Returns null when nothing is set so the caller can show its own placeholder.
 */
export const resolveAccountLabel = (
  account: unknown,
  accountLabels: Map<string, string>
): string | null => {
  if (!account) return null;
  if (typeof account === 'string') return accountLabels.get(account) ?? account;
  if (typeof account === 'object') {
    const obj = account as { name?: string; accountNumber?: string; id?: string };
    if (obj.name) {
      return obj.accountNumber ? `${obj.accountNumber} · ${obj.name}` : obj.name;
    }
    if (obj.id) return accountLabels.get(obj.id) ?? obj.id;
  }
  return null;
};

/** Tax reference as the API may return it. Null means no tax is set. */
export const resolveTaxLabel = (tax: unknown, taxLabels: Map<string, string>): string | null => {
  if (!tax) return null;
  if (typeof tax === 'string') return taxLabels.get(tax) ?? tax;
  if (typeof tax === 'object') {
    const obj = tax as { name?: string; rate?: number; id?: string };
    if (obj.name) return `${obj.name} (${obj.rate ?? 0}%)`;
    if (obj.id) return taxLabels.get(obj.id) ?? obj.id;
  }
  return null;
};

/**
 * Accounts that fit a role by normal balance: sales accounts are credit-side,
 * receivable accounts are debit-side. Accounts of unknown side are kept out, but the
 * account a product already uses stays selectable so editing never blanks the field.
 */
export const filterAccountsByNormalBalance = (
  accounts: AccountOption[],
  normalBalance: 'debit' | 'credit',
  keepId?: string | null
): AccountOption[] =>
  accounts.filter(
    (account) =>
      account.id === keepId ||
      (normalBalance === 'debit' ? account.isDebit === true : account.isDebit === false)
  );

export type ProductSummary = {
  total: number;
  sold: number;
  bought: number;
  tracked: number;
  /** Product counts per category, largest first, for the overview chart. */
  categoryCounts: number[];
};

const MAX_CATEGORY_BARS = 8;

/** Counts of the products on hand by how they are traded and whether their stock is tracked. */
export const summarizeProducts = (products: Product[], total = products.length): ProductSummary => {
  const perCategory = new Map<string, number>();
  products.forEach((p) => {
    const key = p.category?.id ?? '';
    perCategory.set(key, (perCategory.get(key) ?? 0) + 1);
  });
  return {
    total,
    sold: products.filter((p) => p.sellingInfo.isSold).length,
    bought: products.filter((p) => p.buyingInfo.isPurchased).length,
    tracked: products.filter((p) => p.inventoryInfo.isTracked).length,
    categoryCounts: [...perCategory.values()].sort((x, y) => y - x).slice(0, MAX_CATEGORY_BARS),
  };
};

export const percentOf = (part: number, whole: number): number =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;
