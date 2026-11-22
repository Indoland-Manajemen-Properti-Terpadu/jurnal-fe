import { Alert, Anchor, Button, Group, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowsLeftRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { DataTableFrame } from '@/module/inventory/presentation/components/warehouses/DataTableFrame';
import type { WarehouseMove } from '@/module/inventory/domain/warehouse';
import { routes } from '@/router/routes';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  moves: WarehouseMove[];
  loading: boolean;
  failed: boolean;
  showValue: boolean;
  onRetry: () => void;
};

const header = (label: string, align?: 'right') => (
  <Table.Th ta={align} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

/** The latest movements here; the same ledger as Stock Movements, filtered to this warehouse. */
export function WarehouseMovesTab({ moves, loading, failed, showValue, onRetry }: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const columnCount = showValue ? 8 : 6;

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
    if (failed && moves.length === 0) {
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
    if (moves.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columnCount} p={0}>
            <EmptyState
              title={t('detail.moves.empty')}
              icon={<IconArrowsLeftRight size={36} stroke={1.5} />}
              description=""
              py={40}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    return moves.map((move) => (
      <Table.Tr key={move.id}>
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm">{move.date ? dateFormatV1(move.date, 'D MMM YYYY') : '-'}</Text>
        </Table.Td>
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" fw={500}>
            {move.documentNumber || '-'}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{move.typeLabel}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{move.productName || '-'}</Text>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" c={move.quantityIn > 0 ? 'green.8' : 'dimmed'}>
            {numberFormat(move.quantityIn)}
          </Text>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" c={move.quantityOut > 0 ? 'red.7' : 'dimmed'}>
            {numberFormat(move.quantityOut)}
          </Text>
        </Table.Td>
        {showValue && (
          <>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{move.unitCost === null ? '-' : formatCurrency(move.unitCost)}</Text>
            </Table.Td>
            <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
              <Text size="sm">{move.value === null ? '-' : formatCurrency(move.value)}</Text>
            </Table.Td>
          </>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          {t('detail.moves.description')}
        </Text>
        <Anchor component={Link} to={routes.inventory.stockMovements} size="sm">
          {t('detail.moves.viewAll')}
        </Anchor>
      </Group>
      <DataTableFrame minWidth={760}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {header(t('detail.moves.date'))}
            {header(t('detail.moves.document'))}
            {header(t('detail.moves.type'))}
            {header(t('detail.moves.product'))}
            {header(t('detail.moves.in'), 'right')}
            {header(t('detail.moves.out'), 'right')}
            {showValue && header(t('detail.moves.unitCost'), 'right')}
            {showValue && header(t('detail.moves.value'), 'right')}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderBody()}</Table.Tbody>
      </DataTableFrame>
    </Stack>
  );
}
