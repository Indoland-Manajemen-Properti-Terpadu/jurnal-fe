import { useMemo, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconArrowsLeftRight, IconInfoCircle } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { MOVEMENT_TYPES } from '@/module/inventory/domain/stockMovement';
import { DateRangeField } from '@/module/inventory/presentation/components/shared/DateRangeField';
import { MovementsTable } from '@/module/inventory/presentation/components/stock/MovementsTable';
import type { StockFilterValues } from '@/module/inventory/presentation/components/stock/stockFilters';
import { useBalances, useMovements } from '@/module/inventory/presentation/hooks/useStockQueries';
import { useWarehouseList } from '@/module/inventory/presentation/hooks/useWarehouses';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

const PAGE_SIZE = 20;

type Props = {
  filters: StockFilterValues;
  today: string;
  update: (patch: Partial<StockFilterValues>) => void;
  tabList: ReactNode;
};

/** The movement ledger, newest first, with the filters of period, warehouse, product and type. */
export function HistoryTab({ filters, today, update, tabList }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const movements = useMovements({
    startDate: filters.from,
    endDate: filters.to,
    warehouse: filters.warehouse || undefined,
    product: filters.product || undefined,
    type: filters.type || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  });
  const warehouses = useWarehouseList({ limit: 100 });
  const balances = useBalances({});
  const { data } = movements;
  const rows = data?.items ?? [];
  const showValue = rows.length === 0 || rows.some((row) => row.value !== null);

  const productOptions = useMemo(() => {
    const options = (balances.data?.rows ?? []).map((row) => ({
      value: row.productId,
      label: row.name,
    }));
    if (filters.product && !options.some((option) => option.value === filters.product)) {
      const known = rows.find((row) => row.productId === filters.product);
      options.push({ value: filters.product, label: known?.productName ?? filters.product });
    }
    return options;
  }, [balances.data, filters.product, rows]);

  const warehouseOptions = (warehouses.data?.items ?? []).map((warehouse) => ({
    value: warehouse.id,
    label: `${warehouse.code} · ${warehouse.name}`,
  }));

  const typeOptions = MOVEMENT_TYPES.map((type) => ({ value: type, label: t(`types.${type}`) }));

  const total = data?.totalResults ?? 0;
  const from = total === 0 ? 0 : ((data?.page ?? 1) - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : from + rows.length - 1;
  const unit = rows[0]?.unit ?? '';

  const renderBody = () => {
    if (movements.isLoading) {
      return (
        <Stack gap="xs">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={20} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (movements.isError && !data) {
      return (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            {t('loadFailed.title')}
            <Button size="xs" variant="default" onClick={() => movements.refetch()}>
              {t('loadFailed.retry')}
            </Button>
          </Group>
        </Alert>
      );
    }
    if (rows.length === 0) {
      return (
        <Paper withBorder radius="md" bg="white" p={0}>
          <Table>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td p={0}>
                  <EmptyState
                    title={t('history.emptyTitle')}
                    description={t('history.emptyBody')}
                    icon={<IconArrowsLeftRight size={36} stroke={1.5} />}
                    py={40}
                  />
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Paper>
      );
    }
    return <MovementsTable rows={rows} showValue={showValue} />;
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white">
      <Stack gap="md">
        {tabList}
        <Group gap="sm" wrap="wrap">
          <DateRangeField
            aria-label={t('history.period')}
            from={filters.from}
            to={filters.to}
            maxDate={today}
            onChange={(start, end) => update({ from: start, to: end })}
            w={{ base: '100%', sm: 250 }}
          />
          <Select
            aria-label={t('history.warehouse')}
            placeholder={t('history.allWarehouses')}
            data={warehouseOptions}
            value={filters.warehouse || null}
            onChange={(value) => update({ warehouse: value ?? '' })}
            clearable
            searchable
            radius="md"
            w={{ base: '100%', sm: 230 }}
          />
          <Select
            aria-label={t('history.product')}
            placeholder={t('history.allProducts')}
            data={productOptions}
            value={filters.product || null}
            onChange={(value) => update({ product: value ?? '' })}
            clearable
            searchable
            radius="md"
            w={{ base: '100%', sm: 230 }}
          />
          <Select
            aria-label={t('history.type')}
            placeholder={t('history.allTypes')}
            data={typeOptions}
            value={filters.type || null}
            onChange={(value) => update({ type: value ?? '' })}
            clearable
            radius="md"
            w={{ base: '100%', sm: 230 }}
          />
        </Group>
        {data && rows.length > 0 && (
          <Group
            justify="space-between"
            wrap="wrap"
            gap="sm"
            px="md"
            py="xs"
            bg="gray.0"
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
          >
            <Text size="sm" fw={600}>
              {t('history.totalCount', { count: data.totals.count })}
            </Text>
            <Group gap="lg" wrap="wrap">
              <Text size="sm" c="dimmed">
                {t('history.totalIn')}{' '}
                <Text span fw={700} c="green.8">
                  {filters.product
                    ? `${numberFormat(data.totals.inQty)} ${unit}`
                    : data.totals.inValue !== null
                      ? formatCurrency(data.totals.inValue)
                      : '-'}
                </Text>
              </Text>
              <Text size="sm" c="dimmed">
                {t('history.totalOut')}{' '}
                <Text span fw={700} c="dark.8">
                  {filters.product
                    ? `${numberFormat(data.totals.outQty)} ${unit}`
                    : data.totals.outValue !== null
                      ? formatCurrency(data.totals.outValue)
                      : '-'}
                </Text>
              </Text>
              {!filters.product && (
                <Tooltip label={t('history.totalsNote')} multiline w={280} withArrow>
                  <IconInfoCircle
                    size={16}
                    color="var(--mantine-color-dimmed)"
                    aria-label={t('history.totalsNote')}
                  />
                </Tooltip>
              )}
            </Group>
          </Group>
        )}
        {renderBody()}
        {data && data.totalResults > 0 && (
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm" c="dimmed">
              {t('history.showing', { from, to, total })}
            </Text>
            {data.totalPages > 1 && (
              <Pagination
                total={data.totalPages}
                value={data.page}
                onChange={(page) => update({ page })}
                size="sm"
                radius="md"
              />
            )}
          </Group>
        )}
        <Text size="xs" c="dimmed">
          {t('immutable')}
        </Text>
      </Stack>
    </Paper>
  );
}
