import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Grid,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { IconCalendar, IconRepeat } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  BULK_MAX_CUSTOMERS,
  emptyBulkForm,
  validateBulk,
  type BulkOutcome,
  type BulkRecurringValues,
} from '@/module/sales/domain/saleBulk';
import { BulkResultPanel } from './BulkResultPanel';
import { useBulkRecurring } from '../../hooks/useBulkRecurring';
import { useCustomerSearch, useSaleProductOptions } from '../../hooks/useSaleQueries';

const localToday = (): string => new Date().toLocaleDateString('en-CA');

const FORM_ID = 'bulk-recurring-form';

interface BulkRecurringDialogProps {
  onClose: () => void;
}

/** "Tagihan Rutin": one draft invoice per customer for the same charge and month. */
export function BulkRecurringDialog({ onClose }: Readonly<BulkRecurringDialogProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation('salesBulk');
  const form = useForm<BulkRecurringValues>({ initialValues: emptyBulkForm(localToday()) });
  const mutation = useBulkRecurring();
  const [outcome, setOutcome] = useState<BulkOutcome | null>(null);

  const productsQuery = useSaleProductOptions();
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput, 350);
  const customersQuery = useCustomerSearch(search.trim());
  // Names of everything picked so far, so a chosen customer keeps its label when a new search drops it.
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!customersQuery.data) return;
    setNames((prev) => ({
      ...prev,
      ...Object.fromEntries(customersQuery.data.map((c) => [c.id, c.name])),
    }));
  }, [customersQuery.data]);
  const customerOptions = useMemo(() => {
    const ids = new Set([
      ...form.values.customers,
      ...(customersQuery.data ?? []).map((c) => c.id),
    ]);
    return [...ids].map((id) => ({ value: id, label: names[id] ?? id }));
  }, [form.values.customers, customersQuery.data, names]);

  const errors = useMemo(() => validateBulk(form.values), [form.values]);
  const ready = Object.keys(errors).length === 0;
  const shown = (field: string) =>
    form.isTouched(field) && errors[field]
      ? t(errors[field], { max: String(BULK_MAX_CUSTOMERS) })
      : null;

  const pickProduct = (id: string | null) => {
    form.setFieldValue('product', id ?? '');
    const product = (productsQuery.data ?? []).find((p) => p.value === id);
    if (product) form.setFieldValue('unitPrice', product.price || 0);
  };

  const submit = async () => {
    if (mutation.isPending || !ready) return;
    try {
      setOutcome(await mutation.mutateAsync(form.values));
    } catch {
      // The mutation hook already told the user; the form keeps its values.
    }
  };

  return (
    <ModalFrame
      opened
      onClose={onClose}
      size="min(760px, 94vw)"
      title={t('dialog.title')}
      description={outcome ? undefined : t('dialog.description')}
      scrollBody
      footer={
        outcome ? (
          <>
            <Button variant="default" onClick={() => setOutcome(null)}>
              {t('result.again')}
            </Button>
            <Button onClick={onClose}>{t('result.close')}</Button>
          </>
        ) : (
          <>
            <Button variant="default" onClick={onClose} disabled={mutation.isPending}>
              {t('form.cancel')}
            </Button>
            <Tooltip label={t('form.submitHint')} disabled={ready} withArrow>
              <span>
                <Button
                  type="submit"
                  form={FORM_ID}
                  leftSection={<IconRepeat size={18} />}
                  loading={mutation.isPending}
                  disabled={!ready}
                >
                  {t('form.submit')}
                </Button>
              </span>
            </Tooltip>
          </>
        )
      }
    >
      {outcome ? (
        <BulkResultPanel
          outcome={outcome}
          onOpenInvoice={(id) => {
            onClose();
            navigate(routes.sales.detail.replace(':id', id));
          }}
        />
      ) : (
        <form
          id={FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={t('form.product')}
                placeholder={t('form.productPlaceholder')}
                searchable
                withAsterisk
                data={(productsQuery.data ?? []).map((p) => ({
                  value: p.value,
                  label: p.name,
                }))}
                value={form.values.product || null}
                onChange={pickProduct}
                onBlur={() => form.setTouched((prev) => ({ ...prev, product: true }))}
                error={shown('product')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                type="month"
                label={t('form.period')}
                description={t('form.periodHint')}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                leftSection={<IconCalendar size={16} />}
                withAsterisk
                {...form.getInputProps('period')}
                error={shown('period')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                type="date"
                label={t('form.transactionDate')}
                leftSection={<IconCalendar size={16} />}
                withAsterisk
                {...form.getInputProps('transactionDate')}
                error={shown('transactionDate')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                type="date"
                label={t('form.dueDate')}
                leftSection={<IconCalendar size={16} />}
                withAsterisk
                {...form.getInputProps('dueDate')}
                error={shown('dueDate')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <NumberInput
                label={t('form.unitPrice')}
                description={t('form.priceHint')}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                prefix="Rp "
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                min={0}
                hideControls
                withAsterisk
                value={form.values.unitPrice}
                onChange={(value) => form.setFieldValue('unitPrice', Number(value) || 0)}
                error={shown('unitPrice')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <MultiSelect
                label={t('form.customers')}
                description={t('form.customersHint', { max: String(BULK_MAX_CUSTOMERS) })}
                inputWrapperOrder={['label', 'input', 'description', 'error']}
                placeholder={form.values.customers.length ? '' : t('form.customersPlaceholder')}
                withAsterisk
                searchable
                clearable
                hidePickedOptions={false}
                data={customerOptions}
                value={form.values.customers}
                onChange={(value) => form.setFieldValue('customers', value)}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                filter={({ options }) => options}
                nothingFoundMessage={t('form.nothingFound')}
                maxDropdownHeight={280}
                error={shown('customers')}
              />
              {form.values.customers.length > 0 && (
                <Text size="xs" c="dimmed" mt={6}>
                  {t('form.selected', { count: String(form.values.customers.length) })}
                </Text>
              )}
            </Grid.Col>
          </Grid>
        </form>
      )}
    </ModalFrame>
  );
}
