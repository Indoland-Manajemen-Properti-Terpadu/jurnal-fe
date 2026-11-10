import apiClient from '@/lib/http/apiClient';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import type { SupportedLanguage } from '@/i18n';
import type {
  ProfitLossExportType,
  ProfitLossReport,
} from '@/module/reports/domain/profitLoss.types';
import { mapProfitLossPage } from './profitLossMapper';
import { isRequestCanceled } from './requestCancel';
import {
  ReportRequestError,
  blobErrorMessage,
  filenameFromHeader,
  reportErrorMessage,
  statusOf,
} from './reportRequest';

const ENDPOINT = '/v1/reports/profit-loss';
/** The most rows the server gives per request. */
export const PROFIT_LOSS_PAGE_SIZE = 500;

export const profitLossApi = {
  /**
   * The whole statement. The server pages its lines (500 at most, so one request in practice);
   * if a section does run across a page, every page is read and the lines are joined in order.
   */
  async getReport(
    period: ReportPeriod,
    options: { lang: SupportedLanguage; fallbackMessage: string },
    signal?: AbortSignal
  ): Promise<ProfitLossReport> {
    try {
      const read = async (page: number) =>
        mapProfitLossPage(
          (
            await apiClient.get<unknown>(ENDPOINT, {
              params: {
                startDate: period.startDate,
                endDate: period.endDate,
                lang: options.lang,
                page,
                limit: PROFIT_LOSS_PAGE_SIZE,
              },
              signal,
            })
          ).data
        );

      const first = await read(1);
      const rows = [...first.report.rows];
      for (let page = 2; page <= first.pagination.totalPages; page += 1) {
        rows.push(...(await read(page)).report.rows);
      }
      return { ...first.report, rows };
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
    type: ProfitLossExportType,
    options: { lang: SupportedLanguage; fallbackMessage: string },
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
        `profit-loss-${period.startDate.replaceAll('-', '')}-${period.endDate.replaceAll('-', '')}.${type}`
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
