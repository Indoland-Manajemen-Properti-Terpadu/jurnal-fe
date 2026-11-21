import { Select } from '@mantine/core';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';

interface DepositAccountFieldProps {
  value: string;
  onChange: (id: string) => void;
  withAsterisk?: boolean;
  /** Overrides the label of a voucher's paying account. */
  label?: string;
  error?: string;
}

/** The cash or bank account the money leaves from. */
export const DepositAccountField = ({
  value,
  onChange,
  withAsterisk,
  label,
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
      label={label ?? t('payments.form.deposit')}
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
