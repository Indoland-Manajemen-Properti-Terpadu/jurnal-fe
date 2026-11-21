import { useState } from 'react';
import { Badge, Button, Grid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconChecklist,
  IconChevronRight,
  IconCoins,
  IconFileText,
  IconPackage,
  IconReceipt2,
  IconReceiptRefund,
  IconTruckDelivery,
  IconWallet,
  type Icon,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import {
  actionPath,
  actionPrefix,
  lateDays,
  type ActionTargetType,
  type DashboardAction,
  type DashboardActions,
  type DashboardSummary,
} from '@/module/purchases/domain/dashboard';
import { AgingCard } from '@/module/purchases/presentation/components/hub/AgingCard';
import type { ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/OverviewTab.module.css';
import { PipelineStrip } from '@/module/purchases/presentation/components/hub/PipelineStrip';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';

const VISIBLE_ROWS = 8;

const TARGET_ICON: Record<ActionTargetType, Icon> = {
  purchaseRequest: IconFileText,
  purchaseOrder: IconPackage,
  goodsReceipt: IconTruckDelivery,
  purchaseBill: IconReceipt2,
  paymentRequest: IconCoins,
  purchasePayment: IconWallet,
  purchaseReturn: IconReceiptRefund,
};

const ActionRow = ({
  action,
  language,
}: Readonly<{ action: DashboardAction; language: string }>) => {
  const { t } = useTranslation('purchases');
  const RowIcon = TARGET_ICON[action.target.type];
  const prefix = actionPrefix(action.key);
  // The service words each action in Indonesian; English readers get a line of ours, never a guess.
  const title =
    language === 'id'
      ? action.title
      : prefix
        ? t(`hub.overview.action.${prefix}`)
        : t('hub.overview.action.other');
  const late = lateDays(action);
  return (
    <Link to={actionPath(action.target)} className={classes.row}>
      <ThemeIcon variant="light" color="primary" size={32} radius="md">
        <RowIcon size={16} stroke={1.8} />
      </ThemeIcon>
      <div className={classes.main}>
        <Text size="sm" fw={500} c="primary.7" truncate>
          {title}
        </Text>
        <Text size="xs" c="dimmed" truncate>
          {action.subtitle}
          {action.due &&
            ` · ${t('hub.overview.dueOn', { date: formatDay(action.due.slice(0, 10), language) })}`}
        </Text>
      </div>
      {late !== null && (
        <Badge color="red" variant="light" radius="sm">
          {t('hub.overview.lateBy', { count: late })}
        </Badge>
      )}
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
    return (
      <div className={classes.list}>
        {rows.map((action) => (
          <ActionRow key={action.key} action={action} language={currentLanguage} />
        ))}
        {!expanded && items.length > VISIBLE_ROWS && (
          <Button variant="subtle" fullWidth mt="xs" onClick={() => setExpanded(true)}>
            {t('hub.overview.showAll', { count: items.length })}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Stack gap="lg">
      {summary && <PipelineStrip summary={summary} canOpen={canOpen} onOpen={onOpen} />}
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: aging && onOpenReport ? 8 : 12 }}>
          <SectionCard
            icon={IconChecklist}
            title={t('hub.overview.workTitle')}
            subtitle={t('hub.overview.workSubtitle')}
            action={
              actions && actions.total > 0 ? (
                <Badge variant="light" color="gray" radius="sm">
                  {actions.total}
                </Badge>
              ) : undefined
            }
          >
            {body()}
          </SectionCard>
        </Grid.Col>
        {aging && onOpenReport && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <AgingCard buckets={aging} onOpenReport={onOpenReport} />
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  );
};
