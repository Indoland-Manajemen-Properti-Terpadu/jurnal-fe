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
      // In Postman collection: GET {{base_url}}/v1/reports/balance-sheet?date=2025-04-04&endDate=2026-04-10
      const response = await apiClient.get<unknown>('/v1/reports/balance-sheet', {
        params: {
          date: params.startDate,
          endDate: params.endDate,
        },
        signal,
      });
      return mapBalanceSheetResponse(response.data, params);
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(
    params: BalanceSheetQueryParams,
    type: BalanceSheetExportType,
    signal?: AbortSignal
  ): Promise<Blob> {
    try {
      // Try dedicated export endpoint
      const response = await apiClient.get<Blob>(`/v1/reports/balance-sheet/export/${type}`, {
        params: {
          date: params.startDate,
          endDate: params.endDate,
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
