import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { SummaryBar, type SummaryItem, type SummaryTone } from '@/components/SummaryBar';
import {
  formatBalance,
  getReconciliationState,
  type ReconciliationState,
} from '../../domain/ledgerPresentation';

interface CashBankSummaryProps {
  ledgerAmount: number;
  /** Imported statement rows, matched or not. */
  statementCount: number;
  /** Received minus sent over the imported rows: a movement, not a bank balance. */
  statementNet: number;
  unreconciledStatements: number;
  unreconciledJournals: number;
  journalCount: number;
  lastEntryDate?: Date;
}

const STATE_TONE: Record<ReconciliationState, SummaryTone> = {
  none: 'muted',
  matched: 'success',
  pending: 'warning',
};

export const CashBankSummary: React.FC<CashBankSummaryProps> = ({
  ledgerAmount,
  statementCount,
  statementNet,
  unreconciledStatements,
  unreconciledJournals,
  journalCount,
  lastEntryDate,
}) => {
  const { t } = useTranslation('accountLedger');
  const state = getReconciliationState(statementCount, unreconciledStatements);

  const stateText: Record<ReconciliationState, { value: string; hint: string }> = {
    none: { value: t('cashBank.kpi.reconNone'), hint: t('cashBank.kpi.reconNoneHint') },
    matched: {
      value: t('cashBank.kpi.reconMatched'),
      hint:
        unreconciledJournals > 0
          ? t('cashBank.kpi.reconJournalsOnly', { journals: unreconciledJournals })
          : t('cashBank.kpi.reconMatchedHint'),
    },
    pending: {
      value: t('cashBank.kpi.reconPending', { count: unreconciledStatements }),
      hint: t('cashBank.kpi.reconPendingHint', {
        statements: unreconciledStatements,
        journals: unreconciledJournals,
      }),
    },
  };

  const items: SummaryItem[] = [
    {
      key: 'ledger',
      label: t('cashBank.kpi.ledgerBalance'),
      value: formatBalance(ledgerAmount || 0),
      hint: t('cashBank.kpi.ledgerBalanceHint'),
    },
    {
      key: 'statements',
      label: t('cashBank.kpi.statementTotal'),
      value: statementCount > 0 ? formatBalance(statementNet) : '—',
      hint:
        statementCount > 0
          ? t('cashBank.kpi.statementTotalHint', { count: statementCount })
          : t('cashBank.kpi.statementNone'),
    },
    {
      key: 'recon',
      label: t('cashBank.kpi.reconStatus'),
      value: stateText[state].value,
      hint: stateText[state].hint,
      tone: STATE_TONE[state],
    },
    {
      key: 'journal',
      label: t('cashBank.kpi.journalTotal'),
      value: t('cashBank.kpi.journalTotalValue', { count: journalCount.toLocaleString('id-ID') }),
      hint: lastEntryDate
        ? t('cashBank.kpi.lastEntry', { date: dateFormatV1(lastEntryDate) })
        : t('cashBank.kpi.journalTotalHint'),
    },
  ];

  return <SummaryBar items={items} />;
};
