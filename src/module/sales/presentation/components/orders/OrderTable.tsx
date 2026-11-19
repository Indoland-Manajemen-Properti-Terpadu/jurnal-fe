import { Anchor, Group, Pagination, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconClipboardOff, IconClipboardPlus } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { OrderRights, OrderTab, SaleOrder } from '@/module/sales/domain/saleOrder';
import type { OrderHandlers } from '../../hooks/useOrderActions';
import { OrderRowActions } from './OrderRowActions';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderTableProps {
  orders: SaleOrder[];
  tab: OrderTab;
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  handlers: OrderHandlers;
  rights: OrderRights;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRetry: () => void;
  onCreateNew: () => void;
}

const PAGE_SIZES = ['10', '25', '50'];
const COLUMNS: { key: string; align?: 'right' | 'center'; width?: number }[] = [
  { key: 'colNumber' },
  { key: 'colCustomer' },
  { key: 'colDate' },
  { key: 'colTarget' },
  { key: 'colTotal', align: 'right' },
  { key: 'colStatus', align: 'center', width: 170 },
  { key: 'colAction', align: 'center', width: 90 },
];

export function OrderTable({
  orders,
  tab,
  isLoading,
  isError,
  isFiltered,
  page,
  totalPages,
  total,
  limit,
  handlers,
  rights,
  onPageChange,
  onLimitChange,
  onRetry,
  onCreateNew,
}: Readonly<OrderTableProps>) {
  const { t } = useTranslation('salesOrders');
  const emptyKey = isFiltered ? 'filteredEmpty' : `${tab}Empty`;

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {COLUMNS.map((column) => (
                <Table.Th key={column.key} ta={column.align} w={column.width}>
                  <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                    {t(`table.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading &&
              Array.from({ length: Math.min(limit, 5) }, (_, row) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={row}>
                  {COLUMNS.map((column) => (
                    <Table.Td key={column.key}>
                      <Skeleton height={16} radius="sm" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}

            {!isLoading && isError && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
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

            {!isLoading && !isError && orders.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconClipboardOff size={32} stroke={1.6} />}
                    title={t(`table.${emptyKey}Title`)}
                    description={t(`table.${emptyKey}Description`)}
                    actionLabel={
                      isFiltered || tab !== 'running' ? undefined : t('table.emptyAction')
                    }
                    onAction={isFiltered || tab !== 'running' ? undefined : onCreateNew}
                    actionIcon={<IconClipboardPlus size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              orders.map((order) => (
                <Table.Tr key={order.id}>
                  <Table.Td>
                    <Anchor
                      component="button"
                      type="button"
                      fw={600}
                      size="sm"
                      onClick={() => handlers.onView(order)}
                    >
                      {order.transactionNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{order.customer?.displayName || '–'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(order.transactionDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {order.targetDate ? formatDate(order.targetDate) : t('table.noTarget')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(order.total)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Group justify="center">
                      <OrderStatusBadge status={order.status} />
                    </Group>
                  </Table.Td>
                  <Table.Td ta="center">
                    <OrderRowActions order={order} handlers={handlers} rights={rights} />
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('table.showing', { shown: orders.length, total })}
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
