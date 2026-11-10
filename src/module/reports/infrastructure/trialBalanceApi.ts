import apiClient from '@/lib/http/apiClient';
import type { SupportedLanguage } from '@/i18n';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import type {
  TrialBalanceExportType,
  TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';
import {
  ReportRequestError,
  blobErrorMessage,
  filenameFromHeader,
  reportErrorMessage,
  statusOf,
} from './reportRequest';
import { isRequestCanceled } from './requestCancel';
import { mapTrialBalancePage } from './trialBalanceMapper';

const ENDPOINT = '/v1/reports/trial-balance';
/** The most accounts the server gives per request. */
export const TRIAL_BALANCE_PAGE_SIZE = 100;

interface RequestOptions {
  lang: SupportedLanguage;
  fallbackMessage: string;
}

export const trialBalanceApi = {
  /**
   * The whole trial balance. The server pages its accounts (100 at most), so every page is read
   * and the accounts are joined in order; the totals, the balancing lines and the profit are
   * the server's and are taken from the first page, never added up here.
   */
  async getReport(
    period: ReportPeriod,
    options: RequestOptions,
    signal?: AbortSignal
  ): Promise<TrialBalanceReport> {
    try {
      const read = async (page: number) =>
        mapTrialBalancePage(
          (
            await apiClient.get<unknown>(ENDPOINT, {
              params: {
                startDate: period.startDate,
                endDate: period.endDate,
                lang: options.lang,
                page,
                limit: TRIAL_BALANCE_PAGE_SIZE,
              },
              signal,
            })
          ).data
        );

      const first = await read(1);
      const accounts = [...first.accounts];
      for (let page = 2; page <= first.pagination.totalPages; page += 1) {
        accounts.push(...(await read(page)).accounts);
      }
      return { ...first, accounts };
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new ReportRequestError(
        reportErrorMessage(error, options.fallbackMessage),
        statusOf(error)
      );
    }
  },

  async exportReport(
    period: ReportPeriod,
    type: TrialBalanceExportType,
    options: RequestOptions,
    signal?: AbortSignal
  ): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await apiClient.get<Blob>(`${ENDPOINT}/export/${type}`, {
        params: { startDate: period.startDate, endDate: period.endDate, lang: options.lang },
        responseType: 'blob',
        signal,
      });
      const filename = filenameFromHeader(
        response.headers['content-disposition'],
        `trial-balance-${period.startDate.replaceAll('-', '')}-${period.endDate.replaceAll('-', '')}.${type}`
      );
      return { blob: response.data, filename };
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new ReportRequestError(
        await blobErrorMessage(error, options.fallbackMessage),
        statusOf(error)
      );
    }
  },
};
