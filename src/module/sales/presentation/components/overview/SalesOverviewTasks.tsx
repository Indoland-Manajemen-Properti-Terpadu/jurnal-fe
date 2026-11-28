import { useState } from 'react';
import { Button, Group, Pagination, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type {
  SalesOverview,
  SalesOverviewAction,
  SalesOverviewUrgency,
} from '@/module/sales/domain/salesOverview';
import { formatOverviewCount, formatOverviewMoney } from './salesOverviewFormat';
import { OverviewPanel } from './OverviewPanel';
import classes from './SalesOverview.module.css';

type ActionFilter = 'all' | SalesOverviewUrgency;
const PAGE_SIZE = 8;

const actionPath = (action: SalesOverviewAction): string => {
  const path =
    action.type === 'quote'
      ? routes.sales.quotationDetail
      : action.type === 'order'
        ? routes.sales.orderDetail
        : routes.sales.detail;
  return path.replace(':id', encodeURIComponent(action.id));
};

export function SalesOverviewTasks({ data }: Readonly<{ data: SalesOverview }>) {
  const [filter, setFilter] = useState<ActionFilter>('all');
  const [page, setPage] = useState(1);
  const { t, currentLanguage } = useTranslation('sales');
  const actions =
    filter === 'all' ? data.actions : data.actions.filter((action) => action.urgency === filter);
  const totalPages = Math.max(1, Math.ceil(actions.length / PAGE_SIZE));
  const visible = actions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const first = actions.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, actions.length);
  const overdueCount = data.actionCounts.stale + data.actionCounts.warn;
  const oldestOverdue = data.actions
    .filter((action) => action.urgency !== 'ok')
    .reduce<SalesOverviewAction | null>(
      (oldest, action) => (!oldest || action.ageDays > oldest.ageDays ? action : oldest),
      null
    );

  const selectFilter = (value: string) => {
    if (value === 'all' || value === 'stale' || value === 'warn' || value === 'ok') {
      setFilter(value);
      setPage(1);
    }
  };

  return (
    <div id="sales-overview-actions">
      <OverviewPanel title={t('overview.tasks.title')} caption={t('overview.tasks.caption')}>
        <Stack gap="md">
          {overdueCount > 0 && (
            <div className={classes.taskNotice}>
              <Text size="sm" fw={700} c="orange.8">
                {t('overview.tasks.overdueSummary', {
                  count: formatOverviewCount(overdueCount, currentLanguage),
                })}
              </Text>
              {oldestOverdue && (
                <Text size="xs" c="dimmed" mt={2}>
                  {t('overview.tasks.oldest', {
                    title: oldestOverdue.title,
                    days: formatOverviewCount(oldestOverdue.ageDays, currentLanguage),
                  })}
                </Text>
              )}
            </div>
          )}
          <div
            className={classes.taskFilters}
            role="group"
            aria-label={t('overview.tasks.listLabel')}
          >
            {(['all', 'stale', 'warn', 'ok'] as const).map((key) => {
              const count = key === 'all' ? data.actionCounts.all : data.actionCounts[key];
              return (
                <UnstyledButton
                  key={key}
                  type="button"
                  className={classes.taskFilter}
                  data-active={filter === key}
                  aria-pressed={filter === key}
                  onClick={() => selectFilter(key)}
                >
                  {t(`overview.tasks.filters.${key}`)} (
                  {formatOverviewCount(count, currentLanguage)})
                </UnstyledButton>
              );
            })}
          </div>
          {visible.length === 0 ? (
            <EmptyState
              title={t('overview.tasks.emptyTitle')}
              description={t('overview.tasks.empty')}
              py="xl"
            />
          ) : (
            <>
              <div className={classes.taskList}>
                {visible.map((action) => (
                  <ActionRow
                    key={`${action.type}-${action.id}`}
                    action={action}
                    precision={data.precision}
                  />
                ))}
              </div>
              <Group justify="space-between" mt="md" gap="sm" wrap="wrap">
                <Text size="xs" c="dimmed">
                  {t('overview.tasks.range', {
                    first: formatOverviewCount(first, currentLanguage),
                    last: formatOverviewCount(last, currentLanguage),
                    total: formatOverviewCount(actions.length, currentLanguage),
                  })}
                </Text>
                {totalPages > 1 && (
                  <Pagination size="sm" total={totalPages} value={page} onChange={setPage} />
                )}
              </Group>
            </>
          )}
        </Stack>
      </OverviewPanel>
    </div>
  );
}

function ActionRow({
  action,
  precision,
}: Readonly<{ action: SalesOverviewAction; precision: number }>) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('sales');

  return (
    <div className={classes.taskRow} data-urgency={action.urgency}>
      <div className={classes.taskCopy}>
        <Text size="sm" fw={600}>
          {action.title}
        </Text>
        <Text size="xs" c="dimmed">
          <Text span c="primary.7" fw={600}>
            {action.number}
          </Text>{' '}
          · {action.customer}
        </Text>
        <div className={classes.taskMeta}>
          <Text size="xs" c={action.urgency === 'ok' ? 'dimmed' : 'orange.8'}>
            {t('overview.tasks.age', {
              days: formatOverviewCount(action.ageDays, currentLanguage),
            })}
          </Text>
          <Text size="xs" c="dimmed">
            · {action.detail}
          </Text>
        </div>
      </div>
      <div className={classes.taskAside}>
        {action.amount !== null && (
          <Text size="sm" fw={600} className={classes.money}>
            {formatOverviewMoney(action.amount, precision, currentLanguage)}
          </Text>
        )}
        <Button
          size="xs"
          variant={action.urgency === 'ok' ? 'default' : 'light'}
          color={
            action.urgency === 'stale' ? 'red' : action.urgency === 'warn' ? 'orange' : undefined
          }
          rightSection={<IconArrowUpRight size={14} />}
          onClick={() => navigate(actionPath(action))}
        >
          {t('overview.tasks.open')}
        </Button>
      </div>
    </div>
  );
}
