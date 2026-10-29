import { SimpleGrid } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBookmarks,
  IconScale,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import type { MutationSummary } from '../../domain/ledgerSummary';
import type { NormalSide } from '../../domain/normalBalance';
import { LedgerKpiCard } from './LedgerKpiCard';

interface NonCashBankKpiCardsProps {
  amount: number;
  normalBalance: NormalSide;
  metrics: MutationSummary;
}

export const NonCashBankKpiCards: React.FC<NonCashBankKpiCardsProps> = ({
  amount,
  normalBalance,
  metrics,
}) => {
  const { t } = useTranslation('accountLedger');
  const side = t(`common.side.${normalBalance}`);
  const isDebit = normalBalance === 'Debit';

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      <LedgerKpiCard
        label={t('nonCashBank.kpi.balance')}
        value={formatCurrency(amount || 0)}
        hint={t('nonCashBank.kpi.balanceHint')}
        icon={<IconScale size={20} />}
        iconColor="primary"
        valueColor="dark.8"
        monospace
      />
      <LedgerKpiCard
        label={t('nonCashBank.kpi.normal')}
        value={side}
        hint={t('nonCashBank.kpi.normalHint', { side })}
        icon={<IconBookmarks size={20} />}
        iconColor={isDebit ? 'teal' : 'red'}
        valueColor={isDebit ? 'teal.8' : 'red.8'}
      />
      <LedgerKpiCard
        label={t('nonCashBank.kpi.debit')}
        value={formatCurrency(metrics.totalDebit)}
        hint={t('nonCashBank.kpi.debitHint', { count: metrics.debitCount })}
        icon={<IconArrowDownRight size={20} />}
        iconColor="teal"
        valueColor="teal.8"
        monospace
      />
      <LedgerKpiCard
        label={t('nonCashBank.kpi.credit')}
        value={formatCurrency(metrics.totalCredit)}
        hint={t('nonCashBank.kpi.creditHint', { count: metrics.creditCount })}
        icon={<IconArrowUpRight size={20} />}
        iconColor="red"
        valueColor="red.8"
        monospace
      />
    </SimpleGrid>
  );
};
