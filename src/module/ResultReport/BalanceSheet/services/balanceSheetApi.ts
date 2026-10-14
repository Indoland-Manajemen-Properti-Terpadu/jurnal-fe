import axios from 'axios';
import apiClient from '@/services/apiClient';
import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
  BalanceSheetExportType,
  BalanceSheetQueryParams,
} from '../types/balanceSheet.types';

function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Akses ke laporan neraca ditolak.';
    if (error.response?.status === 404) return 'Laporan neraca tidak tersedia untuk periode ini.';
    if (!error.response) return 'Koneksi ke server terputus. Pastikan koneksi internet stabil.';
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses laporan neraca.';
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

function mapAccountItem(source: any): BalanceSheetAccountItem {
  if (!source || typeof source !== 'object') {
    return {
      accountId: null,
      accountNumber: null,
      accountName: 'Akun',
      categoryId: null,
      categoryName: null,
      balance: 0,
    };
  }

  return {
    accountId: source.accountId ? safeString(source.accountId) : null,
    accountNumber: source.accountNumber ? safeString(source.accountNumber) : null,
    accountName: safeString(source.accountName || source.name, 'Akun Tanpa Nama'),
    categoryId: source.categoryId ? safeString(source.categoryId) : null,
    categoryName: source.categoryName ? safeString(source.categoryName) : null,
    balance: safeNumber(source.balance ?? source.totalAmount),
  };
}

export function mapBalanceSheetResponse(raw: any, queryParams: BalanceSheetQueryParams): BalanceSheetData {
  const data = raw?.data || raw || {};

  // Assets
  const rawAssets = data.assets || {};
  const currentAssets: BalanceSheetAccountItem[] = Array.isArray(rawAssets.currentAssets)
    ? rawAssets.currentAssets.map(mapAccountItem)
    : [];
  const nonCurrentAssets: BalanceSheetAccountItem[] = Array.isArray(rawAssets.nonCurrentAssets)
    ? rawAssets.nonCurrentAssets.map(mapAccountItem)
    : [];
  const depreciationAmortization: BalanceSheetAccountItem[] = Array.isArray(rawAssets.depreciationAmortization)
    ? rawAssets.depreciationAmortization.map(mapAccountItem)
    : [];

  const totalCurrentAssets = safeNumber(rawAssets.totalCurrentAssets) ||
    currentAssets.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);

  const totalNonCurrentAssets = safeNumber(rawAssets.totalNonCurrentAssets) ||
    nonCurrentAssets.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);

  const totalDepreciationAmortization = safeNumber(rawAssets.totalDepreciationAmortization) ||
    depreciationAmortization.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);

  const calculatedTotalAssets = totalCurrentAssets + totalNonCurrentAssets + totalDepreciationAmortization;
  const totalAssets = raw.data?.totalAssets != null ? safeNumber(data.totalAssets) : calculatedTotalAssets;

  // Liabilities
  const rawLiabilities = data.liabilities;
  let currentLiabilities: BalanceSheetAccountItem[] = [];
  let nonCurrentLiabilities: BalanceSheetAccountItem[] = [];
  let allLiabilities: BalanceSheetAccountItem[] = [];
  let totalCurrentLiabilities = 0;
  let totalNonCurrentLiabilities = 0;

  if (Array.isArray(rawLiabilities)) {
    allLiabilities = rawLiabilities.map(mapAccountItem);
    currentLiabilities = allLiabilities.filter((item) =>
      item.categoryName?.toLowerCase().includes('lancar') || !item.categoryName?.toLowerCase().includes('panjang')
    );
    nonCurrentLiabilities = allLiabilities.filter((item) =>
      item.categoryName?.toLowerCase().includes('panjang')
    );
    totalCurrentLiabilities = currentLiabilities.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);
    totalNonCurrentLiabilities = nonCurrentLiabilities.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);
  } else if (rawLiabilities && typeof rawLiabilities === 'object') {
    currentLiabilities = Array.isArray(rawLiabilities.currentLiabilities)
      ? rawLiabilities.currentLiabilities.map(mapAccountItem)
      : [];
    nonCurrentLiabilities = Array.isArray(rawLiabilities.nonCurrentLiabilities)
      ? rawLiabilities.nonCurrentLiabilities.map(mapAccountItem)
      : [];
    allLiabilities = [...currentLiabilities, ...nonCurrentLiabilities];
    totalCurrentLiabilities = safeNumber(rawLiabilities.totalCurrentLiabilities) ||
      currentLiabilities.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);
    totalNonCurrentLiabilities = safeNumber(rawLiabilities.totalNonCurrentLiabilities) ||
      nonCurrentLiabilities.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);
  }

  const calculatedTotalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  const totalLiabilities = raw.data?.totalLiabilities != null ? safeNumber(data.totalLiabilities) : calculatedTotalLiabilities;

  // Equity
  const rawEquity = Array.isArray(data.equity) ? data.equity : [];
  const equity: BalanceSheetAccountItem[] = rawEquity.map(mapAccountItem);
  const calculatedTotalEquity = equity.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);
  const totalEquity = raw.data?.totalEquity != null ? safeNumber(data.totalEquity) : calculatedTotalEquity;

  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;
  const discrepancy = totalAssets - totalLiabilitiesAndEquity;

  return {
    endDate: safeString(data.endDate, queryParams.endDate),
    startDate: queryParams.startDate,
    assets: {
      currentAssets,
      nonCurrentAssets,
      depreciationAmortization,
      totalCurrentAssets,
      totalNonCurrentAssets,
      totalDepreciationAmortization,
      calculatedTotal: calculatedTotalAssets,
    },
    liabilities: {
      currentLiabilities,
      nonCurrentLiabilities,
      totalCurrentLiabilities,
      totalNonCurrentLiabilities,
      allLiabilities,
      calculatedTotal: calculatedTotalLiabilities,
    },
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    isBalanced,
    discrepancy,
  };
}

export const balanceSheetApi = {
  async getReport(params: BalanceSheetQueryParams): Promise<BalanceSheetData> {
    try {
      // In Postman collection: GET {{base_url}}/v1/reports/balance-sheet?date=2025-04-04&endDate=2026-04-10
      const response = await apiClient.get<unknown>('/v1/reports/balance-sheet', {
        params: {
          date: params.startDate,
          startDate: params.startDate,
          fromDate: params.startDate,
          endDate: params.endDate,
          toDate: params.endDate,
        },
      });
      return mapBalanceSheetResponse(response.data, params);
    } catch (error) {
      throw new Error(parseErrorMessage(error));
    }
  },

  async exportReport(params: BalanceSheetQueryParams, type: BalanceSheetExportType): Promise<Blob> {
    try {
      // Try dedicated export endpoint or fallback
      const response = await apiClient.get<Blob>(`/v1/reports/balance-sheet/export/${type}`, {
        params: {
          startDate: params.startDate,
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
            fromDate: params.startDate,
            toDate: params.endDate,
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
