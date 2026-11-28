import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  BalanceSheetData,
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { mapBalanceSheetResponse } from './balanceSheetMapper';
import { isRequestCanceled } from './requestCancel';

function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Akses ke laporan neraca ditolak.';
    if (error.response?.status === 404) return 'Laporan neraca tidak tersedia untuk periode ini.';
    if (!error.response) return 'Koneksi ke server terputus. Pastikan koneksi internet stabil.';
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
  }
  return error instanceof Error
    ? error.message
    : 'Terjadi kesalahan saat memproses laporan neraca.';
}

export const balanceSheetApi = {
  async getReport(
    params: BalanceSheetQueryParams,
    signal?: AbortSignal
  ): Promise<BalanceSheetData> {
    try {
      const read = async (range: { startDate: string; endDate: string }) =>
        mapBalanceSheetResponse(
          (
            await apiClient.get<unknown>('/v1/reports/balance-sheet', {
              // The balance sheet is a point-in-time report; comparison snapshots
              // use the same endpoint with a different cut-off date.
              params: { date: range.endDate },
              signal,
            })
          ).data,
          range
        );
      const [current, compare] = await Promise.all([
        read(params),
        params.comparePeriod ? read(params.comparePeriod) : Promise.resolve(null),
      ]);
      return {
        ...current,
        compare: compare ?? current.compare ?? null,
        compareAsOf: compare?.endDate ?? current.compareAsOf,
      };
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(
    params: BalanceSheetQueryParams,
    type: BalanceSheetExportType,
    signal?: AbortSignal,
    options: { summary?: boolean; showZero?: boolean } = {}
  ): Promise<Blob> {
    try {
      // Try dedicated export endpoint
      const response = await apiClient.get<Blob>(`/v1/reports/balance-sheet/export/${type}`, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          ...(params.comparePeriod
            ? {
                compare: 'custom',
                compareStartDate: params.comparePeriod.startDate,
                compareEndDate: params.comparePeriod.endDate,
              }
            : {}),
          summary: options.summary ?? false,
          showZero: options.showZero ?? false,
        },
        responseType: 'blob',
        signal,
      });
      return response.data;
    } catch (error) {
      // An aborted export must not start the legacy request.
      if (isRequestCanceled(error)) throw error;
      // Fallback to legacy endpoint if available
      try {
        const fallback = await apiClient.get<Blob>('/v1/report/balance/download', {
          params: {
            date: params.startDate,
            endDate: params.endDate,
            type,
          },
          responseType: 'blob',
          signal,
        });
        return fallback.data;
      } catch (fallbackError) {
        if (isRequestCanceled(fallbackError)) throw fallbackError;
        throw new Error(parseErrorMessage(error));
      }
    }
  },
};
