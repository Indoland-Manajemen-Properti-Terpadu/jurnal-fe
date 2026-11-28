import {
  Anchor,
  Badge,
  Box,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatMoneyAt } from '@/utils/formatMoney';
import type { ReceivableInvoiceRow } from '@/module/sales/domain/saleReceivables';
import { formatCount, formatDate, formatDateTime } from '@/module/sales/domain/saleFormat';
import { InvoiceActions, type InvoiceRowActions } from './ReceivableInvoiceActions';

const PAGE_SIZES = ['10', '25', '50'].map((value) => ({ value, label: `${value} / hal` }));
const COLUMN_MIN_WIDTH: Record<string, number> = {
  invoice: 250,
  customer: 150,
  date: 125,
  dueDate: 135,
  aging: 160,
  invoiceTotal: 155,
  settlement: 145,
  remaining: 150,
  lastEmail: 155,
  action: 56,
};

type Paging = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
};

function TableFooter({
  page,
  limit,
  totalPages,
  total,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}) {
  const { t } = useTranslation('salesReceivables');
  return (
    <Group justify="space-between" px="md" py="sm" wrap="wrap">
      <Text size="xs" c="dimmed">
        {t('table.showingInvoices', {
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

const daysUntilDue = (dueDate: string | null): number | null => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;
  const today = new Date();
  const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  return Math.max(0, Math.round((dueDay - todayDay) / 86_400_000));
};

export function ReceivableInvoicesTable({
  rows,
  paging,
  loading,
  error,
  onRetry,
  actions,
  precision,
}: Readonly<{
  rows: ReceivableInvoiceRow[];
  paging: Paging;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  actions: InvoiceRowActions;
  precision: number;
}>) {
  const { t } = useTranslation('salesReceivables');
  const columns = [
    'invoice',
    'customer',
    'date',
    'dueDate',
    'aging',
    'invoiceTotal',
    'settlement',
    'remaining',
    'lastEmail',
    'action',
  ];
  return (
    <Paper withBorder radius="md" p={0} bg="white" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={1500}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {columns.map((key) => (
                <Table.Th
                  key={key}
                  miw={COLUMN_MIN_WIDTH[key]}
                  ta={
                    ['invoiceTotal', 'settlement', 'remaining'].includes(key)
                      ? 'right'
                      : key === 'action'
                        ? 'center'
                        : undefined
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
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      {actions.canView ? (
                        <Anchor
                          component="button"
                          type="button"
                          ta="left"
                          fw={600}
                          size="sm"
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={() => actions.onView(row)}
                        >
                          {row.transactionNumber}
                        </Anchor>
                      ) : (
                        <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                          {row.transactionNumber}
                        </Text>
                      )}
                      {row.customerRefNumber && (
                        <Text size="xs" c="dimmed">
                          {t('table.reference', { value: row.customerRefNumber })}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    {row.customer ? (
                      <Anchor
                        component="button"
                        type="button"
                        size="sm"
                        onClick={() => row.customer && actions.onCustomer(row.customer.id)}
                      >
                        {row.customer.name}
                      </Anchor>
                    ) : (
                      '—'
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(row.transactionDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(row.dueDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {row.daysPastDue > 0 ? (
                      <Badge color="red" variant="light" radius="sm" tt="none">
                        {t('table.daysOverdue', { count: formatCount(row.daysPastDue) })}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {daysUntilDue(row.dueDate) === null
                          ? t('aging.current')
                          : daysUntilDue(row.dueDate) === 0
                            ? t('table.dueToday')
                            : t('table.daysUntilDue', {
                                count: formatCount(daysUntilDue(row.dueDate) || 0),
                              })}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Stack gap={1} align="flex-end">
                      <Text
                        size="sm"
                        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatMoneyAt(row.finalAmount + row.returnedAmount, precision)}
                      </Text>
                      {row.returnedAmount > 0 && (
                        <Text size="xs" c="dimmed">
                          {t('table.returnAdjustment', {
                            amount: formatMoneyAt(row.returnedAmount, precision),
                          })}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Stack gap={1} align="flex-end">
                      <Text size="sm" c={row.paidAmount > 0 ? 'teal.7' : undefined}>
                        {row.paidAmount > 0 ? formatMoneyAt(row.paidAmount, precision) : '—'}
                      </Text>
                      {row.creditAppliedAmount > 0 && (
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                          {t('table.creditAdjustment', {
                            amount: formatMoneyAt(row.creditAppliedAmount, precision),
                          })}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700}>
                      {formatMoneyAt(row.remainingAmount, precision)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      {row.lastInvoiceEmailAt
                        ? formatDateTime(row.lastInvoiceEmailAt)
                        : t('table.notSent')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <InvoiceActions row={row} actions={actions} />
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
