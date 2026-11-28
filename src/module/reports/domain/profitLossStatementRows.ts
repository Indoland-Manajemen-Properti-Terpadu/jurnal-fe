import type { ProfitLossStatement } from './profitLoss.types';

export type ProfitLossStatementRowKind = 'section' | 'account' | 'total' | 'result' | 'grand';

export interface ProfitLossStatementRow {
  kind: ProfitLossStatementRowKind;
  key: string;
  label: string;
  code?: string;
  accountId?: string;
  category?: string | null;
  amount: number | null;
  compareAmount: number | null;
}

export interface ProfitLossStatementRows {
  rows: ProfitLossStatementRow[];
  accountCount: number;
}

type ResultTotalKey = 'laba_kotor' | 'laba_operasional' | 'laba_sebelum_pajak';
type ResultRowKey = 'grossProfit' | 'operatingProfit' | 'profitBeforeTax';

const sectionResult = (
  sectionKey: string
): { key: ResultRowKey; totalKey: ResultTotalKey } | null => {
  switch (sectionKey) {
    case 'hpp':
      return { key: 'grossProfit', totalKey: 'laba_kotor' };
    case 'beban':
      return { key: 'operatingProfit', totalKey: 'laba_operasional' };
    case 'lainKeluar':
      return { key: 'profitBeforeTax', totalKey: 'laba_sebelum_pajak' };
    default:
      return null;
  }
};

const accountOrder = (left: { code: string }, right: { code: string }) =>
  left.code.localeCompare(right.code, undefined, { numeric: true });

/** Builds the report lines from the current and optional comparison statement. */
export const buildProfitLossStatementRows = (
  current: ProfitLossStatement,
  compare: ProfitLossStatement | null,
  options: { mode: 'rinci' | 'ringkas'; hideZero: boolean; search: string }
): ProfitLossStatementRows => {
  const rows: ProfitLossStatementRow[] = [];
  const term = options.search.trim().toLocaleLowerCase();
  let accountCount = 0;

  current.sections.forEach((section) => {
    const comparedSection = compare?.sections.find((item) => item.key === section.key);
    const comparedByCode = new Map(
      (comparedSection?.accounts ?? []).map((account) => [account.code, account])
    );
    const currentByCode = new Map(section.accounts.map((account) => [account.code, account]));
    const allAccounts = [...section.accounts];
    (comparedSection?.accounts ?? []).forEach((account) => {
      if (!currentByCode.has(account.code)) allAccounts.push(account);
    });

    const accounts =
      options.mode === 'rinci'
        ? allAccounts
            .filter((account) => {
              if (
                term &&
                !`${account.code} ${account.name} ${account.category ?? ''}`
                  .toLocaleLowerCase()
                  .includes(term)
              ) {
                return false;
              }
              const amount = currentByCode.get(account.code)?.balance ?? 0;
              const compareAmount = comparedByCode.get(account.code)?.balance ?? 0;
              return !options.hideZero || amount !== 0 || compareAmount !== 0;
            })
            .sort(accountOrder)
        : [];

    if (term && options.mode === 'rinci' && accounts.length === 0) return;

    rows.push({
      kind: 'section',
      key: section.key,
      label: section.label,
      amount: null,
      compareAmount: null,
    });

    accounts.forEach((account) => {
      const currentAccount = currentByCode.get(account.code);
      const comparedAccount = comparedByCode.get(account.code);
      rows.push({
        kind: 'account',
        key: section.key,
        label: account.name,
        code: account.code,
        accountId: account.id,
        category: account.category,
        amount: currentAccount?.balance ?? 0,
        compareAmount: compare ? (comparedAccount?.balance ?? 0) : null,
      });
      accountCount += 1;
    });

    rows.push({
      kind: 'total',
      key: section.key,
      label: '',
      amount: section.total,
      compareAmount: comparedSection?.total ?? (compare ? 0 : null),
    });

    const result = sectionResult(section.key);
    if (result) {
      rows.push({
        kind: 'result',
        key: result.key,
        label: '',
        amount: current.totals[result.totalKey],
        compareAmount: compare ? (compare.totals[result.totalKey] ?? 0) : null,
      });
    }
  });

  rows.push({
    kind: 'grand',
    key: 'netProfit',
    label: '',
    amount: current.totals.laba_bersih,
    compareAmount: compare ? compare.totals.laba_bersih : null,
  });

  return { rows, accountCount };
};
