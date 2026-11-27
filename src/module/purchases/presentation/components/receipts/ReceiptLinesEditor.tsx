import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Button, Group, NumberInput, Table, Text } from '@mantine/core';
import { IconChecks } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { clampReceived, type ReceiptLine } from '@/module/purchases/domain/receiptForm';
import { formatQuantity } from '@/module/purchases/presentation/components/shared/format';

interface ReceiptLinesEditorProps {
  lines: ReceiptLine[];
  quantities: Record<string, number>;
  /** Goods turned away at delivery; services have none. */
  rejected: Record<string, number>;
  service: boolean;
  onReject: (itemId: string, quantity: number) => void;
  overIds: string[];
  showErrors: boolean;
  onChange: (itemId: string, quantity: number) => void;
  onReceiveAll: () => void;
}

/** One row per order line: what was ordered, what already arrived and what arrives now. */
export const ReceiptLinesEditor = ({
  lines,
  quantities,
  rejected,
  service,
  onReject,
  overIds,
  showErrors,
  onChange,
  onReceiveAll,
}: Readonly<ReceiptLinesEditorProps>) => {
  const { t } = useTranslation('purchases');
  const anyOpen = lines.some((line) => line.remaining > 0);

  return (
    <>
      <Group justify="flex-end" mb="xs">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconChecks size={14} />}
          disabled={!anyOpen}
          onClick={onReceiveAll}
        >
          {t('receipts.form.receiveAll')}
        </Button>
      </Group>
      <Table.ScrollContainer type="native" minWidth={680}>
        <Table className={tableClasses.table} verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {[
                'item',
                'ordered',
                'received',
                'remaining',
                'now',
                ...(service ? [] : ['rejected']),
              ].map((key) => (
                <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`receipts.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line) => (
              <Table.Tr key={line.itemId} style={{ verticalAlign: 'top' }}>
                <Table.Td miw={180}>
                  <Text size="sm" pt={7}>
                    {line.name}
                  </Text>
                  {line.schedule.kind === 'TERM' && (
                    <Text size="xs" c="dimmed">
                      {t('orders.schedule.TERM', {
                        seq: line.schedule.seq,
                        of: line.schedule.of,
                      })}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} style={{ whiteSpace: 'nowrap' }}>
                    {formatQuantity(line.ordered)} {line.unitName}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} c="dimmed">
                    {formatQuantity(line.received)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} fw={500}>
                    {formatQuantity(line.remaining)}
                  </Text>
                </Table.Td>
                <Table.Td w={150}>
                  <NumberInput
                    radius="md"
                    aria-label={t('receipts.form.quantityAria', { item: line.name })}
                    value={quantities[line.itemId] ?? 0}
                    min={0}
                    max={line.remaining}
                    hideControls
                    allowNegative={false}
                    decimalScale={4}
                    disabled={line.remaining <= 0}
                    error={
                      showErrors && overIds.includes(line.itemId)
                        ? t('receipts.form.overQuantity', { max: formatQuantity(line.remaining) })
                        : undefined
                    }
                    onChange={(value) =>
                      onChange(line.itemId, clampReceived(value, line.remaining))
                    }
                  />
                </Table.Td>
                {!service && (
                  <Table.Td w={130}>
                    <NumberInput
                      radius="md"
                      aria-label={t('receipts.form.rejectedAria', { item: line.name })}
                      value={rejected[line.itemId] ?? 0}
                      min={0}
                      hideControls
                      allowNegative={false}
                      decimalScale={4}
                      disabled={(quantities[line.itemId] ?? 0) <= 0}
                      onChange={(value) => onReject(line.itemId, value === '' ? 0 : Number(value))}
                    />
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
