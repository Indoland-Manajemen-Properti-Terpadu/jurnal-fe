import { postV2 } from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import type { BankCashTransactionPayload } from '@/module/bank-cash/domain/transactionTypes';

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

  const response = await postV2(API_ACCOUNT.POST_TRANSACTION_ACCOUNT, payload);
  if (!response || (response.status !== 200 && response.status !== 201)) {
    const errorMsg =
      response?.data?.message ||
      response?.statusText ||
      'Gagal membukukan transaksi kas & bank ke sistem akuntansi.';
    throw new Error(errorMsg);
  }
  return response.data;
};
