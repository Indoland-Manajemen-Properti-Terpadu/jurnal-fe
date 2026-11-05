import { Button, Group, NumberInput, Table, Text } from '@mantine/core';
import { IconChecks } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { clampReturnQty, type ReturnLine } from '@/module/purchases/domain/returnForm';
import { formatQuantity } from '@/module/purchases/presentation/components/shared/format';

interface ReturnLinesEditorProps {
  lines: ReturnLine[];
  quantities: Record<string, number>;
  overIds: string[];
  showErrors: boolean;
  onChange: (itemId: string, quantity: number) => void;
  onReturnAll: () => void;
}

/** One row per billed line: what was billed, what already went back and what goes back now. */
export const ReturnLinesEditor = ({
  lines,
  quantities,
  overIds,
  showErrors,
  onChange,
  onReturnAll,
}: Readonly<ReturnLinesEditorProps>) => {
  const { t } = useTranslation('purchases');
  const anyOpen = lines.some((line) => line.returnable > 0);

  return (
    <>
      <Group justify="flex-end" mb="xs">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<IconChecks size={14} />}
          disabled={!anyOpen}
          onClick={onReturnAll}
        >
          {t('returns.form.returnAll')}
        </Button>
      </Group>
      <Table.ScrollContainer minWidth={680}>
        <Table verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {(['item', 'billed', 'returned', 'returnable', 'now'] as const).map((key) => (
                <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`returns.form.col.${key}`)}
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
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} style={{ whiteSpace: 'nowrap' }}>
                    {formatQuantity(line.billed)} {line.unitName}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} c="dimmed">
                    {formatQuantity(line.returned)}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text size="sm" pt={7} fw={500}>
                    {formatQuantity(line.returnable)}
                  </Text>
                </Table.Td>
                <Table.Td w={150}>
                  <NumberInput
                    radius="md"
                    aria-label={t('returns.form.quantityAria', { item: line.name })}
                    value={quantities[line.itemId] ?? 0}
                    min={0}
                    max={line.returnable}
                    hideControls
                    allowNegative={false}
                    decimalScale={4}
                    disabled={line.returnable <= 0}
                    error={
                      showErrors && overIds.includes(line.itemId)
                        ? t('returns.form.overQuantity', { max: formatQuantity(line.returnable) })
                        : undefined
                    }
                    onChange={(value) =>
                      onChange(line.itemId, clampReturnQty(value, line.returnable))
                    }
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
