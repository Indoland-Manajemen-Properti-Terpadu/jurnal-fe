import { IconClipboardCheck, IconClipboardList, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  MetricCard,
  MetricGrid,
} from '@/module/inventory/presentation/components/metrics/MetricCard';
import type { OpnamePage } from '@/module/inventory/infrastructure/opnameApi';
import { formatCurrency } from '@/utils/formatCurrency';

/**
 * Running, awaiting approval and this month's difference. The difference is left out for a person
 * who counts blind: the service sends no value to them, and zero would be a false answer.
 */
export function OpnameMetrics({ page }: Readonly<{ page: OpnamePage }>) {
  const { t } = useTranslation('stockTake');
  const { summary, canSeeValues } = page;
  const showDiff = canSeeValues && summary.diffThisMonth !== null;

  return (
    <MetricGrid columns={3}>
      <MetricCard
        icon={IconClipboardList}
        label={t('metrics.running')}
        value={t('metrics.countUnit', { count: summary.running })}
        hint={t('metrics.runningHint')}
      />
      <MetricCard
        icon={IconClipboardCheck}
        label={t('metrics.pending')}
        value={t('metrics.countUnit', { count: summary.pending })}
        hint={t('metrics.pendingHint')}
        tone={summary.pending > 0 ? 'warning' : 'default'}
      />
      {showDiff && (
        <MetricCard
          icon={IconScale}
          label={t('metrics.diff')}
          value={formatCurrency(summary.diffThisMonth ?? 0)}
          hint={t('metrics.diffHint')}
        />
      )}
    </MetricGrid>
  );
}
