import { Grid, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { RETURN_REASONS } from '@/module/sales/domain/saleReturn';
import type { ReturnFormValues } from '@/module/sales/domain/saleReturnForm';

interface ReturnStepInfoProps {
  form: UseFormReturnType<ReturnFormValues>;
  sale: Sale;
  /** Translated message for the date, shown once the user has been past it. */
  dateError: string | null;
}

const Fact = ({ label, value }: { label: string; value: string }) => (
  <Stack gap={2}>
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text fw={600}>{value || '–'}</Text>
  </Stack>
);

/** Step 1: which invoice, the date, the reason and a note. */
export function ReturnStepInfo({ form, sale, dateError }: Readonly<ReturnStepInfoProps>) {
  const { t } = useTranslation('salesReturns');
  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Fact label={t('form.invoiceNumber')} value={sale.transactionNumber} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Fact label={t('form.invoiceCustomer')} value={sale.customer?.displayName ?? ''} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          label={t('form.number')}
          value=""
          placeholder={t('form.numberAuto')}
          disabled
          readOnly
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput
          type="date"
          label={t('form.date')}
          leftSection={<IconCalendar size={16} />}
          withAsterisk
          {...form.getInputProps('transactionDate')}
          error={dateError}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Select
          label={t('form.reason')}
          withAsterisk
          allowDeselect={false}
          data={RETURN_REASONS.map((value) => ({ value, label: t(`reasons.${value}`) }))}
          {...form.getInputProps('reason')}
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Textarea
          label={t('form.memo')}
          placeholder={t('form.memoPlaceholder')}
          autosize
          minRows={2}
          {...form.getInputProps('memo')}
        />
      </Grid.Col>
    </Grid>
  );
}
