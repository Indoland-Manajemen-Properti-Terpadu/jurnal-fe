import { NumberInput, Select } from '@mantine/core';
import { IconCoin } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PaymentFormValues } from '@/module/purchases/domain/paymentForm';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { useOrders } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface AdvanceSectionProps {
  values: PaymentFormValues;
  showErrors: boolean;
  amountInvalid: boolean;
  onChange: (patch: Partial<PaymentFormValues>) => void;
}

/** The amount paid up front and, optionally, the approved order it is meant for. */
export const AdvanceSection = ({
  values,
  showErrors,
  amountInvalid,
  onChange,
}: Readonly<AdvanceSectionProps>) => {
  const { t } = useTranslation('purchases');
  const orders = useOrders(
    { vendor: values.vendorId, status: 'APPROVED', limit: 50 },
    Boolean(values.vendorId)
  );
  const options = (orders.data?.items ?? []).map((order) => ({
    value: order.id,
    label: `${order.number} · ${formatAmount(order.finalAmount)}`,
  }));

  return (
    <SectionCard
      icon={IconCoin}
      title={t('payments.form.advanceTitle')}
      subtitle={t('payments.form.advanceSubtitle')}
    >
      <NumberInput
        radius="md"
        withAsterisk
        label={t('payments.form.advanceAmount')}
        value={values.advanceAmount}
        min={0}
        hideControls
        allowNegative={false}
        thousandSeparator="."
        decimalSeparator=","
        prefix="Rp "
        error={showErrors && amountInvalid ? t('payments.form.advanceAmountError') : undefined}
        onChange={(value) => onChange({ advanceAmount: value === '' ? '' : Number(value) })}
      />
      <Select
        radius="md"
        clearable
        searchable
        label={t('payments.form.purchaseOrder')}
        placeholder={t('payments.form.purchaseOrderPlaceholder')}
        nothingFoundMessage={t('payments.form.noOrders')}
        disabled={!values.vendorId}
        data={options}
        value={values.purchaseOrderId || null}
        onChange={(id) => onChange({ purchaseOrderId: id ?? '' })}
      />
    </SectionCard>
  );
};
