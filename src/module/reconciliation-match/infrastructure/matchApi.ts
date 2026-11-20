import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/lib/http/endpoints';

/** The server wraps its payload as `{ data: ... }`. */
const unwrap = <T>(body: unknown): T => ((body as { data?: T } | null)?.data || body) as T;

/** `DELETE /cancel/:matchId`: the statement rows go back to "not matched" and the journal can be voided again. */
export const cancelReconciliationMatch = async (matchId: string): Promise<unknown> => {
  const url = API_ACCOUNT.CANCEL_RECONCILIATION.replace(':matchId', encodeURIComponent(matchId));
  const { data } = await apiClient.delete<unknown>(url);
  return data;
};

/** The active matches of a journal; an empty list means it is not reconciled. */
export const fetchMatchIdsForJournal = async (journalId: string): Promise<string[]> => {
  const { data } = await apiClient.get<unknown>(API_ACCOUNT.GET_RECONCILIATION_MATCHES, {
    params: { journalId },
  });
  const list = unwrap<{ id?: string }[] | undefined>(data);
  return Array.isArray(list)
    ? list.map((match) => match.id).filter((id): id is string => !!id)
    : [];
};
