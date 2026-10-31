import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { VarianceType } from '@/module/petty-cash/domain/pettyCashEntities';

interface Props {
  type: VarianceType;
  /** Signed amount: negative is a shortage. */
  amount: number;
  size?: string;
}

/** Cash over/short in words: orange for a difference, teal when the cash matches the books. */
export function VarianceText({ type, amount, size = 'sm' }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const money = formatCurrency(Math.abs(amount), false);
  const key = type === 'SHORT' ? 'short' : type === 'OVER' ? 'over' : 'balanced';

  return (
    <Text size={size} fw={650} c={type === 'BALANCED' ? 'teal.8' : 'orange.8'}>
      {t(`counts.${key}`, { amount: money })}
    </Text>
  );
}
