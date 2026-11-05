import { describe, expect, it } from 'vitest';
import { depositAccountOptions, type DepositSourceAccount } from './saleDeposit';

const account = (patch: Partial<DepositSourceAccount>): DepositSourceAccount => ({
  id: 'a',
  name: 'Akun',
  accountNumber: '1-1',
  isBankAndCash: false,
  isArchived: false,
  subAccount: [],
  ...patch,
});

describe('depositAccountOptions', () => {
  it('offers only cash and bank accounts', () => {
    const options = depositAccountOptions([
      account({ id: 'bank', name: 'Bank BCA', accountNumber: '1-19995', isBankAndCash: true }),
      account({ id: 'rev', name: 'Pendapatan', accountNumber: '4-1' }),
    ]);
    expect(options).toEqual([{ value: 'bank', label: '1-19995 - Bank BCA' }]);
  });

  it('offers the sub-accounts of a cash header, never the header', () => {
    const options = depositAccountOptions([
      account({
        id: 'head',
        name: 'Kas dan Setara Kas',
        isBankAndCash: true,
        subAccount: [
          account({
            id: 's1',
            name: 'Bank Mandiri',
            accountNumber: '1-10003',
            isBankAndCash: true,
          }),
          account({
            id: 's2',
            name: 'Lama',
            accountNumber: '1-10009',
            isBankAndCash: true,
            isArchived: true,
          }),
          account({ id: 's3', name: 'Lain', accountNumber: '1-10010', isBankAndCash: false }),
        ],
      }),
    ]);
    expect(options).toEqual([{ value: 's1', label: '1-10003 - Bank Mandiri' }]);
  });

  it('finds a bank account nested two levels deep', () => {
    const options = depositAccountOptions([
      account({
        id: 'head',
        subAccount: [
          account({
            id: 'mid',
            isBankAndCash: true,
            subAccount: [
              account({
                id: 'leaf',
                name: 'Bank Dalam',
                accountNumber: '1-10111',
                isBankAndCash: true,
              }),
            ],
          }),
        ],
      }),
    ]);
    expect(options).toEqual([{ value: 'leaf', label: '1-10111 - Bank Dalam' }]);
  });

  it('skips archived accounts', () => {
    expect(
      depositAccountOptions([account({ id: 'x', isBankAndCash: true, isArchived: true })])
    ).toEqual([]);
  });
});
