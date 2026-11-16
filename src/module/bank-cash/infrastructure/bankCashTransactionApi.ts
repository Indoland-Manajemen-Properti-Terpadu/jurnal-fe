import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import type { BankCashTransactionPayload } from '@/module/bank-cash/domain/transactionTypes';

const DEFAULT_FAILURE = 'Gagal membukukan transaksi kas & bank ke sistem akuntansi.';

/** The server's own message when it sent one, otherwise the status text, otherwise a default. */
const failureMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.response?.statusText ||
      DEFAULT_FAILURE
    );
  }
  return DEFAULT_FAILURE;
};

/** The manual journal's multipart shape: JSON fields as text and each file in `attachments`. */
const toFormData = (payload: Record<string, unknown>, attachments: File[]): FormData => {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    body.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });
  attachments.forEach((file) => body.append('attachments', file));
  return body;
};

export const submitBankCashTransaction = async (data: BankCashTransactionPayload) => {
  const payload: Record<string, unknown> = {
    transactionDate: data.transactionDate,
    transactionDetail: data.transactionDetail.map((detail) => ({
      account: detail.account,
      description: detail.description,
      ...(detail.debit !== undefined ? { debit: detail.debit } : {}),
      ...(detail.credit !== undefined ? { credit: detail.credit } : {}),
    })),
  };

  if (data.transactionNumber !== undefined && !Number.isNaN(data.transactionNumber)) {
    payload.transactionNumber = data.transactionNumber;
  }
  if (data.notes && data.notes.trim().length > 0) {
    payload.notes = data.notes.trim();
  }
  if (data.tags && data.tags.length > 0) {
    payload.tags = data.tags;
  }

  const attachments = data.attachments ?? [];

  try {
    const response = await apiClient.post(
      API_ACCOUNT.POST_TRANSACTION_ACCOUNT,
      attachments.length > 0 ? toFormData(payload, attachments) : payload
    );
    return response.data;
  } catch (error) {
    throw new Error(failureMessage(error));
  }
};
