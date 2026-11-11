import { Group, Pagination, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconCashBanknoteOff } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { SalePaymentRow } from '@/module/sales/domain/salePaymentList';

type SalePaymentTableProps = {
  rows: SalePaymentRow[];
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onOpenInvoice: (saleId: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRetry: () => void;
};

const PAGE_SIZES = ['10', '25', '50'];

const COLUMNS: Array<{ key: string; align?: 'right' }> = [
  { key: 'colDate' },
  { key: 'colNumber' },
  { key: 'colInvoice' },
  { key: 'colCustomer' },
  { key: 'colMethod' },
  { key: 'colAmount', align: 'right' },
  { key: 'colOverpayment', align: 'right' },
];

export function SalePaymentTable({
  rows,
  isLoading,
  isError,
  isFiltered,
  page,
  totalPages,
  total,
  limit,
  onOpenInvoice,
  onPageChange,
  onLimitChange,
  onRetry,
}: Readonly<SalePaymentTableProps>) {
  const { t } = useTranslation('sales');
  const emptyKey = isFiltered ? 'filteredEmpty' : 'empty';

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {COLUMNS.map((column) => (
                <Table.Th key={column.key} ta={column.align}>
                  <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {t(`payments.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading &&
              Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={`payment-skeleton-${index}`}>
                  {COLUMNS.map((column) => (
                    <Table.Td key={column.key}>
                      <Skeleton
                        height={14}
                        width={column.align ? 90 : 110}
                        ml={column.align && 'auto'}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}

            {!isLoading && isError && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconAlertCircle size={32} stroke={1.6} />}
                    title={t('payments.errorTitle')}
                    description={t('table.errorDescription')}
                    actionLabel={t('table.retry')}
                    onAction={onRetry}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconCashBanknoteOff size={32} stroke={1.6} />}
                    title={t(`payments.${emptyKey}Title`)}
                    description={t(`payments.${emptyKey}Description`)}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <Table.Tr
                  key={row.id}
                  style={{ cursor: row.sale ? 'pointer' : undefined }}
                  onClick={() => row.sale && onOpenInvoice(row.sale.id)}
                >
                  <Table.Td>
                    <Text size="sm">{formatDate(row.paymentDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={700}>
                      {row.transactionNumber}
                    </Text>
                    {row.memo && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {row.memo}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="primary.9">
                      {row.sale?.transactionNumber ?? '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.sale?.customerName ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.paymentMethodName ?? '—'}</Text>
                    {row.depositAccountName && (
                      <Text size="xs" c="dimmed">
                        {row.depositAccountName}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700}>
                      {formatIDR(row.amount)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c={row.overpaymentAmount > 0 ? undefined : 'dimmed'}>
                      {row.overpaymentAmount > 0 ? formatIDR(row.overpaymentAmount) : '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('payments.showing', { shown: rows.length, total })}
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
            onChange={(value) => onLimitChange(Number(value) || 10)}
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

export default SalePaymentTable;
