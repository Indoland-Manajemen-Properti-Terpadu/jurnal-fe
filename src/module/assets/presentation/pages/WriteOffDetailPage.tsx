import { Badge, Box, Button, Grid, Group, Menu, Skeleton, Stack } from '@mantine/core';
import {
  IconArrowLeft,
  IconBook2,
  IconBuildingWarehouse,
  IconCalendarEvent,
  IconCoins,
  IconDots,
  IconDownload,
  IconFileCertificate,
  IconScale,
  IconTag,
} from '@tabler/icons-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { documentTitleKey } from '@/module/assets/domain/writeOffRules';
import { AssetHero } from '@/module/assets/presentation/components/AssetHero';
import { AssetHighlights } from '@/module/assets/presentation/components/AssetHighlights';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import { WriteOffApprovalCard } from '@/module/assets/presentation/components/WriteOffApprovalCard';
import {
  WriteOffAssetCard,
  WriteOffChronologyCard,
  WriteOffEvidenceCard,
  WriteOffSignaturesCard,
  WriteOffValuesCard,
} from '@/module/assets/presentation/components/WriteOffDetailSections';
import { WriteOffStateCard } from '@/module/assets/presentation/components/WriteOffStateCard';
import { WRITE_OFF_STATUS_COLOR } from '@/module/assets/presentation/components/writeOffStatusMeta';
import {
  useDownloadWriteOffPdf,
  useWriteOff,
} from '@/module/assets/presentation/hooks/useWriteOffQueries';
import { isNotFoundError } from '@/module/assets/infrastructure/assetApi';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

/**
 * One write-off report, laid out like the purchasing documents: number and status in the header,
 * the four facts that matter in a strip, the details on the left and the approval on the right.
 * The router wraps it in `AppShellLayout`.
 */
export function WriteOffDetailPage() {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const report = useWriteOff(id);
  const download = useDownloadWriteOffPdf();
  const { data } = report;

  // A report opened from a shared link has no page to go back to; the hub is the natural home.
  const back = () => (location.key === 'default' ? navigate(routes.assets.needsYou) : navigate(-1));

  const renderBody = () => {
    if (report.isLoading) {
      return (
        <Stack gap="lg">
          <Skeleton h={76} radius="lg" />
          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Skeleton h={420} radius="lg" />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Skeleton h={220} radius="lg" />
            </Grid.Col>
          </Grid>
        </Stack>
      );
    }
    if (report.isError && !isNotFoundError(report.error)) {
      return (
        <WriteOffStateCard
          illustration="lost"
          title={t('loadFailed')}
          body={t('loadFailedBody')}
          action={
            <Button variant="default" radius="md" onClick={() => report.refetch()}>
              {t('retry')}
            </Button>
          }
        />
      );
    }
    if (!data) {
      return (
        <WriteOffStateCard
          illustration="lost"
          title={t('reportNotFoundTitle')}
          body={t('reportNotFoundBody')}
          action={
            <Button component={Link} to={routes.assets.needsYou} variant="default" radius="md">
              {t('needsYouTitle')}
            </Button>
          }
        />
      );
    }

    const booked = data.result;
    const bookValue = booked?.bookValue ?? data.snapshot.bookValue;
    const gainLoss = booked?.gainLoss ?? data.snapshot.estimatedGainLoss;
    const estimate = !booked && data.status === 'PENDING_APPROVAL';

    const roles = data.waitingOnRoles.join(', ') || t('roleApprover');
    const banner =
      data.status === 'APPROVED'
        ? {
            title: t('bannerApprovedTitle'),
            body: t('bannerApprovedBody'),
            art: 'approved' as const,
          }
        : data.status === 'REJECTED'
          ? {
              title: t('bannerRejectedTitle'),
              body: t('bannerRejectedBody'),
              art: 'rejected' as const,
            }
          : data.canDecide
            ? {
                title: t('bannerDecideTitle'),
                body: t('bannerDecideBody'),
                art: 'submitted' as const,
              }
            : {
                title: t('bannerWaitTitle', { roles }),
                body: t('bannerWaitBody'),
                art: 'submitted' as const,
              };

    return (
      <Stack gap="lg">
        <AssetHero
          title={banner.title}
          body={banner.body}
          illustration={banner.art}
          artWidth={banner.art === 'submitted' ? 150 : 110}
          compact
        />
        <AssetHighlights
          items={[
            { icon: IconTag, label: t('colType'), value: t(`type_${data.type}`) },
            {
              icon: IconCalendarEvent,
              label: t('docIncidentDate'),
              value: formatAssetDate(data.incidentDate),
            },
            {
              icon: IconCoins,
              label: t('bookValue'),
              value: formatAssetMoney(bookValue, precision),
            },
            {
              icon: IconScale,
              label: gainLoss > 0 ? t('gain') : gainLoss < 0 ? t('loss') : t('breakEven'),
              value: formatAssetMoney(Math.abs(gainLoss), precision),
              hint: estimate ? t('estimateShort') : undefined,
            },
          ]}
        />
        <Grid gutter="lg" align="flex-start">
          {/* On a phone the approval comes first; the details follow. */}
          <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
            <Stack gap="lg">
              <WriteOffChronologyCard report={data} />
              <WriteOffValuesCard report={data} />
              <WriteOffEvidenceCard report={data} />
              <WriteOffAssetCard report={data} />
              <WriteOffSignaturesCard report={data} />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
            <WriteOffApprovalCard report={data} />
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };

  const assetLink = data ? routes.assets.detail.replace(':id', data.assetId) : '';

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconFileCertificate}
          title={
            data ? (
              <Group gap="sm" align="center">
                <span>{data.number}</span>
                <Badge color={WRITE_OFF_STATUS_COLOR[data.status]} variant="light" radius="sm">
                  {t(`status_${data.status}`)}
                </Badge>
              </Group>
            ) : (
              t('docTitleDraft')
            )
          }
          description={
            data
              ? `${t(documentTitleKey(data.type))} · ${data.snapshot.code} · ${data.snapshot.name}`
              : ''
          }
          actions={
            <>
              <Button
                variant="default"
                radius="md"
                leftSection={<IconArrowLeft size={16} />}
                onClick={back}
              >
                {t('back')}
              </Button>
              {data && (
                <>
                  <Button
                    variant="default"
                    radius="md"
                    leftSection={<IconDownload size={16} />}
                    loading={download.isPending}
                    onClick={() => download.mutate(data.id)}
                  >
                    {t('downloadPdf')}
                  </Button>
                  <Menu position="bottom-end" withinPortal>
                    <Menu.Target>
                      <Button variant="default" radius="md" px="xs" aria-label={t('moreActions')}>
                        <IconDots size={18} />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        component={Link}
                        to={assetLink}
                        leftSection={<IconBuildingWarehouse size={16} />}
                      >
                        {t('viewAsset')}
                      </Menu.Item>
                      {data.status === 'APPROVED' && (
                        <Menu.Item
                          component={Link}
                          to={`${assetLink}?tab=journals`}
                          leftSection={<IconBook2 size={16} />}
                        >
                          {t('viewJournals')}
                        </Menu.Item>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </>
          }
        />
        {renderBody()}
      </Stack>
    </Box>
  );
}

export default WriteOffDetailPage;
