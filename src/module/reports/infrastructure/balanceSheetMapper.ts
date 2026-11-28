import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type {
  BalanceSheetAccountItem,
  BalanceSheetCalloutAccount,
  BalanceSheetData,
  BalanceSheetGroupData,
  BalanceSheetQueryParams,
  BalanceSheetSectionData,
  BalanceSheetSnapshot,
} from '@/module/reports/domain/balanceSheet.types';
import { asArray, asRecord, optionalPrecision, safeNumber, safeString } from './reportValue';

const addMoney = (values: number[]) => Number(fromMinor(sumMinor(values.map(toMinor))));

function mapAccountItem(rawSource: unknown): BalanceSheetAccountItem {
  const source = asRecord(rawSource);
  const number = source.code ?? source.accountNumber ?? source.number;
  const name = source.name ?? source.accountName;
  const category = source.category ?? source.categoryName;
  return {
    accountId: source.accountId || source.id ? safeString(source.accountId ?? source.id) : null,
    accountNumber: number ? safeString(number) : null,
    accountName: safeString(name, 'Akun Tanpa Nama'),
    categoryId: source.categoryId ? safeString(source.categoryId) : null,
    categoryName: category ? safeString(category) : null,
    balance: safeNumber(source.balance ?? source.totalAmount),
    derived: source.derived === true,
    extra: source.extra == null ? undefined : safeNumber(source.extra),
    overdraft: source.overdraft === true,
  };
}

function mapCalloutAccounts(value: unknown): BalanceSheetCalloutAccount[] {
  return asArray(value).map((raw) => {
    const item = mapAccountItem(raw);
    return {
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      balance: item.balance,
    };
  });
}

const groupName = (group: BalanceSheetGroupData) => `${group.key} ${group.label}`.toLowerCase();
const sectionName = (section: BalanceSheetSectionData) =>
  `${section.key} ${section.label}`.toLowerCase();
const isCurrentGroup = (group: BalanceSheetGroupData) =>
  /lancar|current/.test(groupName(group)) && !/tidak|non[- ]?current/.test(groupName(group));
const isDepreciationGroup = (group: BalanceSheetGroupData) =>
  /susut|depresiasi|amortisasi|depreciat|amortiz/.test(groupName(group));

function sumGroups(groups: BalanceSheetGroupData[]) {
  return addMoney(groups.map((group) => group.total));
}

function mapNewSnapshot(raw: unknown, fallbackDate: string): BalanceSheetSnapshot {
  const data = asRecord(raw);
  const rawTotals = asRecord(data.totals);
  const sections: BalanceSheetSectionData[] = asArray(data.sections).map(
    (rawSection, sectionIndex) => {
      const section = asRecord(rawSection);
      const groups: BalanceSheetGroupData[] = asArray(section.groups).map(
        (rawGroup, groupIndex) => {
          const group = asRecord(rawGroup);
          const accounts = asArray(group.accounts).map(mapAccountItem);
          return {
            key: safeString(group.key, `group-${groupIndex}`),
            label: safeString(group.label, safeString(group.key, 'Lainnya')),
            total:
              group.total == null
                ? addMoney(accounts.map((account) => account.balance))
                : safeNumber(group.total),
            accounts,
          };
        }
      );
      return {
        key: safeString(section.key, `section-${sectionIndex}`),
        label: safeString(section.label, safeString(section.key, '')),
        total: section.total == null ? sumGroups(groups) : safeNumber(section.total),
        groups,
      };
    }
  );

  const assetSection = sections.find((section) => /aset|asset/.test(sectionName(section)));
  const liabilitySection = sections.find((section) => /liab|kewajiban/.test(sectionName(section)));
  const equitySection = sections.find((section) =>
    /ekuitas|equity|modal/.test(sectionName(section))
  );
  const assetGroups = assetSection?.groups ?? [];
  const currentGroups = assetGroups.filter(isCurrentGroup);
  const depreciationGroups = assetGroups.filter(isDepreciationGroup);
  const nonCurrentGroups = assetGroups.filter(
    (group) => !currentGroups.includes(group) && !depreciationGroups.includes(group)
  );
  const liabilitiesGroups = liabilitySection?.groups ?? [];
  const shortLiabilityGroups = liabilitiesGroups.filter(isCurrentGroup);
  const longLiabilityGroups = liabilitiesGroups.filter(
    (group) => !shortLiabilityGroups.includes(group)
  );
  const assets = rawTotals.aset == null ? (assetSection?.total ?? 0) : safeNumber(rawTotals.aset);
  const liabilities =
    rawTotals.liab == null ? (liabilitySection?.total ?? 0) : safeNumber(rawTotals.liab);
  const equity =
    rawTotals.ekuitas == null ? (equitySection?.total ?? 0) : safeNumber(rawTotals.ekuitas);
  const totalCurrentAssets =
    rawTotals.aset_lancar == null ? sumGroups(currentGroups) : safeNumber(rawTotals.aset_lancar);
  const totalNonCurrentAssets =
    rawTotals.aset_tidak_lancar == null
      ? sumGroups(nonCurrentGroups)
      : safeNumber(rawTotals.aset_tidak_lancar);
  const totalDepreciationAmortization =
    rawTotals.penyusutan == null ? sumGroups(depreciationGroups) : safeNumber(rawTotals.penyusutan);
  const netNonCurrentAssets = addMoney([totalNonCurrentAssets, totalDepreciationAmortization]);
  const totalCurrentLiabilities =
    rawTotals.liab_pendek == null
      ? sumGroups(shortLiabilityGroups)
      : safeNumber(rawTotals.liab_pendek);
  const totalNonCurrentLiabilities =
    rawTotals.liab_panjang == null
      ? sumGroups(longLiabilityGroups)
      : safeNumber(rawTotals.liab_panjang);
  const discrepancy =
    rawTotals.selisih == null
      ? addMoney([assets, -liabilities, -equity])
      : safeNumber(rawTotals.selisih);
  const allLiabilities = liabilitiesGroups.flatMap((group) => group.accounts);
  const equityAccounts = equitySection?.groups.flatMap((group) => group.accounts) ?? [];

  return {
    endDate: safeString(data.as_of ?? data.endDate, fallbackDate),
    precision: optionalPrecision(data.precision),
    negativeFormat:
      data.negativeFormat === 'minus' || data.negativeFormat === 'parentheses'
        ? data.negativeFormat
        : undefined,
    sections,
    assets: {
      currentAssets: currentGroups.flatMap((group) => group.accounts),
      nonCurrentAssets: nonCurrentGroups.flatMap((group) => group.accounts),
      depreciationAmortization: depreciationGroups.flatMap((group) => group.accounts),
      totalCurrentAssets,
      totalNonCurrentAssets,
      totalDepreciationAmortization,
      netNonCurrentAssets,
      calculatedTotal: assets,
    },
    liabilities: {
      currentLiabilities: shortLiabilityGroups.flatMap((group) => group.accounts),
      nonCurrentLiabilities: longLiabilityGroups.flatMap((group) => group.accounts),
      totalCurrentLiabilities,
      totalNonCurrentLiabilities,
      allLiabilities,
      calculatedTotal: liabilities,
    },
    equity: equityAccounts,
    totalAssets: assets,
    totalLiabilities: liabilities,
    totalEquity: equity,
    totalLiabilitiesAndEquity: addMoney([liabilities, equity]),
    isBalanced: discrepancy === 0,
    discrepancy,
    journalCount: data.journal_count == null ? undefined : safeNumber(data.journal_count),
    currentYearProfit: data.laba_berjalan == null ? undefined : safeNumber(data.laba_berjalan),
    priorYearProfit: data.laba_lalu == null ? undefined : safeNumber(data.laba_lalu),
    modules: Object.keys(asRecord(data.modules)).length
      ? Object.fromEntries(
          Object.entries(asRecord(data.modules)).map(([key, count]) => [key, safeNumber(count)])
        )
      : undefined,
    unmapped: mapCalloutAccounts(data.unmapped),
    overdrafts: mapCalloutAccounts(data.overdrafts),
  };
}

/** Maps both the PRO-129 grouped response and the older balance-sheet payload. */
function mapSnapshot(raw: unknown, fallbackDate: string): BalanceSheetSnapshot {
  const data = asRecord(raw);
  if (Array.isArray(data.sections)) return mapNewSnapshot(data, fallbackDate);

  const rawAssets = asRecord(data.assets);
  const currentAssets = asArray(rawAssets.currentAssets).map(mapAccountItem);
  const nonCurrentAssets = asArray(rawAssets.nonCurrentAssets).map(mapAccountItem);
  const depreciationAmortization = asArray(rawAssets.depreciationAmortization).map(mapAccountItem);
  const totalCurrentAssets =
    rawAssets.totalCurrentAssets == null
      ? addMoney(currentAssets.map((item) => item.balance))
      : safeNumber(rawAssets.totalCurrentAssets);
  const totalNonCurrentAssets =
    rawAssets.totalNonCurrentAssets == null
      ? addMoney(nonCurrentAssets.map((item) => item.balance))
      : safeNumber(rawAssets.totalNonCurrentAssets);
  const totalDepreciationAmortization =
    rawAssets.totalDepreciationAmortization == null
      ? addMoney(depreciationAmortization.map((item) => item.balance))
      : safeNumber(rawAssets.totalDepreciationAmortization);
  const netNonCurrentAssets = addMoney([totalNonCurrentAssets, totalDepreciationAmortization]);
  const totalAssets =
    data.totalAssets == null
      ? addMoney([totalCurrentAssets, totalNonCurrentAssets, totalDepreciationAmortization])
      : safeNumber(data.totalAssets);

  const rawLiabilities = data.liabilities;
  let allLiabilities: BalanceSheetAccountItem[] = [];
  let currentLiabilities: BalanceSheetAccountItem[] = [];
  let nonCurrentLiabilities: BalanceSheetAccountItem[] = [];
  const liabilitiesRecord = asRecord(rawLiabilities);
  if (Array.isArray(rawLiabilities)) {
    allLiabilities = rawLiabilities.map(mapAccountItem);
    currentLiabilities = allLiabilities.filter(
      (item) =>
        /lancar|current/i.test(item.categoryName ?? '') &&
        !/panjang|non/i.test(item.categoryName ?? '')
    );
    nonCurrentLiabilities = allLiabilities.filter((item) =>
      /panjang|non[- ]?current/i.test(item.categoryName ?? '')
    );
    const assigned = new Set([...currentLiabilities, ...nonCurrentLiabilities]);
    currentLiabilities.push(...allLiabilities.filter((item) => !assigned.has(item)));
  } else {
    currentLiabilities = asArray(liabilitiesRecord.currentLiabilities).map(mapAccountItem);
    nonCurrentLiabilities = asArray(liabilitiesRecord.nonCurrentLiabilities).map(mapAccountItem);
    allLiabilities = [...currentLiabilities, ...nonCurrentLiabilities];
  }
  const totalCurrentLiabilities =
    liabilitiesRecord.totalCurrentLiabilities == null
      ? addMoney(currentLiabilities.map((item) => item.balance))
      : safeNumber(liabilitiesRecord.totalCurrentLiabilities);
  const totalNonCurrentLiabilities =
    liabilitiesRecord.totalNonCurrentLiabilities == null
      ? addMoney(nonCurrentLiabilities.map((item) => item.balance))
      : safeNumber(liabilitiesRecord.totalNonCurrentLiabilities);
  const totalLiabilities =
    data.totalLiabilities == null
      ? addMoney([totalCurrentLiabilities, totalNonCurrentLiabilities])
      : safeNumber(data.totalLiabilities);
  const equity = asArray(data.equity).map(mapAccountItem);
  const totalEquity =
    data.totalEquity == null
      ? addMoney(equity.map((item) => item.balance))
      : safeNumber(data.totalEquity);
  const discrepancy =
    data.discrepancy == null
      ? addMoney([totalAssets, -totalLiabilities, -totalEquity])
      : safeNumber(data.discrepancy);
  const sections: BalanceSheetSectionData[] = [
    {
      key: 'assets',
      label: 'Aset',
      total: totalAssets,
      groups: [
        {
          key: 'current',
          label: 'Aset Lancar',
          total: totalCurrentAssets,
          accounts: currentAssets,
        },
        {
          key: 'non-current',
          label: 'Aset Tidak Lancar',
          total: totalNonCurrentAssets,
          accounts: nonCurrentAssets,
        },
        {
          key: 'depreciation',
          label: 'Penyusutan dan Amortisasi',
          total: totalDepreciationAmortization,
          accounts: depreciationAmortization,
        },
      ],
    },
    {
      key: 'liabilities',
      label: 'Liabilitas',
      total: totalLiabilities,
      groups: [
        {
          key: 'short',
          label: 'Jangka Pendek',
          total: totalCurrentLiabilities,
          accounts: currentLiabilities,
        },
        {
          key: 'long',
          label: 'Jangka Panjang',
          total: totalNonCurrentLiabilities,
          accounts: nonCurrentLiabilities,
        },
      ],
    },
    {
      key: 'equity',
      label: 'Ekuitas',
      total: totalEquity,
      groups: [{ key: 'equity', label: 'Ekuitas', total: totalEquity, accounts: equity }],
    },
  ];

  return {
    endDate: safeString(data.endDate ?? data.as_of, fallbackDate),
    precision: optionalPrecision(data.precision),
    negativeFormat:
      data.negativeFormat === 'minus' || data.negativeFormat === 'parentheses'
        ? data.negativeFormat
        : undefined,
    sections,
    assets: {
      currentAssets,
      nonCurrentAssets,
      depreciationAmortization,
      totalCurrentAssets,
      totalNonCurrentAssets,
      totalDepreciationAmortization,
      netNonCurrentAssets,
      calculatedTotal: addMoney([
        totalCurrentAssets,
        totalNonCurrentAssets,
        totalDepreciationAmortization,
      ]),
    },
    liabilities: {
      currentLiabilities,
      nonCurrentLiabilities,
      totalCurrentLiabilities,
      totalNonCurrentLiabilities,
      allLiabilities,
      calculatedTotal: addMoney([totalCurrentLiabilities, totalNonCurrentLiabilities]),
    },
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity: addMoney([totalLiabilities, totalEquity]),
    isBalanced: Math.abs(discrepancy) < 0.01,
    discrepancy,
    journalCount: data.journalCount == null ? undefined : safeNumber(data.journalCount),
    currentYearProfit:
      data.currentYearProfit == null ? undefined : safeNumber(data.currentYearProfit),
    priorYearProfit: data.priorYearProfit == null ? undefined : safeNumber(data.priorYearProfit),
    modules: Object.keys(asRecord(data.modules)).length
      ? Object.fromEntries(
          Object.entries(asRecord(data.modules)).map(([key, count]) => [key, safeNumber(count)])
        )
      : undefined,
    unmapped: mapCalloutAccounts(data.unmapped),
    overdrafts: mapCalloutAccounts(data.overdrafts),
  };
}

export function mapBalanceSheetResponse(
  raw: unknown,
  queryParams: BalanceSheetQueryParams
): BalanceSheetData {
  const envelope = asRecord(raw);
  const payload = asRecord(envelope.data ?? raw);
  const currentPayload = payload.current ?? payload;
  const current = mapSnapshot(currentPayload, queryParams.endDate);
  const comparePayload = payload.compare;
  const compare =
    comparePayload == null
      ? null
      : mapSnapshot(comparePayload, queryParams.comparePeriod?.endDate ?? queryParams.endDate);
  return {
    ...current,
    startDate: queryParams.startDate,
    compareAsOf: compare ? compare.endDate : undefined,
    compare,
  };
}
