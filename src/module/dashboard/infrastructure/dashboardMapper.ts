import { roundToCents, subtractAmounts } from '../domain/dashboardMoney';
import type {
  AuditLogEntry,
  BalanceSheetLine,
  BalanceSheetSummary,
  PeriodInfo,
  SaleSummary,
} from '../domain/dashboardTypes';
import type {
  AuditLogDto,
  BalanceSheetDto,
  BalanceSheetLineDto,
  PeriodDto,
  SaleDto,
} from './dashboardDto';

/** A finite number, or 0. Used for counts. */
export const toNumber = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

/** An amount rounded half up to the cent: the input boundary for money. */
export const toMoney = (v: unknown): number => roundToCents(toNumber(v));

const asList = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const mapLine = (dto: BalanceSheetLineDto | null | undefined): BalanceSheetLine => ({
  accountId: dto?.accountId ?? null,
  accountNumber: dto?.accountNumber ?? null,
  accountName: dto?.accountName ?? '—',
  categoryId: dto?.categoryId ?? '',
  categoryName: dto?.categoryName ?? '',
  balance: toMoney(dto?.balance),
});

const mapLines = (arr: unknown): BalanceSheetLine[] =>
  asList<BalanceSheetLineDto>(arr).map(mapLine);

export const mapBalanceSheet = (d: BalanceSheetDto, endDate: string): BalanceSheetSummary => {
  const assets = d.assets ?? {};
  return {
    endDate: d.endDate ?? endDate,
    currentAssets: mapLines(assets.currentAssets),
    nonCurrentAssets: mapLines(assets.nonCurrentAssets),
    liabilities: mapLines(d.liabilities),
    equity: mapLines(d.equity),
    totalCurrentAssets: toMoney(assets.totalCurrentAssets),
    totalNonCurrentAssets: toMoney(assets.totalNonCurrentAssets),
    totalDepreciation: toMoney(assets.totalDepreciationAmortization),
    totalAssets: toMoney(d.totalAssets),
    totalLiabilities: toMoney(d.totalLiabilities),
    totalEquity: toMoney(d.totalEquity),
  };
};

export const mapSale = (s: SaleDto): SaleSummary => ({
  id: s.id ?? s._id ?? '',
  transactionNumber: s.transactionNumber ?? '—',
  customerName: s.customer?.displayName ?? '—',
  transactionDate: s.transactionDate ?? null,
  dueDate: s.dueDate ?? null,
  status: String(s.status ?? 'DRAFT').toUpperCase(),
  finalAmount: toMoney(s.finalAmount ?? s.total),
  netSales:
    s.subtotal === undefined
      ? undefined
      : subtractAmounts(toMoney(s.subtotal), toMoney(s.discountAmount)),
  paidAmount: toMoney(s.paidAmount),
  remainingAmount: toMoney(s.remainingAmount),
});

export const mapSales = (raw: unknown): SaleDto[] => asList<SaleDto>(raw);

export const mapPeriods = (raw: unknown): PeriodInfo[] =>
  asList<PeriodDto>(raw).map((p) => ({
    id: p.id ?? '',
    name: p.name ?? '—',
    type: p.type ?? '',
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
    isActive: Boolean(p.isActive),
  }));

export const mapAuditLogs = (raw: unknown): AuditLogEntry[] =>
  asList<AuditLogDto>(raw).map((l) => ({
    id: l.id ?? '',
    action: String(l.action ?? '').toUpperCase(),
    transactionNumber: l.journal?.transactionNumber ?? l.snapshot?.transactionNumber ?? null,
    journalId: l.journal?.id ?? null,
    performedBy: l.performedBy?.name ?? '—',
    createdAt: l.createdAt ?? null,
  }));
