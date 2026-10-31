import type {
  AgingBucket,
  BalanceSheetLine,
  BalanceSheetSummary,
  MonthlyPoint,
  SaleSummary,
} from './dashboardTypes';
import { sameAmount, subtractAmounts, sumAmounts } from './dashboardMoney';

/**
 * Pure dashboard aggregations. Amounts are rounded to the cent when mapped from the API and
 * summed in integer cents here, so decimals never drift. Ratios are presentation-only.
 */

const sum = sumAmounts;

const startOfDay = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const DAY_MS = 86_400_000;

const isOpen = (s: SaleSummary) =>
  s.remainingAmount > 0 && s.status !== 'DRAFT' && s.status !== 'VOID';

export const getCashBalance = (bs?: BalanceSheetSummary): number =>
  bs ? sum(bs.currentAssets.filter((l) => l.categoryId === 'KB').map((l) => l.balance)) : 0;

export const getSalesKpis = (sales: SaleSummary[], now = new Date()) => {
  const today = startOfDay(now);
  const open = sales.filter(isOpen);
  const overdue = open.filter((s) => s.dueDate && startOfDay(new Date(s.dueDate)) < today);
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const thisMonth = sales.filter((s) => {
    if (!s.transactionDate || s.status === 'DRAFT') return false;
    const d = new Date(s.transactionDate);
    return `${d.getFullYear()}-${d.getMonth()}` === monthKey;
  });
  const drafts = sales.filter((s) => s.status === 'DRAFT');
  const totalInvoiced = sum(sales.filter((s) => s.status !== 'DRAFT').map((s) => s.finalAmount));
  const totalCollected = sum(sales.filter((s) => s.status !== 'DRAFT').map((s) => s.paidAmount));
  return {
    outstanding: sum(open.map((s) => s.remainingAmount)),
    openCount: open.length,
    overdueAmount: sum(overdue.map((s) => s.remainingAmount)),
    overdueCount: overdue.length,
    // Revenue is sales before VAT and withholding; the invoice total is only the fallback.
    monthRevenue: sum(thisMonth.map((s) => s.netSales ?? s.finalAmount)),
    monthCount: thisMonth.length,
    draftCount: drafts.length,
    draftAmount: sum(drafts.map((s) => s.finalAmount)),
    totalInvoiced,
    totalCollected,
    collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
  };
};

const MONTHS_ID = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const MONTHS_EN = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const getMonthlyTrend = (
  sales: SaleSummary[],
  months = 6,
  now = new Date(),
  lang: 'id' | 'en' = 'id'
): MonthlyPoint[] => {
  const monthLabels = lang === 'en' ? MONTHS_EN : MONTHS_ID;
  const points: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${monthLabels[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      invoiced: 0,
      collected: 0,
    });
  }
  const index = new Map(points.map((p, i) => [p.key, i]));
  const invoiced: number[][] = points.map(() => []);
  const collected: number[][] = points.map(() => []);
  sales.forEach((s) => {
    if (!s.transactionDate || s.status === 'DRAFT') return;
    const d = new Date(s.transactionDate);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) return;
    invoiced[i].push(s.finalAmount);
    collected[i].push(s.paidAmount);
  });
  return points.map((p, i) => ({
    ...p,
    invoiced: sumAmounts(invoiced[i]),
    collected: sumAmounts(collected[i]),
  }));
};

export const getReceivableAging = (
  sales: SaleSummary[],
  now = new Date(),
  labels?: { current: string; d1_30: string; d31_60: string; d60Plus: string }
): AgingBucket[] => {
  const today = startOfDay(now);
  const buckets: AgingBucket[] = [
    {
      key: 'current',
      label: labels?.current ?? 'Belum jatuh tempo',
      amount: 0,
      count: 0,
      color: 'teal',
    },
    {
      key: '1-30',
      label: labels?.d1_30 ?? '1–30 hari',
      amount: 0,
      count: 0,
      color: 'yellow',
    },
    {
      key: '31-60',
      label: labels?.d31_60 ?? '31–60 hari',
      amount: 0,
      count: 0,
      color: 'orange',
    },
    {
      key: '60+',
      label: labels?.d60Plus ?? '> 60 hari',
      amount: 0,
      count: 0,
      color: 'red',
    },
  ];
  const amounts: number[][] = buckets.map(() => []);
  sales.filter(isOpen).forEach((s) => {
    const due = s.dueDate ? startOfDay(new Date(s.dueDate)) : today;
    const late = Math.floor((today - due) / DAY_MS);
    let i = 0;
    if (late > 60) i = 3;
    else if (late > 30) i = 2;
    else if (late > 0) i = 1;
    amounts[i].push(s.remainingAmount);
    buckets[i].count += 1;
  });
  return buckets.map((b, i) => ({ ...b, amount: sumAmounts(amounts[i]) }));
};

export const getStatusBreakdown = (sales: SaleSummary[]) => {
  const map = new Map<string, number>();
  sales.forEach((s) => map.set(s.status, (map.get(s.status) ?? 0) + 1));
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
};

export const getActivePeriod = <
  T extends { isActive: boolean; type: string; endDate: string | null },
>(
  periods: T[]
): T | undefined =>
  periods
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime())[0];

export const getBankAccounts = (bs?: BalanceSheetSummary): BalanceSheetLine[] =>
  bs
    ? bs.currentAssets.filter((l) => l.categoryId === 'KB').sort((a, b) => b.balance - a.balance)
    : [];

export type TopDebtor = {
  customerName: string;
  totalOutstanding: number;
  invoiceCount: number;
  oldestDueDate: string | null;
  isOverdue: boolean;
};

export const getTopDebtors = (
  sales: SaleSummary[],
  now = new Date(),
  limit = 5,
  fallbackName = 'Pelanggan Umum'
): TopDebtor[] => {
  const today = startOfDay(now);
  const openSales = sales.filter(isOpen);
  const customerMap = new Map<
    string,
    { amounts: number[]; oldestDue: string | null; hasOverdue: boolean }
  >();

  openSales.forEach((s) => {
    const name = s.customerName || fallbackName;
    const isDueOver = s.dueDate ? startOfDay(new Date(s.dueDate)) < today : false;
    const existing = customerMap.get(name);
    if (!existing) {
      customerMap.set(name, {
        amounts: [s.remainingAmount],
        oldestDue: s.dueDate,
        hasOverdue: isDueOver,
      });
    } else {
      existing.amounts.push(s.remainingAmount);
      if (isDueOver) existing.hasOverdue = true;
      if (
        s.dueDate &&
        (!existing.oldestDue || new Date(s.dueDate) < new Date(existing.oldestDue))
      ) {
        existing.oldestDue = s.dueDate;
      }
    }
  });

  return Array.from(customerMap.entries())
    .map(([customerName, data]) => ({
      customerName,
      totalOutstanding: sumAmounts(data.amounts),
      invoiceCount: data.amounts.length,
      oldestDueDate: data.oldestDue,
      isOverdue: data.hasOverdue,
    }))
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
    .slice(0, limit);
};

export type FinancialHealthSummary = {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
  netWorkingCapital: number;
  equityRatio: number;
  liabilityRatio: number;
  cashRatio: number;
};

/**
 * Liabilities due within the year: everything except long-term liabilities (category `KJP` or a
 * name with "panjang"). Without the line detail only the total is known, so it is used as is.
 */
export const getCurrentLiabilities = (bs?: BalanceSheetSummary): number => {
  if (!bs) return 0;
  if (bs.liabilities.length === 0) return bs.totalLiabilities;
  return sumAmounts(
    bs.liabilities
      .filter(
        (line) => line.categoryId !== 'KJP' && !line.categoryName.toLowerCase().includes('panjang')
      )
      .map((line) => line.balance)
  );
};

export const getFinancialHealthSummary = (
  bs?: BalanceSheetSummary,
  cash = 0
): FinancialHealthSummary => {
  const totalAssets = bs?.totalAssets ?? 0;
  const totalLiabilities = bs?.totalLiabilities ?? 0;
  const totalEquity = bs?.totalEquity ?? 0;
  const totalCurrentAssets = bs?.totalCurrentAssets ?? 0;
  const totalLiabilitiesAndEquity = sumAmounts([totalLiabilities, totalEquity]);
  const isBalanced = !bs || sameAmount(totalAssets, totalLiabilitiesAndEquity);
  const netWorkingCapital = subtractAmounts(totalCurrentAssets, getCurrentLiabilities(bs));
  const denom = Math.max(1, Math.abs(totalAssets));

  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    netWorkingCapital,
    equityRatio: totalAssets > 0 ? Math.max(0, (totalEquity / denom) * 100) : 0,
    liabilityRatio: totalAssets > 0 ? Math.max(0, (totalLiabilities / denom) * 100) : 0,
    cashRatio: totalAssets > 0 ? Math.max(0, (cash / denom) * 100) : 0,
  };
};
