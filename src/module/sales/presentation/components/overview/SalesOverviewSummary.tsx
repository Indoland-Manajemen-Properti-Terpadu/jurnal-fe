import { Button, Group, Paper, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCash,
  IconChevronRight,
  IconFileText,
  IconReceipt2,
  IconSend,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { shareLabel } from '@/module/sales/domain/saleReceivables';
import { routes } from '@/router/routes';
import type { SalesOverview } from '@/module/sales/domain/salesOverview';
import {
  formatOverviewCompactMoney,
  formatOverviewCount,
  formatOverviewMoney,
  overviewMonthLabels,
} from './salesOverviewFormat';
import { SegmentBar } from '../shared/SegmentBar';
import classes from './SalesOverview.module.css';

interface SalesOverviewSummaryProps {
  data: SalesOverview;
  onShowActions: () => void;
}

const invoiceList = (tab: 'draft' | 'issued') => `${routes.sales.main}?tab=${tab}`;
const openInvoiceList = `${routes.sales.main}?tab=issued&status=open`;
const awaitingQuotesList = `${routes.sales.quotations}?tab=running&status=SENT`;

export function SalesOverviewReceivables({ data }: Readonly<{ data: SalesOverview }>) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('sales');
  const amounts = data.receivables;
  const overdueShare = shareLabel(amounts.overdue, amounts.amount) ?? '0';

  const parts = [
    {
      key: 'overdue',
      label: t('overview.receivables.overdue'),
      value: amounts.overdue,
      color: 'var(--mantine-color-red-5)',
    },
    {
      key: 'next7Days',
      label: t('overview.receivables.next7Days'),
      value: amounts.next7Days,
      color: 'var(--mantine-color-yellow-6)',
    },
    {
      key: 'later',
      label: t('overview.receivables.later'),
      value: amounts.later,
      color: 'var(--mantine-color-gray-3)',
    },
  ];

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Stack gap={4}>
          <Text fw={700}>{t('overview.receivables.title')}</Text>
          <Text size="xs" c="dimmed">
            {t('overview.receivables.subtitle', {
              count: formatOverviewCount(amounts.count, currentLanguage),
              futureCount: formatOverviewCount(amounts.futureCount, currentLanguage),
            })}
          </Text>
        </Stack>
        <Button
          variant="default"
          size="sm"
          rightSection={<IconChevronRight size={16} />}
          onClick={() => navigate(openInvoiceList)}
        >
          {t('overview.receivables.openList')}
        </Button>
      </Group>

      <Text
        className={classes.receivableValue}
        fz={{ base: 'var(--jurnal-text-xl)', sm: 'var(--jurnal-text-3xl)' }}
        fw={700}
        mt="md"
        mb="sm"
        title={formatOverviewMoney(amounts.amount, data.precision, currentLanguage)}
      >
        {formatOverviewMoney(amounts.amount, data.precision, currentLanguage)}
      </Text>

      <SegmentBar
        trackColor="var(--mantine-color-gray-3)"
        aria-label={t('overview.receivables.chartLabel')}
        segments={parts}
      />

      <div className={classes.receivableParts}>
        {parts.map((part) => {
          const count = part.key === 'overdue' ? amounts.overdueCount : null;
          const detail =
            count === null
              ? part.value > 0
                ? formatOverviewMoney(part.value, data.precision, currentLanguage)
                : part.key === 'next7Days'
                  ? t('overview.receivables.noUpcoming')
                  : t('overview.receivables.noLater')
              : part.value > 0
                ? t('overview.receivables.overdueDetail', {
                    count: formatOverviewCount(count, currentLanguage),
                    share: overdueShare,
                  })
                : t('overview.receivables.noOverdue');

          return (
            <div key={part.key} className={classes.receivablePart}>
              <span className={classes.partLabel}>
                <span className={classes.dot} style={{ background: part.color }} />
                <Text size="xs" c="dimmed" fw={500}>
                  {part.label}
                </Text>
              </span>
              <Text className={classes.money} fw={600}>
                {part.value > 0 ? formatOverviewCompactMoney(part.value, currentLanguage) : '–'}
              </Text>
              <Text size="xs" c={part.key === 'overdue' && part.value > 0 ? 'red.7' : 'dimmed'}>
                {part.key === 'later' && part.value > 0
                  ? t('overview.receivables.laterDetail')
                  : detail}
              </Text>
            </div>
          );
        })}
      </div>
    </Paper>
  );
}

export function SalesOverviewHighlights({
  data,
  onShowActions,
}: Readonly<SalesOverviewSummaryProps>) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('sales');
  const monthInfo = overviewMonthLabels(data.asOf, currentLanguage);
  const overdueActions = data.actionCounts.warn + data.actionCounts.stale;

  const rows = [
    {
      key: 'actions',
      icon: <IconAlertTriangle size={18} />,
      tone: 'red',
      title: t('overview.highlights.actions'),
      description: t('overview.highlights.actionsDetail', {
        count: formatOverviewCount(overdueActions, currentLanguage),
      }),
      value: formatOverviewCount(data.actionCounts.all, currentLanguage),
      onClick: onShowActions,
    },
    {
      key: 'unsent',
      icon: <IconSend size={18} />,
      tone: 'gray',
      title: t('overview.highlights.unsent'),
      description: t('overview.highlights.unsentDetail', {
        amount: formatOverviewMoney(data.unsentInvoices.amount, data.precision, currentLanguage),
      }),
      value: formatOverviewCount(data.unsentInvoices.count, currentLanguage),
      onClick: undefined,
    },
    {
      key: 'cash',
      icon: <IconCash size={18} />,
      tone: 'gray',
      title: t('overview.highlights.cash', { month: monthInfo.currentMonth }),
      description: t('overview.highlights.cashDetail', {
        count: formatOverviewCount(data.cash.count, currentLanguage),
      }),
      value: formatOverviewCompactMoney(data.cash.amount, currentLanguage),
      onClick: () => navigate(`${routes.sales.payments}?month=${monthInfo.monthKey}`),
    },
  ];

  return (
    <Paper withBorder radius="lg" p="xs" bg="white" className={classes.highlights}>
      {rows.map((row) => {
        const content = (
          <Group justify="space-between" wrap="nowrap" gap="md">
            <span className={classes.highlightCopy}>
              <ThemeIcon size={36} radius="md" variant="light" color={row.tone}>
                {row.icon}
              </ThemeIcon>
              <span className={classes.highlightText}>
                <Text size="xs" fw={500}>
                  {row.title}
                </Text>
                <Text
                  size="xs"
                  c={row.key === 'actions' && overdueActions > 0 ? 'red.7' : 'dimmed'}
                >
                  {row.description}
                </Text>
              </span>
            </span>
            <span className={classes.highlightValue}>
              <Text fw={700} size="lg">
                {row.value}
              </Text>
              {row.onClick && <IconChevronRight size={16} color="var(--mantine-color-gray-5)" />}
            </span>
          </Group>
        );

        return row.onClick ? (
          <UnstyledButton
            key={row.key}
            type="button"
            className={classes.highlight}
            onClick={row.onClick}
            aria-label={`${row.title}. ${row.description}`}
          >
            {content}
          </UnstyledButton>
        ) : (
          <div key={row.key} className={classes.highlight}>
            {content}
          </div>
        );
      })}
    </Paper>
  );
}

export function SalesOverviewWorkflow({ data }: Readonly<{ data: SalesOverview }>) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('sales');
  const stages = [
    {
      key: 'quotes',
      count: data.workflow.quotes,
      route: awaitingQuotesList,
      icon: <IconFileText size={15} />,
    },
    {
      key: 'orders',
      count: data.workflow.orders,
      route: null,
      icon: <IconReceipt2 size={15} />,
    },
    {
      key: 'drafts',
      count: data.workflow.drafts,
      route: invoiceList('draft'),
      icon: <IconFileText size={15} />,
    },
    {
      key: 'invoices',
      count: data.workflow.invoices,
      route: openInvoiceList,
      icon: <IconReceipt2 size={15} />,
    },
  ] as const;

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Text fw={700}>{t('overview.workflow.title')}</Text>
      <Text size="xs" c="dimmed" mt={4} mb="md">
        {t('overview.workflow.caption')}
      </Text>
      <div className={classes.workflowGrid}>
        {stages.map((stage) => {
          const label = t(`overview.workflow.${stage.key}`);
          const content = (
            <>
              <span className={classes.workflowTop}>
                <Text size="xs" fw={600} c="dimmed">
                  {label}
                </Text>
                {stage.icon}
              </span>
              <span className={classes.workflowCount}>
                {formatOverviewCount(stage.count, currentLanguage)}
              </span>
              <Text size="xs" c="dimmed" fw={400} ta="left" style={{ whiteSpace: 'normal' }}>
                {t(`overview.workflow.${stage.key}Hint`)}
              </Text>
            </>
          );
          return stage.route ? (
            <UnstyledButton
              type="button"
              key={stage.key}
              className={classes.workflowItem}
              onClick={() => navigate(stage.route)}
              aria-label={t('overview.workflow.openStage', { stage: label })}
            >
              {content}
            </UnstyledButton>
          ) : (
            <div key={stage.key} className={classes.workflowItem}>
              {content}
            </div>
          );
        })}
      </div>
    </Paper>
  );
}
