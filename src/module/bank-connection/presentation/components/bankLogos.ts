import { INDONESIA_BANKS, type BankMasterItem } from '@/constants/banks';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import { LOCAL_FEE_RULES } from '@/module/bank-connection/domain/feeRules';

const FILES = import.meta.glob('/src/assets/banks/*.{svg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** The name (without extension) a bank logo is expected under in `src/assets/banks/`: the bank code. */
export const bankLogoFile = (bankCode?: string): string | undefined => bankCode || undefined;

/** The logo file the team has added for a bank code, if any. Nothing is drawn or fetched here. */
export const bankLogo = (bankCode?: string): string | undefined => {
  const name = bankLogoFile(bankCode);
  if (!name) return undefined;
  const found = Object.entries(FILES).find(([path]) => {
    const file = path.split('/').pop() ?? '';
    return file.slice(0, file.lastIndexOf('.')) === name;
  });
  return found?.[1];
};

/**
 * The banks that have a logo file in `src/assets/banks/`, in the order of the bank master. Dropping a
 * logo file in the folder adds the bank here.
 */
export const banksWithLogo = (): BankMasterItem[] =>
  INDONESIA_BANKS.filter((bank) => Boolean(bankLogo(bank.code)));

/** Until the backend sends its own list, the banks with a logo are the ones offered. No fee is claimed. */
export const localBankProviders = (): BankProvider[] =>
  banksWithLogo().map((bank) => ({
    id: bank.code,
    bankName: bank.shortName,
    bankCode: bank.code,
    accountTypes: ['CORPORATE', 'INDIVIDUAL'],
    capabilities: ['FEED'],
    status: 'AVAILABLE',
    requiredFields: [],
    fees: LOCAL_FEE_RULES[bank.code],
  }));
