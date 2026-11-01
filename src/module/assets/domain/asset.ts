export type AssetCategory = 'vehicle' | 'building' | 'machinery' | 'electronic' | 'land' | 'other';

export type DepreciationMethod = 'straight_line' | 'double_declining' | 'none';

export type AssetStatus = 'active' | 'fully_depreciated' | 'disposed';

export interface AssetItem {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionCost: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  accumulatedDepreciation: number;
  netBookValue: number;
  status: AssetStatus;
  notes?: string;
  disposalDate?: string;
  disposalPrice?: number;
  disposalGainLoss?: number;
}

export interface AssetFormValues {
  id?: string;
  code: string;
  name: string;
  category: AssetCategory;
  acquisitionDate: string;
  acquisitionCost: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  notes?: string;
}

export interface DepreciationScheduleItem {
  yearNumber: number;
  yearDate: string;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}
