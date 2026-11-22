import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Menu,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconDots,
  IconPackage,
  IconSearch,
  IconAdjustments,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { DataTableFrame } from '@/module/inventory/presentation/components/warehouses/DataTableFrame';
import type { StockStatus, WarehouseStockItem } from '@/module/inventory/domain/warehouse';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

type Props = {
  items: WarehouseStockItem[];
  loading: boolean;
  failed: boolean;
  /** False when the service sends no values to this person. */
  showValue: boolean;
  /** The warehouse's own value, as the service totals it. */
  totalValue: number | null;
  canUpdate: boolean;
  onSetMin: (item: WarehouseStockItem) => void;
  onRetry: () => void;
};

type StatusFilter = StockStatus | 'all';

const STATUS_COLOR: Record<StockStatus, string | undefined> = {
  safe: 'green.8',
  belowMin: 'orange.8',
  empty: 'red.7',
};

const header = (label: string, align?: 'right' | 'center') => (
  <Table.Th ta={align} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

/** What the warehouse holds, product by product. Quantities are never added across products. */
export function WarehouseStockTab({
  items,
  loading,
  failed,
  showValue,
  totalValue,
  canUpdate,
  onSetMin,
  onRetry,
}: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (status === 'all' || item.status === status) &&
        (needle === '' ||
          item.name.toLowerCase().includes(needle) ||
          item.sku.toLowerCase().includes(needle))
    );
  }, [items, search, status]);

  const columnCount = 6 + (showValue ? 2 : 0) + (canUpdate ? 1 : 0);

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: 4 }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={columnCount}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (failed && items.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columnCount}>
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Text size="sm">{t('loadFailed.title')}</Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  {t('loadFailed.retry')}
                </Button>
              </Group>
            </Alert>
          </Table.Td>
        </Table.Tr>
      );
    }
    if (visible.length === 0) {
      const filtered = items.length > 0;
      return (
        <Table.Tr>
          <Table.Td colSpan={columnCount} p={0}>
            <EmptyState
              title={t(filtered ? 'detail.stock.noMatch' : 'detail.stock.empty')}
              description={filtered ? undefined : t('detail.stock.emptyBody')}
              icon={
                filtered ? (
                  <IconSearch size={36} stroke={1.5} />
                ) : (
                  <IconPackage size={36} stroke={1.5} />
                )
              }
              py={40}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return visible.map((item) => (
      <Table.Tr key={item.productId}>
        <Table.Td>
          <Text size="sm" fw={600} c="dark.8">
            {item.name}
          </Text>
          {item.sku && (
            <Text size="xs" c="dimmed">
              {item.sku}
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="sm">{item.unit || '-'}</Text>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm">{numberFormat(item.quantity)}</Text>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" c={item.minQty > 0 ? undefined : 'dimmed'}>
            {item.minQty > 0 ? numberFormat(item.minQty) : '-'}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500} c={STATUS_COLOR[item.status]}>
            {t(`detail.stockStatus.${item.status}`)}
          </Text>
        </Table.Td>
        {showValue && (
          <>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{item.avgCost === null ? '-' : formatCurrency(item.avgCost)}</Text>
            </Table.Td>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{item.value === null ? '-' : formatCurrency(item.value)}</Text>
            </Table.Td>
          </>
        )}
        {canUpdate && (
          <Table.Td ta="center">
            <Menu position="bottom-end" withinPortal shadow="md" radius="md">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  aria-label={t('detail.stock.actions', { name: item.name })}
                >
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconAdjustments size={16} />}
                  onClick={() => onSetMin(item)}
                >
                  {t('detail.stock.setMin')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Table.Td>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Stack gap="md">
      <Group gap="sm" wrap="wrap">
        <TextInput
          placeholder={t('detail.stock.searchProduct')}
          aria-label={t('detail.stock.searchProduct')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={{ base: '100%', sm: 280 }}
          radius="md"
        />
        <Select
          aria-label={t('detail.stock.filterStatus')}
          data={[
            { value: 'all', label: t('detail.stock.allStatus') },
            { value: 'safe', label: t('detail.stockStatus.safe') },
            { value: 'belowMin', label: t('detail.stockStatus.belowMin') },
            { value: 'empty', label: t('detail.stockStatus.empty') },
          ]}
          value={status}
          onChange={(value) => setStatus((value as StatusFilter | null) ?? 'all')}
          allowDeselect={false}
          radius="md"
          w={{ base: '100%', sm: 200 }}
        />
      </Group>
      <DataTableFrame minWidth={720}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {header(t('detail.stock.product'))}
            {header(t('detail.stock.unit'))}
            {header(t('detail.stock.qty'), 'right')}
            {header(t('detail.stock.min'), 'right')}
            {header(t('detail.stock.status'))}
            {showValue && header(t('detail.stock.avgCost'), 'right')}
            {showValue && header(t('detail.stock.value'), 'right')}
            {canUpdate && header('', 'center')}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderBody()}</Table.Tbody>
        {showValue && totalValue !== null && !loading && items.length > 0 && (
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text size="sm" fw={700}>
                  {t('detail.stock.totalValue')}
                </Text>
              </Table.Td>
              <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm" fw={700}>
                  {formatCurrency(totalValue)}
                </Text>
              </Table.Td>
              {canUpdate && <Table.Td />}
            </Table.Tr>
          </Table.Tfoot>
        )}
      </DataTableFrame>
    </Stack>
  );
}
