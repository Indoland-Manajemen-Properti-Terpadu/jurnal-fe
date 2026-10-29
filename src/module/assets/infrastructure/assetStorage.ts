import {
  AssetCategory,
  AssetFormValues,
  AssetItem,
  DepreciationScheduleItem,
} from '@/module/assets/domain/asset';

const STORAGE_KEY = 'jurnal_fixed_assets_data';

export const calculateAssetDepreciation = (
  cost: number,
  residual: number,
  usefulLifeYears: number,
  method: 'straight_line' | 'double_declining' | 'none',
  acquisitionDateStr: string
): { accumulatedDepreciation: number; netBookValue: number } => {
  if (method === 'none' || usefulLifeYears <= 0) {
    return {
      accumulatedDepreciation: 0,
      netBookValue: cost,
    };
  }

  const acquisitionDate = new Date(acquisitionDateStr);
  const now = new Date();

  // Calculate elapsed months
  let monthsElapsed =
    (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
    (now.getMonth() - acquisitionDate.getMonth());

  if (monthsElapsed < 0) monthsElapsed = 0;

  const totalMonths = usefulLifeYears * 12;
  const depreciableAmount = Math.max(0, cost - residual);

  if (method === 'straight_line') {
    const monthlyDep = depreciableAmount / totalMonths;
    const cappedMonths = Math.min(monthsElapsed, totalMonths);
    const accum = Math.round(monthlyDep * cappedMonths);
    const nbv = Math.max(residual, cost - accum);
    return {
      accumulatedDepreciation: accum,
      netBookValue: nbv,
    };
  }

  // Double declining
  if (method === 'double_declining') {
    const annualRate = 2 / usefulLifeYears;
    let currentBookValue = cost;
    const yearsElapsed = Math.min(usefulLifeYears, monthsElapsed / 12);
    const fullYears = Math.floor(yearsElapsed);
    const partialYearFraction = yearsElapsed - fullYears;

    for (let y = 0; y < fullYears; y++) {
      const depYear = currentBookValue * annualRate;
      currentBookValue = Math.max(residual, currentBookValue - depYear);
    }
    if (partialYearFraction > 0 && currentBookValue > residual) {
      const depPartial = currentBookValue * annualRate * partialYearFraction;
      currentBookValue = Math.max(residual, currentBookValue - depPartial);
    }

    const accum = Math.round(cost - currentBookValue);
    return {
      accumulatedDepreciation: accum,
      netBookValue: Math.round(currentBookValue),
    };
  }

  return { accumulatedDepreciation: 0, netBookValue: cost };
};

const INITIAL_SEED_ASSETS: AssetItem[] = [
  {
    id: 'asset-001',
    code: 'AST-KND-001',
    name: 'Kendaraan Operasional Toyota Avanza 1.5G',
    category: 'vehicle',
    acquisitionDate: '2023-01-15',
    acquisitionCost: 265000000,
    residualValue: 50000000,
    usefulLifeYears: 5,
    depreciationMethod: 'straight_line',
    accumulatedDepreciation: 71666667,
    netBookValue: 193333333,
    status: 'active',
    notes: 'Kendaraan operasional tim lapangan & logistik Jakarta.',
  },
  {
    id: 'asset-002',
    code: 'AST-GDG-001',
    name: 'Gedung Kantor Pusat & Ruko Komersial 3 Lantai',
    category: 'building',
    acquisitionDate: '2021-06-01',
    acquisitionCost: 2200000000,
    residualValue: 400000000,
    usefulLifeYears: 20,
    depreciationMethod: 'straight_line',
    accumulatedDepreciation: 292500000,
    netBookValue: 1907500000,
    status: 'active',
    notes: 'Kantor pusat terdaftar dengan sertifikat hak milik (SHM).',
  },
  {
    id: 'asset-003',
    code: 'AST-MSN-001',
    name: 'Mesin Produksi & Line Packaging Otomatis',
    category: 'machinery',
    acquisitionDate: '2022-09-10',
    acquisitionCost: 520000000,
    residualValue: 40000000,
    usefulLifeYears: 8,
    depreciationMethod: 'straight_line',
    accumulatedDepreciation: 125000000,
    netBookValue: 395000000,
    status: 'active',
    notes: 'Unit mesin pabrikasi utama dengan garansi servis berkala.',
  },
  {
    id: 'asset-004',
    code: 'AST-ELK-001',
    name: 'Apple MacBook Pro 16" M3 Max (Dev Team Lead)',
    category: 'electronic',
    acquisitionDate: '2024-01-10',
    acquisitionCost: 54000000,
    residualValue: 6000000,
    usefulLifeYears: 4,
    depreciationMethod: 'straight_line',
    accumulatedDepreciation: 19000000,
    netBookValue: 35000000,
    status: 'active',
    notes: 'Inventaris workstation utama tim arsitektur & rekayasa sistem.',
  },
  {
    id: 'asset-005',
    code: 'AST-ELK-002',
    name: 'Server Rack Enterprise & Switch Cisco Jaringan',
    category: 'electronic',
    acquisitionDate: '2022-04-15',
    acquisitionCost: 110000000,
    residualValue: 10000000,
    usefulLifeYears: 5,
    depreciationMethod: 'straight_line',
    accumulatedDepreciation: 53333333,
    netBookValue: 56666667,
    status: 'active',
    notes: 'Infrastruktur on-premise private server & router cadangan.',
  },
  {
    id: 'asset-006',
    code: 'AST-TNH-001',
    name: 'Tanah Kavling Area Gudang Logistik Barat',
    category: 'land',
    acquisitionDate: '2020-03-20',
    acquisitionCost: 1750000000,
    residualValue: 1750000000,
    usefulLifeYears: 0,
    depreciationMethod: 'none',
    accumulatedDepreciation: 0,
    netBookValue: 1750000000,
    status: 'active',
    notes: 'Tanah tidak disusutkan sesuai standar akuntansi PSAK.',
  },
];

export const loadStoredAssets = (): AssetItem[] => {
  if (typeof window === 'undefined') return INITIAL_SEED_ASSETS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_ASSETS));
      return INITIAL_SEED_ASSETS;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Recalculate dynamic accumulated depreciation & NBV based on current date
      return parsed.map((asset: AssetItem) => {
        if (asset.status === 'disposed') return asset;
        const { accumulatedDepreciation, netBookValue } = calculateAssetDepreciation(
          asset.acquisitionCost,
          asset.residualValue,
          asset.usefulLifeYears,
          asset.depreciationMethod,
          asset.acquisitionDate
        );
        const isFullyDep =
          asset.depreciationMethod !== 'none' && netBookValue <= asset.residualValue;
        return {
          ...asset,
          accumulatedDepreciation,
          netBookValue,
          status: isFullyDep ? ('fully_depreciated' as const) : ('active' as const),
        };
      });
    }
    return INITIAL_SEED_ASSETS;
  } catch (e) {
    console.error('[AssetStorage] Failed to parse stored assets:', e);
    return INITIAL_SEED_ASSETS;
  }
};

export const persistAssets = (assets: AssetItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  } catch (e) {
    console.error('[AssetStorage] Failed to persist assets:', e);
  }
};

export const generateDepreciationSchedule = (asset: AssetItem): DepreciationScheduleItem[] => {
  const schedule: DepreciationScheduleItem[] = [];
  const { acquisitionCost, residualValue, usefulLifeYears, depreciationMethod, acquisitionDate } =
    asset;

  if (depreciationMethod === 'none' || usefulLifeYears <= 0) {
    return [
      {
        yearNumber: 1,
        yearDate: acquisitionDate ? acquisitionDate.substring(0, 4) : 'Tahun 1',
        beginningBookValue: acquisitionCost,
        depreciationExpense: 0,
        accumulatedDepreciation: 0,
        endingBookValue: acquisitionCost,
      },
    ];
  }

  const startYear = acquisitionDate
    ? parseInt(acquisitionDate.substring(0, 4), 10)
    : new Date().getFullYear();
  let currentBeginning = acquisitionCost;
  let runningAccum = 0;
  const depreciableAmount = Math.max(0, acquisitionCost - residualValue);

  if (depreciationMethod === 'straight_line') {
    const annualDep = Math.round(depreciableAmount / usefulLifeYears);

    for (let i = 1; i <= usefulLifeYears; i++) {
      const isLastYear = i === usefulLifeYears;
      const expense = isLastYear
        ? Math.max(0, currentBeginning - residualValue)
        : Math.min(annualDep, currentBeginning - residualValue);
      runningAccum += expense;
      const ending = Math.max(residualValue, currentBeginning - expense);

      schedule.push({
        yearNumber: i,
        yearDate: `${startYear + i - 1}`,
        beginningBookValue: currentBeginning,
        depreciationExpense: expense,
        accumulatedDepreciation: runningAccum,
        endingBookValue: ending,
      });

      currentBeginning = ending;
    }
  } else if (depreciationMethod === 'double_declining') {
    const rate = 2 / usefulLifeYears;

    for (let i = 1; i <= usefulLifeYears; i++) {
      const isLastYear = i === usefulLifeYears;
      let expense = Math.round(currentBeginning * rate);
      if (currentBeginning - expense < residualValue || isLastYear) {
        expense = Math.max(0, currentBeginning - residualValue);
      }
      runningAccum += expense;
      const ending = Math.max(residualValue, currentBeginning - expense);

      schedule.push({
        yearNumber: i,
        yearDate: `${startYear + i - 1}`,
        beginningBookValue: currentBeginning,
        depreciationExpense: expense,
        accumulatedDepreciation: runningAccum,
        endingBookValue: ending,
      });

      currentBeginning = ending;
    }
  }

  return schedule;
};
