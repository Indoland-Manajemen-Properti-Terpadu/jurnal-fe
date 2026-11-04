import { useState } from 'react';
import { ActionIcon, MultiSelect, Text, TextInput } from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import { IconReceipt, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { VOUCHER_STATUSES, type VoucherStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import { summarizeVoucherAccounts } from '@/module/petty-cash/domain/pettyCashView';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import {
  DocumentNumber,
  DocumentTable,
  TwoLine,
} from '@/module/petty-cash/presentation/components/DocumentTable';
import {
  usePettyCashLookups,
  usePettyCashVouchers,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

const PAGE_SIZE = 10;

interface Props {
  fundId: string;
  onSelectVoucher: (voucherId: string) => void;
}

/** Vouchers of one fund. Search, status, dates and paging are answered by the server. */
export function VoucherList({ fundId, onSelectVoucher }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [range, setRange] = useState<DatesRangeValue<string>>([null, null]);
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 400);

  // A range picker reports `[from, null]` after the first click; query only once both ends exist.
  const [from, to] = range;
  const hasRange = Boolean(from && to);
  const query = usePettyCashVouchers({
    fundId,
    status: statuses as VoucherStatus[],
    search: debouncedSearch,
    from: hasRange ? (from ?? undefined) : undefined,
    to: hasRange ? (to ?? undefined) : undefined,
    page,
    limit: PAGE_SIZE,
    sortBy: 'date:desc',
  });

  const lookups = usePettyCashLookups();
  const resolveAccount = (accountId: string) =>
    lookups.data?.expenseAccounts.find((account) => account.id === accountId);

  const filtered = Boolean(debouncedSearch || statuses.length || hasRange);
  const resetFilters = () => {
    setSearch('');
    setStatuses([]);
    setRange([null, null]);
    setPage(1);
  };
  const results = query.data;

  return (
    <DocumentTable
      filters={
        <>
          <TextInput
            aria-label={t('vouchers.searchPlaceholder')}
            placeholder={t('vouchers.searchPlaceholder')}
            leftSection={<IconSearch size={16} />}
            rightSection={
              search ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label={t('vouchers.clearSearch')}
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
            w={{ base: '100%', sm: 300 }}
          />
          <MultiSelect
            aria-label={t('vouchers.statusPlaceholder')}
            placeholder={statuses.length ? undefined : t('vouchers.statusPlaceholder')}
            data={VOUCHER_STATUSES.map((status) => ({
              value: status,
              label: t(`status.voucher.${status}`),
            }))}
            value={statuses}
            onChange={(next) => {
              setStatuses(next);
              setPage(1);
            }}
            clearable
            clearButtonProps={{ 'aria-label': t('common.clearStatuses') }}
            w={{ base: '100%', sm: 260 }}
          />
          <DatePickerInput
            type="range"
            allowSingleDateInRange
            aria-label={t('vouchers.datePlaceholder')}
            placeholder={t('vouchers.datePlaceholder')}
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
        </>
      }
      countLabel={results ? t('vouchers.count', { count: results.totalResults }) : undefined}
      columns={[
        { key: 'number', label: t('vouchers.columns.number') },
        { key: 'date', label: t('vouchers.columns.date') },
        { key: 'beneficiary', label: t('vouchers.columns.beneficiary') },
        { key: 'account', label: t('vouchers.columns.account') },
        { key: 'total', label: t('vouchers.columns.total'), numeric: true },
        { key: 'status', label: t('vouchers.columns.status') },
      ]}
      items={results?.items}
      rowKey={(voucher) => voucher.id}
      rowLabel={(voucher) => t('vouchers.view', { number: voucher.voucherNumber })}
      onOpen={(voucher) => onSelectVoucher(voucher.id)}
      cells={(voucher) => {
        const accounts = summarizeVoucherAccounts(voucher.lines, resolveAccount);
        return [
          <DocumentNumber
            key="number"
            number={voucher.voucherNumber}
            tag={
              voucher.source === 'ADVANCE' ? (
                <Text size="xs" c="dimmed">
                  {t('vouchers.fromAdvance')}
                </Text>
              ) : undefined
            }
          />,
          dateFormatV1(voucher.transactionDate),
          <TwoLine
            key="beneficiary"
            primary={voucher.beneficiary}
            secondary={voucher.description}
          />,
          accounts.first ? (
            <TwoLine
              key="account"
              primary={`${accounts.first.accountNumber} · ${accounts.first.name}`}
              secondary={
                accounts.extra > 0
                  ? t('vouchers.moreAccounts', { count: accounts.extra })
                  : undefined
              }
            />
          ) : (
            '-'
          ),
          formatCurrency(voucher.totalAmount, false),
          <PettyCashStatusBadge key="status" kind="voucher" status={voucher.status} />,
        ];
      }}
      minWidth={820}
      loading={query.isLoading}
      fetching={query.isFetching}
      stale={query.isPlaceholderData}
      error={
        query.isError
          ? { title: t('vouchers.loadFailed'), error: query.error, onRetry: () => query.refetch() }
          : null
      }
      empty={{
        icon: <IconReceipt size={32} />,
        title: t('vouchers.emptyTitle'),
        description: filtered ? t('vouchers.emptyFiltered') : t('vouchers.emptyDescription'),
        actionLabel: filtered ? t('common.clearFilters') : undefined,
        onAction: filtered ? resetFilters : undefined,
      }}
      pagination={
        results && {
          page,
          totalPages: results.totalPages,
          totalResults: results.totalResults,
          limit: PAGE_SIZE,
          onChange: setPage,
        }
      }
    />
  );
}
