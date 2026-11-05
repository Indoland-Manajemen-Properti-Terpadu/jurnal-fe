import { useTranslation } from '@/i18n';
import {
  MoneyRows,
  type MoneyRow,
} from '@/module/purchases/presentation/components/shared/MoneyRows';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface ValueFigures {
  amount: number;
  discountAmount: number;
  net: number;
  taxAmount: number;
  withholdingAmount: number;
  finalAmount: number;
}

/** The value of a return in the order the books follow: goods, discount, net, tax, withholding. */
export const ReturnValueRows = ({
  figures,
  ns,
}: Readonly<{ figures: ValueFigures; ns: 'returns.form' | 'returns.detail' }>) => {
  const { t } = useTranslation('purchases');
  const rows: MoneyRow[] = [
    { label: t(`${ns}.amount`), amount: formatAmount(figures.amount) },
    ...(figures.discountAmount > 0
      ? [
          {
            label: t(`${ns}.discount`),
            amount: formatAmount(figures.discountAmount),
            minus: true,
            emphasis: 'muted' as const,
          },
        ]
      : []),
    { label: t(`${ns}.net`), amount: formatAmount(figures.net) },
    ...(figures.taxAmount > 0
      ? [
          {
            label: t(`${ns}.tax`),
            amount: formatAmount(figures.taxAmount),
            emphasis: 'muted' as const,
          },
        ]
      : []),
    ...(figures.withholdingAmount > 0
      ? [
          {
            label: t(`${ns}.withholding`),
            amount: formatAmount(figures.withholdingAmount),
            minus: true,
            emphasis: 'muted' as const,
          },
        ]
      : []),
    { label: t(`${ns}.final`), amount: formatAmount(figures.finalAmount), emphasis: 'total' },
  ];
  return <MoneyRows rows={rows} />;
};
