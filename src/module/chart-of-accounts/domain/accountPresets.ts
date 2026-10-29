import type { CategoryAccountModel } from './categoryAccount';

export interface AccountPreset {
  keywords: string[];
  isBankAndCash: boolean;
  isContra: boolean;
  defaultName: string;
}

export const ACCOUNT_PRESETS: Record<string, AccountPreset> = {
  bank: {
    keywords: ['kb', 'kas & bank', 'kas', 'bank'],
    isBankAndCash: true,
    isContra: false,
    defaultName: 'Bank Operasional ',
  },
  pettyCash: {
    keywords: ['kb', 'kas & bank', 'kas'],
    isBankAndCash: true,
    isContra: false,
    defaultName: 'Kas Kecil Operasional',
  },
  receivable: {
    keywords: ['ap', 'piutang', 'receivable'],
    isBankAndCash: false,
    isContra: false,
    defaultName: 'Piutang Usaha Pelanggan',
  },
  accumDepr: {
    keywords: ['da', 'depresiasi', 'penyusutan', 'aktiva tetap'],
    isBankAndCash: false,
    isContra: true,
    defaultName: 'Akumulasi Penyusutan ',
  },
  revenue: {
    keywords: ['pen', 'pendapatan', 'revenue'],
    isBankAndCash: false,
    isContra: false,
    defaultName: 'Pendapatan Jasa Operasional',
  },
  expense: {
    keywords: ['beb', 'beban', 'biaya'],
    isBankAndCash: false,
    isContra: false,
    defaultName: 'Beban Operasional ',
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
