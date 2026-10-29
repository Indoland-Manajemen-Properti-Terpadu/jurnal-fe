import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  GeneralLedgerAccount,
  GeneralLedgerExportType,
  GeneralLedgerReport,
  GeneralLedgerTransaction,
  ReportPeriod,
} from '../types/generalLedger.types';

function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Akses ke laporan buku besar ditolak.';
    if (error.response?.status === 404)
      return 'Laporan buku besar tidak tersedia untuk periode ini.';
    if (!error.response) return 'Koneksi ke server terputus. Pastikan koneksi internet stabil.';
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
  }
  return error instanceof Error
    ? error.message
    : 'Terjadi kesalahan saat memproses laporan buku besar.';
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function safeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value != null) return String(value);
  return fallback;
}

function mapTransaction(source: any): GeneralLedgerTransaction {
  if (!source || typeof source !== 'object') {
    return {
      transactionDate: '',
      transactionNumber: '-',
      description: '-',
      debit: 0,
      credit: 0,
      balance: 0,
      journalId: '',
    };
  }

  return {
    transactionDate: safeString(source.transactionDate),
    transactionNumber: safeString(source.transactionNumber, '-'),
    description: safeString(source.description, '-'),
    debit: safeNumber(source.debit),
    credit: safeNumber(source.credit),
    balance: safeNumber(source.balance),
    journalId: safeString(source.journalId),
  };
}

function mapAccount(source: any): GeneralLedgerAccount {
  const accountInfo = source?.account || {};
  const categoryRaw = accountInfo.category;
  const categoryName =
    typeof categoryRaw === 'string' ? categoryRaw : safeString(categoryRaw?.name, 'Lainnya');

  const transactions = Array.isArray(source?.transactions)
    ? source.transactions.map(mapTransaction)
    : [];

  return {
    id: safeString(accountInfo.id || accountInfo._id || source.id),
    number: safeString(accountInfo.accountNumber || source.accountNumber, '-'),
    name: safeString(accountInfo.name || source.name, 'Akun Tanpa Nama'),
    category: categoryName,
    isContra: accountInfo.isContra === true,
    openingBalance: safeNumber(source.openingBalance),
    transactions,
    periodDebit: safeNumber(source.periodDebit),
    periodCredit: safeNumber(source.periodCredit),
    closingBalance: safeNumber(source.closingBalance),
  };
}

export function mapGeneralLedgerResponse(raw: any): GeneralLedgerReport {
  const data = raw?.data || raw || {};
  const accounts = Array.isArray(data.accounts) ? data.accounts.map(mapAccount) : [];

  const lock = data.periodLockInfo || null;

  return {
    accounts,
    periodDebitTotal: safeNumber(data.periodDebitTotal),
    periodCreditTotal: safeNumber(data.periodCreditTotal),
    periodLockName: lock ? safeString(lock.name) : null,
    periodLockType: lock ? safeString(lock.type) : null,
  };
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
