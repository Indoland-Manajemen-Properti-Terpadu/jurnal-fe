import { Grid, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { OrderFormApi } from '../../hooks/useOrderForm';
import { CustomerPicker } from '../shared/CustomerPicker';

export function OrderStepGeneral({ api }: Readonly<{ api: OrderFormApi }>) {
  const { t } = useTranslation('salesOrders');
  const { form } = api;

  return (
    <Stack gap="md">
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <CustomerPicker
            label={t('form.general.customer')}
            placeholder={t('form.general.customerPlaceholder')}
            withAsterisk
            value={form.values.customer || null}
            onChange={(id) => form.setFieldValue('customer', id || '')}
            error={form.errors.customer}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('form.general.number')}
            placeholder={t('form.general.numberPlaceholder')}
            {...form.getInputProps('transactionNumber')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            type="date"
            label={t('form.general.transactionDate')}
            leftSection={<IconCalendar size={16} />}
            withAsterisk
            value={form.values.transactionDate}
            onChange={(event) => api.changeTransactionDate(event.currentTarget.value)}
            error={form.errors.transactionDate}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            type="date"
            label={t('form.general.targetDate')}
            description={t('form.general.targetDateHint')}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            leftSection={<IconCalendar size={16} />}
            withAsterisk
            {...form.getInputProps('targetDate')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label={t('form.general.paymentTerm')}
            placeholder={t('form.general.paymentTermPlaceholder')}
            data={api.termOptions}
            searchable
            clearable
            value={form.values.paymentTerm || null}
            onChange={(value) => form.setFieldValue('paymentTerm', value || '')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label={t('form.general.customerRef')}
            placeholder={t('form.general.customerRefPlaceholder')}
            {...form.getInputProps('customerRefNumber')}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label={t('form.general.unitTower')}
            placeholder={t('form.general.unitTowerPlaceholder')}
            {...form.getInputProps('unitTower')}
          />
        </Grid.Col>
      </Grid>
      <Textarea
        label={t('form.general.deliveryAddress')}
        placeholder={t('form.general.deliveryAddressPlaceholder')}
        minRows={2}
        autosize
        {...form.getInputProps('deliveryAddress')}
      />
    </Stack>
  );
}
