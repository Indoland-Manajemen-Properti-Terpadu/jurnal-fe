import { Paper, Skeleton, Table } from '@mantine/core';
import { useTranslation } from '@/i18n';

export function TransactionTableSkeleton({ limit }: Readonly<{ limit: number }>) {
  const { t } = useTranslation('contactDetail');

  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Table verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead bg="gray.0">
          <Table.Tr>
            <Table.Th>{t('table.number')}</Table.Th>
            <Table.Th>{t('table.dates')}</Table.Th>
            <Table.Th>{t('table.items')}</Table.Th>
            <Table.Th ta="center">{t('table.status')}</Table.Th>
            <Table.Th ta="right">{t('table.total')}</Table.Th>
            <Table.Th ta="right">{t('table.remaining')}</Table.Th>
            <Table.Th ta="center">{t('table.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
            // eslint-disable-next-line react/no-array-index-key
            <Table.Tr key={`skeleton-row-${idx}`}>
              <Table.Td>
                <Skeleton height={16} width="80%" mb={4} />
                <Skeleton height={12} width="40%" />
              </Table.Td>
              <Table.Td>
                <Skeleton height={14} width="70%" mb={4} />
                <Skeleton height={12} width="50%" />
              </Table.Td>
              <Table.Td>
                <Skeleton height={14} width="85%" />
              </Table.Td>
              <Table.Td ta="center">
                <Skeleton height={20} width={70} radius="sm" mx="auto" />
              </Table.Td>
              <Table.Td ta="right">
                <Skeleton height={16} width={80} ml="auto" />
              </Table.Td>
              <Table.Td ta="right">
                <Skeleton height={16} width={80} ml="auto" />
              </Table.Td>
              <Table.Td ta="center">
                <Skeleton height={24} width={24} radius="sm" mx="auto" />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
