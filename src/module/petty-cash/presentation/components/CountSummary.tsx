import { Button } from '@mantine/core';
import { IconDeviceFloppy, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { VarianceType } from '@/module/petty-cash/domain/pettyCashEntities';
import type { AmountRow } from '@/module/petty-cash/presentation/components/DetailKit';
import { FormSummaryCard } from '@/module/petty-cash/presentation/components/FormSummaryCard';

interface Props {
  /** Cash counted in the box. */
  counted: number;
  /** Balances of the non-cash pockets; leave out when the fund has none. */
  nonCash?: number;
  /** Cash plus non-cash, worked out in the domain; required with `nonCash`. */
  totalCounted?: number;
  expected: number;
  variance: { amount: number; type: VarianceType };
  pending: boolean;
  showIssues: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

/** Live result of the count against the books, and the two ways to save it. */
export function CountSummary({
  counted,
  nonCash,
  totalCounted,
  expected,
  variance,
  pending,
  showIssues,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const noteKey =
    variance.type === 'SHORT'
      ? 'shortNote'
      : variance.type === 'OVER'
        ? 'overNote'
        : 'balancedNote';
  const hasNonCash = nonCash !== undefined && totalCounted !== undefined;

  const rows: AmountRow[] = [
    { label: t(hasNonCash ? 'countForm.cashCounted' : 'countForm.counted'), value: money(counted) },
    ...(hasNonCash
      ? [
          { label: t('countForm.nonCashCounted'), value: money(nonCash) },
          { label: t('countForm.totalCounted'), value: money(totalCounted) },
        ]
      : []),
    { label: t('countForm.expected'), value: money(expected) },
    { label: t('countForm.variance'), value: money(Math.abs(variance.amount)), total: true },
  ];

  return (
    <FormSummaryCard
      title={t('countForm.summaryTitle')}
      rows={rows}
      notes={[t('countForm.expectedNote')]}
      status={{
        tone: variance.type === 'BALANCED' ? 'ok' : 'warning',
        text: t(`countForm.${noteKey}`, { amount: money(Math.abs(variance.amount)) }),
      }}
      issuesText={showIssues ? t('countForm.fixIssues') : undefined}
    >
      <Button leftSection={<IconSend size={16} />} loading={pending} onClick={onSubmit} fullWidth>
        {t('countForm.submit')}
      </Button>
      <Button
        variant="default"
        leftSection={<IconDeviceFloppy size={16} />}
        disabled={pending}
        onClick={onSaveDraft}
        fullWidth
      >
        {t('countForm.saveDraft')}
      </Button>
      <Button variant="subtle" color="gray" disabled={pending} onClick={onCancel} fullWidth>
        {t('countForm.cancel')}
      </Button>
    </FormSummaryCard>
  );
}
