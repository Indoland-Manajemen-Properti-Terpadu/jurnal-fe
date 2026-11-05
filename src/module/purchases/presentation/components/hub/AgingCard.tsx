import { Button } from '@mantine/core';
import { IconHourglass } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { AGING_BUCKETS, bucketShares } from '@/module/purchases/domain/payablesView';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import {
  AGING_COLOR,
  Legend,
  SegmentBar,
} from '@/module/purchases/presentation/components/shared/visuals';

interface AgingCardProps {
  totals: PayablesAging['totals'];
  onOpenReport: () => void;
}

/** How the remaining payables split by days past due. */
export const AgingCard = ({ totals, onOpenReport }: Readonly<AgingCardProps>) => {
  const { t } = useTranslation('purchases');
  const shares = bucketShares(totals);
  return (
    <SectionCard
      icon={IconHourglass}
      title={t('hub.overview.agingTitle')}
      subtitle={t('hub.overview.agingSubtitle')}
    >
      <SegmentBar
        height={12}
        aria-label={t('hub.overview.agingTitle')}
        segments={shares.map((bucket) => ({
          key: bucket.key,
          value: bucket.amount,
          color: AGING_COLOR[bucket.key],
        }))}
      />
      <Legend
        items={AGING_BUCKETS.map((key) => ({
          key,
          label: t(`hub.overview.aging.${key}`),
          value: formatAmount(totals[key]),
          color: AGING_COLOR[key],
        }))}
      />
      <Button variant="light" fullWidth onClick={onOpenReport}>
        {t('hub.overview.seeReport')}
      </Button>
    </SectionCard>
  );
};
