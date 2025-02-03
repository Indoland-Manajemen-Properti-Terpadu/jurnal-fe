import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';

// Function to get All Account (Head & Sub Account)
export const useAllAccounts = (accounts: JournalAccounts[]): JournalAccounts[] => {
  let mergedAccounts: JournalAccounts[] = [];

  accounts.forEach((account) => {
    mergedAccounts.push(account);
    if (account.subAccount) {
      mergedAccounts = [...mergedAccounts, ...useAllAccounts(account.subAccount)];
    }
  });
  return mergedAccounts;
};

// Function to get only Sub Account
// export const useHeadAccounts = (accounts: JournalAccounts[]): JournalAccounts[] => {
//   return accounts.filter((account) => !account.subAccount || account.subAccount.length === 0);
// };

export const useHeadAccounts = (accounts: JournalAccounts[]): JournalAccounts[] => {
  return accounts;
};

// Function to get only Head Account
export const useSubAccounts = (accounts: JournalAccounts[]): JournalAccounts[] => {
  let allSubAccounts: JournalAccounts[] = [];

  accounts.forEach((account) => {
    if (account.subAccount) {
      allSubAccounts = [...allSubAccounts, ...account.subAccount];
      allSubAccounts = [...allSubAccounts, ...useSubAccounts(account.subAccount)];
    }
  });
  return allSubAccounts;
};
