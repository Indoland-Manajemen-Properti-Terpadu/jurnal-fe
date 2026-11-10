import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import type { SupportedLanguage } from '@/i18n';
import type {
  ProfitLossExportType,
  ProfitLossReport,
} from '@/module/reports/domain/profitLoss.types';
import { mapProfitLossPage } from './profitLossMapper';
import { isRequestCanceled } from './requestCancel';

const ENDPOINT = '/v1/reports/profit-loss';
/** The most rows the server gives per request. */
export const PROFIT_LOSS_PAGE_SIZE = 500;

const FILENAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

/** A failed request with the status the server answered (400 a refusal, 403 no right). */
export class ProfitLossRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = 'ProfitLossRequestError';
  }
}

const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;

/** The server's own message of a failed request, or the fallback. */
export const profitLossErrorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback;

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
      throw new ProfitLossRequestError(
        profitLossErrorMessage(error, options.fallbackMessage),
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
      const header = String(response.headers['content-disposition'] ?? '');
      const filename =
        FILENAME_PATTERN.exec(header)?.[1] ??
        `profit-loss-${period.startDate.replaceAll('-', '')}-${period.endDate.replaceAll('-', '')}.${type}`;
      return { blob: response.data, filename };
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new ProfitLossRequestError(
        await blobErrorMessage(error, options.fallbackMessage),
        statusOf(error)
      );
    }
  },
};

/** A failed download carries its JSON message inside the blob, so the text is read back. */
const blobErrorMessage = async (error: unknown, fallback: string): Promise<string> => {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve('');
      reader.readAsText(error.response?.data as Blob);
    });
    try {
      const { message } = JSON.parse(text) as { message?: string };
      if (message) return message;
    } catch {
      // Not JSON: use the fallback.
    }
  }
  return profitLossErrorMessage(error, fallback);
};
