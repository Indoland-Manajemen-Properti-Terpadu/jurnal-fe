import { Box, Table } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PendingChangeItem } from '../../domain/pendingChange';
import PendingChangeRow from './PendingChangeRow';

type PendingChangeTableProps = {
  items: PendingChangeItem[];
  approvingId: string | null;
  onApprove: (change: PendingChangeItem) => void;
};

export default function PendingChangeTable({
  items,
  approvingId,
  onApprove,
}: PendingChangeTableProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead bg="gray.0">
          <Table.Tr>
            <Table.Th style={{ width: '26%' }}>{t('colType')}</Table.Th>
            <Table.Th style={{ width: '32%' }}>{t('colDoc')}</Table.Th>
            <Table.Th style={{ width: '18%' }}>{t('colPayload')}</Table.Th>
            <Table.Th style={{ width: '12%' }}>{t('colTime')}</Table.Th>
            <Table.Th style={{ width: '12%', textAlign: 'center' }}>{t('colAction')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((change) => (
            <PendingChangeRow
              key={change.id}
              change={change}
              isApproving={approvingId === change.id}
              onApprove={onApprove}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
