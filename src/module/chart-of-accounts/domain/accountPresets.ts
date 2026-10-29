import type { CategoryAccountModel } from './categoryAccount';

export interface AccountPreset {
  keywords: string[];
  isBankAndCash: boolean;
  isContra: boolean;
  /** i18n key (namespace `chartOfAccounts`) of the suggested account name. */
  defaultNameKey: string;
}

export const ACCOUNT_PRESETS: Record<string, AccountPreset> = {
  bank: {
    keywords: ['kb', 'kas & bank', 'kas', 'bank'],
    isBankAndCash: true,
    isContra: false,
    defaultNameKey: 'presetNames.bank',
  },
  pettyCash: {
    keywords: ['kb', 'kas & bank', 'kas'],
    isBankAndCash: true,
    isContra: false,
    defaultNameKey: 'presetNames.pettyCash',
  },
  receivable: {
    keywords: ['ap', 'piutang', 'receivable'],
    isBankAndCash: false,
    isContra: false,
    defaultNameKey: 'presetNames.receivable',
  },
  accumDepr: {
    keywords: ['da', 'depresiasi', 'penyusutan', 'aktiva tetap'],
    isBankAndCash: false,
    isContra: true,
    defaultNameKey: 'presetNames.accumDepr',
  },
  revenue: {
    keywords: ['pen', 'pendapatan', 'revenue'],
    isBankAndCash: false,
    isContra: false,
    defaultNameKey: 'presetNames.revenue',
  },
  expense: {
    keywords: ['beb', 'beban', 'biaya'],
    isBankAndCash: false,
    isContra: false,
    defaultNameKey: 'presetNames.expense',
  },
};

/** First category whose name contains, or whose code equals, one of the preset keywords. */
export const findPresetCategory = (
  presetKey: string,
  categories: CategoryAccountModel[]
): CategoryAccountModel | undefined => {
  const preset = ACCOUNT_PRESETS[presetKey];
  if (!preset) return undefined;
  return categories.find((c) =>
    preset.keywords.some(
      (kw) => (c.name || '').toLowerCase().includes(kw) || (c.categoryID || '').toLowerCase() === kw
    )
  );
};
