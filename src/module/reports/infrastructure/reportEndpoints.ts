import { BASE_URL } from '@/lib/http/endpoints';

export const REPORT_ENDPOINTS = {
  JOURNAL_ENTRY: `${BASE_URL}/v1/report/journal-entry`,
  BALANCE_SHEET: `${BASE_URL}/v1/report/balance`,
  INCOME_STATEMENT: `${BASE_URL}/v1/report/income-statement`,
  TRIAL_BALANCE: `${BASE_URL}/v1/report/trial-balance`,
  EQUITY_CHANGE: `${BASE_URL}/v1/report/equity-changes`,
} as const;

export const REPORT_EXPORT_ENDPOINTS = {
  INCOME_STATEMENT: `${REPORT_ENDPOINTS.INCOME_STATEMENT}/download`,
  EQUITY_CHANGE: `${REPORT_ENDPOINTS.EQUITY_CHANGE}/download`,
} as const;
