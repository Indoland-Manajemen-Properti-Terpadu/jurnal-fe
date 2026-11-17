import { useState } from 'react';
import { Box, Skeleton, Stack } from '@mantine/core';
import {
  IconFileCertificate,
  IconHistory,
  IconInbox,
  IconPackageImport,
  IconSend,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { lastClosedMonth } from '@/module/assets/domain/writeOffRules';
import { AssetDialogs } from '@/module/assets/presentation/components/AssetDialogs';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { NeedsYouDepreciation } from '@/module/assets/presentation/components/NeedsYouDepreciation';
import { NeedsYouPendingAssets } from '@/module/assets/presentation/components/NeedsYouPendingAssets';
import { NeedsYouReportList } from '@/module/assets/presentation/components/NeedsYouReportList';
import { NeedsYouSection } from '@/module/assets/presentation/components/NeedsYouSection';
import { NeedsYouTiles } from '@/module/assets/presentation/components/NeedsYouTiles';
import { WriteOffHistoryTable } from '@/module/assets/presentation/components/WriteOffHistoryTable';
import { WriteOffStateCard } from '@/module/assets/presentation/components/WriteOffStateCard';
import { useAssetDialogs } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { useAssetSummary, useAssets } from '@/module/assets/presentation/hooks/useAssetQueries';
import {
  useCurrentUserId,
  useWriteOffDecisions,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { useDecimalPrecision } from '@/module/settings';

/** Largest page the asset list serves; the hub shows every pending asset and every one behind. */
const LIST_LIMIT = 100;

const SECTION = {
  decisions: 'needs-you-decisions',
  pending: 'needs-you-pending',
  depreciation: 'needs-you-depreciation',
} as const;

/**
 * "Menunggu Anda": everything in Assets that waits on someone — reports to decide, new assets to
 * activate, depreciation behind — then the user's own reports and the report history. The router
 * wraps it in `AppShellLayout`.
 */
export function NeedsYouPage() {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const [today] = useState(() => dayjs().format('YYYY-MM-DD'));
  const decisions = useWriteOffDecisions();
  const me = useCurrentUserId();
  const summary = useAssetSummary();
  const pendingAssets = useAssets({ page: 1, limit: LIST_LIMIT, status: 'pending' });
  const activeAssets = useAssets({ page: 1, limit: LIST_LIMIT, status: 'active' });
  const dialogs = useAssetDialogs();

  const pending = pendingAssets.data?.items ?? [];
  const behind = (activeAssets.data?.items ?? []).filter(
    (asset) => asset.depreciationDue.months > 0
  );
  const behindTotal = behind.reduce((sum, asset) => sum + asset.depreciationDue.amount, 0);
  const own = me.data ? decisions.pending.filter((report) => report.createdBy.id === me.data) : [];
  const loading = decisions.isLoading || pendingAssets.isLoading || activeAssets.isLoading;
  const nothingWaits =
    !loading &&
    decisions.count === 0 &&
    pending.length === 0 &&
    behind.length === 0 &&
    own.length === 0;

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconInbox}
            title={t('needsYouTitle')}
            description={t('needsYouSubtitle')}
          />

          <NeedsYouTiles
            tiles={[
              { key: 'decisions', value: String(decisions.count), target: SECTION.decisions },
              {
                key: 'pending',
                value: String(pending.length),
                sub: t('tilePendingSub', {
                  amount: formatAssetMoney(
                    summary.data?.pending.totalAcquisitionCost ?? 0,
                    precision
                  ),
                }),
                target: SECTION.pending,
              },
              {
                key: 'depreciation',
                value: String(behind.length),
                sub: t('tileDepreciationSub', {
                  count: behind.length,
                  amount: formatAssetMoney(behindTotal, precision),
                }),
                target: SECTION.depreciation,
              },
            ]}
          />

          {loading && <Skeleton h={160} radius="lg" />}

          {nothingWaits && (
            <WriteOffStateCard
              illustration="allDone"
              title={t('allDoneTitle')}
              body={t('allDoneBody')}
            />
          )}

          {decisions.count > 0 && (
            <NeedsYouSection
              id={SECTION.decisions}
              icon={IconFileCertificate}
              title={t('groupDecisions')}
              subtitle={t('groupDecisionsSub')}
              count={decisions.count}
            >
              <NeedsYouReportList reports={decisions.reports} />
            </NeedsYouSection>
          )}

          {pending.length > 0 && (
            <NeedsYouSection
              id={SECTION.pending}
              icon={IconPackageImport}
              color="yellow"
              title={t('groupPending')}
              subtitle={t('groupPendingSub')}
              count={pending.length}
            >
              <NeedsYouPendingAssets
                assets={pending}
                onActivate={(asset) => dialogs.open({ kind: 'activate', asset })}
              />
            </NeedsYouSection>
          )}

          <NeedsYouDepreciation
            id={SECTION.depreciation}
            assets={behind}
            upTo={lastClosedMonth(today)}
          />

          {own.length > 0 && (
            <NeedsYouSection
              id="needs-you-own"
              icon={IconSend}
              color="gray"
              title={t('groupOwn')}
              subtitle={t('groupOwnSub')}
              count={own.length}
            >
              <NeedsYouReportList reports={own} showStatus />
            </NeedsYouSection>
          )}

          <NeedsYouSection
            id="needs-you-history"
            icon={IconHistory}
            color="gray"
            title={t('groupHistory')}
            subtitle={t('groupHistorySub')}
          >
            <WriteOffHistoryTable />
          </NeedsYouSection>
        </Stack>
      </Box>

      <AssetDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </>
  );
}

export default NeedsYouPage;
