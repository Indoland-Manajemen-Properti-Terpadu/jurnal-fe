import type { AccountOption, Product, ProductFormValues, Tax } from './product';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Defaults for a new product; an existing product keeps its own settings. */
export const toInitialValues = (product?: Product): ProductFormValues => ({
  name: product?.name ?? '',
  sku: product?.sku ?? '',
  productCategory: product?.category?.id ?? null,
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
