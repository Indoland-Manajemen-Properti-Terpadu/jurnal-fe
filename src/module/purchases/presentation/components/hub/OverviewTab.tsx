import { useState } from 'react';
import { Badge, Button, Grid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconCheck,
  IconChecklist,
  IconChevronRight,
  IconFileText,
  IconPackage,
  IconReceipt2,
  IconWallet,
  type Icon,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { WorkItem } from '@/module/purchases/domain/purchaseOverview';
import { AgingCard } from '@/module/purchases/presentation/components/hub/AgingCard';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import type { CanFn, ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/OverviewTab.module.css';
import { PipelineStrip } from '@/module/purchases/presentation/components/hub/PipelineStrip';
import type { OverviewData } from '@/module/purchases/presentation/components/hub/useOverviewData';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';

const VISIBLE_ROWS = 8;

const KIND_ICON: Record<WorkItem['docKind'], Icon> = {
  request: IconFileText,
  order: IconPackage,
  bill: IconReceipt2,
  payment: IconWallet,
};

const WorkRow = ({ item, language }: Readonly<{ item: WorkItem; language: string }>) => {
  const { t } = useTranslation('purchases');
  const RowIcon = KIND_ICON[item.docKind];
  return (
    <Link to={detailPath(item.docKind, item.id)} className={classes.row}>
      <ThemeIcon variant="light" color="primary" size={32} radius="md">
        <RowIcon size={16} stroke={1.8} />
      </ThemeIcon>
      <div className={classes.main}>
        <Text size="sm" fw={500} c="primary.7" truncate>
          {item.number}
          {item.vendorName && (
            <Text span size="sm" c="dimmed" fw={400}>
              {' · '}
              {item.vendorName}
            </Text>
          )}
        </Text>
        <Text size="xs" c="dimmed">
          {t(`hub.overview.reason.${item.reason}`)} · {formatDay(item.date, language)}
        </Text>
      </div>
      {item.amount !== null && (
        <Text size="sm" fw={500} className={classes.amount}>
          {formatAmount(item.amount)}
        </Text>
      )}
      <IconChevronRight size={16} color="var(--mantine-color-dimmed)" aria-hidden />
    </Link>
  );
};

interface OverviewTabProps {
  can: CanFn;
  data: OverviewData;
  onOpen: (tab: ListTab) => void;
  onOpenReport?: () => void;
}

/** What needs the user's attention now, where each document stands, and how late the payables are. */
export const OverviewTab = ({ can, data, onOpen, onOpenReport }: Readonly<OverviewTabProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? data.items : data.items.slice(0, VISIBLE_ROWS);

  const body = () => {
    if (data.isLoading) {
      return (
        <Stack gap="sm">
          {Array.from({ length: 4 }, (_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={index} height={34} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (data.isError) {
      return (
        <EmptyState
          icon={<IconAlertCircle size={32} stroke={1.6} />}
          color="red"
          title={t('list.errorTitle')}
          description={t('list.errorDescription')}
          actionLabel={t('common.retry')}
          onAction={data.refetch}
        />
      );
    }
    if (data.items.length === 0) {
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
        {rows.map((item) => (
          <WorkRow key={item.key} item={item} language={currentLanguage} />
        ))}
        {!expanded && data.items.length > VISIBLE_ROWS && (
          <Button variant="subtle" fullWidth mt="xs" onClick={() => setExpanded(true)}>
            {t('hub.overview.showAll', { count: data.items.length })}
          </Button>
        )}
      </div>
    );
  };

  return (
    <Stack gap="lg">
      <PipelineStrip can={can} onOpen={onOpen} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: data.totals && onOpenReport ? 8 : 12 }}>
          <SectionCard
            icon={IconChecklist}
            title={t('hub.overview.workTitle')}
            subtitle={t('hub.overview.workSubtitle')}
            action={
              data.items.length > 0 ? (
                <Badge variant="light" color="gray" radius="sm">
                  {data.items.length}
                </Badge>
              ) : undefined
            }
          >
            {body()}
          </SectionCard>
        </Grid.Col>
        {data.totals && onOpenReport && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <AgingCard totals={data.totals} onOpenReport={onOpenReport} />
          </Grid.Col>
        )}
      </Grid>
    </Stack>
  );
};
