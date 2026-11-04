import { SummaryBar, type SummaryItem } from '@/components/SummaryBar';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { UnmatchedSummary } from '../../domain/unmatchedSummary';

/** A negative amount in brackets, like the ledger. */
const signed = (amount: number): string =>
  amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount);

/**
 * What is still open on both sides: statement rows with no journal, journal lines with no
 * statement row, and what is left between the two.
 */
const ReconciliationSummary: React.FC<{ summary: UnmatchedSummary }> = ({ summary }) => {
  const { t } = useTranslation('reconciliation');
  const items: SummaryItem[] = [
    {
      key: 'statements',
      label: t('summary.statements'),
      value: signed(summary.statementNet),
      hint: t('summary.rows', { count: summary.statementCount }),
    },
    {
      key: 'journals',
      label: t('summary.journals'),
      value: signed(summary.journalNet),
      hint: t('summary.rows', { count: summary.journalCount }),
    },
    {
      key: 'difference',
      label: t('summary.difference'),
      value: signed(summary.difference),
      hint: summary.difference === 0 ? t('summary.differenceZero') : t('summary.differenceHint'),
    },
  ];
  return <SummaryBar items={items} columns={3} />;
};

export default ReconciliationSummary;
