import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import type { ConfirmImportPayload } from '../domain/importDraft';
import { toStatementRows } from './bankStatementMapper';
import type { BankStatementModelV2 } from '../domain/bankStatement';

export const fetchBankStatement = async (idAccount: string): Promise<BankStatementModelV2> => {
  const { data } = await apiClient.get<unknown>(
    `${API_ACCOUNT.GET_BANK_STATEMENT}?accountId=${idAccount}`
  );
  return { results: toStatementRows(data) };
};

/** Uploads the file for parsing; the body holds the preview rows. */
export const uploadBankStatement = async (idAccount: string, file: File): Promise<unknown> => {
  const formData = new FormData();
  formData.append('accountId', idAccount);
  formData.append('file', file);
  const { data } = await apiClient.post<unknown>(API_ACCOUNT.POST_IMPORT_BANK_STATEMENT, formData);
  return data;
};

export type ImportResponse = { status?: number; code?: number; message?: string; data?: unknown };

export const confirmBankStatementImport = async (
  payload: ConfirmImportPayload
): Promise<ImportResponse> => {
  const { data } = await apiClient.post<ImportResponse>(
    API_ACCOUNT.POST_CONFIRM_IMPORT_BANK_STATEMENT,
    payload
  );
  return data;
};

/** Known gap: the endpoint constant ends with a slash, so the URL has `//` before the id. */
export const commitBankStatementImport = async (
  idAccount: string,
  payload: Record<string, unknown>
): Promise<ImportResponse> => {
  const { data } = await apiClient.post<ImportResponse>(
    `${API_ACCOUNT.POST_COMMIT_IMPORT_BANK_STATEMENT}/${idAccount}`,
    payload
  );
  return data;
};

/** The server's own message of a failed request, or the fallback. */
export const errorMessage = (error: unknown, fallback: string): string =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;

/** True when the server answered with an error status (as opposed to a network failure). */
export const hasResponse = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response !== undefined;

export const bodyMessage = (body: unknown): string | undefined =>
  (body as { message?: string } | null | undefined)?.message;
