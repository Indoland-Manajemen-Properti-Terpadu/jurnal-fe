import {
  Grid,
  MultiSelect,
  Paper,
  Select,
  Stack,
  TagsInput,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleFormApi } from '../../hooks/useSaleForm';
import { StepHeading } from './StepHeading';

export function StepGeneral({ api }: Readonly<{ api: SaleFormApi }>) {
  const { t } = useTranslation('sales');
  const { form } = api;

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <StepHeading
          title={t('form.steps.general')}
          description={t('form.steps.generalDesc')}
          step={1}
        />
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.general.customer')}
              placeholder={t('form.general.customerPlaceholder')}
              data={api.customerOptions}
              searchable
              clearable
              withAsterisk
              value={form.values.customer}
              onChange={api.changeCustomer}
              error={form.errors.customer}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('form.general.invoiceNumber')}
              placeholder={t('form.general.invoiceNumberPlaceholder')}
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
            <Select
              label={t('form.general.paymentTerm')}
              placeholder={t('form.general.paymentTermPlaceholder')}
              description={t('form.general.paymentTermHint')}
              inputWrapperOrder={['label', 'input', 'description', 'error']}
              data={api.termOptions}
              searchable
              clearable
              value={form.values.paymentTerm}
              onChange={api.changeTerm}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              type="date"
              label={t('form.general.dueDate')}
              leftSection={<IconCalendar size={16} />}
              withAsterisk
              {...form.getInputProps('dueDate')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label={t('form.general.customerRef')}
              placeholder={t('form.general.customerRefPlaceholder')}
              {...form.getInputProps('customerRefNumber')}
            />
          </Grid.Col>
        </Grid>

        <Textarea
          label={t('form.general.billingAddress')}
          placeholder={t('form.general.billingAddressPlaceholder')}
          minRows={2}
          autosize
          {...form.getInputProps('billingAddress')}
        />
        <TagsInput
          label={t('form.general.emails')}
          placeholder={t('form.general.emailsPlaceholder')}
          description={t('form.general.emailsHint')}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          {...form.getInputProps('emails')}
        />
        <MultiSelect
          label={t('form.general.tags')}
          placeholder={t('form.general.tagsPlaceholder')}
          data={api.tagOptions}
          searchable
          clearable
          {...form.getInputProps('tags')}
        />
      </Stack>
    </Paper>
  );
}
