import { useState } from 'react';
import dayjs from 'dayjs';
import { lastClosedMonth } from '@/module/assets/domain/writeOffRules';
import { useAssets } from '@/module/assets/presentation/hooks/useAssetQueries';
import {
  useCurrentUserId,
  useWriteOffDecisions,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';

/** Largest page the asset list serves; the hub shows every pending asset and every one behind. */
const LIST_LIMIT = 100;

/**
 * Everything in Assets that waits on someone: reports the user can decide, the user's own
 * reports in flight, assets to activate and assets whose depreciation is behind. Shared by the
 * panel on the asset list and the "Menunggu Anda" page.
 */
export const useNeedsYou = () => {
  const [today] = useState(() => dayjs().format('YYYY-MM-DD'));
  const decisions = useWriteOffDecisions();
  const me = useCurrentUserId();
  const pendingAssets = useAssets({ page: 1, limit: LIST_LIMIT, status: 'pending' });
  const activeAssets = useAssets({ page: 1, limit: LIST_LIMIT, status: 'active' });

  const pending = pendingAssets.data?.items ?? [];
  const behind = (activeAssets.data?.items ?? []).filter(
    (asset) => asset.depreciationDue.months > 0
  );
  const behindTotal = behind.reduce((sum, asset) => sum + asset.depreciationDue.amount, 0);
  const own = me.data
    ? decisions.pending.filter((report) => report.createdBy.id === me.data && !report.canDecide)
    : [];
  const loading = decisions.isLoading || pendingAssets.isLoading || activeAssets.isLoading;
  const failed = decisions.query.isError || pendingAssets.isError || activeAssets.isError;
  const total = decisions.count + pending.length + behind.length + own.length;

  return {
    decisions: decisions.reports,
    own,
    pending,
    behind,
    behindTotal,
    upTo: lastClosedMonth(today),
    total,
    loading,
    failed,
    // Zero counts from a failed request must never read as "nothing waits".
    allDone: !loading && !failed && total === 0,
    retry: () => {
      decisions.query.refetch();
      pendingAssets.refetch();
      activeAssets.refetch();
    },
  };
};
