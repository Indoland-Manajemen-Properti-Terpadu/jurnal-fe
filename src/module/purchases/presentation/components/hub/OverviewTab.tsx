import { useState } from 'react';
import {
  Alert,
  Grid,
  Group,
  Pagination,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChecklist,
  IconCoins,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import {
  actionPath,
  actionPrefix,
  lateDays,
  type DashboardAction,
  type DashboardActions,
  type DashboardSummary,
} from '@/module/purchases/domain/dashboard';
import { ReleaseRetentionDialog } from '@/module/purchases/presentation/components/hub/ReleaseRetentionDialog';
import { RetentionTaskRow } from '@/module/purchases/presentation/components/hub/RetentionTaskRow';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useRetentionTasks } from '@/module/purchases/presentation/hooks/useRetention';
import { AgingCard } from '@/module/purchases/presentation/components/hub/AgingCard';
import {
  PurchaseMonthCard,
  TopVendorsCard,
  VendorCreditsCard,
} from '@/module/purchases/presentation/components/hub/DashboardInsights';
import type { ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/OverviewTab.module.css';
import {
  PipelineStrip,
  ProcurementCard,
} from '@/module/purchases/presentation/components/hub/PipelineStrip';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';

const VISIBLE_ROWS = 8;
type SeverityFilter = 'all' | 'stale' | 'warn' | 'ok';

const ActionRow = ({
  action,
  language,
}: Readonly<{ action: DashboardAction; language: string }>) => {
  const { t } = useTranslation('purchases');
  const prefix = actionPrefix(action.key);
  // The service words each action in Indonesian; English readers get a line of ours, never a guess.
  const title =
    language === 'id'
      ? action.title
      : prefix
        ? t(`hub.overview.action.${prefix}`)
        : t('hub.overview.action.other');
  const late = lateDays(action);
  const [documentNumber, ...details] = action.subtitle.split(' · ');
  return (
    <Link
      to={actionPath(action.target)}
      className={classes.row}
      data-severity={action.severity ?? 'ok'}
    >
      <span className={classes.bar} aria-hidden />
      <div className={classes.main}>
        <Text size="md" fw={600} lh={1.3}>
          {title}
        </Text>
        <Text size="xs" c="primary.7" fw={600}>
          {documentNumber}
        </Text>
        {(details.length > 0 || (action.due && late === null)) && (
          <Text size="xs" c="dimmed">
            {details.join(' · ')}
            {action.due &&
              late === null &&
              ` · ${t('hub.overview.dueOn', { date: formatDay(action.due.slice(0, 10), language) })}`}
          </Text>
        )}
        {late !== null && (
          <Text size="xs" c={action.severity === 'stale' ? 'red.7' : 'orange.8'} fw={600}>
            {action.due
              ? t('hub.overview.lateByDate', {
                  count: late,
                  date: formatDay(action.due.slice(0, 10), language),
                })
              : t('hub.overview.lateBy', { count: late })}
          </Text>
        )}
      </div>
      <span className={classes.open}>{t('hub.overview.openAction')}</span>
    </Link>
  );
};

interface OverviewTabProps {
  summary: DashboardSummary | undefined;
  actions: DashboardActions | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  canOpen: (tab: ListTab) => boolean;
  onOpen: (tab: ListTab) => void;
  onOpenReport?: () => void;
  onOpenVendor?: (id: string) => void;
}

/** What needs the user's attention now (the service's own list), where each document stands, payables aging. */
export const OverviewTab = ({
  summary,
  actions,
  isLoading,
  isError,
  refetch,
  canOpen,
  onOpen,
  onOpenReport,
  onOpenVendor,
}: Readonly<OverviewTabProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [page, setPage] = useState(1);
  const items = actions?.items ?? [];
  const filtered = severity === 'all' ? items : items.filter((item) => item.severity === severity);
  const pages = Math.max(1, Math.ceil(filtered.length / VISIBLE_ROWS));
  const activePage = Math.min(page, pages);
  const rows = filtered.slice((activePage - 1) * VISIBLE_ROWS, activePage * VISIBLE_ROWS);
  const counts = actions?.bySeverity;
  const aging = summary?.payables?.aging;
  // Only people who may read the purchasing report get a retention summary, and so its to-dos.
  const retentionTasks = useRetentionTasks(Boolean(summary?.retention)).data ?? [];
  const { can } = usePurchaseAccess();
  const canRelease = can(PURCHASE_MENU.retentionRelease, 'create');
  const [releasing, setReleasing] = useState<string | null>(null);

  const body = () => {
    if (isLoading) {
      return (
        <Stack gap="sm">
          {Array.from({ length: 4 }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} height={34} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (isError) {
      return (
        <EmptyState
          icon={<IconAlertCircle size={32} stroke={1.6} />}
          color="red"
          title={t('list.errorTitle')}
          description={t('list.errorDescription')}
          actionLabel={t('common.retry')}
          onAction={refetch}
        />
      );
    }
    if (items.length === 0) {
      return (
        <EmptyState
          icon={<IconCheck size={32} stroke={1.6} />}
          title={t('hub.overview.emptyTitle')}
          description={t('hub.overview.emptyDescription')}
        />
      );
    }
    const oldest = actions?.oldest ?? items.find((action) => lateDays(action) !== null);
    return (
      <div>
        {actions && actions.late > 0 && oldest && (
          <Alert
            m="lg"
            color="yellow"
            variant="light"
            radius="md"
            icon={<IconAlertTriangle size={18} />}
            title={t('hub.overview.lateAlertTitle', { count: actions.late })}
          >
            {t('hub.overview.lateAlertBody', {
              title: currentLanguage === 'id' ? oldest.title : t('hub.overview.action.other'),
              subtitle: oldest.subtitle,
              days: lateDays(oldest) ?? 0,
            })}
          </Alert>
        )}
        <div className={classes.filters}>
          <SegmentedControl
            aria-label={t('hub.overview.filterActions')}
            value={severity}
            onChange={(value) => {
              setSeverity(value as SeverityFilter);
              setPage(1);
            }}
            data={(
              [
                ['all', actions?.total ?? items.length],
                [
                  'stale',
                  counts?.stale ?? items.filter((item) => item.severity === 'stale').length,
                ],
                ['warn', counts?.warn ?? items.filter((item) => item.severity === 'warn').length],
                ['ok', counts?.ok ?? items.filter((item) => item.severity === 'ok').length],
              ] as const
            ).map(([value, count]) => ({
              value,
              label: `${t(`hub.overview.severity.${value}`)} (${count})`,
            }))}
          />
        </div>
        <div className={classes.list}>
          {rows.length === 0 && (
            <Text p="md" size="sm" c="dimmed">
              {t('hub.overview.noFilteredActions')}
            </Text>
          )}
          {rows.map((action) => (
            <ActionRow key={action.key} action={action} language={currentLanguage} />
          ))}
        </div>
        <Group justify="space-between" p="md" gap="sm" wrap="wrap">
          <Text size="xs" c="dimmed">
            {t('hub.overview.showingActions', {
              from: filtered.length ? (activePage - 1) * VISIBLE_ROWS + 1 : 0,
              to: Math.min(activePage * VISIBLE_ROWS, filtered.length),
              total: filtered.length,
            })}
          </Text>
          {pages > 1 && (
            <Pagination total={pages} value={activePage} onChange={setPage} size="sm" />
          )}
        </Group>
      </div>
    );
  };

  return (
    <Stack gap="lg">
      {releasing && (
        <ReleaseRetentionDialog purchaseOrderId={releasing} onClose={() => setReleasing(null)} />
      )}
      {summary && <PipelineStrip summary={summary} canOpen={canOpen} onOpen={onOpen} />}
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: summary ? 8 : 12 }}>
          <div id="purchase-actions">
            <SectionCard
              icon={IconChecklist}
              plain
              flush
              title={t('hub.overview.workTitle')}
              subtitle={t('hub.overview.workSubtitle')}
              action={
                actions && actions.late > 0 ? (
                  <Text size="xs" c="red.7" fw={600}>
                    {t('hub.overview.lateBadge', { count: actions.late })}
                  </Text>
                ) : undefined
              }
            >
              {body()}
            </SectionCard>
          </div>
        </Grid.Col>
        {summary && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              {aging && onOpenReport && <AgingCard buckets={aging} />}
              {summary.payables?.topVendors && (
                <TopVendorsCard payables={summary.payables} onOpenVendor={onOpenVendor} />
              )}
              {summary.vendorCredits && (
                <VendorCreditsCard credits={summary.vendorCredits} precision={summary.precision} />
              )}
              {summary.purchaseMonth && (
                <PurchaseMonthCard period={summary.purchaseMonth} precision={summary.precision} />
              )}
              <ProcurementCard summary={summary} />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
      {summary?.retention && (
        <SectionCard
          icon={IconCoins}
          flush
          title={t('hub.overview.retentionTitle')}
          subtitle={formatAmount(summary.retention.total, summary.precision)}
        >
          {retentionTasks.length === 0 ? (
            <Text p="lg" size="sm" c="dimmed">
              {t('hub.overview.retentionNoTasks')}
            </Text>
          ) : (
            retentionTasks.map((task) => (
              <RetentionTaskRow
                key={`${task.purchaseOrderId}-${task.type}`}
                task={task}
                language={currentLanguage}
                onRelease={canRelease ? setReleasing : undefined}
              />
            ))
          )}
        </SectionCard>
      )}
    </Stack>
  );
};
