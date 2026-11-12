import { Progress, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { usageOf, type RefreshUsage as Usage } from '@/module/bank-connection/domain/feeRules';

/** How many of the month's included refreshes are used, and a plain warning once the quota is passed. */
export function RefreshUsage({ usage }: Readonly<{ usage: Usage }>) {
  const { t } = useTranslation('bankConnection');
  const { over, left, percent } = usageOf(usage);

  return (
    <Stack gap={4} maw={360}>
      <Text fz="sm">
        {t('detail.active.usage', { used: usage.used, included: usage.included })}
      </Text>
      <Progress
        value={percent}
        color={over > 0 ? 'orange' : 'primary'}
        size="sm"
        aria-hidden="true"
      />
      {over > 0 && (
        <Text fz={12} c="orange.8">
          {t('detail.active.usageOver', {
            over,
            fee: formatCurrency(usage.extraRefreshFee ?? 0, false),
          })}
        </Text>
      )}
      {over === 0 && left === 0 && (
        <Text fz={12} c="orange.8">
          {t('detail.active.usageNear')}
        </Text>
      )}
    </Stack>
  );
}
