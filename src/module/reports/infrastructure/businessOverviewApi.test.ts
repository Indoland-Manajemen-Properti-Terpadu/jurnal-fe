import apiClient from '@/lib/http/apiClient';
import {
  fetchBalanceSheetSummaryReport,
  fetchEquityChangeReport,
  fetchIncomeStatementReport,
  fetchJournalEntryReport,
  fetchTrialBalanceReport,
} from './businessOverviewApi';
import { REPORT_ENDPOINTS, REPORT_EXPORT_ENDPOINTS } from './reportEndpoints';

vi.mock('@/lib/http/apiClient', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: 'payload' }) },
}));

const get = vi.mocked(apiClient.get);

describe('business overview report API', () => {
  beforeEach(() => {
    get.mockClear();
  });

  it('keeps the endpoint paths the backend serves', () => {
    expect(REPORT_ENDPOINTS.JOURNAL_ENTRY).toMatch(/\/v1\/report\/journal-entry$/);
    expect(REPORT_ENDPOINTS.BALANCE_SHEET).toMatch(/\/v1\/report\/balance$/);
    expect(REPORT_ENDPOINTS.INCOME_STATEMENT).toMatch(/\/v1\/report\/income-statement$/);
    expect(REPORT_ENDPOINTS.TRIAL_BALANCE).toMatch(/\/v1\/report\/trial-balance$/);
    expect(REPORT_ENDPOINTS.EQUITY_CHANGE).toMatch(/\/v1\/report\/equity-changes$/);
    expect(REPORT_EXPORT_ENDPOINTS.INCOME_STATEMENT).toBe(
      `${REPORT_ENDPOINTS.INCOME_STATEMENT}/download`
    );
    expect(REPORT_EXPORT_ENDPOINTS.EQUITY_CHANGE).toBe(
      `${REPORT_ENDPOINTS.EQUITY_CHANGE}/download`
    );
  });

  it('sends dates in the query string for balance sheet, trial balance and journal entries', async () => {
    await fetchBalanceSheetSummaryReport('2026-01-01', '2026-01-31');
    await fetchTrialBalanceReport('2026-01-01', '2026-01-31');
    await fetchJournalEntryReport('2026-01-01', '2026-01-31');

    expect(get.mock.calls.map(([url]) => url)).toEqual([
      `${REPORT_ENDPOINTS.BALANCE_SHEET}?fromDate=2026-01-01&toDate=2026-01-31`,
      `${REPORT_ENDPOINTS.TRIAL_BALANCE}?fromDate=2026-01-01&toDate=2026-01-31`,
      `${REPORT_ENDPOINTS.JOURNAL_ENTRY}?fromDate=2026-01-01&toDate=2026-01-31`,
    ]);
  });

  it('omits missing dates from the journal entry query', async () => {
    await fetchJournalEntryReport();

    expect(get).toHaveBeenCalledWith(`${REPORT_ENDPOINTS.JOURNAL_ENTRY}?`, { params: undefined });
  });

  it('sends dates as params for income statement and equity changes', async () => {
    const income = await fetchIncomeStatementReport('2026-01-01', '2026-01-31');
    await fetchEquityChangeReport('2026-01-01', '2026-01-31');

    expect(income).toBe('payload');
    expect(get).toHaveBeenNthCalledWith(1, REPORT_ENDPOINTS.INCOME_STATEMENT, {
      params: { fromDate: '2026-01-01', toDate: '2026-01-31' },
    });
    expect(get).toHaveBeenNthCalledWith(2, REPORT_ENDPOINTS.EQUITY_CHANGE, {
      params: { fromDate: '2026-01-01', toDate: '2026-01-31' },
    });
  });

  it('rejects when the request fails, so the query shows its error state instead of an empty report', async () => {
    get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchTrialBalanceReport('2026-01-01', '2026-01-31')).rejects.toThrow(
      'Network Error'
    );
  });
});
