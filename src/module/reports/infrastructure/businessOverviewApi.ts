import { get } from '@/lib/http/apiClient';
import type { BalanceSheetReport } from '@/module/reports/domain/balanceSheetReport.types';
import type { EquityChangeReport } from '@/module/reports/domain/EquityChange.types';
import type { IncomeStatementReport } from '@/module/reports/domain/IncomeStatement.types';
import type { ReportJournalEntryModel } from '@/module/reports/domain/JournalEntry.types';
import type { TrialBalanceReport } from '@/module/reports/domain/TrialBalanceReport.types';
import { REPORT_ENDPOINTS } from './reportEndpoints';

// These calls use the legacy `get` helper, which returns the Axios error response (or null)
// instead of throwing. Switching to throwing semantics is a separate decision (spec section 11).

const dateQuery = (fromDate?: string, toDate?: string): string => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  return params.toString();
};

export const fetchBalanceSheetSummaryReport = (
  fromDate: string,
  toDate: string
): Promise<BalanceSheetReport> =>
  get(`${REPORT_ENDPOINTS.BALANCE_SHEET}?${dateQuery(fromDate, toDate)}`);

export const fetchTrialBalanceReport = (
  fromDate: string,
  toDate: string
): Promise<TrialBalanceReport> =>
  get(`${REPORT_ENDPOINTS.TRIAL_BALANCE}?${dateQuery(fromDate, toDate)}`);

export const fetchJournalEntryReport = (
  fromDate?: string,
  toDate?: string
): Promise<ReportJournalEntryModel[]> =>
  get(`${REPORT_ENDPOINTS.JOURNAL_ENTRY}?${dateQuery(fromDate, toDate)}`);

export const fetchIncomeStatementReport = (
  fromDate: string,
  toDate: string
): Promise<IncomeStatementReport[]> =>
  get(REPORT_ENDPOINTS.INCOME_STATEMENT, { fromDate, toDate });

export const fetchEquityChangeReport = (
  fromDate: string,
  toDate: string
): Promise<EquityChangeReport> => get(REPORT_ENDPOINTS.EQUITY_CHANGE, { fromDate, toDate });
