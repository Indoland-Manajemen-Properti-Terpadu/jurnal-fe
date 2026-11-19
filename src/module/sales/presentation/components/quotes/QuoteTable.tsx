import { Anchor, Group, Pagination, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconFileOff, IconFilePlus } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { QuoteRights, QuoteTab, SaleQuote } from '@/module/sales/domain/saleQuote';
import type { QuoteHandlers } from '../../hooks/useQuoteActions';
import { QuoteRowActions } from './QuoteRowActions';
import { QuoteStatusBadge } from './QuoteStatusBadge';

interface QuoteTableProps {
  quotes: SaleQuote[];
  tab: QuoteTab;
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  handlers: QuoteHandlers;
  rights: QuoteRights;
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
  { key: 'colValidUntil' },
  { key: 'colTotal', align: 'right' },
  { key: 'colStatus', align: 'center', width: 150 },
  { key: 'colAction', align: 'center', width: 90 },
];

export function QuoteTable({
  quotes,
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
}: Readonly<QuoteTableProps>) {
  const { t } = useTranslation('salesQuotes');
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

            {!isLoading && !isError && quotes.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconFileOff size={32} stroke={1.6} />}
                    title={t(`table.${emptyKey}Title`)}
                    description={t(`table.${emptyKey}Description`)}
                    actionLabel={isFiltered ? undefined : t('table.emptyAction')}
                    onAction={isFiltered ? undefined : onCreateNew}
                    actionIcon={<IconFilePlus size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              quotes.map((quote) => (
                <Table.Tr key={quote.id}>
                  <Table.Td>
                    <Anchor
                      component="button"
                      type="button"
                      fw={600}
                      size="sm"
                      onClick={() => handlers.onView(quote)}
                    >
                      {quote.transactionNumber}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{quote.customer?.displayName || '–'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(quote.transactionDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={quote.displayStatus === 'EXPIRED' ? 'red.7' : undefined}>
                      {formatDate(quote.validUntil)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(quote.total)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="center">
                    <Group justify="center">
                      <QuoteStatusBadge status={quote.displayStatus} />
                    </Group>
                  </Table.Td>
                  <Table.Td ta="center">
                    <QuoteRowActions quote={quote} handlers={handlers} rights={rights} />
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('table.showing', { shown: quotes.length, total })}
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
