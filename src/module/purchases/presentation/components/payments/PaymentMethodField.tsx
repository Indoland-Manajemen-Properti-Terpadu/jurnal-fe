import { Select, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { usePaymentMethodOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface PaymentMethodFieldProps {
  value: string;
  onChange: (id: string) => void;
}

/** How the money leaves: the method suggests the account and carries the default admin fee. */
export const PaymentMethodField = ({ value, onChange }: Readonly<PaymentMethodFieldProps>) => {
  const { t } = useTranslation('purchases');
  const { data: methods = [], isLoading } = usePaymentMethodOptions();
  const selected = methods.find((method) => method.id === value);

  return (
    <div>
      <Select
        radius="md"
        searchable
        clearable
        label={t('payments.form.method')}
        placeholder={t('payments.form.methodPlaceholder')}
        data={methods.map((method) => ({ value: method.id, label: method.name }))}
        value={value || null}
        disabled={isLoading}
        onChange={(id) => onChange(id ?? '')}
      />
      {selected && (
        <Text size="xs" c="dimmed" mt={4}>
          {t('payments.form.methodHint', {
            account: selected.accountName ?? t('payments.form.methodNoAccount'),
            fee: formatAmount(selected.adminFee),
          })}
        </Text>
      )}
    </div>
  );
};
