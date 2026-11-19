import type { ReactNode } from 'react';
import { Alert, Button, Paper, Stack, Switch } from '@mantine/core';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CreateSaleItemForm } from '@/module/sales/domain/sale';
import { SaleLinesTable } from '../form/SaleLinesTable';
import { StepHeading } from '../form/StepHeading';

interface DocStepLinesProps {
  ns: 'salesQuotes' | 'salesOrders';
  items: CreateSaleItemForm[];
  errors: Record<string, ReactNode>;
  isPriceIncludeTax: boolean;
  onTaxInclusiveChange: (value: boolean) => void;
  productOptions: { value: string; label: string }[];
  taxOptions: { value: string; label: string }[];
  onProductChange: (index: number, productId: string | null) => void;
  onLineChange: (index: number, patch: Partial<CreateSaleItemForm>) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
}

/** Step two of a quote or an order: the lines. The copy comes from the document's namespace. */
export function DocStepLines({
  ns,
  items,
  errors,
  isPriceIncludeTax,
  onTaxInclusiveChange,
  productOptions,
  taxOptions,
  onProductChange,
  onLineChange,
  onAddLine,
  onRemoveLine,
}: Readonly<DocStepLinesProps>) {
  const { t } = useTranslation(ns);
  const { t: ts } = useTranslation('sales');

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
          checked={isPriceIncludeTax}
          onChange={(event) => onTaxInclusiveChange(event.currentTarget.checked)}
        />
        {errors.lines && (
          <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />}>
            {errors.lines}
          </Alert>
        )}
        <SaleLinesTable
          items={items}
          errors={errors}
          productOptions={productOptions}
          taxOptions={taxOptions}
          onProductChange={onProductChange}
          onChange={onLineChange}
          onRemove={onRemoveLine}
        />
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={onAddLine}
          style={{ alignSelf: 'flex-start' }}
        >
          {ts('form.lines.addRow')}
        </Button>
      </Stack>
    </Paper>
  );
}
