import { describe, expect, it } from 'vitest';
import { INDONESIA_BANKS } from '@/constants/banks';
import {
  banksWithLogo,
  bankLogo,
  localBankProviders,
} from '@/module/bank-connection/presentation/components/bankLogos';

describe('banksWithLogo', () => {
  it('lists exactly the master banks that have a logo file, in master order', () => {
    const banks = banksWithLogo();
    expect(banks.length).toBeGreaterThan(0);
    expect(banks.every((bank) => Boolean(bankLogo(bank.code)))).toBe(true);
    const order = INDONESIA_BANKS.map((bank) => bank.code);
    const positions = banks.map((bank) => order.indexOf(bank.code));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(banks.map((bank) => bank.code)).toEqual(
      expect.arrayContaining(['014', '008', '009', '022'])
    );
  });

  it('leaves out a bank without a logo, such as BRI', () => {
    expect(banksWithLogo().map((bank) => bank.code)).not.toContain('002');
  });
});

describe('localBankProviders', () => {
  it('offers each of them as a bank that can be chosen, without inventing a fee', () => {
    const providers = localBankProviders();
    expect(providers.map((provider) => provider.bankName)).toContain('BCA');
    providers.forEach((provider) => {
      expect(provider.status).toBe('AVAILABLE');
      expect(provider.bankCode).toBeTruthy();
      expect(provider.monthlyFee).toBeUndefined();
      expect(provider.accountTypes).toEqual(['CORPORATE', 'INDIVIDUAL']);
    });
  });
});
