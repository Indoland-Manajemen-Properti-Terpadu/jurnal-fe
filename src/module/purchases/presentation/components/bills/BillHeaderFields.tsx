import {
  Grid,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useTranslation } from '@/i18n';
import type {
  BillFormErrors,
  BillFormValues,
  AdjustmentKind,
} from '@/module/purchases/domain/billForm';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { useTagOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillHeaderFieldsProps {
  values: BillFormValues;
  errors: BillFormErrors;
  showErrors: boolean;
  /** The due date the service works out from the payment term, shown as the hint. */
  dueHint?: string;
  onChange: <K extends keyof BillFormValues>(key: K, value: BillFormValues[K]) => void;
}

const MONEY = {
  decimalScale: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
} as const;
const KINDS: AdjustmentKind[] = ['none', 'percentage', 'nominal'];

/** The vendor's invoice numbers and total, the dates, the discount, the PPh withholding, tags and note. */
export const BillHeaderFields = ({
  values,
  errors,
  showErrors,
  dueHint,
  onChange,
}: Readonly<BillHeaderFieldsProps>) => {
  const { t } = useTranslation('purchases');
  const tags = useTagOptions();
  const error = (key: keyof BillFormValues) =>
    showErrors && errors.fields[key] ? t(`bills.form.error.${errors.fields[key]}`) : undefined;

  const adjustment = (
    kindKey: 'discountKind' | 'withholdingKind',
    valueKey: 'discountValue' | 'withholdingValue',
    label: string
  ) => (
    <Stack gap={6}>
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <SegmentedControl
        size="xs"
        radius="md"
        data={KINDS.map((kind) => ({ value: kind, label: t(`bills.form.kind.${kind}`) }))}
        value={values[kindKey]}
        onChange={(value) => onChange(kindKey, value as AdjustmentKind)}
      />
      {values[kindKey] !== 'none' && (
        <NumberInput
          radius="md"
          aria-label={label}
          {...MONEY}
          min={0}
          allowNegative={false}
          prefix={values[kindKey] === 'nominal' ? 'Rp ' : undefined}
          suffix={values[kindKey] === 'percentage' ? ' %' : undefined}
          value={values[valueKey]}
          onChange={(value) => onChange(valueKey, value === '' ? '' : Number(value))}
          error={error(valueKey)}
        />
      )}
    </Stack>
  );

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          radius="md"
          label={t('bills.form.vendorInvoiceNumber')}
          placeholder={t('bills.form.vendorInvoiceNumberPlaceholder')}
          value={values.vendorInvoiceNumber}
          onChange={(event) => onChange('vendorInvoiceNumber', event.currentTarget.value)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          radius="md"
          label={t('bills.form.taxInvoiceNumber')}
          placeholder={t('bills.form.taxInvoiceNumberPlaceholder')}
          value={values.taxInvoiceNumber}
          onChange={(event) => onChange('taxInvoiceNumber', event.currentTarget.value)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput
          radius="md"
          label={t('bills.form.vendorInvoiceTotal')}
          description={t('bills.form.vendorInvoiceTotalHint')}
          prefix="Rp "
          min={0}
          allowNegative={false}
          {...MONEY}
          value={values.vendorInvoiceTotal}
          onChange={(value) => onChange('vendorInvoiceTotal', value === '' ? '' : Number(value))}
          error={error('vendorInvoiceTotal')}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <DateField
          withAsterisk
          label={t('bills.form.date')}
          value={values.date}
          onChange={(value) => onChange('date', value)}
          error={error('date')}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <DateField
          clearable
          label={t('bills.form.dueDate')}
          description={dueHint ?? t('bills.form.dueDateHint')}
          value={values.dueDate}
          minDate={values.date || undefined}
          onChange={(value) => onChange('dueDate', value)}
          error={error('dueDate')}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <MultiSelect
          searchable
          clearable
          radius="md"
          label={t('bills.form.tags')}
          placeholder={t('bills.form.tagsPlaceholder')}
          nothingFoundMessage={t('bills.form.noTags')}
          data={(tags.data ?? []).map((tag) => ({ value: tag.id, label: tag.name }))}
          value={values.tagIds}
          onChange={(value) => onChange('tagIds', value)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        {adjustment('discountKind', 'discountValue', t('bills.form.discount'))}
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        {adjustment('withholdingKind', 'withholdingValue', t('bills.form.withholding'))}
        {values.withholdingKind !== 'none' && (
          <TextInput
            mt="xs"
            radius="md"
            aria-label={t('bills.form.withholdingCode')}
            placeholder={t('bills.form.withholdingCodePlaceholder')}
            value={values.withholdingTaxCode}
            onChange={(event) => onChange('withholdingTaxCode', event.currentTarget.value)}
          />
        )}
      </Grid.Col>
      <Grid.Col span={12}>
        <Textarea
          radius="md"
          autosize
          minRows={2}
          label={t('common.memo')}
          value={values.memo}
          onChange={(event) => onChange('memo', event.currentTarget.value)}
        />
      </Grid.Col>
    </Grid>
  );
};
