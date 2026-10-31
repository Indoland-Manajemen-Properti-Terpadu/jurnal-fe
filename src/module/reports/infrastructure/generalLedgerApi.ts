import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { mapGeneralLedgerResponse } from './generalLedgerMapper';

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
  async getReport(period: ReportPeriod): Promise<GeneralLedgerReport> {
    try {
      const response = await apiClient.get<unknown>('/v1/general-ledger', {
        params: {
          startDate: period.startDate,
          endDate: period.endDate,
        },
      });
      return mapGeneralLedgerResponse(response.data);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(period: ReportPeriod, type: GeneralLedgerExportType): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(`/v1/general-ledger/export/${type}`, {
        params: {
          startDate: period.startDate,
          endDate: period.endDate,
        },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  },
};
