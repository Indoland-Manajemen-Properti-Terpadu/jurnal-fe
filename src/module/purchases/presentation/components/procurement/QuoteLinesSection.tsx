import { NumberInput, Select, SimpleGrid, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  QUOTE_LIMITS,
  type QuoteFormErrors,
  type QuoteFormLine,
  type QuoteFormValues,
} from '@/module/purchases/domain/quoteForm';
import { formatQuantity } from '@/module/purchases/presentation/components/shared/format';
import { useTaxOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface QuoteLinesSectionProps {
  values: QuoteFormValues;
  errors: QuoteFormErrors;
  showErrors: boolean;
  onLine: (requestItemId: string, patch: Partial<QuoteFormLine>) => void;
  onChange: <K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) => void;
}

const MONEY = {
  decimalScale: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
} as const;

/** The price of each requested item, with tax, the specification offered and the price after negotiation. */
export const QuoteLinesSection = ({
  values,
  errors,
  showErrors,
  onLine,
  onChange,
}: Readonly<QuoteLinesSectionProps>) => {
  const { t } = useTranslation('purchases');
  const taxes = useTaxOptions();
  const taxData = (taxes.data ?? []).map((tax) => ({
    value: tax.id,
    label: `${tax.name} (${tax.rate}%)`,
  }));

  return (
    <Stack gap="md">
      <Switch
        label={t('procurement.quote.priceIncludesTax')}
        checked={values.isPriceIncludeTax}
        onChange={(event) => onChange('isPriceIncludeTax', event.currentTarget.checked)}
      />
      {values.lines.map((line) => {
        const row = errors.lines[line.requestItemId];
        return (
          <Stack
            key={line.requestItemId}
            gap="xs"
            p="md"
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            <div>
              <Text size="sm" fw={600}>
                {line.label}
              </Text>
              <Text size="xs" c="dimmed">
                {formatQuantity(line.quantity)} {line.unitName}
              </Text>
            </div>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <NumberInput
                withAsterisk
                radius="md"
                label={t('procurement.quote.unitPrice')}
                prefix="Rp "
                min={0}
                allowNegative={false}
                {...MONEY}
                value={line.unitPrice}
                onChange={(value) =>
                  onLine(line.requestItemId, { unitPrice: value === '' ? '' : Number(value) })
                }
                error={
                  showErrors && row?.unitPrice
                    ? t('procurement.quote.error.priceRequired')
                    : undefined
                }
              />
              <Select
                radius="md"
                clearable
                label={t('procurement.quote.tax')}
                placeholder={t('procurement.quote.noTax')}
                data={taxData}
                value={line.taxId || null}
                onChange={(tax) => onLine(line.requestItemId, { taxId: tax ?? '' })}
              />
              <NumberInput
                radius="md"
                label={t('procurement.quote.finalPrice')}
                description={t('procurement.quote.finalPriceHint')}
                prefix="Rp "
                min={0}
                allowNegative={false}
                {...MONEY}
                value={line.finalPrice}
                onChange={(value) =>
                  onLine(line.requestItemId, { finalPrice: value === '' ? '' : Number(value) })
                }
                error={
                  showErrors && row?.finalPrice ? t('procurement.quote.error.negative') : undefined
                }
              />
            </SimpleGrid>
            <TextInput
              radius="md"
              label={t('procurement.quote.specification')}
              placeholder={t('procurement.quote.specificationPlaceholder')}
              value={line.specification}
              onChange={(event) =>
                onLine(line.requestItemId, { specification: event.currentTarget.value })
              }
              error={
                showErrors && row?.specification
                  ? t('procurement.quote.error.specificationTooLong', {
                      max: QUOTE_LIMITS.specification,
                    })
                  : undefined
              }
            />
          </Stack>
        );
      })}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <NumberInput
          radius="md"
          label={t('procurement.quote.discount')}
          prefix="Rp "
          min={0}
          allowNegative={false}
          {...MONEY}
          value={values.discountAmount}
          onChange={(value) => onChange('discountAmount', value === '' ? '' : Number(value))}
          error={
            showErrors && errors.fields.discountAmount
              ? t(`procurement.quote.error.${errors.fields.discountAmount}`)
              : undefined
          }
        />
        <NumberInput
          radius="md"
          label={t('procurement.quote.shipping')}
          prefix="Rp "
          min={0}
          allowNegative={false}
          {...MONEY}
          value={values.shippingAmount}
          onChange={(value) => onChange('shippingAmount', value === '' ? '' : Number(value))}
          error={
            showErrors && errors.fields.shippingAmount
              ? t(`procurement.quote.error.${errors.fields.shippingAmount}`)
              : undefined
          }
        />
      </SimpleGrid>
    </Stack>
  );
};
