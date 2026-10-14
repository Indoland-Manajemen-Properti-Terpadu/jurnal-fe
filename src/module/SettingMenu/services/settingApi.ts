import apiClient from '@/services/apiClient';
import { API_SETTINGS } from '@/services/endpoint';

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

/* =========================================================================
 * GENERAL SETTINGS
 * ========================================================================= */
export type GeneralSetting = {
  id: string;
  site?: string;
  decimalPrecision: number;
  createdAt?: string;
  updatedAt?: string;
};

export const fetchGeneralSettings = async (): Promise<GeneralSetting> => {
  const { data } = await apiClient.get<ApiEnvelope<GeneralSetting>>(API_SETTINGS.GET_GENERAL_SETTINGS);
  return data.data;
};

export const updateGeneralSettings = async (decimalPrecision: number): Promise<GeneralSetting> => {
  const { data } = await apiClient.put<ApiEnvelope<GeneralSetting>>(API_SETTINGS.PUT_GENERAL_SETTINGS, {
    decimalPrecision,
  });
  return data.data;
};

/* =========================================================================
 * ACCOUNT MAPPINGS
 * ========================================================================= */
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

export const fetchAccountMappings = async (): Promise<AccountMappingsByGroup> => {
  const { data } = await apiClient.get<ApiEnvelope<AccountMappingsByGroup>>(API_SETTINGS.GET_ACCOUNT_MAPPINGS);
  return data.data || {};
};

export const seedAccountMappings = async (): Promise<void> => {
  await apiClient.post(API_SETTINGS.POST_SEED_ACCOUNT_MAPPINGS);
};

export const updateAccountMapping = async (id: string, accountId: string): Promise<AccountMappingItem> => {
  const { data } = await apiClient.put<ApiEnvelope<AccountMappingItem>>(
    API_SETTINGS.PUT_ACCOUNT_MAPPING(id),
    { account: accountId }
  );
  return data.data;
};

export const updateAccountMappingBatch = async (
  mappings: Array<{ id: string; account: string }>
): Promise<AccountMappingItem[]> => {
  const { data } = await apiClient.put<ApiEnvelope<AccountMappingItem[]>>(
    API_SETTINGS.PUT_ACCOUNT_MAPPING_BATCH,
    { mappings }
  );
  return data.data;
};

/* =========================================================================
 * NUMBER FORMATS
 * ========================================================================= */
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

export const fetchNumberFormats = async (): Promise<NumberFormat[]> => {
  const { data } = await apiClient.get<ApiEnvelope<NumberFormat[]>>(API_SETTINGS.GET_NUMBER_FORMATS);
  return Array.isArray(data.data) ? data.data : [];
};

export const createNumberFormat = async (payload: CreateNumberFormatPayload): Promise<NumberFormat> => {
  const { data } = await apiClient.post<ApiEnvelope<NumberFormat>>(API_SETTINGS.POST_NUMBER_FORMAT, payload);
  return data.data;
};

export const updateNumberFormat = async (
  id: string,
  payload: UpdateNumberFormatPayload
): Promise<NumberFormat> => {
  const { data } = await apiClient.put<ApiEnvelope<NumberFormat>>(
    API_SETTINGS.PUT_NUMBER_FORMAT(id),
    payload
  );
  return data.data;
};

export const deleteNumberFormat = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_NUMBER_FORMAT(id));
};

/* =========================================================================
 * PAYMENT TERMS
 * ========================================================================= */
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

export const fetchPaymentTerms = async (page = 1): Promise<PaymentTerm[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: PaymentTerm[] } | PaymentTerm[]>>(
    `${API_SETTINGS.GET_PAYMENT_TERMS}?page=${page}`
  );
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.data || [];
};

export const createPaymentTerm = async (payload: CreatePaymentTermPayload): Promise<PaymentTerm> => {
  const { data } = await apiClient.post<ApiEnvelope<PaymentTerm>>(API_SETTINGS.POST_PAYMENT_TERM, payload);
  return data.data;
};

export const updatePaymentTerm = async (
  id: string,
  payload: UpdatePaymentTermPayload
): Promise<PaymentTerm> => {
  const { data } = await apiClient.put<ApiEnvelope<PaymentTerm>>(
    API_SETTINGS.PUT_PAYMENT_TERM(id),
    payload
  );
  return data.data;
};

export const deletePaymentTerm = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_PAYMENT_TERM(id));
};

/* =========================================================================
 * PAYMENT METHODS
 * ========================================================================= */
export type PaymentMethod = {
  id: string;
  site?: string;
  name: string;
  adminFee: number;
  external_id?: string;
  isDefault?: boolean;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePaymentMethodPayload = {
  name: string;
  adminFee?: number;
};

export type UpdatePaymentMethodPayload = {
  name?: string;
  adminFee?: number;
};

export const fetchPaymentMethods = async (page = 1): Promise<PaymentMethod[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: PaymentMethod[] } | PaymentMethod[]>>(
    `${API_SETTINGS.GET_PAYMENT_METHODS}?page=${page}`
  );
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.data || [];
};

export const createPaymentMethod = async (
  payload: CreatePaymentMethodPayload
): Promise<PaymentMethod> => {
  const { data } = await apiClient.post<ApiEnvelope<PaymentMethod>>(
    API_SETTINGS.POST_PAYMENT_METHOD,
    payload
  );
  return data.data;
};

export const updatePaymentMethod = async (
  id: string,
  payload: UpdatePaymentMethodPayload
): Promise<PaymentMethod> => {
  const { data } = await apiClient.put<ApiEnvelope<PaymentMethod>>(
    API_SETTINGS.PUT_PAYMENT_METHOD(id),
    payload
  );
  return data.data;
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_PAYMENT_METHOD(id));
};

/* =========================================================================
 * TAXES
 * ========================================================================= */
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

export const fetchTaxes = async (): Promise<Tax[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: Tax[] } | Tax[]>>(API_SETTINGS.GET_TAXES);
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.data || [];
};

export const createTax = async (payload: CreateTaxPayload): Promise<Tax> => {
  const { data } = await apiClient.post<ApiEnvelope<Tax>>(API_SETTINGS.POST_TAX, payload);
  return data.data;
};

export const updateTax = async (id: string, payload: UpdateTaxPayload): Promise<Tax> => {
  const { data } = await apiClient.put<ApiEnvelope<Tax>>(API_SETTINGS.PUT_TAX(id), payload);
  return data.data;
};

export const deleteTax = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_TAX(id));
};

/* =========================================================================
 * TAGS
 * ========================================================================= */
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

export const fetchTags = async (params?: TagListParams): Promise<Tag[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.search) query.append('search', params.search);

  const url = `${API_SETTINGS.GET_TAGS}${query.toString() ? `?${query.toString()}` : ''}`;
  const { data } = await apiClient.get<ApiEnvelope<{ data: Tag[] } | Tag[]>>(url);
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.data || [];
};

export const createTag = async (payload: { name: string; color?: string }): Promise<Tag> => {
  const { data } = await apiClient.post<ApiEnvelope<Tag>>(API_SETTINGS.POST_TAG, payload);
  return data.data;
};

export const updateTag = async (id: string, payload: { name: string; color?: string }): Promise<Tag> => {
  const { data } = await apiClient.put<ApiEnvelope<Tag>>(API_SETTINGS.PUT_TAG(id), payload);
  return data.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_TAG(id));
};

