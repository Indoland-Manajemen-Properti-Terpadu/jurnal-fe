import type {
  TrialBalanceAccount,
  TrialBalanceCells,
  TrialBalanceGroup,
  TrialBalanceReport,
  TrialBalanceSums,
  TrialBalanceStatement,
  TrialBalanceStatementGroup,
  TrialBalanceStatementRow,
  TrialBalanceStatementTotals,
} from '@/module/reports/domain/trialBalance.types';
import { TRIAL_BALANCE_GROUPS } from '@/module/reports/domain/trialBalance.types';
import { asArray, asRecord, optionalPrecision, safeNumber, safeString } from './reportValue';

/** A side stays `null` when the server leaves it empty; only a number or numeric text is a figure. */
const cell = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  return safeNumber(value);
};

/** A whole group can be `null` too (an account outside the profit and loss or the balance sheet). */
const mapCells = (raw: unknown): TrialBalanceCells | null => {
  if (raw == null || typeof raw !== 'object') return null;
  const group = asRecord(raw);
  return { debit: cell(group.debit), credit: cell(group.credit) };
};

const mapSums = (raw: unknown): TrialBalanceSums => {
  const sums = asRecord(raw);
  return { debit: safeNumber(sums.debit), credit: safeNumber(sums.credit) };
};

const mapStatementAmounts = (raw: unknown): TrialBalanceStatementTotals => {
  const source = asRecord(raw);
  return {
    open_debit: safeNumber(source.open_debit),
    open_credit: safeNumber(source.open_credit),
    debit: safeNumber(source.debit),
    credit: safeNumber(source.credit),
    close_debit: safeNumber(source.close_debit),
    close_credit: safeNumber(source.close_credit),
  };
};

const mapStatementRow = (raw: unknown): TrialBalanceStatementRow => {
  const row = asRecord(raw);
  return {
    id: safeString(row.id),
    code: safeString(row.code),
    name: safeString(row.name),
    category: safeString(row.category),
    lines: safeNumber(row.lines),
    ...mapStatementAmounts(row),
  };
};

const mapStatementGroup = (raw: unknown): TrialBalanceStatementGroup => {
  const group = asRecord(raw);
  return {
    key: safeString(group.key),
    label: safeString(group.label),
    rows: asArray(group.rows).map(mapStatementRow),
    ...mapStatementAmounts(group),
  };
};

const mapStatement = (raw: unknown): TrialBalanceStatement | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const statement = asRecord(raw);
  const totals = asRecord(statement.totals);
  const difference = asRecord(statement.selisih);
  const modules = asRecord(statement.modules);
  return {
    from: safeString(statement.from),
    to: safeString(statement.to),
    groups: asArray(statement.groups).map(mapStatementGroup),
    totals: mapStatementAmounts(totals),
    selisih: {
      open: safeNumber(difference.open),
      move: safeNumber(difference.move),
      close: safeNumber(difference.close),
    },
    journalCount: safeNumber(statement.journal_count),
    modules: Object.fromEntries(
      Object.entries(modules).map(([name, count]) => [name, safeNumber(count)])
    ),
  };
};

const mapAccount = (raw: unknown): TrialBalanceAccount => {
  const row = asRecord(raw);
  const account = asRecord(row.account);
  return {
    id: safeString(account.id),
    accountNumber: safeString(account.accountNumber),
    name: safeString(account.name),
    categoryName: safeString(asRecord(account.category).name),
    categoryCode: safeString(asRecord(account.category).categoryID),
    isHead: account.isHead === true,
    isContra: account.isContra === true,
    opening: mapCells(row.opening),
    movement: mapCells(row.movement),
    closing: mapCells(row.closing),
    profitLoss: mapCells(row.profitLoss),
    balanceSheet: mapCells(row.balanceSheet),
  };
};

/** One page of `GET /v1/reports/trial-balance` (`{ data: { accounts, totals, balancing, profit, pagination } }`). */
export const mapTrialBalancePage = (body: unknown): TrialBalanceReport => {
  const data = asRecord(asRecord(body).data);
  const totals = asRecord(data.totals);
  const balancing = asRecord(data.balancing);
  const pagination = asRecord(data.pagination);
  const page = safeNumber(pagination.page) || 1;
  const accounts = asArray(data.accounts).map(mapAccount);
  return {
    startDate: safeString(data.startDate),
    endDate: safeString(data.endDate),
    precision: optionalPrecision(data.precision),
    negativeFormat:
      data.negativeFormat === 'minus' || data.negativeFormat === 'parentheses'
        ? data.negativeFormat
        : undefined,
    statement: mapStatement(data.statement),
    accounts,
    totals: Object.fromEntries(
      TRIAL_BALANCE_GROUPS.map((group) => [group, mapSums(totals[group])])
    ) as Record<TrialBalanceGroup, TrialBalanceSums>,
    balancing: {
      profitLoss: mapSums(balancing.profitLoss),
      balanceSheet: mapSums(balancing.balanceSheet),
    },
    profit: safeNumber(data.profit),
    pagination: {
      page,
      limit: safeNumber(pagination.limit) || accounts.length,
      totalRows: safeNumber(pagination.totalRows) || accounts.length,
      totalPages: safeNumber(pagination.totalPages) || 1,
    },
  };
};
