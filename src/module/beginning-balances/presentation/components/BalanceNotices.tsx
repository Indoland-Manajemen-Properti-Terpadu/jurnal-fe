import { Alert, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

/** Shown only while revenue or expense accounts hold an amount: valid for a mid-year start only. */
export function BalanceNotices({ profitLossFilled }: Readonly<{ profitLossFilled: number }>) {
  const { t } = useTranslation('beginningBalances');
  if (profitLossFilled === 0) return null;

  return (
    <Alert
      variant="light"
      color="primary"
      radius="md"
      icon={<IconInfoCircle size={18} />}
      title={t('notices.profitLoss.title')}
    >
      <Text fz="sm" maw="80ch">
        {t('notices.profitLoss.body')}
      </Text>
    </Alert>
  );
}
