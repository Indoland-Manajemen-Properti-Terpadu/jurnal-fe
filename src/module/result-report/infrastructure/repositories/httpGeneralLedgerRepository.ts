import axios from 'axios';
import apiClient from '@/services/apiClient';
import type { GeneralLedgerExportType, ReportPeriod } from '../../domain/entities/generalLedger';
import type { GeneralLedgerRepository } from '../../domain/repositories/generalLedgerRepository';
import { mapGeneralLedgerResponse } from '../mappers/generalLedgerMapper';

function reportRequestError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return new Error('Akses ke laporan buku besar ditolak.');
    if (error.response?.status === 404) return new Error('Laporan buku besar tidak tersedia untuk periode ini.');
    if (!error.response) return new Error('Koneksi ke server terputus. Coba lagi.');
  }
  return error instanceof Error && !axios.isAxiosError(error)
    ? error
    : new Error('Laporan buku besar belum dapat diproses. Coba lagi.');
}

export const httpGeneralLedgerRepository: GeneralLedgerRepository = {
  async get(period) {
    try {
      const response = await apiClient.get<unknown>('/v1/general-ledger', {
        params: period,
      });
      return mapGeneralLedgerResponse(response.data);
    } catch (error) {
      throw reportRequestError(error);
    }
  },
  async export(period: ReportPeriod, type: GeneralLedgerExportType) {
    try {
      const response = await apiClient.get<Blob>(`/v1/general-ledger/export/${type}`, {
        params: period,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw reportRequestError(error);
    }
  },
};
