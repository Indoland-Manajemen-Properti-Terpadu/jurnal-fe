import { Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { OpnameHistoryEntry } from '@/module/inventory/domain/stockOpname';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import { dateFormatV1 } from '@/utils/formatDate';

/** Who did what to the count and when, newest first; a reason given on the way is kept with it. */
export function OpnameHistoryTab({ history }: Readonly<{ history: OpnameHistoryEntry[] }>) {
  const { t } = useTranslation('stockTake');
  const rows = [...history].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <DataTableFrame minWidth={640} hover={false}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {columnHeader(t('history.time'))}
          {columnHeader(t('history.event'))}
          {columnHeader(t('history.user'))}
          {columnHeader(t('history.note'))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text size="sm" c="dimmed" ta="center" py="lg">
                {t('history.empty')}
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          rows.map((entry, index) => (
            <Table.Tr key={`${entry.at}-${index}`}>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm">{dateFormatV1(entry.at, 'D MMM YYYY')}</Text>
                <Text size="xs" c="dimmed">
                  {dateFormatV1(entry.at, 'HH:mm')}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {entry.action}
                </Text>
              </Table.Td>
              <Table.Td>
                {entry.userName ? <Text size="sm">{entry.userName}</Text> : <Dash />}
              </Table.Td>
              <Table.Td>{entry.note ? <Text size="sm">{entry.note}</Text> : <Dash />}</Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </DataTableFrame>
  );
}
