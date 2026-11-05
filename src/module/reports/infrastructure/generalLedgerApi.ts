import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { mapGeneralLedgerResponse } from './generalLedgerMapper';
import { isRequestCanceled } from './requestCancel';

export const GENERAL_LEDGER_PAGE_SIZE = 20;

function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Akses ke laporan buku besar ditolak.';
    if (error.response?.status === 404) {
      return 'Laporan buku besar tidak tersedia untuk periode ini.';
    }
    if (!error.response) return 'Koneksi ke server terputus. Pastikan koneksi internet stabil.';
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
  }
  return error instanceof Error
    ? error.message
    : 'Terjadi kesalahan saat memproses laporan buku besar.';
}

export const generalLedgerApi = {
  /** The server pages the accounts (20 by default, 100 at most); the period totals cover all of them. */
  async getReport(
    period: ReportPeriod,
    page = 1,
    limit = GENERAL_LEDGER_PAGE_SIZE,
    signal?: AbortSignal
  ): Promise<GeneralLedgerReport> {
    try {
      const response = await apiClient.get<unknown>('/v1/general-ledger', {
        params: {
          startDate: period.startDate,
          endDate: period.endDate,
          page,
          limit,
        },
        signal,
      });
      return mapGeneralLedgerResponse(response.data);
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(
    period: ReportPeriod,
    type: GeneralLedgerExportType,
    signal?: AbortSignal
  ): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(`/v1/general-ledger/export/${type}`, {
        params: {
          startDate: period.startDate,
          endDate: period.endDate,
        },
        responseType: 'blob',
        signal,
      });
      return response.data;
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      throw new Error(parseErrorMessage(error));
    }
  },
};
