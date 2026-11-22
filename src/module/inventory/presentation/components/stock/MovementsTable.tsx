import { Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { StockMovement } from '@/module/inventory/domain/stockMovement';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import {
  DocumentNumber,
  JournalLink,
  UnitCost,
  useMovementTypeLabel,
} from '@/module/inventory/presentation/components/shared/documentCells';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  rows: StockMovement[];
  /** False when the service sends no values to this person. */
  showValue: boolean;
  /** Inside one document every row has the same number and no journal: leave those columns out. */
  withinDocument?: boolean;
};

/** The ledger rows: what moved, where, at what price, and which journal it posted. */
export function MovementsTable({ rows, showValue, withinDocument = false }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const typeLabel = useMovementTypeLabel();

  return (
    <DataTableFrame minWidth={1040}>
      <Table.Thead bg="gray.0">
        <Table.Tr>
          {columnHeader(t('history.date'))}
          {!withinDocument && columnHeader(t('history.document'))}
          {columnHeader(t('history.type'))}
          {columnHeader(t('history.product'))}
          {columnHeader(t('history.warehouse'))}
          {columnHeader(t('history.in'), 'right')}
          {columnHeader(t('history.out'), 'right')}
          {showValue && columnHeader(t('history.unitCost'), 'right')}
          {showValue && columnHeader(t('history.value'), 'right')}
          {!withinDocument && columnHeader(t('history.journal'), 'center')}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.id}>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{dateFormatV1(row.date, 'D MMM YYYY')}</Text>
            </Table.Td>
            {!withinDocument && (
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <DocumentNumber
                  sourceType={row.sourceType}
                  sourceId={row.sourceId}
                  number={row.documentNumber}
                />
              </Table.Td>
            )}
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{typeLabel(row.type, row.typeLabel)}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" fw={600} c="dark.8">
                {row.productName || '-'}
              </Text>
              {row.sku && (
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {row.sku}
                </Text>
              )}
            </Table.Td>
            <Table.Td style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{row.warehouse.name}</Text>
            </Table.Td>
            <Table.Td ta="right">
              {row.quantityIn > 0 ? (
                <Text size="sm" fw={600} c="green.8">
                  {numberFormat(row.quantityIn)}
                </Text>
              ) : (
                <Dash />
              )}
            </Table.Td>
            <Table.Td ta="right">
              {row.quantityOut > 0 ? (
                <Text size="sm" fw={600} c="dark.8">
                  {numberFormat(row.quantityOut)}
                </Text>
              ) : (
                <Dash />
              )}
            </Table.Td>
            {showValue && (
              <>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <UnitCost amount={row.unitCost} breakdown={row.costBreakdown} />
                </Table.Td>
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm" fw={600}>
                    {row.value === null ? '-' : formatCurrency(row.value)}
                  </Text>
                </Table.Td>
              </>
            )}
            {!withinDocument && (
              <Table.Td ta="center" style={{ whiteSpace: 'nowrap' }}>
                <JournalLink journalId={row.journalId} />
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </DataTableFrame>
  );
}
