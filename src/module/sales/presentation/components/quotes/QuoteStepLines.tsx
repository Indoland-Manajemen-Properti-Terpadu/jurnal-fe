import { Alert, Button, Paper, Stack, Switch } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { QuoteFormApi } from '../../hooks/useQuoteForm';
import { SaleLinesTable } from '../form/SaleLinesTable';
import { StepHeading } from '../form/StepHeading';

export function QuoteStepLines({ api }: Readonly<{ api: QuoteFormApi }>) {
  const { t } = useTranslation('salesQuotes');
  const { t: ts } = useTranslation('sales');
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
          label={ts('form.lines.taxInclusive')}
          description={ts('form.lines.taxInclusiveHint')}
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
          onChange={api.changeLine}
          onRemove={api.removeLine}
        />
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={api.addLine}
          style={{ alignSelf: 'flex-start' }}
        >
          {ts('form.lines.addRow')}
        </Button>
      </Stack>
    </Paper>
  );
}
