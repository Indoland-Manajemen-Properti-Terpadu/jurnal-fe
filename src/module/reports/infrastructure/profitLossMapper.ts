import type {
  ProfitLossPagination,
  ProfitLossReport,
  ProfitLossRow,
  ProfitLossRowType,
  ProfitLossSection,
  ProfitLossSummary,
} from '@/module/reports/domain/profitLoss.types';
import { asArray, asRecord, safeNumber, safeString } from './reportValue';

const ROW_TYPES: ProfitLossRowType[] = [
  'title',
  'head',
  'account',
  'subtotal',
  'total',
  'profit',
  'blank',
];

const mapRow = (raw: unknown): ProfitLossRow => {
  const row = asRecord(raw);
  const account = asRecord(row.account);
  const type = ROW_TYPES.find((item) => item === row.type) ?? 'blank';
  return {
    type,
    key: typeof row.key === 'string' ? row.key : null,
    accountId: safeString(account.id),
    groupId: typeof row.groupId === 'string' ? row.groupId : null,
    parentId: typeof row.parentId === 'string' ? row.parentId : null,
    accountNumber: safeString(account.accountNumber),
    label: safeString(row.label) || safeString(account.name),
    amount: row.amount == null ? null : safeNumber(row.amount),
    isContra: account.isContra === true,
  };
};

const mapSummary = (raw: unknown): ProfitLossSummary => {
  const summary = asRecord(raw);
  const totalRevenue = safeNumber(summary.totalRevenue);
  const hasNet = summary.netRevenue != null;
  return {
    // An older server sends no gross/contra/net: revenue is then taken as it is, without contra.
    grossRevenue: hasNet ? safeNumber(summary.grossRevenue) : totalRevenue,
    totalContra: hasNet ? safeNumber(summary.totalContra) : 0,
    netRevenue: hasNet ? safeNumber(summary.netRevenue) : totalRevenue,
    totalRevenue,
    totalDirectCost: safeNumber(summary.totalDirectCost),
    grossProfit: safeNumber(summary.grossProfit),
    totalOpex: safeNumber(summary.totalOpex),
    profitAfterOpex: safeNumber(summary.profitAfterOpex),
    totalOtherIncome: safeNumber(summary.totalOtherIncome),
    totalOtherExpense: safeNumber(summary.totalOtherExpense),
    profitNett: safeNumber(summary.profitNett),
    totalTaxes: safeNumber(summary.totalTaxes),
    profitAfterTax: safeNumber(summary.profitAfterTax),
  };
};

const mapSection = (raw: unknown): ProfitLossSection => {
  const section = asRecord(raw);
  return {
    key: safeString(section.key),
    title: safeString(section.title),
    total: safeNumber(section.total),
  };
};

/** One page of `GET /v1/reports/profit-loss` (`{ data: { sections, summary, rows, pagination } }`). */
export const mapProfitLossPage = (
  body: unknown
): { report: ProfitLossReport; pagination: ProfitLossPagination } => {
  const data = asRecord(asRecord(body).data);
  const pagination = asRecord(data.pagination);
  return {
    report: {
      startDate: safeString(data.startDate),
      endDate: safeString(data.endDate),
      sections: asArray(data.sections).map(mapSection),
      summary: mapSummary(data.summary),
      rows: asArray(data.rows).map(mapRow),
    },
    pagination: {
      page: safeNumber(pagination.page) || 1,
      totalPages: safeNumber(pagination.totalPages) || 1,
    },
  };
};
