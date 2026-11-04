import { useState } from 'react';
import { Group, Select, Text } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { IconBook2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { cashBookTypeKey } from '@/module/petty-cash/domain/pettyCashView';
import { DocumentTable, TwoLine } from '@/module/petty-cash/presentation/components/DocumentTable';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import { usePettyCashCashBook } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

const PAGE_SIZE = 20;
const money = (amount: number) => formatCurrency(amount, false);

/**
 * Physical cash movements of one fund in the order the server returns them (transaction date, then
 * sequence). The opening and closing balance belong to the filtered period.
 */
export function CashBookPanel({
  fundId,
  pockets = [],
}: Readonly<{ fundId: string; pockets?: FundPocket[] }>) {
  const { t } = useTranslation('pettyCash');
  const [range, setRange] = useState<DatesRangeValue<string>>([null, null]);
  const [page, setPage] = useState(1);
  const [pocket, setPocket] = useState<string | null>(null);
  const pocketName = (code: string | null) =>
    pockets.find((item) => item.code === code)?.name ?? code ?? '';
  // A range picker reports `[from, null]` after the first click; query only once both ends exist.
  const [from, to] = range;
  const hasRange = Boolean(from && to);
  const query = usePettyCashCashBook(fundId, {
    from: hasRange ? (from ?? undefined) : undefined,
    to: hasRange ? (to ?? undefined) : undefined,
    pocket: pocket ?? undefined,
    page,
    limit: PAGE_SIZE,
  });
  const book = query.data;
  const filtered = hasRange;

  const columns = [
    { key: 'date', label: t('cashBook.columns.date') },
    { key: 'type', label: t('cashBook.columns.type') },
    ...(pockets.length > 1 ? [{ key: 'pocket', label: t('cashBook.columns.pocket') }] : []),
    { key: 'in', label: t('cashBook.columns.in'), numeric: true },
    { key: 'out', label: t('cashBook.columns.out'), numeric: true },
    { key: 'balance', label: t('cashBook.columns.balance'), numeric: true },
  ];

  return (
    <DocumentTable
      filters={
        <>
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
            w={{ base: '100%', sm: 250 }}
          />
          {pockets.length > 1 && (
            <Select
              aria-label={t('cashBook.pocketFilter')}
              placeholder={t('cashBook.allPockets')}
              data={pockets.map((item) => ({ value: item.code, label: item.name }))}
              value={pocket}
              onChange={(next) => {
                setPocket(next);
                setPage(1);
              }}
              clearable
              allowDeselect
              w={{ base: '100%', sm: 220 }}
            />
          )}
        </>
      }
      countLabel={
        book && (
          <Group gap="lg" wrap="nowrap">
            <span>
              {t('cashBook.opening')}{' '}
              <Text span size="sm" fw={600} c="dark.8">
                {money(book.openingBalance)}
              </Text>
            </span>
            <span>
              {t('cashBook.closing')}{' '}
              <Text span size="sm" fw={600} c="dark.8">
                {money(book.closingBalance)}
              </Text>
            </span>
          </Group>
        )
      }
      columns={columns}
      items={book?.entries.items}
      rowKey={(entry) => entry.id}
      cells={(entry) => [
        dateFormatV1(entry.txnDate),
        <TwoLine
          key="type"
          primary={t(`cashBook.types.${cashBookTypeKey(entry.type)}`)}
          secondary={entry.memo}
        />,
        ...(pockets.length > 1 ? [pocketName(entry.pocket)] : []),
        entry.direction === 'IN' ? money(entry.amount) : '',
        entry.direction === 'OUT' ? money(entry.amount) : '',
        <Text key="balance" size="sm" fw={600} c="dark.8">
          {money(pocket ? (entry.pocketBalance ?? entry.runningBalance) : entry.runningBalance)}
        </Text>,
      ]}
      minWidth={720}
      loading={query.isLoading}
      fetching={query.isFetching}
      stale={query.isPlaceholderData}
      error={
        query.isError
          ? { title: t('cashBook.loadFailed'), error: query.error, onRetry: () => query.refetch() }
          : null
      }
      empty={{
        icon: <IconBook2 size={32} />,
        title: t('cashBook.emptyTitle'),
        description: filtered ? t('cashBook.emptyFiltered') : t('cashBook.emptyDescription'),
      }}
      pagination={
        book && {
          page,
          totalPages: book.entries.totalPages,
          totalResults: book.entries.totalResults,
          limit: PAGE_SIZE,
          onChange: setPage,
        }
      }
    />
  );
}
