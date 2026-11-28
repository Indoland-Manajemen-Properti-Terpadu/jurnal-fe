import {
  ActionIcon,
  Anchor,
  Box,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconBell, IconDotsVertical, IconEye, IconUser } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatMoneyAt } from '@/utils/formatMoney';
import type { ReceivableCustomerRow } from '@/module/sales/domain/saleReceivables';
import { formatCount } from '@/module/sales/domain/saleFormat';

const PAGE_SIZES = ['10', '25', '50'].map((value) => ({ value, label: `${value} / hal` }));

type Paging = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
};

function TableFooter({ page, limit, totalPages, total, onPage, onLimit }: Paging) {
  const { t } = useTranslation('salesReceivables');
  return (
    <Group justify="space-between" px="md" py="sm" wrap="wrap">
      <Text size="xs" c="dimmed">
        {t('table.showingCustomers', {
          start: formatCount(total ? (page - 1) * limit + 1 : 0),
          end: formatCount(Math.min(page * limit, total)),
          total: formatCount(total),
        })}
      </Text>
      <Group gap="xs">
        <Select
          aria-label={t('table.pageSize')}
          data={PAGE_SIZES}
          value={String(limit)}
          onChange={(value) => value && onLimit(Number(value))}
          w={88}
          size="xs"
        />
        <Pagination
          total={Math.max(1, totalPages)}
          value={page}
          onChange={onPage}
          size="sm"
          withEdges
        />
      </Group>
    </Group>
  );
}

export type CustomerRowActions = {
  canSendReminder: boolean;
  onDetail: (row: ReceivableCustomerRow) => void;
  onReminder: (row: ReceivableCustomerRow) => void;
  onContact: (row: ReceivableCustomerRow) => void;
};

function CustomerActions({
  row,
  actions,
}: {
  row: ReceivableCustomerRow;
  actions: CustomerRowActions;
}) {
  const { t } = useTranslation('salesReceivables');
  return (
    <Menu position="bottom-end" shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" radius="md" aria-label={t('table.actions')}>
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEye size={16} />} onClick={() => actions.onDetail(row)}>
          {t('actions.customerDetail')}
        </Menu.Item>
        {actions.canSendReminder && row.overdueCount > 0 && (
          <Menu.Item
            leftSection={<IconBell size={16} />}
            onClick={() => actions.onReminder(row)}
          >
            {t('actions.customerReminder', { count: formatCount(row.overdueCount) })}
          </Menu.Item>
        )}
        <Menu.Item leftSection={<IconUser size={16} />} onClick={() => actions.onContact(row)}>
          {t('actions.openContact')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export function ReceivableCustomersTable({
  rows,
  paging,
  loading,
  error,
  onRetry,
  actions,
  precision,
}: Readonly<{
  rows: ReceivableCustomerRow[];
  paging: Paging;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  actions: CustomerRowActions;
  precision: number;
}>) {
  const { t } = useTranslation('salesReceivables');
  const columns = [
    'customer',
    'invoices',
    'current',
    'days1to30',
    'days31to60',
    'days61to90',
    'over90',
    'total',
    'credit',
    'action',
  ];
  return (
    <Paper withBorder radius="md" p={0} bg="white" style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={1080}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {columns.map((key) => (
                  <Table.Th
                    key={key}
                    ta={
                      key === 'customer'
                        ? 'left'
                        : key === 'invoices' || key === 'action'
                          ? 'center'
                          : 'right'
                    }
                  >
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      tt="uppercase"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {key === 'action' ? '' : t(`table.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading &&
                Array.from({ length: 4 }, (_, index) => (
                  <Table.Tr key={index}>
                    {columns.map((key) => (
                      <Table.Td key={key}>
                        <Skeleton height={16} radius="sm" />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              {!loading && error && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} p="xl">
                    <EmptyState
                      title={t('table.errorTitle')}
                      description={t('table.errorDescription')}
                      actionLabel={t('table.retry')}
                      onAction={onRetry}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} p="xl">
                    <EmptyState
                      title={t('table.emptyTitle')}
                      description={t('table.emptyDescription')}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {!loading &&
                !error &&
                rows.map((row) => (
                  <Table.Tr key={row.customer.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Anchor
                          component="button"
                          type="button"
                          ta="left"
                          fw={600}
                          size="sm"
                          onClick={() => actions.onDetail(row)}
                        >
                          {row.customer.name || '—'}
                        </Anchor>
                        {row.overdueCount > 0 && (
                          <Text size="xs" c="red.7">
                            {t('table.customerOverdue', {
                              count: formatCount(row.overdueCount),
                              days: formatCount(row.maxDaysOverdue),
                            })}
                          </Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text size="sm">{formatCount(row.invoiceCount)}</Text>
                    </Table.Td>
                    {(['current', 'days1to30', 'days31to60', 'days61to90', 'over90'] as const).map(
                      (key) => (
                        <Table.Td key={key} ta="right">
                          <Text
                            size="sm"
                            c={key !== 'current' && row.aging[key].amount > 0 ? 'red.7' : undefined}
                            style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {row.aging[key].amount > 0
                              ? formatMoneyAt(row.aging[key].amount, precision)
                              : '—'}
                          </Text>
                        </Table.Td>
                      )
                    )}
                    <Table.Td ta="right">
                      <Text
                        size="sm"
                        fw={700}
                        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatMoneyAt(row.total, precision)}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" c={row.credit > 0 ? 'teal.7' : 'dimmed'}>
                        {row.credit > 0 ? formatMoneyAt(row.credit, precision) : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <CustomerActions row={row} actions={actions} />
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      <Box style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}>
        <TableFooter {...paging} />
      </Box>
    </Paper>
  );
}
