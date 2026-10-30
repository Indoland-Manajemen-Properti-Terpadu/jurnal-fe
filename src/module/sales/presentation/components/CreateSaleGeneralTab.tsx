import { Grid, Select, Stack, Switch, TextInput, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CreateSaleFormValues } from '../../domain/sale';

type Option = { value: string; label: string };

type CreateSaleGeneralTabProps = {
  form: UseFormReturnType<CreateSaleFormValues>;
  customerOptions: Option[];
  paymentTermOptions: Option[];
  onCustomerChange: (customerId: string | null) => void;
};

export function CreateSaleGeneralTab({
  form,
  customerOptions,
  paymentTermOptions,
  onCustomerChange,
}: Readonly<CreateSaleGeneralTabProps>) {
  const { t } = useTranslation('sales');

  return (
    <Stack gap="sm">
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label={t('create.customer')}
            placeholder={t('create.customerPlaceholder')}
            data={customerOptions}
            searchable
            clearable
            required
            value={form.values.customer}
            onChange={onCustomerChange}
            error={form.errors.customer}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('create.invoiceNumber')}
            placeholder={t('create.invoiceNumberPlaceholder')}
            {...form.getInputProps('transactionNumber')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            type="date"
            label={t('create.transactionDate')}
            leftSection={<IconCalendar size={16} />}
            required
            {...form.getInputProps('transactionDate')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            type="date"
            label={t('create.dueDate')}
            leftSection={<IconCalendar size={16} />}
            required
            {...form.getInputProps('dueDate')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label={t('create.paymentTerm')}
            placeholder={t('create.paymentTermPlaceholder')}
            data={paymentTermOptions}
            searchable
            clearable
            {...form.getInputProps('paymentTerm')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('create.customerRef')}
            placeholder={t('create.customerRefPlaceholder')}
            {...form.getInputProps('customerRefNumber')}
          />
        </Grid.Col>
      </Grid>

      <Textarea
        label={t('create.billingAddress')}
        placeholder={t('create.billingAddressPlaceholder')}
        minRows={2}
        {...form.getInputProps('billingAddress')}
      />

      <Switch
        label={t('create.taxInclusive')}
        mt="xs"
        {...form.getInputProps('isPriceIncludeTax', { type: 'checkbox' })}
      />
    </Stack>
  );
}
