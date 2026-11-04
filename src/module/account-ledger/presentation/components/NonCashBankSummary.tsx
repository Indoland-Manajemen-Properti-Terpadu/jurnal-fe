import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { SummaryBar, type SummaryItem } from '@/components/SummaryBar';
import type { MutationSummary } from '../../domain/ledgerSummary';
import type { NormalSide } from '../../domain/normalBalance';
import { formatBalance } from '../../domain/ledgerPresentation';

interface NonCashBankSummaryProps {
  amount: number;
  normalBalance: NormalSide;
  metrics: MutationSummary;
  lastEntryDate?: Date;
}

export const NonCashBankSummary: React.FC<NonCashBankSummaryProps> = ({
  amount,
  normalBalance,
  metrics,
  lastEntryDate,
}) => {
  const { t } = useTranslation('accountLedger');

  const items: SummaryItem[] = [
    {
      key: 'balance',
      label: t('nonCashBank.kpi.balance'),
      value: formatBalance(amount || 0),
      hint: t('nonCashBank.kpi.balanceHint', { side: t(`common.side.${normalBalance}`) }),
    },
    {
      key: 'debit',
      label: t('nonCashBank.kpi.debit'),
      value: formatCurrency(metrics.totalDebit),
      hint: t('nonCashBank.kpi.debitHint', { count: metrics.debitCount }),
    },
    {
      key: 'credit',
      label: t('nonCashBank.kpi.credit'),
      value: formatCurrency(metrics.totalCredit),
      hint: t('nonCashBank.kpi.creditHint', { count: metrics.creditCount }),
    },
    {
      key: 'mutations',
      label: t('nonCashBank.kpi.mutations'),
      value: t('nonCashBank.kpi.mutationsValue', {
        count: metrics.totalCount.toLocaleString('id-ID'),
      }),
      hint: lastEntryDate
        ? t('nonCashBank.kpi.lastEntry', { date: dateFormatV1(lastEntryDate) })
        : t('nonCashBank.kpi.mutationsHint'),
    },
  ];

  return <SummaryBar items={items} />;
};
