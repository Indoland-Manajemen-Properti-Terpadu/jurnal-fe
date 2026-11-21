import { Group, NumberInput, Select, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PaymentTermOption } from '@/module/purchases/domain/purchaseCommon';
import {
  termFields,
  withTermDefaults,
  type QuoteFormErrors,
  type QuoteFormValues,
} from '@/module/purchases/domain/quoteForm';

interface QuoteTermSectionProps {
  values: QuoteFormValues;
  errors: QuoteFormErrors;
  showErrors: boolean;
  terms: PaymentTermOption[];
  /** Name of the term the quote already has, kept in the list even if it is inactive now. */
  currentTermName?: string;
  onReplace: (values: QuoteFormValues) => void;
  onChange: <K extends keyof QuoteFormValues>(key: K, value: QuoteFormValues[K]) => void;
}

/** The payment term and the figures of its mechanism that this vendor may change. */
export const QuoteTermSection = ({
  values,
  errors,
  showErrors,
  terms,
  currentTermName,
  onReplace,
  onChange,
}: Readonly<QuoteTermSectionProps>) => {
  const { t } = useTranslation('purchases');
  const term = terms.find((candidate) => candidate.id === values.paymentTermId);
  const fields = termFields(term);
  const data = terms.map((option) => ({ value: option.id, label: option.name }));
  if (values.paymentTermId && !term && currentTermName) {
    data.unshift({ value: values.paymentTermId, label: currentTermName });
  }
  const error = (key: keyof QuoteFormValues) =>
    showErrors && errors.fields[key]
      ? t(`procurement.quote.error.${errors.fields[key]}`)
      : undefined;

  return (
    <Stack gap="md">
      <Select
        withAsterisk
        radius="md"
        searchable
        label={t('procurement.quote.term')}
        placeholder={t('procurement.quote.termPlaceholder')}
        data={data}
        value={values.paymentTermId || null}
        onChange={(id) =>
          onReplace(
            withTermDefaults(
              values,
              terms.find((option) => option.id === id)
            )
          )
        }
        error={error('paymentTermId')}
      />
      {term && (term.paymentLabel || term.billingLabel || term.dueLabel) && (
        <Text size="xs" c="dimmed">
          {[term.paymentLabel, term.billingLabel, term.dueLabel].filter(Boolean).join(' · ')}
        </Text>
      )}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
        {fields.advance && (
          <NumberInput
            radius="md"
            label={t('procurement.quote.advancePercent')}
            suffix=" %"
            min={0}
            max={100}
            decimalScale={2}
            hideControls
            value={values.advancePercent}
            onChange={(value) => onChange('advancePercent', value === '' ? '' : Number(value))}
            error={error('advancePercent')}
          />
        )}
        {fields.installments && (
          <NumberInput
            radius="md"
            label={t('procurement.quote.installments')}
            min={0}
            allowDecimal={false}
            hideControls
            value={values.installments}
            onChange={(value) => {
              const next = value === '' ? '' : Number(value);
              onChange('installments', next);
              if (values.installmentPercents.length > 0) onChange('installmentPercents', []);
            }}
            error={error('installments')}
          />
        )}
        {fields.periods && (
          <NumberInput
            radius="md"
            label={t('procurement.quote.periods')}
            min={0}
            allowDecimal={false}
            hideControls
            value={values.periods}
            onChange={(value) => onChange('periods', value === '' ? '' : Number(value))}
            error={error('periods')}
          />
        )}
        {fields.due && (
          <NumberInput
            radius="md"
            label={t('procurement.quote.dueDays')}
            suffix={` ${t('procurement.quote.daysUnit')}`}
            min={0}
            allowDecimal={false}
            hideControls
            value={values.dueDays}
            onChange={(value) => onChange('dueDays', value === '' ? '' : Number(value))}
            error={error('dueDays')}
          />
        )}
        {fields.retention && (
          <>
            <NumberInput
              radius="md"
              label={t('procurement.quote.retentionPercent')}
              suffix=" %"
              min={0}
              max={99}
              decimalScale={2}
              hideControls
              value={values.retentionPercent}
              onChange={(value) => onChange('retentionPercent', value === '' ? '' : Number(value))}
              error={error('retentionPercent')}
            />
            <NumberInput
              radius="md"
              label={t('procurement.quote.maintenanceMonths')}
              suffix={` ${t('procurement.quote.monthsUnit')}`}
              min={0}
              allowDecimal={false}
              hideControls
              value={values.maintenanceMonths}
              onChange={(value) => onChange('maintenanceMonths', value === '' ? '' : Number(value))}
              error={error('maintenanceMonths')}
            />
          </>
        )}
      </SimpleGrid>
      {fields.installments &&
        typeof values.installments === 'number' &&
        values.installments >= 2 && (
          <Stack gap={6}>
            <Group justify="space-between" align="center">
              <Text size="sm" fw={500}>
                {t('procurement.quote.percentsTitle')}
              </Text>
              <Switch
                size="xs"
                label={t('procurement.quote.customPercents')}
                checked={values.installmentPercents.length > 0}
                onChange={(event) =>
                  onChange(
                    'installmentPercents',
                    event.currentTarget.checked
                      ? Array.from({ length: values.installments as number }, () => '' as const)
                      : []
                  )
                }
              />
            </Group>
            {values.installmentPercents.length > 0 && (
              <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
                {values.installmentPercents.map((percent, index) => (
                  <NumberInput
                    key={index}
                    radius="md"
                    aria-label={t('procurement.quote.percentAria', { number: index + 1 })}
                    placeholder={t('procurement.quote.termNumber', { number: index + 1 })}
                    suffix=" %"
                    min={0}
                    decimalScale={2}
                    hideControls
                    value={percent}
                    onChange={(value) =>
                      onChange(
                        'installmentPercents',
                        values.installmentPercents.map((current, i) =>
                          i === index ? (value === '' ? '' : Number(value)) : current
                        )
                      )
                    }
                  />
                ))}
              </SimpleGrid>
            )}
            {error('installmentPercents' as keyof QuoteFormValues) && (
              <Text size="xs" c="red">
                {error('installmentPercents' as keyof QuoteFormValues)}
              </Text>
            )}
          </Stack>
        )}
      <Switch
        label={t('procurement.quote.withReceipt')}
        description={t('procurement.quote.withReceiptHint')}
        checked={values.withReceipt}
        onChange={(event) => onChange('withReceipt', event.currentTarget.checked)}
      />
    </Stack>
  );
};
