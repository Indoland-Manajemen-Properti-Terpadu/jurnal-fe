import { Grid, MultiSelect, NumberInput, Select, TextInput, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type {
  BillFormErrors,
  BillFormValues,
  AdjustmentKind,
} from '@/module/purchases/domain/billForm';
import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import { useTagOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillHeaderFieldsProps {
  source: BillSource;
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
  source,
  values,
  errors,
  showErrors,
  dueHint,
  onChange,
}: Readonly<BillHeaderFieldsProps>) => {
  const { t } = useTranslation('purchases');
  const isManual = source === 'MANUAL';
  const tags = useTagOptions();
  const error = (key: keyof BillFormValues) =>
    showErrors && errors.fields[key] ? t(`bills.form.error.${errors.fields[key]}`) : undefined;

  const KIND_DATA = KINDS.map((kind) => ({ value: kind, label: t(`bills.form.kind.${kind}`) }));
  /** Kind as a dropdown with its value beside it; the value waits until a kind is chosen. */
  const adjustment = (
    kindKey: 'discountKind' | 'withholdingKind',
    valueKey: 'discountValue' | 'withholdingValue',
    label: string
  ) => {
    const kind = values[kindKey];
    return (
      <>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Select
            radius="md"
            allowDeselect={false}
            label={label}
            data={KIND_DATA}
            value={kind}
            onChange={(value) => value && onChange(kindKey, value as AdjustmentKind)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <NumberInput
            radius="md"
            label={t('bills.form.adjustmentValue', { label })}
            {...MONEY}
            min={0}
            allowNegative={false}
            disabled={kind === 'none'}
            placeholder={kind === 'none' ? '-' : undefined}
            prefix={kind === 'nominal' ? 'Rp ' : undefined}
            suffix={kind === 'percentage' ? ' %' : undefined}
            value={kind === 'none' ? '' : values[valueKey]}
            onChange={(value) => onChange(valueKey, value === '' ? '' : Number(value))}
            error={error(valueKey)}
          />
        </Grid.Col>
      </>
    );
  };
  // Hints sit under the input so every field in a row starts and ends on the same line.
  const hintBelow = ['label', 'input', 'description', 'error'] as const;
  const withholding = values.withholdingKind !== 'none';

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <TextInput
          radius="md"
          label={t('bills.form.vendorInvoiceNumber')}
          placeholder={t('bills.form.vendorInvoiceNumberPlaceholder')}
          value={values.vendorInvoiceNumber}
          onChange={(event) => onChange('vendorInvoiceNumber', event.currentTarget.value)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <TextInput
          radius="md"
          label={t('bills.form.taxInvoiceNumber')}
          placeholder={t('bills.form.taxInvoiceNumberPlaceholder')}
          value={values.taxInvoiceNumber}
          onChange={(event) => onChange('taxInvoiceNumber', event.currentTarget.value)}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <DateField
          withAsterisk
          label={t('bills.form.date')}
          value={values.date}
          onChange={(value) => onChange('date', value)}
          error={error('date')}
        />
      </Grid.Col>
      {isManual && (
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <DateField
            clearable
            label={t('bills.form.dueDate')}
            description={dueHint ?? t('bills.form.dueDateHint')}
            inputWrapperOrder={[...hintBelow]}
            value={values.dueDate}
            minDate={values.date || undefined}
            onChange={(value) => onChange('dueDate', value)}
            error={error('dueDate')}
          />
        </Grid.Col>
      )}
      {isManual && adjustment('discountKind', 'discountValue', t('bills.form.discount'))}
      {adjustment('withholdingKind', 'withholdingValue', t('bills.form.withholding'))}
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <NumberInput
          radius="md"
          label={
            isManual
              ? t('bills.form.vendorInvoiceTotal')
              : t('bills.form.vendorInvoiceTotalComparison')
          }
          description={
            isManual
              ? t('bills.form.vendorInvoiceTotalHint')
              : t('bills.form.vendorInvoiceTotalComparisonHint')
          }
          inputWrapperOrder={[...hintBelow]}
          prefix="Rp "
          min={0}
          allowNegative={false}
          {...MONEY}
          value={values.vendorInvoiceTotal}
          onChange={(value) => onChange('vendorInvoiceTotal', value === '' ? '' : Number(value))}
          error={error('vendorInvoiceTotal')}
        />
      </Grid.Col>
      {withholding && (
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            radius="md"
            label={t('bills.form.withholdingCode')}
            placeholder={t('bills.form.withholdingCodePlaceholder')}
            value={values.withholdingTaxCode}
            onChange={(event) => onChange('withholdingTaxCode', event.currentTarget.value)}
          />
        </Grid.Col>
      )}
      <Grid.Col span={withholding ? { base: 12, md: 6 } : { base: 12, md: 9 }}>
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
