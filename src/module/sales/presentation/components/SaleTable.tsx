import { Group, Pagination, Select, Stack, Table, Text } from '@mantine/core';
import { IconReceipt2, IconReceiptOff } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Sale } from '../../domain/sale';
import { SaleTableRow } from './SaleTableRow';
import { SaleTableSkeletonRows } from './SaleTableSkeletonRows';

type SaleTableProps = {
  sales: Sale[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onViewDetail: (sale: Sale) => void;
  onPaySale: (sale: Sale) => void;
  onGenerateLink?: (sale: Sale) => void;
  onDownloadPdf?: (sale: Sale) => void;
  onCreateNew?: () => void;
};

const COLUMNS = [
  { key: 'colNumber' },
  { key: 'colCustomer' },
  { key: 'colDate' },
  { key: 'colDue' },
  { key: 'colTotal', align: 'right' },
  { key: 'colRemaining', align: 'right' },
  { key: 'colStatus', align: 'center' },
  { key: 'colAction', align: 'center', width: 70 },
] as const;

const PAGE_SIZES = ['10', '25', '50'];

export function SaleTable({
  sales,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onPaySale,
  onGenerateLink,
  onDownloadPdf,
  onCreateNew,
}: Readonly<SaleTableProps>) {
  const { t } = useTranslation('sales');

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={950}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {COLUMNS.map((column) => (
                <Table.Th
                  key={column.key}
                  ta={'align' in column ? column.align : undefined}
                  w={'width' in column ? column.width : undefined}
                >
                  <Text size="xs" fw={700} c="dimmed">
                    {t(`table.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading && <SaleTableSkeletonRows count={Math.min(limit, 5)} />}

            {!isLoading && sales.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={8} p={0}>
                  <EmptyState
                    icon={<IconReceiptOff size={32} stroke={1.6} />}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                    actionLabel={onCreateNew ? t('table.emptyAction') : undefined}
                    onAction={onCreateNew}
                    actionIcon={<IconReceipt2 size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              sales.map((sale) => (
                <SaleTableRow
                  key={sale.id}
                  sale={sale}
                  onViewDetail={onViewDetail}
                  onPaySale={onPaySale}
                  onGenerateLink={onGenerateLink}
                  onDownloadPdf={onDownloadPdf}
                />
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
