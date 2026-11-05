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
import type { CanFn, HubTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import classes from '@/module/purchases/presentation/components/hub/PipelineStrip.module.css';
import {
  usePipelineCounts,
  type PipelineStage,
} from '@/module/purchases/presentation/components/hub/usePipelineCounts';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';

const STAGE_ICON: Record<PipelineStage, Icon> = {
  requests: IconFileText,
  orders: IconPackage,
  receipts: IconTruckDelivery,
  bills: IconReceipt2,
  payments: IconWallet,
};

interface PipelineStripProps {
  can: CanFn;
  onOpen: (tab: HubTab) => void;
}

/** The buying chain as five connected steps; each opens its list. */
export const PipelineStrip = ({ can, onOpen }: Readonly<PipelineStripProps>) => {
  const { t } = useTranslation('purchases');
  const counts = usePipelineCounts(can).filter((item) => item.total !== null);
  if (counts.length === 0) return null;

  return (
    <SectionCard
      icon={IconRoute}
      title={t('hub.overview.pipelineTitle')}
      subtitle={t('hub.overview.pipelineSubtitle')}
    >
      <div className={classes.steps}>
        {counts.map(({ stage, total }) => {
          const StageIcon = STAGE_ICON[stage];
          return (
            <button
              key={stage}
              type="button"
              className={classes.step}
              onClick={() => onOpen(stage)}
            >
              <span className={classes.orb}>
                <ThemeIcon variant="light" color="primary" size={40} radius="xl">
                  <StageIcon size={20} stroke={1.8} />
                </ThemeIcon>
              </span>
              <Text fz="xs" c="dimmed" fw={500}>
                {t(`hub.tabs.${stage}`)}
              </Text>
              <Text fz="xl" fw={700} lh={1.1} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {total}
              </Text>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
};
