import { IconCircleCheck, IconSend, IconTrendingUp } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR, formatCount } from '@/module/sales/domain/saleFormat';
import type { QuoteSummary } from '@/module/sales/domain/saleQuote';
import { StatCard, StatCardRow } from '../shared/StatCard';

/** Three figures that change what the user does next: what waits, what was won, how often. */
export function QuoteSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: QuoteSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesQuotes');
  const rate = summary?.conversionRate;

  return (
    <StatCardRow>
      <StatCard
        loading={isLoading}
        tone="orange"
        icon={<IconSend size={22} />}
        label={t('summary.awaiting')}
        value={formatCompactIDR(summary?.awaiting.amount)}
        caption={t('summary.awaitingCount', { count: formatCount(summary?.awaiting.count ?? 0) })}
      />
      <StatCard
        loading={isLoading}
        tone="green"
        icon={<IconCircleCheck size={22} />}
        label={t('summary.accepted')}
        value={formatCompactIDR(summary?.accepted.amount)}
        caption={t('summary.acceptedCount', { count: formatCount(summary?.accepted.count ?? 0) })}
      />
      <StatCard
        loading={isLoading}
        tone="primary"
        icon={<IconTrendingUp size={22} />}
        label={t('summary.conversion')}
        value={typeof rate === 'number' ? `${Math.round(rate * 100)}%` : '–'}
        caption={
          typeof rate === 'number' ? t('summary.conversionHint') : t('summary.conversionNone')
        }
      />
    </StatCardRow>
  );
}
