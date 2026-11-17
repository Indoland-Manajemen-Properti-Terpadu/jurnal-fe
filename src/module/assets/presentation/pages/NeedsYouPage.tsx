import { useEffect } from 'react';
import { Badge, Box, Button, SimpleGrid, Skeleton, Stack } from '@mantine/core';
import {
  IconArrowLeft,
  IconChecklist,
  IconFileCertificate,
  IconHistory,
  IconPackageImport,
  IconSend,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { AssetDialogs } from '@/module/assets/presentation/components/AssetDialogs';
import { AssetFeatureCard } from '@/module/assets/presentation/components/AssetFeatureCard';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { NeedsYouDepreciation } from '@/module/assets/presentation/components/NeedsYouDepreciation';
import { NeedsYouPendingAssets } from '@/module/assets/presentation/components/NeedsYouPendingAssets';
import { NeedsYouReportList } from '@/module/assets/presentation/components/NeedsYouReportList';
import { WriteOffHistoryTable } from '@/module/assets/presentation/components/WriteOffHistoryTable';
import { useAssetDialogs } from '@/module/assets/presentation/hooks/useAssetDialogs';
import { useAssetSummary } from '@/module/assets/presentation/hooks/useAssetQueries';
import { useNeedsYou } from '@/module/assets/presentation/hooks/useNeedsYou';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

const SECTION = {
  decisions: 'needs-you-decisions',
  pending: 'needs-you-pending',
  depreciation: 'needs-you-depreciation',
} as const;

const count = (value: number) => (
  <Badge variant="light" color="gray" radius="sm">
    {value}
  </Badge>
);

/**
 * "Menunggu Anda": three cards for what is waiting, the detail of each, the user's own reports
 * and the report history. It has no sidebar
 * entry of its own: the panel on the asset list opens it, and `#<section>` scrolls to the group a
 * row of that panel points at. The router wraps it in `AppShellLayout`.
 */
export function NeedsYouPage() {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const needs = useNeedsYou();
  const summary = useAssetSummary();
  const dialogs = useAssetDialogs();
  const { decisions, own, pending, behind, behindTotal, loading, failed } = needs;
  // The summary counts every pending asset; the list is one page of at most 100.
  const pendingCount = summary.data?.pending.count ?? pending.length;

  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

  // Scroll to the group the panel pointed at once its rows are on screen.
  useEffect(() => {
    if (!hash || loading) {
      return;
    }
    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [hash, loading]);

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconChecklist}
            title={t('needsYouTitle')}
            description={t('needsYouSubtitle')}
            actions={
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.assets.main)}
              >
                {t('backToList')}
              </Button>
            }
          />

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <AssetFeatureCard
              illustration="decision"
              value={String(decisions.length)}
              title={t('tileDecisions')}
              body={decisions.length > 0 ? t('tileDecisionsSub') : t('tileNothing')}
              actionLabel={t('viewGroup')}
              disabled={decisions.length === 0}
              onAction={() => jump(SECTION.decisions)}
            />
            <AssetFeatureCard
              illustration="pendingAsset"
              value={String(pendingCount)}
              title={t('tilePending')}
              body={t('tilePendingSub', {
                amount: formatAssetMoney(
                  summary.data?.pending.totalAcquisitionCost ?? 0,
                  precision
                ),
              })}
              actionLabel={t('viewGroup')}
              disabled={pendingCount === 0}
              onAction={() => jump(SECTION.pending)}
            />
            <AssetFeatureCard
              illustration="depreciation"
              value={String(behind.length)}
              title={t('tileDepreciation')}
              body={t('tileDepreciationSub', {
                count: behind.length,
                amount: formatAssetMoney(behindTotal, precision),
              })}
              actionLabel={t('viewGroup')}
              disabled={behind.length === 0}
              onAction={() => jump(SECTION.depreciation)}
            />
          </SimpleGrid>

          {loading && <Skeleton h={160} radius="md" />}

          {failed && (
            <AssetCard icon={IconChecklist} title={t('needsYouTitle')}>
              <EmptyState
                color="red"
                title={t('loadFailed')}
                description={t('loadFailedBody')}
                actionLabel={t('retry')}
                onAction={needs.retry}
                py={24}
              />
            </AssetCard>
          )}

          {needs.allDone && (
            <AssetCard icon={IconChecklist} title={t('needsYouTitle')}>
              <EmptyState
                icon={<IconChecklist size={32} stroke={1.6} />}
                title={t('allDoneTitle')}
                description={t('heroBodyDone')}
                py={24}
              />
            </AssetCard>
          )}

          {decisions.length > 0 && (
            <Box id={SECTION.decisions}>
              <AssetCard
                icon={IconFileCertificate}
                title={t('groupDecisions')}
                subtitle={t('groupDecisionsSub')}
                right={count(decisions.length)}
              >
                <NeedsYouReportList reports={decisions} />
              </AssetCard>
            </Box>
          )}

          {pending.length > 0 && (
            <Box id={SECTION.pending}>
              <AssetCard
                icon={IconPackageImport}
                title={t('groupPending')}
                subtitle={t('groupPendingSub')}
                right={count(pending.length)}
              >
                <NeedsYouPendingAssets
                  assets={pending}
                  onActivate={(asset) => dialogs.open({ kind: 'activate', asset })}
                />
              </AssetCard>
            </Box>
          )}

          <NeedsYouDepreciation id={SECTION.depreciation} assets={behind} upTo={needs.upTo} />

          {own.length > 0 && (
            <AssetCard
              icon={IconSend}
              title={t('groupOwn')}
              subtitle={t('groupOwnSub')}
              right={count(own.length)}
            >
              <NeedsYouReportList reports={own} own />
            </AssetCard>
          )}

          <AssetCard icon={IconHistory} title={t('groupHistory')} subtitle={t('groupHistorySub')}>
            <WriteOffHistoryTable />
          </AssetCard>
        </Stack>
      </Box>

      <AssetDialogs dialog={dialogs.dialog} onClose={dialogs.close} />
    </>
  );
}

export default NeedsYouPage;
