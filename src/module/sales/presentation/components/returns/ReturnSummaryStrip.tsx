import { IconFilePencil, IconReceiptRefund, IconWallet } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR, formatCount } from '@/module/sales/domain/saleFormat';
import type { ReturnSummary } from '@/module/sales/domain/saleReturn';
import { StatCard, StatCardRow } from '../shared/StatCard';

/** Returns issued this month, credit still owed to customers, and drafts waiting to be issued. */
export function ReturnSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: ReturnSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesReturns');
  const count = (n?: number) => t('summary.count', { count: formatCount(n ?? 0) });

  return (
    <StatCardRow>
      <StatCard
        loading={isLoading}
        tone="primary"
        icon={<IconReceiptRefund size={22} />}
        label={t('summary.thisMonth')}
        value={formatCompactIDR(summary?.thisMonth.amount)}
        caption={count(summary?.thisMonth.count)}
      />
      <StatCard
        loading={isLoading}
        tone="green"
        icon={<IconWallet size={22} />}
        label={t('summary.credit')}
        value={formatCompactIDR(summary?.credit.amount)}
        caption={count(summary?.credit.count)}
      />
      <StatCard
        loading={isLoading}
        tone="gray"
        icon={<IconFilePencil size={22} />}
        label={t('summary.waiting')}
        value={formatCompactIDR(summary?.waiting.amount)}
        caption={count(summary?.waiting.count)}
      />
    </StatCardRow>
  );
}
