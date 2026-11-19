import { Anchor, Group, Pagination, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconClipboardOff, IconClipboardPlus } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { ReturnRights, ReturnTab, SaleReturn } from '@/module/sales/domain/saleReturn';
import type { ReturnHandlers } from '../../hooks/useReturnActions';
import { ReturnRowActions } from './ReturnRowActions';
import { ReturnStatusBadge } from './ReturnStatusBadge';

interface ReturnTableProps {
  returns: SaleReturn[];
  tab: ReturnTab;
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  handlers: ReturnHandlers;
  rights: ReturnRights;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRetry: () => void;
  onCreateNew: () => void;
}

const PAGE_SIZES = ['10', '25', '50'];
const COLUMNS: { key: string; align?: 'right' | 'center'; width?: number }[] = [
  { key: 'colNumber' },
  { key: 'colInvoice' },
  { key: 'colCustomer' },
  { key: 'colDate' },
  { key: 'colAmount', align: 'right' },
  { key: 'colCredit', align: 'right' },
  { key: 'colStatus', align: 'center', width: 150 },
  { key: 'colAction', align: 'center', width: 90 },
];

export function ReturnTable({
  returns,
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
}: Readonly<ReturnTableProps>) {
  const { t } = useTranslation('salesReturns');
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

            {!isLoading && !isError && returns.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconClipboardOff size={32} stroke={1.6} />}
                    title={t(`table.${emptyKey}Title`)}
                    description={t(`table.${emptyKey}Description`)}
                    actionLabel={isFiltered || tab !== 'draft' ? undefined : t('table.emptyAction')}
                    onAction={isFiltered || tab !== 'draft' ? undefined : onCreateNew}
                    actionIcon={<IconClipboardPlus size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              returns.map((ret) => (
                <Table.Tr key={ret.id}>
                  <Table.Td>
                    <Anchor
                      component="button"
                      type="button"
                      fw={600}
                      size="sm"
                      onClick={() => handlers.onView(ret)}
                    >
                      {ret.transactionNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{ret.saleNumber || '–'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{ret.customer?.displayName || '–'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(ret.transactionDate)}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(ret.finalAmount)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      c={ret.creditRemaining > 0 ? undefined : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {ret.creditRemaining > 0 ? formatIDR(ret.creditRemaining) : '–'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Group justify="center">
                      <ReturnStatusBadge status={ret.displayStatus} />
                    </Group>
                  </Table.Td>
                  <Table.Td ta="center">
                    <ReturnRowActions ret={ret} handlers={handlers} rights={rights} />
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('table.showing', { shown: returns.length, total })}
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
