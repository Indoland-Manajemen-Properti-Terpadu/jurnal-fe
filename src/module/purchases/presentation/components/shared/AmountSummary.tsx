import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  MoneyRows,
  type MoneyRow,
} from '@/module/purchases/presentation/components/shared/MoneyRows';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface AmountSummaryProps {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  withholdingAmount: number;
  finalAmount: number;
  /** Open amount to show under the final line, for bills. */
  remainingAmount?: number;
  /** Marks the figures as an estimate the server will confirm. */
  estimate?: boolean;
}

/** The money of an order or bill, in the order the server calculates it. */
export const AmountSummary = ({
  subtotal,
  discountAmount,
  taxAmount,
  total,
  withholdingAmount,
  finalAmount,
  remainingAmount,
  estimate,
}: Readonly<AmountSummaryProps>) => {
  const { t } = useTranslation('purchases');
  const rows: MoneyRow[] = [
    { label: t('amounts.subtotal'), amount: formatAmount(subtotal) },
    ...(discountAmount > 0
      ? [
          {
            label: t('amounts.discount'),
            amount: formatAmount(discountAmount),
            minus: true,
            emphasis: 'muted' as const,
          },
        ]
      : []),
    ...(taxAmount > 0
      ? [{ label: t('amounts.tax'), amount: formatAmount(taxAmount), emphasis: 'muted' as const }]
      : []),
    { label: t('amounts.total'), amount: formatAmount(total), emphasis: 'total' },
    ...(withholdingAmount > 0
      ? [
          {
            label: t('amounts.withholding'),
            amount: formatAmount(withholdingAmount),
            minus: true,
            emphasis: 'muted' as const,
          },
        ]
      : []),
    { label: t('amounts.payable'), amount: formatAmount(finalAmount), emphasis: 'total' },
    ...(remainingAmount !== undefined
      ? [
          {
            label: t('amounts.remaining'),
            amount: formatAmount(remainingAmount),
            emphasis: 'muted' as const,
          },
        ]
      : []),
  ];
  return (
    <>
      <MoneyRows rows={rows} />
      {estimate && (
        <Text fz="xs" c="dimmed" mt="xs">
          {t('amounts.estimateNote')}
        </Text>
      )}
    </>
  );
};
