import { IconClipboardCheck, IconHourglassHigh, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR, formatCount } from '@/module/sales/domain/saleFormat';
import type { OrderSummary } from '@/module/sales/domain/saleOrder';
import { StatCard, StatCardRow } from '../shared/StatCard';

/** What waits for the customer, what is ready to invoice, and what already was. */
export function OrderSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: OrderSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesOrders');
  const count = (n?: number) => t('summary.count', { count: formatCount(n ?? 0) });

  return (
    <StatCardRow>
      <StatCard
        loading={isLoading}
        tone="orange"
        icon={<IconHourglassHigh size={22} />}
        label={t('summary.awaiting')}
        value={formatCompactIDR(summary?.awaiting.amount)}
        caption={count(summary?.awaiting.count)}
      />
      <StatCard
        loading={isLoading}
        tone="primary"
        icon={<IconClipboardCheck size={22} />}
        label={t('summary.ready')}
        value={formatCompactIDR(summary?.ready.amount)}
        caption={count(summary?.ready.count)}
      />
      <StatCard
        loading={isLoading}
        tone="green"
        icon={<IconReceipt2 size={22} />}
        label={t('summary.invoiced')}
        value={formatCompactIDR(summary?.invoiced.amount)}
        caption={count(summary?.invoiced.count)}
      />
    </StatCardRow>
  );
}
