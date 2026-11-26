import { IconHourglass } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AgingBucket } from '@/module/purchases/domain/dashboard';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import {
  AGING_COLOR,
  Legend,
  SegmentBar,
} from '@/module/purchases/presentation/components/shared/visuals';

interface AgingCardProps {
  buckets: AgingBucket[];
}

/** How the remaining payables split by days past due, as the summary of the service sends them. */
export const AgingCard = ({ buckets }: Readonly<AgingCardProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconHourglass}
      plain
      title={t('hub.overview.agingTitle')}
      subtitle={t('hub.overview.agingSubtitle')}
    >
      <SegmentBar
        height={12}
        aria-label={t('hub.overview.agingTitle')}
        segments={buckets.map((bucket) => ({
          key: bucket.key,
          value: bucket.amount,
          color: AGING_COLOR[bucket.key],
        }))}
      />
      <Legend
        items={buckets.map((bucket) => ({
          key: bucket.key,
          label: t(`hub.overview.aging.${bucket.key}`),
          value: formatAmount(bucket.amount),
          color: AGING_COLOR[bucket.key],
        }))}
      />
    </SectionCard>
  );
};
