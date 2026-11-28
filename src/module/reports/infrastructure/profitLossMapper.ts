import type {
  ProfitLossPagination,
  ProfitLossReport,
  ProfitLossRow,
  ProfitLossRowType,
  ProfitLossStatement,
  ProfitLossStatementPair,
  ProfitLossSection,
  ProfitLossSummary,
} from '@/module/reports/domain/profitLoss.types';
import { asArray, asRecord, optionalPrecision, safeNumber, safeString } from './reportValue';

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

const mapStatement = (raw: unknown): ProfitLossStatement | null => {
  const statement = asRecord(raw);
  if (!Object.keys(statement).length) return null;
  const totals = asRecord(statement.totals);
  const modules = asRecord(statement.modules);

  return {
    from: safeString(statement.from),
    to: safeString(statement.to),
    label: safeString(statement.label),
    sections: asArray(statement.sections).map((value) => {
      const section = asRecord(value);
      return {
        key: safeString(section.key),
        label: safeString(section.label),
        normal: section.normal === 'credit' ? 'credit' : 'debit',
        total: safeNumber(section.total),
        accounts: asArray(section.accounts).map((accountValue) => {
          const account = asRecord(accountValue);
          return {
            id: safeString(account.id),
            code: safeString(account.code),
            name: safeString(account.name),
            category: safeString(account.category) || null,
            balance: safeNumber(account.balance),
          };
        }),
      };
    }),
    totals: {
      pendapatan: safeNumber(totals.pendapatan),
      hpp: safeNumber(totals.hpp),
      beban: safeNumber(totals.beban),
      lain_masuk: safeNumber(totals.lain_masuk),
      lain_keluar: safeNumber(totals.lain_keluar),
      pajak: safeNumber(totals.pajak),
      laba_kotor: safeNumber(totals.laba_kotor),
      laba_operasional: safeNumber(totals.laba_operasional),
      laba_sebelum_pajak: safeNumber(totals.laba_sebelum_pajak),
      laba_bersih: safeNumber(totals.laba_bersih),
    },
    journalCount: safeNumber(statement.journal_count),
    modules: Object.fromEntries(
      Object.entries(modules).map(([name, count]) => [name, safeNumber(count)])
    ),
  };
};

const mapStatementPair = (raw: unknown): ProfitLossStatementPair | undefined => {
  const statement = asRecord(raw);
  const current = mapStatement(statement.current);
  if (!current) return undefined;
  return { current, compare: mapStatement(statement.compare) };
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
      precision: optionalPrecision(data.precision),
      negativeFormat:
        data.negativeFormat === 'minus' || data.negativeFormat === 'parentheses'
          ? data.negativeFormat
          : undefined,
      sections: asArray(data.sections).map(mapSection),
      summary: mapSummary(data.summary),
      rows: asArray(data.rows).map(mapRow),
      statement: mapStatementPair(data.statement),
    },
    pagination: {
      page: safeNumber(pagination.page) || 1,
      totalPages: safeNumber(pagination.totalPages) || 1,
    },
  };
};
