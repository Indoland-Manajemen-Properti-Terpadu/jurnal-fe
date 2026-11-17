import { useQuery } from '@tanstack/react-query';
import { fetchAssetDecisionCount } from '@/module/asset-decisions/infrastructure/assetDecisionApi';

/** Shares the `asset-write-offs` key prefix, so filing or deciding a report refreshes the badge. */
export const assetDecisionCountKey = ['asset-write-offs', 'decision-count'] as const;

const REFRESH_MS = 30_000;

/** Polls every 30 s, but stops once the server refused: a user without access would be refused forever. */
export const decisionRefreshInterval = (status: string): number | false =>
  status === 'error' ? false : REFRESH_MS;

export const useAssetDecisionCount = () =>
  useQuery({
    queryKey: assetDecisionCountKey,
    queryFn: fetchAssetDecisionCount,
    retry: false,
    refetchInterval: (query) => decisionRefreshInterval(query.state.status),
  });
