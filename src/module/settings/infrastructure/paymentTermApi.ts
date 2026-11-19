import { isAxiosError } from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_SETTINGS } from '@/lib/http/endpoints';
import type { PaymentTerm, PaymentTermAppliesTo, PaymentTermPayload } from '../domain/paymentTerm';
import {
  toPaymentTerm,
  toPaymentTermPage,
  type PaymentTermDto,
  type PaymentTermListDto,
  type PaymentTermPage,
} from './paymentTermMapper';

type ApiEnvelope<T> = { code?: number; message?: string; data: T };

export type PaymentTermListParams = {
  q?: string;
  appliesTo?: PaymentTermAppliesTo;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

/** Only the filters the person chose; `isActive: false` is a real choice and stays. */
const toQuery = (params: PaymentTermListParams): Record<string, string | number | boolean> => {
  const query: Record<string, string | number | boolean> = {};
  const q = params.q?.trim();
  if (q) {
    query.q = q;
  }
  if (params.appliesTo) {
    query.appliesTo = params.appliesTo;
  }
  if (params.isActive !== undefined) {
    query.isActive = params.isActive;
  }
  if (params.page) {
    query.page = params.page;
  }
  if (params.limit) {
    query.limit = params.limit;
  }
  return query;
};

export const fetchPaymentTerms = async (
  params: PaymentTermListParams = {}
): Promise<PaymentTermPage> => {
  const { data } = await apiClient.get<ApiEnvelope<PaymentTermListDto>>(
    API_SETTINGS.GET_PAYMENT_TERMS,
    { params: toQuery(params) }
  );
  return toPaymentTermPage(data.data);
};

export const fetchPaymentTerm = async (id: string): Promise<PaymentTerm> => {
  const { data } = await apiClient.get<ApiEnvelope<PaymentTermDto>>(
    API_SETTINGS.GET_PAYMENT_TERM(id)
  );
  return toPaymentTerm(data.data);
};

export const createPaymentTerm = async (payload: PaymentTermPayload): Promise<PaymentTerm> => {
  const { data } = await apiClient.post<ApiEnvelope<PaymentTermDto>>(
    API_SETTINGS.POST_PAYMENT_TERM,
    payload
  );
  return toPaymentTerm(data.data);
};

export const updatePaymentTerm = async (
  id: string,
  payload: PaymentTermPayload
): Promise<PaymentTerm> => {
  const { data } = await apiClient.put<ApiEnvelope<PaymentTermDto>>(
    API_SETTINGS.PUT_PAYMENT_TERM(id),
    payload
  );
  return toPaymentTerm(data.data);
};

export const setPaymentTermStatus = async (id: string, isActive: boolean): Promise<PaymentTerm> => {
  const { data } = await apiClient.patch<ApiEnvelope<PaymentTermDto>>(
    API_SETTINGS.PATCH_PAYMENT_TERM_STATUS(id),
    { isActive }
  );
  return toPaymentTerm(data.data);
};

export const deletePaymentTerm = async (id: string): Promise<void> => {
  await apiClient.delete(API_SETTINGS.DELETE_PAYMENT_TERM(id));
};

/** The HTTP status and the message the API sent with a failed call, when there are any. */
export const readPaymentTermError = (error: unknown): { status?: number; message?: string } => {
  if (!isAxiosError<{ message?: string }>(error)) {
    return {};
  }
  return { status: error.response?.status, message: error.response?.data?.message };
};

/** The API answers 409 when a term that documents already use is deleted. */
export const isPaymentTermInUseError = (error: unknown): boolean =>
  readPaymentTermError(error).status === 409;
