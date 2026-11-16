import { useState } from 'react';
import { Alert, Anchor, Group, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { BankProvider } from '@/module/bank-connection/domain/connection';
import type { AccountType } from '@/module/bank-connection/domain/connectionForm';
import { FeeInfoDialog } from '@/module/bank-connection/presentation/components/FeeInfoDialog';

/**
 * The fee of the chosen bank for the chosen kind of account. A bank with a rule (a quota of refreshes)
 * says it and links to the full explanation; a bank with only a monthly fee states it; none says nothing.
 */
export function FeeNotice({
  provider,
  accountType,
}: Readonly<{ provider: BankProvider; accountType: AccountType }>) {
  const { t } = useTranslation('bankConnection');
  const [open, setOpen] = useState(false);
  const rule = provider.fees?.[accountType];

  if (rule) {
    return (
      <>
        <Alert icon={<IconInfoCircle size={16} />} color="primary" radius="md">
          <Group justify="space-between" gap="sm" wrap="nowrap" align="flex-start">
            <Text fz="sm">
              {t('form.feeRule.notice', {
                amount: formatCurrency(rule.monthly, false),
                included: rule.includedRefreshes,
              })}
            </Text>
            <Anchor
              component="button"
              type="button"
              fz="sm"
              onClick={() => setOpen(true)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {t('form.feeRule.more')}
            </Anchor>
          </Group>
        </Alert>
        <FeeInfoDialog rule={rule} opened={open} onClose={() => setOpen(false)} />
      </>
    );
  }
  if (provider.monthlyFee) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="primary" radius="md">
        {t('form.feeNotice', { amount: formatCurrency(provider.monthlyFee) })}
      </Alert>
    );
  }
  return null;
}
