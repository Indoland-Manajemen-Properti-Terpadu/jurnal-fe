import apiClient from '@/lib/http/apiClient';
import { API_SETTINGS } from '@/services/endpoint';
import type {
  GeneralSetting,
  AccountMappingAccount,
  AccountMappingItem,
  AccountMappingsByGroup,
  NumberFormatType,
  NumberFormat,
  CreateNumberFormatPayload,
  UpdateNumberFormatPayload,
  PaymentTerm,
  CreatePaymentTermPayload,
  UpdatePaymentTermPayload,
  PaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload,
  Tax,
  CreateTaxPayload,
  UpdateTaxPayload,
  Tag,
  TagListParams,
} from '@/module/settings/domain/settingTypes';

type ApiEnvelope<T> = {
  code: number;
  message: string;
  data: T;
};

/* =========================================================================
 * GENERAL SETTINGS
 * ========================================================================= */

export const fetchGeneralSettings = async (): Promise<GeneralSetting> => {
  const { data } = await apiClient.get<ApiEnvelope<GeneralSetting>>(
    API_SETTINGS.GET_GENERAL_SETTINGS
  );
  return data.data;
};

export const updateGeneralSettings = async (decimalPrecision: number): Promise<GeneralSetting> => {
  const { data } = await apiClient.put<ApiEnvelope<GeneralSetting>>(
    API_SETTINGS.PUT_GENERAL_SETTINGS,
    {
      decimalPrecision,
    }
  );
  return data.data;
};

/* =========================================================================
 * ACCOUNT MAPPINGS
 * ========================================================================= */

export const fetchAccountMappings = async (): Promise<AccountMappingsByGroup> => {
  const { data } = await apiClient.get<ApiEnvelope<AccountMappingsByGroup>>(
    API_SETTINGS.GET_ACCOUNT_MAPPINGS
  );
  return data.data || {};
};

export const seedAccountMappings = async (): Promise<void> => {
  await apiClient.post(API_SETTINGS.POST_SEED_ACCOUNT_MAPPINGS);
};

export const updateAccountMapping = async (
  id: string,
  accountId: string
): Promise<AccountMappingItem> => {
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

export const fetchNumberFormats = async (): Promise<NumberFormat[]> => {
  const { data } = await apiClient.get<ApiEnvelope<NumberFormat[]>>(
    API_SETTINGS.GET_NUMBER_FORMATS
  );
  return Array.isArray(data.data) ? data.data : [];
};

export const createNumberFormat = async (
  payload: CreateNumberFormatPayload
): Promise<NumberFormat> => {
  const { data } = await apiClient.post<ApiEnvelope<NumberFormat>>(
    API_SETTINGS.POST_NUMBER_FORMAT,
    payload
  );
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

export const fetchPaymentTerms = async (page = 1): Promise<PaymentTerm[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: PaymentTerm[] } | PaymentTerm[]>>(
    `${API_SETTINGS.GET_PAYMENT_TERMS}?page=${page}`
  );
  if (Array.isArray(data.data)) {
    return data.data;
  }
  return data.data?.data || [];
};

export const createPaymentTerm = async (
  payload: CreatePaymentTermPayload
): Promise<PaymentTerm> => {
  const { data } = await apiClient.post<ApiEnvelope<PaymentTerm>>(
    API_SETTINGS.POST_PAYMENT_TERM,
    payload
  );
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

export const fetchTaxes = async (): Promise<Tax[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: Tax[] } | Tax[]>>(
    API_SETTINGS.GET_TAXES
  );
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

export const updateTag = async (
  id: string,
  payload: { name: string; color?: string }
): Promise<Tag> => {
  const { data } = await apiClient.put<ApiEnvelope<Tag>>(API_SETTINGS.PUT_TAG(id), payload);
  return data.data;
};

export const deleteTag = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_TAG(id));
};
