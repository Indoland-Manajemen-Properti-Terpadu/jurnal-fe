import { Group, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { TermSchedule } from '@/module/purchases/domain/procurement';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface TermScheduleTableProps {
  schedule: TermSchedule | null;
}

/** Whether the schedule says more than "pay it all at once", which the term name already tells. */
export const hasSplitSchedule = (schedule: TermSchedule | null): schedule is TermSchedule =>
  schedule !== null && schedule.rows.some((row) => row.kind !== 'FULL');

/**
 * The payments the service planned for a quote, with its own sentence per row and a total that is
 * always 100% and the quote's total. The figures are the service's: the screen never works them out.
 */
export const TermScheduleTable = ({ schedule }: Readonly<TermScheduleTableProps>) => {
  const { t } = useTranslation('purchases');
  if (!hasSplitSchedule(schedule)) return null;
  const hasAdvance = schedule.advanceAmount > 0;
  const hasWithheld = schedule.rows.some((row) => row.withheld);

  return (
    <Stack gap={6}>
      <Text size="xs" c="dimmed">
        {t('procurement.detail.schedule.title')}
      </Text>
      <Table.ScrollContainer type="native" minWidth={420}>
        <Table verticalSpacing="xs" withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('procurement.detail.schedule.col.payment')}
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('procurement.detail.schedule.col.percent')}
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('procurement.detail.schedule.col.amount')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {schedule.rows.map((row) => (
              <Table.Tr key={`${row.kind}-${row.seq}`}>
                <Table.Td>
                  <Text
                    size="sm"
                    c={row.withheld ? 'dimmed' : undefined}
                    fs={row.withheld ? 'italic' : undefined}
                  >
                    {row.label}
                  </Text>
                  {row.retentionAmount > 0 && (
                    <Text size="xs" c="dimmed">
                      {t('procurement.detail.schedule.heldOnTerm', {
                        amount: formatAmount(row.retentionAmount),
                      })}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <Text size="sm" c={row.withheld ? 'dimmed' : undefined}>
                    {row.percent}%
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <Text size="sm" c={row.withheld ? 'dimmed' : undefined}>
                    {formatAmount(row.amount)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
            {hasAdvance &&
              [
                ['advanceTotal', schedule.advancePercent, schedule.advanceAmount],
                ['afterAdvance', schedule.afterAdvancePercent, schedule.afterAdvanceAmount],
              ].map(([key, percent, amount]) => (
                <Table.Tr key={key} bg="var(--jurnal-color-surface-muted)">
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {t(`procurement.detail.schedule.${key}`)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <Text size="sm" fw={600}>
                      {percent}%
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <Text size="sm" fw={600}>
                      {formatAmount(Number(amount))}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            <Table.Tr>
              <Table.Td>
                <Text size="sm" fw={700}>
                  {t('procurement.detail.schedule.total')}
                </Text>
              </Table.Td>
              <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <Group justify="flex-end">
                  <Text size="sm" fw={700}>
                    {schedule.percent}%
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                <Text size="sm" fw={700}>
                  {formatAmount(schedule.amount)}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {hasWithheld && (
        <Text size="xs" c="dimmed">
          {t('procurement.detail.schedule.withheldNote')}
        </Text>
      )}
    </Stack>
  );
};
