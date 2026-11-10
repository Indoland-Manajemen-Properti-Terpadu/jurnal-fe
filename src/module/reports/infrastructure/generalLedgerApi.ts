import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  GeneralLedgerExportType,
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { mapGeneralLedgerResponse } from './generalLedgerMapper';
import { isRequestCanceled } from './requestCancel';

/**
 * Accounts asked per request. The ledger lists only accounts with movement or a balance, so a site
 * has few of them and one request is the norm; the weight is in each account's transactions, so
 * the request stays small instead of asking for the most the server allows (100).
 */
export const GENERAL_LEDGER_CHUNK_SIZE = 50;

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
  /**
   * The whole ledger. The server pages its accounts; every page is read, one after the other, and
   * the accounts are joined in order. The period totals are the server's (they cover every
   * account) and are taken from the first page.
   */
  async getReport(period: ReportPeriod, signal?: AbortSignal): Promise<GeneralLedgerReport> {
    try {
      const read = async (page: number) =>
        mapGeneralLedgerResponse(
          (
            await apiClient.get<unknown>('/v1/general-ledger', {
              params: {
                startDate: period.startDate,
                endDate: period.endDate,
                page,
                limit: GENERAL_LEDGER_CHUNK_SIZE,
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
      return {
        ...first,
        accounts,
        pagination: { ...first.pagination, page: 1, limit: accounts.length, totalPages: 1 },
      };
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
