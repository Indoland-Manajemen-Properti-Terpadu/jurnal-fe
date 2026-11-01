import { SimpleGrid } from '@mantine/core';
import {
  IconArrowsExchange,
  IconBuildingBank,
  IconReceipt2,
  IconWallet,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { LedgerKpiCard } from './LedgerKpiCard';

interface CashBankKpiCardsProps {
  ledgerAmount: number;
  bankBalance?: number;
  unreconciledCount: number;
  journalCount: number;
}

export const CashBankKpiCards: React.FC<CashBankKpiCardsProps> = ({
  ledgerAmount,
  bankBalance,
  unreconciledCount,
  journalCount,
}) => {
  const { t } = useTranslation('accountLedger');
  const isMatched = unreconciledCount === 0;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      <LedgerKpiCard
        label={t('cashBank.kpi.ledgerBalance')}
        value={formatCurrency(ledgerAmount || 0)}
        hint={t('cashBank.kpi.ledgerBalanceHint')}
        icon={<IconWallet size={20} />}
        iconColor="teal"
        valueColor="dark.8"
        monospace
      />
      <LedgerKpiCard
        label={t('cashBank.kpi.bankBalance')}
        value={formatCurrency(bankBalance ?? ledgerAmount ?? 0)}
        hint={t('cashBank.kpi.bankBalanceHint')}
        icon={<IconBuildingBank size={20} />}
        iconColor="blue"
        valueColor="blue.8"
        monospace
      />
      <LedgerKpiCard
        label={t('cashBank.kpi.reconStatus')}
        value={
          isMatched
            ? t('cashBank.kpi.reconMatched')
            : t('cashBank.kpi.reconPending', { count: unreconciledCount })
        }
        hint={t(isMatched ? 'cashBank.kpi.reconMatchedHint' : 'cashBank.kpi.reconPendingHint')}
        icon={<IconArrowsExchange size={20} />}
        iconColor={isMatched ? 'teal' : 'orange'}
        valueColor={isMatched ? 'teal.8' : 'orange.8'}
      />
      <LedgerKpiCard
        label={t('cashBank.kpi.journalTotal')}
        value={t('cashBank.kpi.journalTotalValue', { count: journalCount.toLocaleString('id-ID') })}
        hint={t('cashBank.kpi.journalTotalHint')}
        icon={<IconReceipt2 size={20} />}
        iconColor="indigo"
        valueColor="dark.8"
      />
    </SimpleGrid>
  );
};
