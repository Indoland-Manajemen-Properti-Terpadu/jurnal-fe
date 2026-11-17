import { useQuery } from '@tanstack/react-query';
import { fetchAssetDecisionCount } from '@/module/asset-decisions/infrastructure/assetDecisionApi';

/** Shares the `asset-write-offs` key prefix, so filing or deciding a report refreshes the badge. */
export const assetDecisionCountKey = ['asset-write-offs', 'decision-count'] as const;

const REFRESH_MS = 30_000;

export const useAssetDecisionCount = () =>
  useQuery({
    queryKey: assetDecisionCountKey,
    queryFn: fetchAssetDecisionCount,
    refetchInterval: REFRESH_MS,
  });
