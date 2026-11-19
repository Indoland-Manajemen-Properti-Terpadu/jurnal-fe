import { IconCalendarDollar, IconCashBanknote, IconReceiptTax } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR, formatCount } from '@/module/sales/domain/saleFormat';
import type { SalePaymentSummary } from '@/module/sales/domain/salePaymentList';
import { StatCard, StatCardRow } from '../shared/StatCard';

/** Received this month, received in total, and the withholding tax taken off payments. */
export function SalePaymentSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: SalePaymentSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('sales');
  const count = (n?: number) => t('payments.summary.count', { count: formatCount(n ?? 0) });

  return (
    <StatCardRow>
      <StatCard
        loading={isLoading}
        tone="primary"
        icon={<IconCalendarDollar size={22} />}
        label={t('payments.summary.thisMonth')}
        value={formatCompactIDR(summary?.thisMonth.amount)}
        caption={count(summary?.thisMonth.count)}
      />
      <StatCard
        loading={isLoading}
        tone="green"
        icon={<IconCashBanknote size={22} />}
        label={t('payments.summary.total')}
        value={formatCompactIDR(summary?.total.amount)}
        caption={count(summary?.total.count)}
      />
      <StatCard
        loading={isLoading}
        tone="orange"
        icon={<IconReceiptTax size={22} />}
        label={t('payments.summary.withholding')}
        value={formatCompactIDR(summary?.withholding)}
        caption={t('payments.summary.withholdingHint')}
      />
    </StatCardRow>
  );
}
