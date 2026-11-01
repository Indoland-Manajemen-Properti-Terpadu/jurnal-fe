import { useState } from 'react';
import { Group, Pagination, Paper, Skeleton, Stack, Table, Text } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { IconBook2 } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { cashBookTypeKey } from '@/module/petty-cash/domain/pettyCashView';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashCashBook } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

const PAGE_SIZE = 20;
const COLUMNS = 6;
const money = (amount: number) => formatCurrency(amount, false);

/**
 * Physical cash movements of one fund in the order the server returns them (transaction date, then
 * sequence). The opening and closing balance belong to the filtered period.
 */
export function CashBookPanel({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const [range, setRange] = useState<DatesRangeValue<string>>([null, null]);
  const [page, setPage] = useState(1);
  // A range picker reports `[from, null]` after the first click; query only once both ends exist.
  const [from, to] = range;
  const hasRange = Boolean(from && to);
  const query = usePettyCashCashBook(fundId, {
    from: hasRange ? (from ?? undefined) : undefined,
    to: hasRange ? (to ?? undefined) : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const book = query.data;
  const filtered = hasRange;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="md" wrap="wrap">
        <DatePickerInput
          type="range"
          allowSingleDateInRange
          aria-label={t('cashBook.datePlaceholder')}
          placeholder={t('cashBook.datePlaceholder')}
          value={range}
          onChange={(next) => {
            setRange(next);
            setPage(1);
          }}
          valueFormat="DD/MM/YYYY"
          clearable
          clearButtonProps={{ 'aria-label': t('common.clearDates') }}
          w={{ base: '100%', sm: 260 }}
        />
        {book && (
          <Group gap="xl">
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                {t('cashBook.opening')}
              </Text>
              <Text fw={650}>{money(book.openingBalance)}</Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                {t('cashBook.closing')}
              </Text>
              <Text fw={650}>{money(book.closingBalance)}</Text>
            </Stack>
          </Group>
        )}
      </Group>

      {query.isError && (
        <QueryErrorState
          title={t('cashBook.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}

      <Paper
        withBorder
        radius="md"
        bg="white"
        aria-busy={query.isFetching}
        style={{
          overflow: 'hidden',
          opacity: query.isPlaceholderData ? 0.55 : 1,
          transition: 'opacity 150ms ease',
        }}
      >
        <Table.ScrollContainer minWidth={720}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('cashBook.columns.date')}</Table.Th>
                <Table.Th>{t('cashBook.columns.type')}</Table.Th>
                <Table.Th>{t('cashBook.columns.memo')}</Table.Th>
                <Table.Th ta="right">{t('cashBook.columns.in')}</Table.Th>
                <Table.Th ta="right">{t('cashBook.columns.out')}</Table.Th>
                <Table.Th ta="right">{t('cashBook.columns.balance')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {query.isLoading &&
                Array.from({ length: 5 }, (_, index) => (
                  <Table.Tr key={`loading-${index}`}>
                    <Table.Td colSpan={COLUMNS}>
                      <Skeleton height={20} radius="sm" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              {book?.entries.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={COLUMNS}>
                    <EmptyState
                      icon={<IconBook2 size={32} />}
                      title={t('cashBook.emptyTitle')}
                      description={
                        filtered ? t('cashBook.emptyFiltered') : t('cashBook.emptyDescription')
                      }
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {book?.entries.items.map((entry) => (
                <Table.Tr key={entry.id}>
                  <Table.Td>{dateFormatV1(entry.txnDate)}</Table.Td>
                  <Table.Td>{t(`cashBook.types.${cashBookTypeKey(entry.type)}`)}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {entry.memo}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    {entry.direction === 'IN' && (
                      <Text size="sm" fw={600} c="teal.8">
                        {money(entry.amount)}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    {entry.direction === 'OUT' && (
                      <Text size="sm" fw={600}>
                        {money(entry.amount)}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={650}>
                      {money(entry.runningBalance)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {book && book.entries.totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {t('common.page')} {book.entries.page} {t('common.of')} {book.entries.totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={book.entries.totalPages} size="sm" />
        </Group>
      )}
    </Stack>
  );
}
