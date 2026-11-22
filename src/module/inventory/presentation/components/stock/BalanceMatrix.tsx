import { Anchor, Table, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { visibleWarehouses, type BalanceReport } from '@/module/inventory/domain/stockBalance';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import { stockCardPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

type Props = {
  report: BalanceReport;
  /** False when the service sends no values to this person. */
  showValue: boolean;
};

/** Products down, warehouses across; only the value is totalled, never the quantities. */
export function BalanceMatrix({ report, showValue }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const warehouses = visibleWarehouses(report);
  const labelSpan = 2 + warehouses.length + 1;

  return (
    <DataTableFrame minWidth={640 + warehouses.length * 96} stickyFirst stickyLast={showValue}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {columnHeader(t('balances.product'))}
          {columnHeader(t('balances.unit'))}
          {warehouses.map((warehouse) => {
            const name = warehouse.isActive
              ? warehouse.name
              : `${warehouse.name} (${t('balances.inactive')})`;
            return (
              <Table.Th key={warehouse.id} ta="right" title={name}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ whiteSpace: 'nowrap' }}>
                  {warehouse.code}
                </Text>
                <Text size="xs" c="dimmed" maw={110} ml="auto" truncate="end">
                  {name}
                </Text>
              </Table.Th>
            );
          })}
          {columnHeader(t('balances.totalQty'), 'right')}
          {showValue && columnHeader(t('balances.avgCost'), 'right')}
          {showValue && columnHeader(t('balances.value'), 'right')}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {report.rows.map((row) => (
          <Table.Tr key={row.productId}>
            <Table.Td miw={220}>
              <Anchor
                component={Link}
                to={stockCardPath(row.productId)}
                size="sm"
                fw={600}
                c="dark.8"
                aria-label={t('balances.openCard', { name: row.name })}
              >
                {row.name}
              </Anchor>
              {row.sku && (
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {row.sku}
                </Text>
              )}
            </Table.Td>
            <Table.Td>
              <Text size="sm">{row.unit || '-'}</Text>
            </Table.Td>
            {warehouses.map((warehouse) => {
              const qty = row.quantities[warehouse.id] ?? 0;
              return (
                <Table.Td key={warehouse.id} ta="right">
                  {qty === 0 ? (
                    <Dash />
                  ) : (
                    <Anchor
                      component={Link}
                      to={stockCardPath(row.productId, warehouse.id)}
                      size="sm"
                    >
                      {numberFormat(qty)}
                    </Anchor>
                  )}
                </Table.Td>
              );
            })}
            <Table.Td ta="right">
              <Text size="sm" fw={600}>
                {numberFormat(row.totalQty)}
              </Text>
            </Table.Td>
            {showValue && (
              <>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">{row.avgCost === null ? '-' : formatCurrency(row.avgCost)}</Text>
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm" fw={600}>
                    {row.value === null ? '-' : formatCurrency(row.value)}
                  </Text>
                </Table.Td>
              </>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
      {showValue && report.summary.inventoryValue !== null && (
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td>
              <Text size="sm" fw={700}>
                {t('balances.totalValue')}
              </Text>
            </Table.Td>
            <Table.Td colSpan={labelSpan} />
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
