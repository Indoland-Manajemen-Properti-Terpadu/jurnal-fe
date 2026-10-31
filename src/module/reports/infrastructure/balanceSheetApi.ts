import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  BalanceSheetData,
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { mapBalanceSheetResponse } from './balanceSheetMapper';

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
  async getReport(params: BalanceSheetQueryParams): Promise<BalanceSheetData> {
    try {
      // In Postman collection: GET {{base_url}}/v1/reports/balance-sheet?date=2025-04-04&endDate=2026-04-10
      const response = await apiClient.get<unknown>('/v1/reports/balance-sheet', {
        params: {
          date: params.startDate,
          endDate: params.endDate,
        },
      });
      return mapBalanceSheetResponse(response.data, params);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(params: BalanceSheetQueryParams, type: BalanceSheetExportType): Promise<Blob> {
    try {
      // Try dedicated export endpoint
      const response = await apiClient.get<Blob>(`/v1/reports/balance-sheet/export/${type}`, {
        params: {
          date: params.startDate,
          endDate: params.endDate,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      // Fallback to legacy endpoint if available
      try {
        const fallback = await apiClient.get<Blob>('/v1/report/balance/download', {
          params: {
            date: params.startDate,
            endDate: params.endDate,
            type,
          },
          responseType: 'blob',
        });
        return fallback.data;
      } catch {
        throw new Error(parseErrorMessage(error));
      }
    }
  },
};
