import type { AgingBucket, BalanceSheetSummary, MonthlyPoint, SaleSummary } from './dashboardTypes';

/**
 * Pure dashboard aggregations. Amounts come from the API as whole Rupiah values,
 * so they are only summed (never divided/rounded) here. Ratios are presentation-only.
 */

const sum = (values: number[]): number => values.reduce((acc, v) => acc + v, 0);

const startOfDay = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const DAY_MS = 86_400_000;

const isOpen = (s: SaleSummary) => s.remainingAmount > 0 && s.status !== 'DRAFT' && s.status !== 'VOID';

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
    monthRevenue: sum(thisMonth.map((s) => s.finalAmount)),
    monthCount: thisMonth.length,
    draftCount: drafts.length,
    draftAmount: sum(drafts.map((s) => s.finalAmount)),
    totalInvoiced,
    totalCollected,
    collectionRate: totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
  };
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const getMonthlyTrend = (sales: SaleSummary[], months = 6, now = new Date()): MonthlyPoint[] => {
  const points: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTHS_ID[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
      invoiced: 0,
      collected: 0,
    });
  }
  const index = new Map(points.map((p, i) => [p.key, i]));
  sales.forEach((s) => {
    if (!s.transactionDate || s.status === 'DRAFT') return;
    const d = new Date(s.transactionDate);
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i === undefined) return;
    points[i].invoiced += s.finalAmount;
    points[i].collected += s.paidAmount;
  });
  return points;
};

export const getReceivableAging = (sales: SaleSummary[], now = new Date()): AgingBucket[] => {
  const today = startOfDay(now);
  const buckets: AgingBucket[] = [
    { key: 'current', label: 'Belum jatuh tempo', amount: 0, count: 0, color: 'teal' },
    { key: '1-30', label: '1–30 hari', amount: 0, count: 0, color: 'yellow' },
    { key: '31-60', label: '31–60 hari', amount: 0, count: 0, color: 'orange' },
    { key: '60+', label: '> 60 hari', amount: 0, count: 0, color: 'red' },
  ];
  sales.filter(isOpen).forEach((s) => {
    const due = s.dueDate ? startOfDay(new Date(s.dueDate)) : today;
    const late = Math.floor((today - due) / DAY_MS);
    let b = buckets[0];
    if (late > 60) [, , , b] = buckets;
    else if (late > 30) [, , b] = buckets;
    else if (late > 0) [, b] = buckets;
    b.amount += s.remainingAmount;
    b.count += 1;
  });
  return buckets;
};

export const getStatusBreakdown = (sales: SaleSummary[]) => {
  const map = new Map<string, number>();
  sales.forEach((s) => map.set(s.status, (map.get(s.status) ?? 0) + 1));
  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
};

export const getActivePeriod = <T extends { isActive: boolean; type: string; endDate: string | null }>(
  periods: T[]
): T | undefined =>
  periods
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime())[0];

