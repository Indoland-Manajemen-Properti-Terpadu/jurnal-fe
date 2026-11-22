import { IconCalculator } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  SummaryRows,
  type SummaryRow,
} from '@/module/purchases/presentation/components/shared/SummaryRows';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface AmountsCardProps {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  withholdingAmount: number;
  /** Rows between the figures above and the closing band: what was returned, what was paid. */
  extra?: SummaryRow[];
  /** The band at the bottom: the total of an order, what a bill still owes. */
  closing: { label: string; value: number };
  subtitle: string;
}

/** "Ringkasan biaya" of an order or a bill, as in the reference web: rows, then one highlighted figure. */
export const AmountsCard = ({
  subtotal,
  discountAmount,
  taxAmount,
  withholdingAmount,
  extra = [],
  closing,
  subtitle,
}: Readonly<AmountsCardProps>) => {
  const { t } = useTranslation('purchases');
  const rows: SummaryRow[] = [
    { label: t('amounts.subtotal'), value: formatAmount(subtotal) },
    ...(discountAmount > 0
      ? [{ label: t('amounts.discount'), value: `-${formatAmount(discountAmount)}` }]
      : []),
    ...(taxAmount > 0 ? [{ label: t('amounts.tax'), value: formatAmount(taxAmount) }] : []),
    ...(withholdingAmount > 0
      ? [{ label: t('amounts.withholding'), value: `-${formatAmount(withholdingAmount)}` }]
      : []),
    ...extra,
  ];
  return (
    <SectionCard
      icon={IconCalculator}
      label
      flush
      title={t('amounts.cardTitle')}
      subtitle={subtitle}
    >
      <SummaryRows
        rows={rows}
        total={{ label: closing.label, value: formatAmount(closing.value) }}
      />
    </SectionCard>
  );
};
