import { useState } from 'react';
import { Alert, Grid, Skeleton, Stack, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChecklist,
  IconChevronRight,
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
import type { ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/OverviewTab.module.css';
import {
  PipelineStrip,
  ProcurementCard,
} from '@/module/purchases/presentation/components/hub/PipelineStrip';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';

const VISIBLE_ROWS = 8;

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
  const waiting = action.waiting !== null && action.waiting > 0 ? action.waiting : null;
  return (
    <Link to={actionPath(action.target)} className={classes.row} data-late={late !== null}>
      <span className={classes.bar} aria-hidden />
      <div className={classes.main}>
        <Text size="md" fw={600} lh={1.3}>
          {title}
        </Text>
        <Text size="xs" c="dimmed">
          {action.subtitle}
          {action.due &&
            late === null &&
            ` · ${t('hub.overview.dueOn', { date: formatDay(action.due.slice(0, 10), language) })}`}
        </Text>
        {late !== null && (
          <Text size="xs" c="red.7" fw={600}>
            {t('hub.overview.lateBy', { count: late })}
            {waiting !== null && ` · ${t('hub.overview.waitingFor', { count: waiting })}`}
          </Text>
        )}
      </div>
      <IconChevronRight size={16} color="var(--mantine-color-dimmed)" aria-hidden />
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
}: Readonly<OverviewTabProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const [expanded, setExpanded] = useState(false);
  const items = actions?.items ?? [];
  const rows = expanded ? items : items.slice(0, VISIBLE_ROWS);
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
    if (items.length === 0 && retentionTasks.length === 0) {
      return (
        <EmptyState
          icon={<IconCheck size={32} stroke={1.6} />}
          title={t('hub.overview.emptyTitle')}
          description={t('hub.overview.emptyDescription')}
        />
      );
    }
    const oldest = items.find((action) => lateDays(action) !== null);
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
        <div className={classes.list}>
          {rows.map((action) => (
            <ActionRow key={action.key} action={action} language={currentLanguage} />
          ))}
          {retentionTasks.map((task) => (
            <RetentionTaskRow
              key={`${task.purchaseOrderId}-${task.type}`}
              task={task}
              language={currentLanguage}
              onRelease={canRelease ? setReleasing : undefined}
            />
          ))}
        </div>
        {items.length > VISIBLE_ROWS && (
          <button
            type="button"
            className={classes.more}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded
              ? t('hub.overview.showLess')
              : t('hub.overview.moreActions', { count: items.length - VISIBLE_ROWS })}
          </button>
        )}
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
          <SectionCard
            icon={IconChecklist}
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
        </Grid.Col>
        {summary && (
          <Grid.Col span={{ base: 12, lg: aging && onOpenReport ? 4 : 12 }}>
            <Stack gap="lg">
              {aging && onOpenReport && <AgingCard buckets={aging} onOpenReport={onOpenReport} />}
              <ProcurementCard summary={summary} />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  );
};
