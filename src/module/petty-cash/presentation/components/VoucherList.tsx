import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Group,
  MultiSelect,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { DatePickerInput, type DatesRangeValue } from '@mantine/dates';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEye, IconReceipt, IconSearch, IconX } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { VOUCHER_STATUSES, type VoucherStatus } from '@/module/petty-cash/domain/pettyCashStatus';
import { summarizeVoucherAccounts } from '@/module/petty-cash/domain/pettyCashView';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import {
  usePettyCashLookups,
  usePettyCashVouchers,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

const PAGE_SIZE = 10;
const COLUMNS = 7;

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
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" gap="sm" wrap="wrap">
        <Group gap="sm" wrap="wrap" style={{ flex: 1 }}>
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
        </Group>
        {results && (
          <Text size="xs" c="dimmed" aria-live="polite">
            {t('vouchers.count', { count: results.totalResults })}
          </Text>
        )}
      </Group>

      {query.isError && (
        <QueryErrorState
          title={t('vouchers.loadFailed')}
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
        <Table.ScrollContainer minWidth={820}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('vouchers.columns.number')}</Table.Th>
                <Table.Th>{t('vouchers.columns.date')}</Table.Th>
                <Table.Th>{t('vouchers.columns.beneficiary')}</Table.Th>
                <Table.Th>{t('vouchers.columns.account')}</Table.Th>
                <Table.Th ta="right">{t('vouchers.columns.total')}</Table.Th>
                <Table.Th>{t('vouchers.columns.status')}</Table.Th>
                <Table.Th ta="center">{t('vouchers.columns.action')}</Table.Th>
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
              {results?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={COLUMNS}>
                    <EmptyState
                      icon={<IconReceipt size={32} />}
                      title={t('vouchers.emptyTitle')}
                      description={
                        filtered ? t('vouchers.emptyFiltered') : t('vouchers.emptyDescription')
                      }
                      actionLabel={filtered ? t('common.clearFilters') : undefined}
                      onAction={filtered ? resetFilters : undefined}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
              {results?.items.map((voucher) => {
                const accounts = summarizeVoucherAccounts(voucher.lines, resolveAccount);
                return (
                  <Table.Tr key={voucher.id}>
                    <Table.Td>
                      <Anchor
                        component="button"
                        type="button"
                        fw={650}
                        size="sm"
                        onClick={() => onSelectVoucher(voucher.id)}
                      >
                        {voucher.voucherNumber}
                      </Anchor>
                      {voucher.source === 'ADVANCE' && (
                        <Badge ml="xs" size="xs" variant="outline" color="gray" tt="none">
                          {t('vouchers.fromAdvance')}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>{dateFormatV1(voucher.transactionDate)}</Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600} lineClamp={1}>
                        {voucher.beneficiary}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {voucher.description}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {accounts.first && (
                        <>
                          <Text size="sm" lineClamp={1}>
                            {accounts.first.accountNumber} · {accounts.first.name}
                          </Text>
                          {accounts.extra > 0 && (
                            <Text size="xs" c="dimmed">
                              {t('vouchers.moreAccounts', { count: accounts.extra })}
                            </Text>
                          )}
                        </>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={650}>
                        {formatCurrency(voucher.totalAmount, false)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <PettyCashStatusBadge kind="voucher" status={voucher.status} />
                    </Table.Td>
                    <Table.Td ta="center">
                      <ActionIcon
                        variant="subtle"
                        aria-label={t('vouchers.view', { number: voucher.voucherNumber })}
                        onClick={() => onSelectVoucher(voucher.id)}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {results && results.totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {t('common.page')} {results.page} {t('common.of')} {results.totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={results.totalPages} size="sm" />
        </Group>
      )}
    </Stack>
  );
}
