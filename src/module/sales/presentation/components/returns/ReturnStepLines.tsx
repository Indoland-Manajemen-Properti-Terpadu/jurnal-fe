import { Alert, Button, Group, NumberInput, Stack, Table, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  estimateReturnLine,
  returnAll,
  type ReturnFormValues,
} from '@/module/sales/domain/saleReturnForm';

interface ReturnStepLinesProps {
  form: UseFormReturnType<ReturnFormValues>;
  errors: Record<string, string>;
  /** Show the "pick at least one line" message. */
  showErrors: boolean;
}

const num = { fontVariantNumeric: 'tabular-nums' } as const;

/** Step 2: how much of each invoice line is taken back. */
export function ReturnStepLines({ form, errors, showErrors }: Readonly<ReturnStepLinesProps>) {
  const { t } = useTranslation('salesReturns');
  const { lines } = form.values;
  const hasRoom = lines.some((line) => line.remaining > 0);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={700}>{t('form.linesTitle')}</Text>
        <Button
          size="xs"
          variant="light"
          disabled={!hasRoom}
          onClick={() => form.setFieldValue('lines', returnAll(lines))}
        >
          {t('form.returnAll')}
        </Button>
      </Group>
      {!hasRoom && <Alert color="gray">{t('form.nothingLeft')}</Alert>}
      <Table.ScrollContainer minWidth={720}>
        <Table verticalSpacing="xs" horizontalSpacing="sm">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>{t('form.colItem')}</Table.Th>
              <Table.Th ta="right">{t('form.colInvoiceQty')}</Table.Th>
              <Table.Th ta="right">{t('form.colReturned')}</Table.Th>
              <Table.Th w={130}>{t('form.colReturnQty')}</Table.Th>
              <Table.Th ta="right">{t('form.colNetPrice')}</Table.Th>
              <Table.Th>{t('form.colTax')}</Table.Th>
              <Table.Th ta="right">{t('form.colTotal')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line, index) => {
              const estimate = estimateReturnLine(line);
              const lineError = errors[`lines.${index}`];
              return (
                <Table.Tr key={line.saleItem}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {line.name || '–'}
                    </Text>
                    {line.description && line.description !== line.name && (
                      <Text size="xs" c="dimmed">
                        {line.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">{line.quantity}</Table.Td>
                  <Table.Td ta="right">{line.returned}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      aria-label={`${t('form.colReturnQty')} ${line.name}`}
                      min={0}
                      max={line.remaining}
                      decimalScale={4}
                      hideControls
                      disabled={line.remaining <= 0}
                      value={line.returnQty}
                      onChange={(value) =>
                        form.setFieldValue(`lines.${index}.returnQty`, Number(value) || 0)
                      }
                      error={showErrors && lineError ? t(lineError) : undefined}
                    />
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    {formatIDR(estimate.netUnit)}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={line.lineTax > 0 ? undefined : 'dimmed'}>
                      {line.lineTax > 0 ? line.taxName || formatIDR(estimate.tax) : t('form.noTax')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" fw={600} style={num}>
                    {formatIDR(estimate.total)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {showErrors && errors.lines && (
        <Text size="sm" c="red.7">
          {t(errors.lines)}
        </Text>
      )}
    </Stack>
  );
}
