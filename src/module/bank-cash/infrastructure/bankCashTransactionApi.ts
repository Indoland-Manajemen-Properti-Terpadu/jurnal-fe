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

  try {
    const response = await apiClient.post(API_ACCOUNT.POST_TRANSACTION_ACCOUNT, payload);
    return response.data;
  } catch (error) {
    throw new Error(failureMessage(error));
  }
};
