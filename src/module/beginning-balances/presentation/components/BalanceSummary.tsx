import React from 'react';
import { SummaryBar, type SummaryItem } from '@/components/SummaryBar';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { BalanceState } from '../../domain/beginningBalance';

type Props = {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  balanceState: BalanceState;
  filledCount: number;
  accountCount: number;
  /** The gap is recorded to the opening equity account when publishing. */
  autoBalance?: boolean;
};

/** One surface for the equation the user is solving: debit, credit, what is left, and progress. */
const BalanceSummary: React.FC<Props> = ({
  totalDebit,
  totalCredit,
  difference,
  balanceState,
  filledCount,
  accountCount,
  autoBalance = false,
}) => {
  const { t } = useTranslation('beginningBalances');

  const balance: Pick<SummaryItem, 'value' | 'hint' | 'tone'> = {
    balanced: {
      value: t('summary.balanced'),
      hint: t('summary.balancedHint'),
      tone: 'success' as const,
    },
    empty: {
      value: t('summary.empty'),
      hint: t('summary.emptyHint'),
      tone: 'muted' as const,
    },
    unbalanced: {
      value: t('summary.difference', { amount: formatCurrency(difference) }),
      hint: autoBalance
        ? t('summary.autoBalanceHint')
        : totalDebit > totalCredit
          ? t('summary.creditLowerHint')
          : t('summary.debitLowerHint'),
      tone: 'warning' as const,
    },
  }[balanceState];

  const items: SummaryItem[] = [
    {
      key: 'debit',
      label: t('summary.totalDebit'),
      value: formatCurrency(totalDebit),
      hint: t('summary.debitHint'),
    },
    {
      key: 'credit',
      label: t('summary.totalCredit'),
      value: formatCurrency(totalCredit),
      hint: t('summary.creditHint'),
    },
    { key: 'balance', label: t('summary.balanceStatus'), ...balance },
    {
      key: 'filled',
      label: t('summary.filledAccounts'),
      value: filledCount.toLocaleString('id-ID'),
      hint: t('summary.filledHint', { total: accountCount.toLocaleString('id-ID') }),
    },
  ];

  return <SummaryBar items={items} />;
};

export default BalanceSummary;
