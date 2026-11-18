import { Box, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import {
  IconArrowRight,
  IconCalendarDue,
  IconFileCertificate,
  IconPackageImport,
  IconSend,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { AssetIllustration } from '@/module/assets/presentation/components/AssetIllustration';
import { formatAssetMonth, timeAgo } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/WorkList.module.css';
import { WorkRow, type WorkRowProps } from '@/module/assets/presentation/components/WorkRow';
import { useNeedsYou } from '@/module/assets/presentation/hooks/useNeedsYou';
import { useDecimalPrecision } from '@/module/settings';
import { routes } from '@/router/routes';

/** Rows the panel shows; the rest waits on the page itself. */
const MAX_ROWS = 4;

type Row = WorkRowProps & { key: string };

/**
 * "Menunggu Anda" under the asset list header, built like the purchasing work queue: a standard
 * card, a neutral count, rows that open where the work is done, and one way to the full page.
 */
export function NeedsYouCard() {
  const { t, i18n } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  const needs = useNeedsYou();
  const hub = routes.assets.needsYou;
  const report = (id: string) => routes.assets.writeOffDetail.replace(':id', id);
  const ago = (iso: string) => {
    const { key, count } = timeAgo(iso);
    return t(key, { count });
  };

  const rows: Row[] = [
    ...needs.decisions.map((item) => ({
      key: `decision-${item.id}`,
      icon: IconFileCertificate,
      title: item.number,
      titleSuffix: item.snapshot.name,
      subtitle: `${t('itemDecisionLabel', { type: t(`type_${item.type}`) })} · ${ago(item.submittedAt)}`,
      to: report(item.id),
    })),
    ...(needs.pending.length > 0
      ? [
          {
            key: 'pending',
            icon: IconPackageImport,
            title: t('itemPendingTitle', { count: needs.pending.length }),
            subtitle: needs.pending
              .slice(0, 2)
              .map((asset) => asset.name)
              .join(', '),
            to: `${hub}#needs-you-pending`,
          },
        ]
      : []),
    ...(needs.behind.length > 0
      ? [
          {
            key: 'depreciation',
            icon: IconCalendarDue,
            title: t('itemDepreciationTitle', { count: needs.behind.length }),
            subtitle: t('itemDepreciationSub', {
              amount: formatAssetMoney(needs.behindTotal, precision),
              month: formatAssetMonth(needs.upTo, i18n.language),
            }),
            to: `${hub}#needs-you-depreciation`,
          },
        ]
      : []),
    ...needs.own.map((item) => ({
      key: `own-${item.id}`,
      icon: IconSend,
      title: item.number,
      titleSuffix: item.snapshot.name,
      subtitle: `${t('journeyWaiting', {
        roles: item.waitingOnRoles.join(', ') || t('roleApprover'),
      })} · ${ago(item.submittedAt)}`,
      to: report(item.id),
    })),
  ];
  const shown = rows.slice(0, MAX_ROWS);
  const more = rows.length - shown.length;

  const body = () => {
    if (needs.loading) {
      return (
        <Stack gap="sm">
          {Array.from({ length: 3 }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} height={34} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (needs.failed) {
      return (
        <EmptyState
          color="red"
          title={t('loadFailed')}
          description={t('loadFailedBody')}
          actionLabel={t('retry')}
          onAction={needs.retry}
          py={24}
        />
      );
    }
    if (needs.allDone) {
      return null;
    }
    return (
      <div className={classes.list}>
        {shown.map(({ key, ...row }) => (
          <WorkRow key={key} {...row} />
        ))}
        {more > 0 && (
          <Text size="xs" c="dimmed" ta="center" className={classes.more}>
            {t('moreWaiting', { count: more })}
          </Text>
        )}
      </div>
    );
  };

  const headline =
    needs.allDone || rows.length === 0
      ? t('cardAllDone')
      : t('panelHeadline', { count: needs.total });

  return (
    <Paper withBorder radius="md" bg="white" p={{ base: 'md', sm: 'lg' }} h="100%">
      <Group justify="space-between" align="center" wrap="nowrap" mb="md" gap="lg">
        <Stack gap={6} miw={0}>
          <Group gap="xs" wrap="nowrap">
            <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
              {t('needsYouTitle')}
            </Text>
          </Group>
          {needs.allDone && (
            <Text fz="sm" fw={600} c="dark.9">
              {t('allDoneTitle')}
            </Text>
          )}
          <Text fz="sm" c="dimmed" maw="46ch">
            {needs.loading || needs.failed ? t('needsYouCardSub') : headline}
          </Text>
          <Button
            component={Link}
            to={hub}
            variant="default"
            size="xs"
            radius="md"
            w="fit-content"
            mt={4}
            rightSection={<IconArrowRight size={14} />}
          >
            {t('openAll')}
          </Button>
        </Stack>
        <Box visibleFrom="md" w={200} style={{ flex: 'none' }}>
          <AssetIllustration name={needs.allDone ? 'allDone' : 'needsYou'} maxWidth={200} />
        </Box>
      </Group>
      {body()}
    </Paper>
  );
}

export default NeedsYouCard;
