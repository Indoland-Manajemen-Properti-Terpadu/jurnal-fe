import apiClient from '@/lib/http/apiClient';

type DecisionRowDto = { canDecide?: boolean | null; status?: string | null };
type DecisionPageDto = { data?: { data?: DecisionRowDto[] } };

/** The most reports the count asks for; a site rarely has more waiting at once. */
export const DECISION_LIMIT = 100;

/** Pending write-off reports the signed-in user can decide (`canDecide`). */
export const fetchAssetDecisionCount = async (): Promise<number> => {
  const { data } = await apiClient.get<DecisionPageDto>('/v1/asset-reports', {
    params: { page: 1, limit: DECISION_LIMIT, status: 'PENDING_APPROVAL' },
  });
  return (data.data?.data ?? []).filter((row) => row.canDecide === true).length;
};
