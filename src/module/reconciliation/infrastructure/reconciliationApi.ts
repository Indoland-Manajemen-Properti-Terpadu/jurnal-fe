import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/services/endpoint';
import { recommendedBalance } from '../domain/matchRules';
import type { GetReconciliationModel, JournalDetail, MatchPayload } from '../domain/reconciliation';

type Body = { data?: unknown; results?: unknown } | unknown[] | null | undefined;

/** The server wraps its payload as `{ data: ... }`; an unwrapped body is accepted too. */
const unwrap = <T>(body: unknown): T => ((body as { data?: T } | null)?.data || body) as T;

export const fetchReconciliation = async (idAccount: string): Promise<GetReconciliationModel> => {
  const { data: body } = await apiClient.get<unknown>(
    `${API_ACCOUNT.GET_RECONCILIATION}${idAccount}`
  );
  const data = unwrap<Partial<GetReconciliationModel> | undefined>(body);
  const balance =
    data?.balance || (data?.bankStatements ? recommendedBalance(data.bankStatements) : 0);
  return { ...data, balance: balance || 0 } as GetReconciliationModel;
};

/** API answers `{ data: { results: [...] } }`; the other shapes are accepted for safety. */
export const toJournalDetails = (body: Body): JournalDetail[] => {
  const wrapped = body as { data?: { results?: unknown } | unknown[]; results?: unknown };
  const nested = (wrapped?.data as { results?: unknown } | undefined)?.results;
  if (Array.isArray(nested)) return nested as JournalDetail[];
  if (Array.isArray(wrapped?.results)) return wrapped.results as JournalDetail[];
  if (Array.isArray(wrapped?.data)) return wrapped.data as JournalDetail[];
  if (Array.isArray(body)) return body as JournalDetail[];
  return [];
};

export const fetchJournalDetailsForRecon = async (
  bankStatementId: string
): Promise<JournalDetail[]> => {
  const url = API_ACCOUNT.GET_JOURNAL_DETAILS_FOR_RECON.replace(
    ':bankStatementId',
    bankStatementId
  );
  const { data } = await apiClient.get<Body>(url);
  return toJournalDetails(data);
};

/** `match-multiple`; a failed request throws (status >= 400). */
export const matchReconciliation = async (payload: MatchPayload): Promise<unknown> => {
  const { data } = await apiClient.post<unknown>(API_ACCOUNT.MATCH_RECONCILIATION, payload);
  return data;
};

/** The server's own message of a failed match, else the transport message. */
export const matchErrorMessage = (error: unknown): string | undefined =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || error.message
    : (error as { message?: string } | null)?.message;
