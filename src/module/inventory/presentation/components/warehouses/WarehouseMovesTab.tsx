import { Alert, Anchor, Button, Group, Paper, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconAlertCircle, IconArrowsLeftRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { historyPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { MovementsTable } from '@/module/inventory/presentation/components/stock/MovementsTable';
import { useMovements } from '@/module/inventory/presentation/hooks/useStockQueries';

const LATEST = 20;

type Props = {
  warehouseId: string;
  /** False when the service sends no values to this person. */
  showValue: boolean;
};

/** The latest movements here: the same ledger and the same table as Stock Movements, for one warehouse. */
export function WarehouseMovesTab({ warehouseId, showValue }: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const { t: ts } = useTranslation('stockMovements');
  const movements = useMovements({ warehouse: warehouseId, limit: LATEST });
  const rows = movements.data?.items ?? [];

  const renderBody = () => {
    if (movements.isLoading) {
      return (
        <Stack gap="xs">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={20} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (movements.isError && rows.length === 0) {
      return (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">{t('loadFailed.title')}</Text>
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
                    title={t('detail.moves.empty')}
                    description=""
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
    return (
      <MovementsTable rows={rows} showValue={showValue && rows.some((row) => row.value !== null)} />
    );
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          {t('detail.moves.description')}
        </Text>
        <Anchor component={Link} to={historyPath({ warehouse: warehouseId })} size="sm">
          {t('detail.moves.viewAll')}
        </Anchor>
      </Group>
      {renderBody()}
      <Text size="xs" c="dimmed">
        {ts('immutable')}
      </Text>
    </Stack>
  );
}
