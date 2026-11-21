import { Select } from '@mantine/core';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';

interface DepositAccountFieldProps {
  value: string;
  onChange: (id: string) => void;
  withAsterisk?: boolean;
  error?: string;
}

/** The cash or bank account the money leaves from. */
export const DepositAccountField = ({
  value,
  onChange,
  withAsterisk,
  error,
}: Readonly<DepositAccountFieldProps>) => {
  const { t } = useTranslation('purchases');
  const { accounts } = useSimpleAccounts({ isBankAndCash: true });

  return (
    <Select
      radius="md"
      searchable
      clearable={!withAsterisk}
      withAsterisk={withAsterisk}
      label={t('payments.form.deposit')}
      placeholder={t('payments.form.depositPlaceholder')}
      data={accounts.map((account) => ({
        value: account.id,
        label: `${account.accountNumber} ${account.name}`,
      }))}
      value={value || null}
      onChange={(id) => onChange(id ?? '')}
      error={error}
    />
  );
};
