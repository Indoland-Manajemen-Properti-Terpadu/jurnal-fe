import {
  Alert,
  Anchor,
  Button,
  Group,
  Pagination,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconClipboardList, IconPlus } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { warehouseName } from '@/module/inventory/domain/stockOpname';
import type { OpnamePage } from '@/module/inventory/infrastructure/opnameApi';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { Dash } from '@/module/inventory/presentation/components/shared/DetailFrame';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import { stockTakeDetailPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { OpnameStatusBadge } from '@/module/inventory/presentation/components/stockTake/OpnameStatusBadge';
import { dateFormatV1 } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

type Props = {
  data: OpnamePage | undefined;
  pageSize: number;
  loading: boolean;
  failed: boolean;
  filtered: boolean;
  canCreate: boolean;
  onRetry: () => void;
  onCreate: () => void;
  onPageChange: (page: number) => void;
};

/** The count documents, newest first; the value of the difference is drawn only when it was sent. */
export function OpnameTable({
  data,
  pageSize,
  loading,
  failed,
  filtered,
  canCreate,
  onRetry,
  onCreate,
  onPageChange,
}: Readonly<Props>) {
  const { t } = useTranslation('stockTake');
  const navigate = useNavigate();
  const rows = data?.items ?? [];
  const total = data?.totalResults ?? 0;
  const from = total === 0 ? 0 : ((data?.page ?? 1) - 1) * pageSize + 1;
  const to = total === 0 ? 0 : from + rows.length - 1;
  const showValue = data?.canSeeValues === true;

  if (loading) {
    return (
      <Stack gap="xs">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height={20} radius="sm" />
        ))}
      </Stack>
    );
  }
  if (failed && !data) {
    return (
      <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
        <Group justify="space-between" wrap="wrap" gap="sm">
          {t('loadFailed.title')}
          <Button size="xs" variant="default" onClick={onRetry}>
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
                  title={t(filtered ? 'list.emptyFilteredTitle' : 'list.emptyTitle')}
                  description={t('list.emptyBody')}
                  icon={<IconClipboardList size={36} stroke={1.5} />}
                  actionLabel={!filtered && canCreate ? t('create') : undefined}
                  actionIcon={<IconPlus size={14} />}
                  onAction={!filtered && canCreate ? onCreate : undefined}
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
    <Stack gap="md">
      <DataTableFrame minWidth={showValue ? 940 : 820}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {columnHeader(t('list.number'))}
            {columnHeader(t('list.date'))}
            {columnHeader(t('list.warehouse'))}
            {columnHeader(t('list.status'))}
            {columnHeader(t('list.progress'))}
            {showValue && columnHeader(t('list.diffProducts'), 'right')}
            {showValue && columnHeader(t('list.diffValue'), 'right')}
            {columnHeader(t('list.createdBy'))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr
              key={row.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(stockTakeDetailPath(row.id))}
            >
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Anchor
                  component={Link}
                  to={stockTakeDetailPath(row.id)}
                  size="sm"
                  fw={600}
                  onClick={(event) => event.stopPropagation()}
                >
                  {row.number}
                </Anchor>
              </Table.Td>
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Text size="sm">{dateFormatV1(row.date, 'D MMM YYYY')}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c={row.warehouse.name ? undefined : 'dimmed'}>
                  {warehouseName(row.warehouse, t('warehouseMissing'))}
                </Text>
              </Table.Td>
              <Table.Td>
                <OpnameStatusBadge status={row.status} />
              </Table.Td>
              <Table.Td miw={150}>
                <Progress
                  value={row.total === 0 ? 0 : (row.counted / row.total) * 100}
                  size="sm"
                  radius="xl"
                  color={row.total > 0 && row.counted === row.total ? 'green' : 'primary'}
                  aria-hidden
                  maw={140}
                />
                <Text size="xs" c="dimmed" mt={4} style={{ whiteSpace: 'nowrap' }}>
                  {t('list.progressValue', { counted: row.counted, total: row.total })}
                </Text>
              </Table.Td>
              {showValue && (
                <Table.Td ta="right">
                  {row.diffProducts === 0 || row.status === 'cancelled' ? (
                    <Dash />
                  ) : (
                    <Text size="sm">{row.diffProducts}</Text>
                  )}
                </Table.Td>
              )}
              {showValue && (
                <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
                  {row.diffValue === null || row.diffValue === 0 || row.status === 'cancelled' ? (
                    <Dash />
                  ) : (
                    <Text size="sm" c={row.diffValue < 0 ? 'red.7' : undefined}>
                      {formatCurrency(row.diffValue)}
                    </Text>
                  )}
                </Table.Td>
              )}
              <Table.Td>
                <Text size="sm">{row.createdByName}</Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </DataTableFrame>
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed">
          {t('list.showing', { from, to, total })}
        </Text>
        {(data?.totalPages ?? 0) > 1 && (
          <Pagination
            total={data?.totalPages ?? 1}
            value={data?.page ?? 1}
            onChange={onPageChange}
            size="sm"
            radius="md"
          />
        )}
      </Group>
    </Stack>
  );
}
