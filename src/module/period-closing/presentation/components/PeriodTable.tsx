import {
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Tabs,
  Text,
} from '@mantine/core';
import {
  IconBook2,
  IconCalendarOff,
  IconLock,
  IconListDetails,
  IconSearch,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type {
  AccountingPeriod,
  PeriodPagination,
  PeriodStatusFilter,
  PeriodType,
} from '@/module/period-closing/domain/accountingPeriod';
import type { PeriodAccess } from '@/module/period-closing/presentation/hooks/usePeriodAccess';
import type { PeriodAction } from './PeriodRowActions';
import { PeriodTableRow } from './PeriodTableRow';

const ALL = 'ALL';
const COLUMN_COUNT = 6;
const SKELETON_ROWS = 4;

export interface PeriodTableFilters {
  type: PeriodType | undefined;
  status: PeriodStatusFilter | undefined;
  setType: (type: PeriodType | undefined) => void;
  setStatus: (status: PeriodStatusFilter | undefined) => void;
  setPage: (page: number) => void;
  hasFilters: boolean;
  reset: () => void;
}

interface PeriodTableProps {
  periods: AccountingPeriod[];
  pagination: PeriodPagination | undefined;
  loading: boolean;
  filters: PeriodTableFilters;
  access: PeriodAccess;
  latestClosingId: string | undefined;
  onAction: (action: PeriodAction, period: AccountingPeriod) => void;
}

/** Type tabs, status filter, the period table and its pages, in one card. */
export function PeriodTable({
  periods,
  pagination,
  loading,
  filters,
  access,
  latestClosingId,
  onAction,
}: Readonly<PeriodTableProps>) {
  const { t } = useTranslation('periodClosing');

  const header = (label: string, minWidth: number, center = false) => (
    <Table.Th miw={minWidth} ta={center ? 'center' : undefined} style={{ whiteSpace: 'nowrap' }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
    </Table.Th>
  );

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMN_COUNT}>
            <Skeleton height={18} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (periods.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT} p={0}>
            {filters.hasFilters ? (
              <EmptyState
                title={t('empty.filteredTitle')}
                description={t('empty.filteredDescription')}
                icon={<IconSearch size={32} stroke={1.5} />}
                actionLabel={t('empty.reset')}
                onAction={filters.reset}
                py={40}
              />
            ) : (
              <EmptyState
                title={t('empty.title')}
                description={t('empty.description')}
                icon={<IconCalendarOff size={32} stroke={1.5} />}
                py={40}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }
    return periods.map((period) => (
      <PeriodTableRow
        key={period.id}
        period={period}
        access={access}
        isLatestClosing={period.id === latestClosingId}
        onAction={onAction}
      />
    ));
  };

  const total = pagination?.total ?? 0;
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, total) : 0;

  return (
    <Tabs
      value={filters.type ?? ALL}
      onChange={(value) =>
        filters.setType(value && value !== ALL ? (value as PeriodType) : undefined)
      }
      color="primary"
      variant="pills"
      radius="md"
    >
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Tabs.List>
            <Tabs.Tab value={ALL} leftSection={<IconListDetails size={16} />}>
              {t('filters.all')}
            </Tabs.Tab>
            <Tabs.Tab value="CLOSE" leftSection={<IconBook2 size={16} />}>
              {t('types.CLOSE')}
            </Tabs.Tab>
            <Tabs.Tab value="LOCK" leftSection={<IconLock size={16} />}>
              {t('types.LOCK')}
            </Tabs.Tab>
          </Tabs.List>
          <Select
            aria-label={t('filters.status')}
            w={180}
            radius="md"
            allowDeselect={false}
            value={filters.status ?? ALL}
            onChange={(value) =>
              filters.setStatus(value && value !== ALL ? (value as PeriodStatusFilter) : undefined)
            }
            data={[
              { value: ALL, label: t('filters.statusAll') },
              { value: 'active', label: t('filters.statusActive') },
              { value: 'inactive', label: t('filters.statusInactive') },
            ]}
          />
        </Group>

        <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={820}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  {header(t('table.name'), 200)}
                  {header(t('table.type'), 150)}
                  {header(t('table.range'), 200)}
                  {header(t('table.status'), 120)}
                  {header(t('table.createdBy'), 140)}
                  {header(t('table.actions'), 64, true)}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{renderBody()}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>

        {pagination && total > 0 && !loading && (
          <Group justify="space-between" wrap="wrap">
            <Text size="xs" c="dimmed">
              {t('table.showing', { from, to, total })}
            </Text>
            {pagination.totalPages > 1 && (
              <Pagination
                value={pagination.page}
                onChange={filters.setPage}
                total={pagination.totalPages}
                radius="md"
                size="sm"
                color="primary"
              />
            )}
          </Group>
        )}
      </Stack>
    </Tabs>
  );
}
