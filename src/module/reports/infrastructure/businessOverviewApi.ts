import apiClient from '@/lib/http/apiClient';
import type { BalanceSheetReport } from '@/module/reports/domain/balanceSheetReport.types';
import type { EquityChangeReport } from '@/module/reports/domain/EquityChange.types';
import type { IncomeStatementReport } from '@/module/reports/domain/IncomeStatement.types';
import type { ReportJournalEntryModel } from '@/module/reports/domain/JournalEntry.types';
import type { TrialBalanceReport } from '@/module/reports/domain/TrialBalanceReport.types';
import { REPORT_ENDPOINTS } from './reportEndpoints';

// These calls use the default client, so an HTTP error rejects and the query reports `isError`.

const getData = async <T>(url: string, params?: Record<string, string>): Promise<T> =>
  (await apiClient.get<T>(url, { params })).data;

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
  getData<BalanceSheetReport>(`${REPORT_ENDPOINTS.BALANCE_SHEET}?${dateQuery(fromDate, toDate)}`);

export const fetchTrialBalanceReport = (
  fromDate: string,
  toDate: string
): Promise<TrialBalanceReport> =>
  getData<TrialBalanceReport>(`${REPORT_ENDPOINTS.TRIAL_BALANCE}?${dateQuery(fromDate, toDate)}`);

export const fetchJournalEntryReport = (
  fromDate?: string,
  toDate?: string
): Promise<ReportJournalEntryModel[]> =>
  getData<ReportJournalEntryModel[]>(
    `${REPORT_ENDPOINTS.JOURNAL_ENTRY}?${dateQuery(fromDate, toDate)}`
  );

export const fetchIncomeStatementReport = (
  fromDate: string,
  toDate: string
): Promise<IncomeStatementReport[]> =>
  getData<IncomeStatementReport[]>(REPORT_ENDPOINTS.INCOME_STATEMENT, { fromDate, toDate });

export const fetchEquityChangeReport = (
  fromDate: string,
  toDate: string
): Promise<EquityChangeReport> =>
  getData<EquityChangeReport>(REPORT_ENDPOINTS.EQUITY_CHANGE, { fromDate, toDate });
