import { Group, Pagination, Select, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconReceipt2, IconReceiptOff } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Sale } from '../../domain/sale';
import type { SaleTab } from '../../domain/saleStatus';
import type { SaleRowHandlers } from './list/SaleRowActions';
import { SaleTableRow } from './SaleTableRow';
import { SaleTableSkeletonRows } from './SaleTableSkeletonRows';

type SaleTableProps = {
  sales: Sale[];
  tab: SaleTab;
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  handlers: SaleRowHandlers;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onRetry: () => void;
  onCreateNew: () => void;
};

const PAGE_SIZES = ['10', '25', '50'];

type Column = { key: string; align?: 'right' | 'center'; width?: number };

const columnsFor = (tab: SaleTab): Column[] => [
  { key: 'colNumber' },
  { key: 'colCustomer' },
  { key: 'colDate' },
  { key: 'colDue' },
  { key: 'colTotal', align: 'right' },
  ...(tab === 'draft' ? [] : [{ key: 'colRemaining', align: 'right' as const }]),
  { key: 'colStatus', align: 'center', width: 130 },
  { key: 'colAction', align: 'center', width: 130 },
];

export function SaleTable({
  sales,
  tab,
  isLoading,
  isError,
  isFiltered,
  page,
  totalPages,
  total,
  limit,
  handlers,
  onPageChange,
  onLimitChange,
  onRetry,
  onCreateNew,
}: Readonly<SaleTableProps>) {
  const { t } = useTranslation('sales');
  const columns = columnsFor(tab);

  let emptyKey = `${tab}Empty`;
  if (isFiltered) emptyKey = 'filteredEmpty';

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={980}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key} ta={column.align} w={column.width}>
                  <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {t(`table.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading && <SaleTableSkeletonRows count={Math.min(limit, 5)} />}

            {!isLoading && isError && (
              <Table.Tr>
                <Table.Td colSpan={columns.length} p={0}>
                  <EmptyState
                    icon={<IconAlertCircle size={32} stroke={1.6} />}
                    title={t('table.errorTitle')}
                    description={t('table.errorDescription')}
                    actionLabel={t('table.retry')}
                    onAction={onRetry}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading && !isError && sales.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={columns.length} p={0}>
                  <EmptyState
                    icon={<IconReceiptOff size={32} stroke={1.6} />}
                    title={t(`table.${emptyKey}Title`)}
                    description={t(`table.${emptyKey}Description`)}
                    actionLabel={isFiltered ? undefined : t('table.emptyAction')}
                    onAction={isFiltered ? undefined : onCreateNew}
                    actionIcon={<IconReceipt2 size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              sales.map((sale) => (
                <SaleTableRow key={sale.id} sale={sale} tab={tab} handlers={handlers} />
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('table.showing', { shown: sales.length, total })}
        </Text>
        <Group gap="sm">
          <Select
            size="xs"
            w={110}
            data={PAGE_SIZES.map((size) => ({
              value: size,
              label: t('table.perPage', { count: size }),
            }))}
            value={String(limit)}
            onChange={(val) => onLimitChange(Number(val) || 10)}
            aria-label={t('table.rowsPerPageAria')}
            allowDeselect={false}
          />
          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Group>
    </Stack>
  );
}

export default SaleTable;
