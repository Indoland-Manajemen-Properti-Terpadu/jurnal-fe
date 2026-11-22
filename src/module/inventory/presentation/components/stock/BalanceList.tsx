import { Anchor, Table, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { BalanceReport } from '@/module/inventory/domain/stockBalance';
import type { StockStatus } from '@/module/inventory/domain/warehouse';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { stockCardPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

export type MinInfo = { minQty: number; status: StockStatus };

type Props = {
  report: BalanceReport;
  warehouseId: string;
  showValue: boolean;
  /** Minimum and status per product; only known for today's balance. */
  mins?: Record<string, MinInfo>;
};

const STATUS_COLOR: Record<StockStatus, string> = {
  safe: 'green.8',
  belowMin: 'orange.8',
  empty: 'red.7',
};

/** What one warehouse holds, product by product. */
export function BalanceList({ report, warehouseId, showValue, mins }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const showMin = mins !== undefined;
  const labelSpan = 3 + (showMin ? 2 : 0) + (showValue ? 1 : 0);

  return (
    <DataTableFrame minWidth={640}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {columnHeader(t('balances.product'))}
          {columnHeader(t('balances.unit'))}
          {columnHeader(t('balances.qty'), 'right')}
          {showMin && columnHeader(t('balances.min'), 'right')}
          {showMin && columnHeader(t('balances.statusColumn'))}
          {showValue && columnHeader(t('balances.avgCost'), 'right')}
          {showValue && columnHeader(t('balances.value'), 'right')}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {report.rows.map((row) => {
          const info = mins?.[row.productId];
          return (
            <Table.Tr key={row.productId}>
              <Table.Td>
                <Anchor
                  component={Link}
                  to={stockCardPath(row.productId, warehouseId)}
                  size="sm"
                  fw={600}
                  c="dark.8"
                >
                  {row.name}
                </Anchor>
                {row.sku && (
                  <Text size="xs" c="dimmed">
                    {row.sku}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>
                <Text size="sm">{row.unit || '-'}</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm" fw={600}>
                  {numberFormat(row.quantities[warehouseId] ?? 0)}
                </Text>
              </Table.Td>
              {showMin && (
                <>
                  <Table.Td ta="right">
                    <Text size="sm" c={info && info.minQty > 0 ? undefined : 'dimmed'}>
                      {info && info.minQty > 0 ? numberFormat(info.minQty) : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {info ? (
                      <Text size="sm" fw={500} c={STATUS_COLOR[info.status]}>
                        {t(`status.${info.status}`)}
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">
                        -
                      </Text>
                    )}
                  </Table.Td>
                </>
              )}
              {showValue && (
                <>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm">
                      {row.avgCost === null ? '-' : formatCurrency(row.avgCost)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm">{row.value === null ? '-' : formatCurrency(row.value)}</Text>
                  </Table.Td>
                </>
              )}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
      {showValue && report.summary.inventoryValue !== null && (
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={labelSpan}>
              <Text size="sm" fw={700}>
                {t('balances.totalValue')}
              </Text>
            </Table.Td>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm" fw={700}>
                {formatCurrency(report.summary.inventoryValue)}
              </Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      )}
    </DataTableFrame>
  );
}
