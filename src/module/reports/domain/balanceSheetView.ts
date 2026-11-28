import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type {
  BalanceSheetAccountItem,
  BalanceSheetSectionData,
  BalanceSheetViewMode,
} from './balanceSheet.types';

export interface BalanceSheetViewRow {
  key: string;
  account: BalanceSheetAccountItem | null;
  code: string | null;
  name: string;
  category: string | null;
  balance: number;
  compareBalance: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  accountCount: number;
}

export interface BalanceSheetViewGroup {
  key: string;
  label: string;
  total: number;
  compareTotal: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  rows: BalanceSheetViewRow[];
}

export interface BalanceSheetViewSection {
  key: string;
  label: string;
  total: number;
  compareTotal: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  groups: BalanceSheetViewGroup[];
  flat?: boolean;
  closingLabel?: string;
}

const sumAmounts = (values: number[]) => Number(fromMinor(sumMinor(values.map(toMinor))));
export const balanceSheetChange = (current: number, previous: number) => {
  const amount = sumAmounts([current, -previous]);
  return { amount, percent: previous === 0 ? null : (amount / Math.abs(previous)) * 100 };
};
const amountChange = (current: number, previous: number) =>
  balanceSheetChange(current, previous).amount;
const changePercent = (current: number, previous: number) =>
  balanceSheetChange(current, previous).percent;
const accountKey = (account: BalanceSheetAccountItem) =>
  account.accountId ?? account.accountNumber ?? account.accountName;
const normalized = (value: string | null | undefined) => (value ?? '').trim().toLocaleLowerCase();
const matches = (account: BalanceSheetAccountItem, term: string) =>
  !term ||
  normalized(account.accountNumber).includes(term) ||
  normalized(account.accountName).includes(term) ||
  normalized(account.categoryName).includes(term);

export function selectBalanceSheetSections(
  sections: BalanceSheetSectionData[],
  compareSections: BalanceSheetSectionData[] | undefined,
  options: { search: string; hideZero: boolean; mode: BalanceSheetViewMode }
): BalanceSheetViewSection[] {
  const term = options.search.trim().toLocaleLowerCase();
  const mode = term ? 'rinci' : options.mode;
  return sections.map((section) => {
    const compareSection = compareSections?.find(
      (item) => item.key === section.key || item.label === section.label
    );
    const compareAccounts = new Map(
      (compareSection?.groups.flatMap((group) => group.accounts) ?? []).map((item) => [
        accountKey(item),
        item,
      ])
    );
    return {
      key: section.key,
      label: section.label,
      total: section.total,
      flat:
        /equity|ekuitas|modal/.test(`${section.key} ${section.label}`.toLowerCase()) ||
        section.groups.length === 1,
      compareTotal: compareSection?.total ?? null,
      changeAmount: compareSection ? amountChange(section.total, compareSection.total) : null,
      changePercent: compareSection ? changePercent(section.total, compareSection.total) : null,
      groups: section.groups.map((group) => {
        const compareGroup = compareSection?.groups.find(
          (item) => item.key === group.key || item.label === group.label
        );
        const visible = group.accounts.filter((account) => {
          const compareBalance = compareAccounts.get(accountKey(account))?.balance ?? 0;
          return (
            (!options.hideZero || account.balance !== 0 || compareBalance !== 0) &&
            matches(account, term)
          );
        });
        const rows: BalanceSheetViewRow[] =
          mode === 'ringkas'
            ? [
                ...new Map(
                  visible.map((account) => [
                    account.categoryName || 'Lainnya',
                    account.categoryName || 'Lainnya',
                  ])
                ).keys(),
              ].map((category) => {
                const accounts = visible.filter(
                  (account) => (account.categoryName || 'Lainnya') === category
                );
                const compared = accounts.map(
                  (account) => compareAccounts.get(accountKey(account))?.balance ?? 0
                );
                return {
                  key: `${group.key}-${category}`,
                  account: null,
                  code: null,
                  name: category,
                  category: null,
                  balance: sumAmounts(accounts.map((account) => account.balance)),
                  compareBalance: compareGroup ? sumAmounts(compared) : null,
                  changeAmount: compareGroup
                    ? amountChange(
                        sumAmounts(accounts.map((account) => account.balance)),
                        sumAmounts(compared)
                      )
                    : null,
                  changePercent: compareGroup
                    ? changePercent(
                        sumAmounts(accounts.map((account) => account.balance)),
                        sumAmounts(compared)
                      )
                    : null,
                  accountCount: accounts.length,
                };
              })
            : visible.map((account) => ({
                key: accountKey(account),
                account,
                code: account.accountNumber,
                name: account.accountName,
                category: account.categoryName,
                balance: account.balance,
                compareBalance: compareGroup
                  ? (compareAccounts.get(accountKey(account))?.balance ?? 0)
                  : null,
                changeAmount: compareGroup
                  ? amountChange(
                      account.balance,
                      compareAccounts.get(accountKey(account))?.balance ?? 0
                    )
                  : null,
                changePercent: compareGroup
                  ? changePercent(
                      account.balance,
                      compareAccounts.get(accountKey(account))?.balance ?? 0
                    )
                  : null,
                accountCount: 1,
              }));
        return {
          key: group.key,
          label: group.label,
          total: group.total,
          compareTotal: compareGroup?.total ?? null,
          changeAmount: compareGroup ? amountChange(group.total, compareGroup.total) : null,
          changePercent: compareGroup ? changePercent(group.total, compareGroup.total) : null,
          rows,
        };
      }),
    };
  });
}
