import {
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useTranslation } from '@/i18n';
import { estimateQuote } from '@/module/purchases/domain/quoteEstimate';
import {
  QUOTE_LIMITS,
  type QuoteFormErrors,
  type QuoteFormLine,
  type QuoteFormValues,
} from '@/module/purchases/domain/quoteForm';
import { formatQuantity } from '@/module/purchases/presentation/components/shared/format';
import { useTaxOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { formatCurrency } from '@/utils/formatCurrency';

interface QuoteLinesSectionProps {
  values: QuoteFormValues;
  errors: QuoteFormErrors;
  showErrors: boolean;
  /** The price after negotiation is asked for only on a single-vendor procurement. */
  showFinalPrice: boolean;
  showShipping: boolean;
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
  showFinalPrice,
  showShipping,
  onLine,
  onChange,
}: Readonly<QuoteLinesSectionProps>) => {
  const { t } = useTranslation('purchases');
  const taxes = useTaxOptions();
  const taxData = (taxes.data ?? []).map((tax) => ({
    value: tax.id,
    label: `${tax.name} (${tax.rate}%)`,
  }));
  const estimate = estimateQuote(
    values,
    Object.fromEntries((taxes.data ?? []).map((tax) => [tax.id, tax.rate]))
  );
  const money = (minor: number) => formatCurrency(minor / 100);
  const percent = values.discountType === 'percentage';

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
            <SimpleGrid cols={{ base: 1, sm: showFinalPrice ? 3 : 2 }} spacing="sm">
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
              {showFinalPrice && (
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
                    showErrors && row?.finalPrice
                      ? t('procurement.quote.error.negative')
                      : undefined
                  }
                />
              )}
            </SimpleGrid>
            <TextInput
              withAsterisk
              radius="md"
              label={t('procurement.quote.specification')}
              placeholder={t('procurement.quote.specificationPlaceholder')}
              value={line.specification}
              onChange={(event) =>
                onLine(line.requestItemId, { specification: event.currentTarget.value })
              }
              error={
                showErrors && row?.specification
                  ? row.specification === 'specificationRequired'
                    ? t('procurement.quote.error.specificationRequired')
                    : t('procurement.quote.error.specificationTooLong', {
                        max: QUOTE_LIMITS.specification,
                      })
                  : undefined
              }
            />
          </Stack>
        );
      })}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        <Stack gap={6}>
          <Group justify="space-between" align="flex-end" wrap="nowrap">
            <Text size="sm" fw={500}>
              {t('procurement.quote.discount')}
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              aria-label={t('procurement.quote.discountMode')}
              data={[
                { value: 'nominal', label: t('procurement.quote.discountModes.nominal') },
                { value: 'percentage', label: t('procurement.quote.discountModes.percentage') },
              ]}
              value={values.discountType}
              onChange={(mode) => {
                onChange('discountType', mode === 'percentage' ? 'percentage' : 'nominal');
                onChange('discountValue', 0);
              }}
            />
          </Group>
          <NumberInput
            radius="md"
            aria-label={t('procurement.quote.discount')}
            {...(percent ? { suffix: ' %', decimalScale: 2 } : { prefix: 'Rp ' })}
            min={0}
            max={percent ? 100 : undefined}
            allowNegative={false}
            {...(percent ? { hideControls: true } : MONEY)}
            value={values.discountValue}
            onChange={(value) => onChange('discountValue', value === '' ? '' : Number(value))}
            error={
              showErrors && errors.fields.discountValue
                ? t(`procurement.quote.error.${errors.fields.discountValue}`)
                : undefined
            }
          />
        </Stack>
        {showShipping && (
          <NumberInput
            radius="md"
            label={t('procurement.quote.shipping')}
            description={t('procurement.quote.shippingHint')}
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
        )}
      </SimpleGrid>
      <Paper withBorder radius="md" p="md" bg="gray.0">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
          {t('procurement.quote.summaryTitle')}
        </Text>
        <Stack gap={4}>
          {[
            ['summarySubtotal', estimate.subtotal],
            ...(estimate.discount > 0 ? [['summaryDiscount', -estimate.discount]] : []),
            ...(estimate.tax > 0 ? [['summaryTax', estimate.tax]] : []),
            ...(estimate.shipping > 0 ? [['summaryShipping', estimate.shipping]] : []),
          ].map(([key, amount]) => (
            <Group key={key as string} justify="space-between">
              <Text size="sm" c="dimmed">
                {t(`procurement.quote.${key}`)}
              </Text>
              <Text size="sm">{money(amount as number)}</Text>
            </Group>
          ))}
          <Group justify="space-between" pt={4}>
            <Text size="sm" fw={700}>
              {t('procurement.quote.summaryTotal')}
            </Text>
            <Text size="sm" fw={700}>
              {money(estimate.total)}
            </Text>
          </Group>
        </Stack>
        <Text size="xs" c="dimmed" mt={6}>
          {t('procurement.quote.summaryNote')}
        </Text>
      </Paper>
    </Stack>
  );
};
