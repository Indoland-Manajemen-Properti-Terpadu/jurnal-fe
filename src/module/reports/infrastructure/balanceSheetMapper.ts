import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { safeNumber, safeString } from './reportValue';

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

export function mapBalanceSheetResponse(
  raw: any,
  queryParams: BalanceSheetQueryParams
): BalanceSheetData {
  const data = raw?.data || raw || {};

  // Assets
  const rawAssets = data.assets || {};
  const currentAssets: BalanceSheetAccountItem[] = Array.isArray(rawAssets.currentAssets)
    ? rawAssets.currentAssets.map(mapAccountItem)
    : [];
  const nonCurrentAssets: BalanceSheetAccountItem[] = Array.isArray(rawAssets.nonCurrentAssets)
    ? rawAssets.nonCurrentAssets.map(mapAccountItem)
    : [];
  const depreciationAmortization: BalanceSheetAccountItem[] = Array.isArray(
    rawAssets.depreciationAmortization
  )
    ? rawAssets.depreciationAmortization.map(mapAccountItem)
    : [];

  const totalCurrentAssets =
    safeNumber(rawAssets.totalCurrentAssets) ||
    currentAssets.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);

  const totalNonCurrentAssets =
    safeNumber(rawAssets.totalNonCurrentAssets) ||
    nonCurrentAssets.reduce((sum: number, item: BalanceSheetAccountItem) => sum + item.balance, 0);

  const totalDepreciationAmortization =
    safeNumber(rawAssets.totalDepreciationAmortization) ||
    depreciationAmortization.reduce(
      (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
      0
    );

  const calculatedTotalAssets =
    totalCurrentAssets + totalNonCurrentAssets + totalDepreciationAmortization;
  const totalAssets =
    raw.data?.totalAssets != null ? safeNumber(data.totalAssets) : calculatedTotalAssets;

  // Liabilities
  const rawLiabilities = data.liabilities;
  let currentLiabilities: BalanceSheetAccountItem[] = [];
  let nonCurrentLiabilities: BalanceSheetAccountItem[] = [];
  let allLiabilities: BalanceSheetAccountItem[] = [];
  let totalCurrentLiabilities = 0;
  let totalNonCurrentLiabilities = 0;

  if (Array.isArray(rawLiabilities)) {
    allLiabilities = rawLiabilities.map(mapAccountItem);
    currentLiabilities = allLiabilities.filter(
      (item) =>
        item.categoryName?.toLowerCase().includes('lancar') ||
        !item.categoryName?.toLowerCase().includes('panjang')
    );
    nonCurrentLiabilities = allLiabilities.filter((item) =>
      item.categoryName?.toLowerCase().includes('panjang')
    );
    totalCurrentLiabilities = currentLiabilities.reduce(
      (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
      0
    );
    totalNonCurrentLiabilities = nonCurrentLiabilities.reduce(
      (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
      0
    );
  } else if (rawLiabilities && typeof rawLiabilities === 'object') {
    currentLiabilities = Array.isArray(rawLiabilities.currentLiabilities)
      ? rawLiabilities.currentLiabilities.map(mapAccountItem)
      : [];
    nonCurrentLiabilities = Array.isArray(rawLiabilities.nonCurrentLiabilities)
      ? rawLiabilities.nonCurrentLiabilities.map(mapAccountItem)
      : [];
    allLiabilities = [...currentLiabilities, ...nonCurrentLiabilities];
    totalCurrentLiabilities =
      safeNumber(rawLiabilities.totalCurrentLiabilities) ||
      currentLiabilities.reduce(
        (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
        0
      );
    totalNonCurrentLiabilities =
      safeNumber(rawLiabilities.totalNonCurrentLiabilities) ||
      nonCurrentLiabilities.reduce(
        (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
        0
      );
  }

  const calculatedTotalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  const totalLiabilities =
    raw.data?.totalLiabilities != null
      ? safeNumber(data.totalLiabilities)
      : calculatedTotalLiabilities;

  // Equity
  const rawEquity = Array.isArray(data.equity) ? data.equity : [];
  const equity: BalanceSheetAccountItem[] = rawEquity.map(mapAccountItem);
  const calculatedTotalEquity = equity.reduce(
    (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
    0
  );
  const totalEquity =
    raw.data?.totalEquity != null ? safeNumber(data.totalEquity) : calculatedTotalEquity;

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
