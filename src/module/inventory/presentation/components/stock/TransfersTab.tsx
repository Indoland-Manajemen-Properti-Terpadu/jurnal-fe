import type { ReactNode } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import { IconAlertCircle, IconPlus, IconTransfer } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import {
  transferDetailPath,
  transferNewPath,
} from '@/module/inventory/presentation/components/shared/stockLinks';
import type { StockFilterValues } from '@/module/inventory/presentation/components/stock/stockFilters';
import {
  useStockRights,
  useTransfers,
} from '@/module/inventory/presentation/hooks/useStockQueries';
import { dateFormatV1 } from '@/utils/formatDate';

const PAGE_SIZE = 10;

type Props = {
  filters: StockFilterValues;
  update: (patch: Partial<StockFilterValues>) => void;
  tabList: ReactNode;
};

/** The transfer documents (PDH): where stock went from one warehouse to another. */
export function TransfersTab({ filters, update, tabList }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const navigate = useNavigate();
  const { transfer: rights } = useStockRights();
  const transfers = useTransfers({
    page: filters.transferPage,
    limit: PAGE_SIZE,
    status: filters.transferStatus || undefined,
    warehouse: filters.warehouse || undefined,
  });
  const { data } = transfers;
  const rows = data?.items ?? [];
  const total = data?.totalResults ?? 0;
  const from = total === 0 ? 0 : ((data?.page ?? 1) - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : from + rows.length - 1;
  const filtered = filters.transferStatus !== '' || filters.warehouse !== '';

  const renderBody = () => {
    if (transfers.isLoading) {
      return (
        <Stack gap="xs">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} height={20} radius="sm" />
          ))}
        </Stack>
      );
    }
    if (transfers.isError && !data) {
      return (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            {t('loadFailed.title')}
            <Button size="xs" variant="default" onClick={() => transfers.refetch()}>
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
                    title={t(filtered ? 'transfers.emptyFilteredTitle' : 'transfers.emptyTitle')}
                    description={t('transfers.emptyBody')}
                    icon={<IconTransfer size={36} stroke={1.5} />}
                    actionLabel={!filtered && rights.create ? t('transfers.create') : undefined}
                    actionIcon={<IconPlus size={14} />}
                    onAction={
                      !filtered && rights.create ? () => navigate(transferNewPath()) : undefined
                    }
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
      <DataTableFrame minWidth={720}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {columnHeader(t('transfers.number'))}
            {columnHeader(t('transfers.date'))}
            {columnHeader(t('transfers.from'))}
            {columnHeader(t('transfers.to'))}
            {columnHeader(t('transfers.products'), 'right')}
            {columnHeader(t('transfers.statusColumn'))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr
              key={row.id}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(transferDetailPath(row.id))}
            >
              <Table.Td style={{ whiteSpace: 'nowrap' }}>
                <Anchor
                  component={Link}
                  to={transferDetailPath(row.id)}
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
                <Text size="sm">{row.from.name}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{row.to.name}</Text>
              </Table.Td>
              <Table.Td ta="right">
                <Text size="sm">{row.productCount}</Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color={row.status === 'posted' ? 'green' : 'gray'} size="sm">
                  {t(row.status === 'posted' ? 'transfers.posted' : 'transfers.void')}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </DataTableFrame>
    );
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white">
      <Stack gap="md">
        {tabList}
        <Group gap="sm" wrap="wrap">
          <Select
            aria-label={t('transfers.statusColumn')}
            placeholder={t('transfers.allStatuses')}
            data={[
              { value: 'POSTED', label: t('transfers.posted') },
              { value: 'VOID', label: t('transfers.void') },
            ]}
            value={filters.transferStatus || null}
            onChange={(value) =>
              update({ transferStatus: (value as 'POSTED' | 'VOID' | null) ?? '' })
            }
            clearable
            radius="md"
            w={{ base: '100%', sm: 220 }}
          />
        </Group>
        {renderBody()}
        {data && data.totalResults > 0 && (
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm" c="dimmed">
              {t('transfers.showing', { from, to, total })}
            </Text>
            {data.totalPages > 1 && (
              <Pagination
                total={data.totalPages}
                value={data.page}
                onChange={(page) => update({ transferPage: page })}
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
