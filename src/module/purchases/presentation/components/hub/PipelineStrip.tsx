import { Group, Text } from '@mantine/core';
import { IconArrowRight, IconRoute } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DashboardSummary, FlowStage } from '@/module/purchases/domain/dashboard';
import type { ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/PipelineStrip.module.css';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

const TAB: Record<FlowStage['key'], ListTab> = {
  request: 'requests',
  order: 'orders',
  receipt: 'receipts',
  bill: 'bills',
  payment: 'payments',
};

interface PipelineStripProps {
  summary: DashboardSummary;
  /** Lists the user may open; a stage the user cannot read is shown without a link. */
  canOpen: (tab: ListTab) => boolean;
  onOpen: (tab: ListTab) => void;
}

/** "Alur pembelian": one box per stage with the documents still in progress; each opens its list. */
export const PipelineStrip = ({ summary, canOpen, onOpen }: Readonly<PipelineStripProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconRoute}
      plain
      title={t('hub.overview.pipelineTitle')}
      subtitle={t('hub.overview.pipelineSubtitle')}
    >
      <div className={classes.steps}>
        {summary.flow.map(({ key, count }) => (
          <button
            key={key}
            type="button"
            className={classes.step}
            disabled={!canOpen(TAB[key])}
            onClick={() => onOpen(TAB[key])}
          >
            <span className={classes.head}>
              <Text fz="sm" fw={600}>
                {t(`hub.overview.stage.${key}`)}
              </Text>
              <IconArrowRight size={14} color="var(--mantine-color-dimmed)" aria-hidden />
            </span>
            <Text
              fz={28}
              fw={700}
              lh={1.1}
              c="primary.8"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {count}
            </Text>
            <Text fz="xs" c="dimmed">
              {t(`hub.overview.stageHint.${key}`)}
            </Text>
          </button>
        ))}
      </div>
    </SectionCard>
  );
};

/** "Pengadaan": how many requests run through bidding and as a single vendor, and any past their date. */
export const ProcurementCard = ({ summary }: Readonly<{ summary: DashboardSummary }>) => {
  const { t } = useTranslation('purchases');
  const { bidding, single, pastRequiredDate } = summary.procurement;
  const unassigned = summary.procurement.unassigned ?? 0;
  const count = summary.procurement.count ?? bidding + single + unassigned;
  const row = (label: string, value: string, danger = false) => (
    <Group justify="space-between" py={4} wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={danger ? 700 : 600} c={danger ? 'red.7' : undefined}>
        {value}
      </Text>
    </Group>
  );
  return (
    <SectionCard
      icon={IconRoute}
      plain
      title={t('hub.overview.procurementTitle')}
      subtitle={t('hub.overview.procurementSubtitle')}
    >
      <div>
        <Text fw={700} size="xl">
          {count}
        </Text>
        <Text size="xs" c="dimmed" mb="sm">
          {t('hub.overview.requestsCount', { count })}
        </Text>
        {count > 0 && (
          <div
            style={{
              display: 'flex',
              height: 8,
              borderRadius: 99,
              overflow: 'hidden',
              marginBottom: 12,
            }}
            aria-hidden
          >
            <span
              style={{
                width: `${(bidding / count) * 100}%`,
                background: 'var(--mantine-color-primary-7)',
              }}
            />
            <span
              style={{
                width: `${(single / count) * 100}%`,
                background: 'var(--mantine-color-primary-4)',
              }}
            />
            <span
              style={{
                width: `${(unassigned / count) * 100}%`,
                background: 'var(--mantine-color-gray-4)',
              }}
            />
          </div>
        )}
        {row(t('hub.overview.bidding'), t('hub.overview.requestsCount', { count: bidding }))}
        {row(t('hub.overview.single'), t('hub.overview.requestsCount', { count: single }))}
        {row(t('hub.overview.unassigned'), t('hub.overview.requestsCount', { count: unassigned }))}
        {row(t('hub.overview.pastRequiredLabel'), String(pastRequiredDate), pastRequiredDate > 0)}
      </div>
    </SectionCard>
  );
};
