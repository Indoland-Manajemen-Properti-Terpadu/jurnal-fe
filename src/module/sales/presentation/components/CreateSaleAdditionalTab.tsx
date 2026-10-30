import { Grid, NumberInput, Select, Stack, Textarea } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { CreateSaleFormValues } from '../../domain/sale';

type CreateSaleAdditionalTabProps = {
  form: UseFormReturnType<CreateSaleFormValues>;
  accountOptions: { value: string; label: string }[];
};

export function CreateSaleAdditionalTab({
  form,
  accountOptions,
}: Readonly<CreateSaleAdditionalTabProps>) {
  const { t } = useTranslation('sales');
  const percentage = { value: 'percentage', label: t('create.discountPercentage') };
  const nominal = { value: 'nominal', label: t('create.discountNominal') };

  return (
    <Stack gap="sm">
      <Grid gutter="sm">
        <Grid.Col span={4}>
          <Select
            label={t('create.discountType')}
            data={[percentage, nominal]}
            {...form.getInputProps('discountType')}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <NumberInput
            label={t('create.discountValue')}
            min={0}
            thousandSeparator="."
            decimalSeparator=","
            {...form.getInputProps('discountValue')}
          />
        </Grid.Col>
      </Grid>

      <Grid gutter="sm">
        <Grid.Col span={4}>
          <Select
            label={t('create.withholdingType')}
            data={[nominal, percentage]}
            {...form.getInputProps('withholdingType')}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <NumberInput
            label={t('create.withholdingValue')}
            min={0}
            thousandSeparator="."
            decimalSeparator=","
            {...form.getInputProps('withholdingValue')}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label={t('create.withholdingAccount')}
            placeholder={t('create.withholdingAccountPlaceholder')}
            data={accountOptions}
            searchable
            clearable
            {...form.getInputProps('withholdingAccount')}
          />
        </Grid.Col>
      </Grid>

      <Textarea
        label={t('create.message')}
        placeholder={t('create.messagePlaceholder')}
        minRows={2}
        {...form.getInputProps('message')}
      />

      <Textarea
        label={t('create.memo')}
        placeholder={t('create.memoPlaceholder')}
        minRows={2}
        {...form.getInputProps('memo')}
      />
    </Stack>
  );
}
