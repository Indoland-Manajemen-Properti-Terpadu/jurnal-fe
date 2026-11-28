import { useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconAlertCircle, IconPackage, IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { stockStatus, type StockStatus } from '@/module/inventory/domain/warehouse';
import { DateField } from '@/module/inventory/presentation/components/shared/DateField';
import {
  BalanceList,
  type MinInfo,
} from '@/module/inventory/presentation/components/stock/BalanceList';
import { BalanceMatrix } from '@/module/inventory/presentation/components/stock/BalanceMatrix';
import { BalanceMetrics } from '@/module/inventory/presentation/components/stock/BalanceMetrics';
import { ReconciliationBanner } from '@/module/inventory/presentation/components/stock/ReconciliationBanner';
import type { StockFilterValues } from '@/module/inventory/presentation/components/stock/stockFilters';
import {
  useBalances,
  useCategoryOptions,
} from '@/module/inventory/presentation/hooks/useStockQueries';
import { useWarehouseStock } from '@/module/inventory/presentation/hooks/useWarehouses';

type Props = {
  filters: StockFilterValues;
  today: string;
  update: (patch: Partial<StockFilterValues>) => void;
  /** The tab list, drawn at the top of the card like the other tabs do. */
  tabList: ReactNode;
};

type StatusFilter = StockStatus | 'all';
const SEARCH_DELAY_MS = 300;

/** Stock balances: a matrix of products by warehouse, or the list of one warehouse. */
export function BalancesTab({ filters, today, update, tabList }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const [searchInput, setSearchInput] = useState(filters.search);
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);
  const [status, setStatus] = useState<StatusFilter>('all');

  const asOf = filters.asOf || undefined;
  const categories = useCategoryOptions();
  const balances = useBalances({
    asOf,
    warehouse: filters.warehouse || undefined,
    categoryId: filters.category || undefined,
    q: search,
  });
  const report = balances.data;

  const isToday = !filters.asOf || filters.asOf === today;
  const singleWarehouse = filters.warehouse !== '';
  const warehouseStock = useWarehouseStock(
    singleWarehouse && isToday ? filters.warehouse : undefined
  );
  const mins = useMemo<Record<string, MinInfo> | undefined>(() => {
    if (!singleWarehouse || !isToday || !warehouseStock.data) return undefined;
    return Object.fromEntries(
      warehouseStock.data.map((item) => [
        item.productId,
        { minQty: item.minQty, status: item.status },
      ])
    );
  }, [singleWarehouse, isToday, warehouseStock.data]);

  const metricsReport = useMemo(() => {
    if (!report) return undefined;

    const stockCount = report.rows.filter((row) =>
      singleWarehouse ? (row.quantities[filters.warehouse] ?? 0) > 0 : row.totalQty > 0
    ).length;
    const emptyCount = isToday
      ? Math.max(0, report.summary.trackedProducts - stockCount)
      : report.summary.emptyCount;
    const belowMinCount =
      singleWarehouse && mins
        ? report.rows.filter(
            (row) =>
              (mins[row.productId]?.status ??
                stockStatus(row.quantities[filters.warehouse] ?? 0, 0)) === 'belowMin'
          ).length
        : report.summary.belowMinCount;

    return {
      ...report,
      summary: { ...report.summary, emptyCount, belowMinCount },
    };
  }, [report, singleWarehouse, isToday, filters.warehouse, mins]);

  const visibleReport = useMemo(() => {
    if (!report) return undefined;
    if (!mins || status === 'all') return report;
    return {
      ...report,
      rows: report.rows.filter(
        (row) =>
          (mins[row.productId]?.status ??
            stockStatus(row.quantities[filters.warehouse] ?? 0, 0)) === status
      ),
    };
  }, [report, filters.warehouse, mins, status]);

  const hasFilters =
    search !== '' || singleWarehouse || filters.category !== '' || status !== 'all';
  const showValue = (report?.summary.inventoryValue ?? null) !== null;

  const reset = () => {
    setSearchInput('');
    setStatus('all');
    update({ warehouse: '', search: '', category: '' });
  };

  const renderBody = () => {
    if (balances.isLoading) {
      return (
        <Stack gap="xs">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} height={20} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (balances.isError && !report) {
      return (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            {t('loadFailed.title')}
            <Button size="xs" variant="default" onClick={() => balances.refetch()}>
              {t('loadFailed.retry')}
            </Button>
          </Group>
        </Alert>
      );
    }
    if (!visibleReport) return null;
    if (visibleReport.rows.length === 0) {
      const onPastDate = !isToday && !hasFilters;
      let title = t('balances.emptyTitle');
      let body = t('balances.emptyBody');
      if (hasFilters) {
        title = t('balances.noMatchTitle');
        body = t('balances.noMatchBody');
      } else if (onPastDate) {
        title = t('balances.emptyOnDateTitle');
        body = t('balances.emptyOnDateBody');
      }
      return (
        <Paper withBorder radius="md" bg="white" p={0}>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td p={0}>
                  <EmptyState
                    title={title}
                    description={body}
                    icon={
                      hasFilters ? (
                        <IconSearch size={36} stroke={1.5} />
                      ) : (
                        <IconPackage size={36} stroke={1.5} />
                      )
                    }
                    actionLabel={hasFilters ? t('balances.reset') : undefined}
                    onAction={hasFilters ? reset : undefined}
                    py={40}
                  />
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      );
    }
    return singleWarehouse ? (
      <BalanceList
        report={visibleReport}
        warehouseId={filters.warehouse}
        showValue={showValue}
        mins={mins}
      />
    ) : (
      <BalanceMatrix report={visibleReport} showValue={showValue} />
    );
  };

  const categoryOptions = (categories.data?.items ?? []).map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const warehouseOptions = (report?.warehouses ?? [])
    .filter((warehouse) => warehouse.isActive || warehouse.id === filters.warehouse)
    .map((warehouse) => ({
      value: warehouse.id,
      label: `${warehouse.code} · ${warehouse.name}`,
    }));

  return (
    <Stack gap="lg">
      {metricsReport && <BalanceMetrics report={metricsReport} />}
      {report && (
        <ReconciliationBanner report={report} scoped={singleWarehouse || filters.category !== ''} />
      )}
      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          {tabList}
          <Group gap="sm" wrap="wrap">
            <Group gap={8} wrap="nowrap" w={{ base: '100%', sm: 'auto' }}>
              <Text size="sm" fw={500} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                {t('balances.asOf')}
              </Text>
              <DateField
                aria-label={t('balances.asOf')}
                value={filters.asOf || today}
                maxDate={today}
                onChange={(value) => update({ asOf: value === today ? '' : value })}
                w={{ base: '100%', sm: 170 }}
              />
            </Group>
            <Select
              aria-label={t('balances.warehouse')}
              placeholder={t('balances.allWarehouses')}
              data={warehouseOptions}
              value={filters.warehouse || null}
              onChange={(value) => {
                setStatus('all');
                update({ warehouse: value ?? '' });
              }}
              clearable
              searchable
              radius="md"
              w={{ base: '100%', sm: 240 }}
            />
            <Select
              aria-label={t('balances.category')}
              placeholder={t('balances.allCategories')}
              data={categoryOptions}
              value={filters.category || null}
              onChange={(value) => update({ category: value ?? '' })}
              clearable
              searchable
              radius="md"
              w={{ base: '100%', sm: 220 }}
            />
            {mins && (
              <Select
                aria-label={t('balances.statusColumn')}
                data={[
                  { value: 'all', label: t('balances.allStatuses') },
                  { value: 'safe', label: t('status.safe') },
                  { value: 'belowMin', label: t('status.belowMin') },
                  { value: 'empty', label: t('status.empty') },
                ]}
                value={status}
                onChange={(value) => setStatus((value as StatusFilter | null) ?? 'all')}
                allowDeselect={false}
                radius="md"
                w={{ base: '100%', sm: 190 }}
              />
            )}
            <TextInput
              aria-label={t('balances.searchLabel')}
              placeholder={t('balances.search')}
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(event) => setSearchInput(event.currentTarget.value)}
              radius="md"
              w={{ base: '100%', sm: 280 }}
            />
          </Group>
          {renderBody()}
        </Stack>
      </Paper>
    </Stack>
  );
}
