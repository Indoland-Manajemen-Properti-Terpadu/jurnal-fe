import type { JournalAccounts } from '@/module/chart-of-accounts';

export const acc = (over: Partial<JournalAccounts> & { id: string; accountNumber: string }) =>
  ({
    name: over.accountNumber,
    amount: 0,
    debit: 0,
    credit: 0,
    isBankAndCash: true,
    isPostable: true,
    ...over,
  }) as JournalAccounts;

export const child = (id: string, accountNumber: string, amount: number) =>
  acc({ id, accountNumber, amount });

/** Shape of the Demo Site: a non-postable header whose children are the real accounts. */
export const demoTree = (): JournalAccounts[] => [
  acc({
    id: 'head',
    accountNumber: '1-10000',
    name: 'Kas dan Setara Kas',
    isHead: true,
    isPostable: false,
    amount: -274_596_069,
    subAccount: [
      child('a1', '1-10001', 553_665_000),
      child('a2', '1-10002', 500_000),
      child('a3', '1-10003', -677_100_000),
      child('a4', '1-10004', -154_207_489),
      child('a5', '1-10005', 2_546_420),
      child('a6', '1-10099', 0),
    ],
  }),
  acc({ id: 'sales', accountNumber: '4-10000', isBankAndCash: false, amount: 99 }),
];
