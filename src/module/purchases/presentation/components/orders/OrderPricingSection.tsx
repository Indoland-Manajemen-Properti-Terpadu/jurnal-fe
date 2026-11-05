import { NumberInput, Select, SimpleGrid, Stack, Switch, TextInput } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { OrderFormErrors, OrderFormValues } from '@/module/purchases/domain/orderForm';

interface OrderPricingSectionProps {
  values: OrderFormValues;
  errors: OrderFormErrors;
  showErrors: boolean;
  onChange: (patch: Partial<OrderFormValues>) => void;
}

const kindOptions = (t: (key: string) => string) => [
  { value: 'percentage', label: t('orders.form.kindPercentage') },
  { value: 'nominal', label: t('orders.form.kindNominal') },
];

/** Tax-inclusive prices, an order discount, and income tax withheld from the vendor. */
export const OrderPricingSection = ({
  values,
  errors,
  showErrors,
  onChange,
}: Readonly<OrderPricingSectionProps>) => {
  const { t } = useTranslation('purchases');
  const options = kindOptions(t);
  const isPercent = (type: string) => type === 'percentage';

  return (
    <Stack gap="md">
      <Switch
        label={t('orders.form.includeTax')}
        description={t('orders.form.includeTaxHint')}
        checked={values.isPriceIncludeTax}
        onChange={(event) => onChange({ isPriceIncludeTax: event.currentTarget.checked })}
      />
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <SimpleGrid cols={2} spacing="xs">
          <Select
            radius="md"
            clearable
            label={t('orders.form.discount')}
            placeholder={t('orders.form.none')}
            data={options}
            value={values.discountType || null}
            onChange={(value) =>
              onChange({
                discountType: (value ?? '') as OrderFormValues['discountType'],
                discountValue: '',
              })
            }
          />
          <NumberInput
            radius="md"
            label={t('orders.form.discountValue')}
            disabled={!values.discountType}
            value={values.discountValue}
            min={0}
            max={isPercent(values.discountType) ? 100 : undefined}
            hideControls
            allowNegative={false}
            suffix={isPercent(values.discountType) ? ' %' : undefined}
            prefix={values.discountType === 'nominal' ? 'Rp ' : undefined}
            thousandSeparator="."
            decimalSeparator=","
            error={showErrors && errors.discount ? t('orders.form.adjustmentInvalid') : undefined}
            onChange={(value) => onChange({ discountValue: value === '' ? '' : Number(value) })}
          />
        </SimpleGrid>
        <SimpleGrid cols={2} spacing="xs">
          <Select
            radius="md"
            clearable
            label={t('orders.form.withholding')}
            placeholder={t('orders.form.none')}
            data={options}
            value={values.withholdingType || null}
            onChange={(value) =>
              onChange({
                withholdingType: (value ?? '') as OrderFormValues['withholdingType'],
                withholdingValue: '',
              })
            }
          />
          <NumberInput
            radius="md"
            label={t('orders.form.withholdingValue')}
            disabled={!values.withholdingType}
            value={values.withholdingValue}
            min={0}
            max={isPercent(values.withholdingType) ? 100 : undefined}
            hideControls
            allowNegative={false}
            suffix={isPercent(values.withholdingType) ? ' %' : undefined}
            prefix={values.withholdingType === 'nominal' ? 'Rp ' : undefined}
            thousandSeparator="."
            decimalSeparator=","
            error={
              showErrors && errors.withholding ? t('orders.form.adjustmentInvalid') : undefined
            }
            onChange={(value) => onChange({ withholdingValue: value === '' ? '' : Number(value) })}
          />
        </SimpleGrid>
      </SimpleGrid>
      {values.withholdingType && (
        <TextInput
          radius="md"
          label={t('orders.form.withholdingCode')}
          placeholder={t('orders.form.withholdingCodePlaceholder')}
          value={values.withholdingTaxCode}
          maxLength={30}
          onChange={(event) => onChange({ withholdingTaxCode: event.currentTarget.value })}
        />
      )}
    </Stack>
  );
};
