import type {
  TrialBalanceAccount,
  TrialBalanceCells,
  TrialBalanceGroup,
  TrialBalanceReport,
  TrialBalanceSums,
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
