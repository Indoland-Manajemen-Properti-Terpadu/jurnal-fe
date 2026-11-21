import { Text, ThemeIcon } from '@mantine/core';
import {
  IconFileText,
  IconPackage,
  IconReceipt2,
  IconRoute,
  IconTruckDelivery,
  IconWallet,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DashboardSummary, FlowStage } from '@/module/purchases/domain/dashboard';
import type { ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/PipelineStrip.module.css';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

const STAGE: Record<FlowStage['key'], { icon: Icon; tab: ListTab }> = {
  request: { icon: IconFileText, tab: 'requests' },
  order: { icon: IconPackage, tab: 'orders' },
  receipt: { icon: IconTruckDelivery, tab: 'receipts' },
  bill: { icon: IconReceipt2, tab: 'bills' },
  payment: { icon: IconWallet, tab: 'payments' },
};

interface PipelineStripProps {
  summary: DashboardSummary;
  /** Lists the user may open; a stage the user cannot read is shown without a link. */
  canOpen: (tab: ListTab) => boolean;
  onOpen: (tab: ListTab) => void;
}

/** The buying chain as connected steps with the number of documents in each; each opens its list. */
export const PipelineStrip = ({ summary, canOpen, onOpen }: Readonly<PipelineStripProps>) => {
  const { t } = useTranslation('purchases');
  const { procurement } = summary;
  return (
    <SectionCard
      icon={IconRoute}
      title={t('hub.overview.pipelineTitle')}
      subtitle={t('hub.overview.pipelineSubtitle')}
    >
      <div className={classes.steps}>
        {summary.flow.map(({ key, count }) => {
          const { icon: StageIcon, tab } = STAGE[key];
          return (
            <button
              key={key}
              type="button"
              className={classes.step}
              disabled={!canOpen(tab)}
              onClick={() => onOpen(tab)}
            >
              <span className={classes.orb}>
                <ThemeIcon variant="light" color="primary" size={40} radius="xl">
                  <StageIcon size={20} stroke={1.8} />
                </ThemeIcon>
              </span>
              <Text fz="xs" c="dimmed" fw={500}>
                {t(`hub.overview.stage.${key}`)}
              </Text>
              <Text fz="xl" fw={700} lh={1.1} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {count}
              </Text>
            </button>
          );
        })}
      </div>
      <Text size="xs" c="dimmed">
        {t('hub.overview.procurementLine', {
          bidding: procurement.bidding,
          single: procurement.single,
        })}
        {procurement.pastRequiredDate > 0 && (
          <Text span size="xs" c="red.7" fw={600}>
            {' · '}
            {t('hub.overview.pastRequired', { count: procurement.pastRequiredDate })}
          </Text>
        )}
      </Text>
    </SectionCard>
  );
};
