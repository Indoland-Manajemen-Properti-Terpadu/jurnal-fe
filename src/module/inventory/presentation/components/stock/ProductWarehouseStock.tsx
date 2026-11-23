import { Alert, Anchor, Badge, Button, Group, Skeleton, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconBuildingWarehouse } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import type { ProductStock } from '@/module/inventory/domain/productStock';
import type { StockStatus } from '@/module/inventory/domain/warehouse';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { stockCardPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { useProductStock } from '@/module/inventory/presentation/hooks/useStockQueries';
import { dateFormatV1 } from '@/utils/formatDate';
import { numberFormat } from '@/utils/formatCurrency';

const STATUS_COLOR: Record<StockStatus, string | undefined> = {
  safe: 'green.8',
  belowMin: 'orange.8',
  empty: 'red.7',
};

const header = (label: string, align?: 'right') => (
  <Table.Th ta={align} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

type TableProps = {
  productId: string;
  stock: ProductStock;
};

/** Each warehouse's quantity of one product. Only this product's own unit is added up, so the total is safe. */
export function ProductWarehouseStockTable({ productId, stock }: Readonly<TableProps>) {
  const { t } = useTranslation('warehouses');

  if (stock.warehouses.length === 0) {
    return (
      <EmptyState title={t('productStock.empty')} icon={<IconBuildingWarehouse size={36} />} />
    );
  }

  return (
    <Table verticalSpacing="sm" horizontalSpacing="lg" style={{ minWidth: 560 }}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {header(t('productStock.warehouse'))}
          {header(t('productStock.qty'), 'right')}
          {header(t('productStock.min'), 'right')}
          {header(t('productStock.status'))}
          {header(t('productStock.lastCount'))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {stock.warehouses.map((row) => (
          <Table.Tr key={row.warehouseId}>
            <Table.Td>
              <Group gap={6} wrap="nowrap">
                <Anchor
                  component={Link}
                  to={stockCardPath(productId, row.warehouseId)}
                  size="sm"
                  fw={600}
                  c="dark.8"
                  aria-label={`${t('productStock.stockCard')}: ${row.name}`}
                >
                  {row.name}
                </Anchor>
                {row.isDefault && (
                  <Badge size="xs" variant="light" radius="sm">
                    {t('productStock.main')}
                  </Badge>
                )}
                {!row.isActive && (
                  <Badge size="xs" variant="light" color="gray" radius="sm">
                    {t('productStock.inactive')}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {row.code}
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm">
                {numberFormat(row.quantity)} {stock.unit}
              </Text>
            </Table.Td>
            <Table.Td ta="right">
              <Text size="sm" c={row.minQty > 0 ? undefined : 'dimmed'}>
                {row.minQty > 0 ? numberFormat(row.minQty) : '-'}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={500} c={STATUS_COLOR[row.status]}>
                {t(`detail.stockStatus.${row.status}`)}
              </Text>
            </Table.Td>
            <Table.Td>
              {row.lastOpname ? (
                <>
                  <Text size="sm">{dateFormatV1(row.lastOpname.date)}</Text>
                  <Text size="xs" c="dimmed">
                    {row.lastOpname.number}
                  </Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  {t('productStock.neverCounted')}
                </Text>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
      <Table.Tfoot>
        <Table.Tr>
          <Table.Td>
            <Text size="sm" fw={700}>
              {t('productStock.total')}
            </Text>
          </Table.Td>
          <Table.Td ta="right">
            <Text size="sm" fw={700}>
              {numberFormat(stock.totalQty)} {stock.unit}
            </Text>
          </Table.Td>
          <Table.Td colSpan={3} />
        </Table.Tr>
      </Table.Tfoot>
    </Table>
  );
}

/**
 * "Stok per gudang" on a stock-tracked product. A person without the right to read stock sees
 * nothing at all rather than an error they cannot act on.
 */
export function ProductWarehouseStock({ productId }: Readonly<{ productId: string }>) {
  const { t } = useTranslation('warehouses');
  const { data, isLoading, error, refetch } = useProductStock(productId);

  if (error instanceof ApiError && error.kind === 'forbidden') return null;

  const count = data ? t('productStock.count', { count: data.warehouses.length }) : undefined;

  return (
    <SectionCard
      icon={IconBuildingWarehouse}
      title={t('productStock.title')}
      subtitle={t('productStock.subtitle')}
      count={count}
      flush
    >
      {isLoading && <Skeleton height={96} radius={0} />}
      {error && (
        <Alert m="lg" color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">{t('productStock.loadFailed')}</Text>
            <Button size="xs" variant="default" onClick={() => refetch()}>
              {t('productStock.retry')}
            </Button>
          </Group>
        </Alert>
      )}
      {data && <ProductWarehouseStockTable productId={productId} stock={data} />}
    </SectionCard>
  );
}
