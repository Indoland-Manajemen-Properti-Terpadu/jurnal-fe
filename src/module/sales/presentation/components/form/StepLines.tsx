import { Alert, Button, Paper, Stack, Switch } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleFormApi } from '../../hooks/useSaleForm';
import { SaleLinesTable } from './SaleLinesTable';
import { StepHeading } from './StepHeading';

export function StepLines({ api }: Readonly<{ api: SaleFormApi }>) {
  const { t } = useTranslation('sales');
  const { form } = api;

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <StepHeading
          title={t('form.steps.lines')}
          description={t('form.steps.linesDesc')}
          step={2}
        />
        <Switch
          label={t('form.lines.taxInclusive')}
          description={t('form.lines.taxInclusiveHint')}
          {...form.getInputProps('isPriceIncludeTax', { type: 'checkbox' })}
        />
        {form.errors.lines && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            {form.errors.lines}
          </Alert>
        )}
        <SaleLinesTable
          items={form.values.items}
          errors={form.errors}
          productOptions={api.productOptions}
          taxOptions={api.taxOptions}
          onProductChange={api.changeProduct}
          onChange={(index, patch) =>
            Object.entries(patch).forEach(([key, value]) =>
              form.setFieldValue(`items.${index}.${key}`, value)
            )
          }
          onRemove={api.removeLine}
        />
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={api.addLine}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('form.lines.addRow')}
        </Button>
      </Stack>
    </Paper>
  );
}
