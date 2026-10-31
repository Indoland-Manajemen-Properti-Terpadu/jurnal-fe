export type GeneralSetting = {
  id: string;
  site?: string;
  decimalPrecision: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AccountMappingAccount = {
  id: string;
  name: string;
  accountNumber?: string;
  isArchived?: boolean;
  type?: string;
};

export type AccountMappingItem = {
  id: string;
  site?: string;
  key: string;
  label: string;
  group: 'ar_ap' | 'sales' | 'purchase' | 'inventory' | 'other' | string;
  account?: AccountMappingAccount | null;
};

export type AccountMappingsByGroup = {
  ar_ap?: AccountMappingItem[];
  sales?: AccountMappingItem[];
  purchase?: AccountMappingItem[];
  inventory?: AccountMappingItem[];
  other?: AccountMappingItem[];
  [groupKey: string]: AccountMappingItem[] | undefined;
};

export type NumberFormatType = 'invoice' | 'transaction';

export type NumberFormat = {
  id: string;
  site?: string;
  type: NumberFormatType;
  prefix: string;
  suffix: string;
  status: 'active' | 'inactive';
  startNumber: number;
  currentNumber: number;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateNumberFormatPayload = {
  type: NumberFormatType;
  prefix: string;
  suffix?: string;
  startNumber?: number;
};

export type UpdateNumberFormatPayload = {
  prefix?: string;
  suffix?: string;
  startNumber?: number;
  status?: 'active' | 'inactive';
};

export type PaymentTerm = {
  id: string;
  site?: string;
  name: string;
  days: number;
  isDefault?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePaymentTermPayload = {
  name: string;
  days: number;
};

export type UpdatePaymentTermPayload = {
  name?: string;
  days?: number;
};

export type PaymentMethod = {
  id: string;
  site?: string;
  name: string;
  adminFee: number;
  external_id?: string;
  isDefault?: boolean;
  defaultAccount?: any;
  feeAccount?: any;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePaymentMethodPayload = {
  name: string;
  adminFee?: number;
  defaultAccount?: string | null;
  feeAccount?: string | null;
};

export type UpdatePaymentMethodPayload = {
  name?: string;
  adminFee?: number;
  defaultAccount?: string | null;
  feeAccount?: string | null;
};

export type Tax = {
  id: string;
  site?: any;
  name: string;
  rate: number;
  description?: string | null;
  salesAccount?: any;
  purchaseAccount?: any;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaxPayload = {
  name: string;
  rate: number | string;
  salesAccount?: string;
  purchaseAccount?: string;
};

export type UpdateTaxPayload = {
  name?: string;
  rate?: number | string;
  salesAccount?: string;
  purchaseAccount?: string;
};

export type Tag = {
  id: string;
  site?: string;
  name: string;
  color?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TagListParams = {
  page?: number;
  search?: string;
};
