import { subDays } from 'date-fns';
import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type { GeneralLedgerAccount, GeneralLedgerTransaction } from './generalLedger.types';

export interface VisibleLedgerAccount {
  account: GeneralLedgerAccount;
  transactions: GeneralLedgerTransaction[];
  /** Search matched journal rows rather than the account itself. */
  filteredRows: boolean;
}

/** Search is local because the current ledger endpoint accepts dates and account IDs only. */
export function selectLedgerAccounts(
  accounts: GeneralLedgerAccount[],
  search: string,
  hideWithoutTransactions: boolean
): VisibleLedgerAccount[] {
  const term = search.trim().replace(/^#/, '').toLocaleLowerCase();
  return accounts.flatMap<VisibleLedgerAccount>((account) => {
    if (hideWithoutTransactions && account.transactions.length === 0) return [];
    if (!term || `${account.number} ${account.name}`.toLocaleLowerCase().includes(term)) {
      return [{ account, transactions: account.transactions, filteredRows: false }];
    }
    const transactions = account.transactions.filter((row) =>
      `${row.transactionNumber} ${row.referenceNumber ?? ''} ${row.description} ${row.notes}`
        .toLocaleLowerCase()
        .includes(term)
    );
    return transactions.length ? [{ account, transactions, filteredRows: true }] : [];
  });
}

export const countPeriodJournals = (accounts: GeneralLedgerAccount[]): number =>
  new Set(
    accounts.flatMap((account) =>
      account.transactions.map((row) => row.journalId || row.transactionNumber)
    )
  ).size;

export const periodDifference = (debit: number, credit: number) =>
  Number(fromMinor(Math.abs(sumMinor([toMinor(debit), -toMinor(credit)]))));

export function displayLedgerDate(value: string, language: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function previousLedgerDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  const previous = subDays(new Date(year, month - 1, day), 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}-${String(previous.getDate()).padStart(2, '0')}`;
}
