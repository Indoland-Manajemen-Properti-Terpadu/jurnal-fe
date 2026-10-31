import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
  BalanceSheetQueryParams,
} from '@/module/reports/domain/balanceSheet.types';
import { asArray, asRecord, safeNumber, safeString } from './reportValue';

function mapAccountItem(rawSource: unknown): BalanceSheetAccountItem {
  if (!rawSource || typeof rawSource !== 'object') {
    return {
      accountId: null,
      accountNumber: null,
      accountName: 'Akun',
      categoryId: null,
      categoryName: null,
      balance: 0,
    };
  }

  const source = asRecord(rawSource);

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
  raw: unknown,
  queryParams: BalanceSheetQueryParams
): BalanceSheetData {
  const wrapped = asRecord(asRecord(raw).data);
  const data = asRecord(asRecord(raw).data || raw);

  // Assets
  const rawAssets = asRecord(data.assets);
  const currentAssets: BalanceSheetAccountItem[] = asArray(rawAssets.currentAssets).map(
    mapAccountItem
  );
  const nonCurrentAssets: BalanceSheetAccountItem[] = asArray(rawAssets.nonCurrentAssets).map(
    mapAccountItem
  );
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
    wrapped.totalAssets != null ? safeNumber(data.totalAssets) : calculatedTotalAssets;

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
    const liabilitiesRecord = asRecord(rawLiabilities);
    currentLiabilities = asArray(liabilitiesRecord.currentLiabilities).map(mapAccountItem);
    nonCurrentLiabilities = asArray(liabilitiesRecord.nonCurrentLiabilities).map(mapAccountItem);
    allLiabilities = [...currentLiabilities, ...nonCurrentLiabilities];
    totalCurrentLiabilities =
      safeNumber(liabilitiesRecord.totalCurrentLiabilities) ||
      currentLiabilities.reduce(
        (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
        0
      );
    totalNonCurrentLiabilities =
      safeNumber(liabilitiesRecord.totalNonCurrentLiabilities) ||
      nonCurrentLiabilities.reduce(
        (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
        0
      );
  }

  const calculatedTotalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  const totalLiabilities =
    wrapped.totalLiabilities != null
      ? safeNumber(data.totalLiabilities)
      : calculatedTotalLiabilities;

  // Equity
  const rawEquity = asArray(data.equity);
  const equity: BalanceSheetAccountItem[] = rawEquity.map(mapAccountItem);
  const calculatedTotalEquity = equity.reduce(
    (sum: number, item: BalanceSheetAccountItem) => sum + item.balance,
    0
  );
  const totalEquity =
    wrapped.totalEquity != null ? safeNumber(data.totalEquity) : calculatedTotalEquity;

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
