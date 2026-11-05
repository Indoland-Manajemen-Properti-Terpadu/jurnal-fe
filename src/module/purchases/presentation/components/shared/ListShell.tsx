import type { ReactNode } from 'react';
import {
  Group,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';

export interface ListColumn {
  key: string;
  label: string;
  align?: 'right';
  minWidth?: number;
}

interface ListShellProps<T> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  statusValue: string;
  onStatusChange: (value: string | null) => void;
  statusOptions: { value: string; label: string }[];
  /** Extra filters shown after the status select. */
  filters?: ReactNode;
  columns: ListColumn[];
  rows: T[] | undefined;
  getKey: (row: T) => string;
  /** The `Table.Td` cells of a row. */
  renderCells: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isFiltered: boolean;
  onResetFilters: () => void;
  page: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  empty: {
    title: string;
    description: string;
    icon: ReactNode;
    actionLabel?: string;
    onAction?: () => void;
  };
}

const SKELETON_ROWS = 6;

/** Search, status filter, table frame and pagination of one purchasing list. */
export function ListShell<T>({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  statusValue,
  onStatusChange,
  statusOptions,
  filters,
  columns,
  rows,
  getKey,
  renderCells,
  onRowClick,
  isLoading,
  isError,
  onRetry,
  isFiltered,
  onResetFilters,
  page,
  totalPages,
  totalResults,
  onPageChange,
  empty,
}: Readonly<ListShellProps<T>>) {
  const { t } = useTranslation('purchases');
  const span = columns.length;

  const body = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={span}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (isError) {
      return (
        <Table.Tr>
          <Table.Td colSpan={span} p={0}>
            <EmptyState
              icon={<IconAlertCircle size={32} stroke={1.6} />}
              color="red"
              title={t('list.errorTitle')}
              description={t('list.errorDescription')}
              actionLabel={t('common.retry')}
              onAction={onRetry}
            />
          </Table.Td>
        </Table.Tr>
      );
    }
    if (!rows || rows.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={span} p={0}>
            {isFiltered ? (
              <EmptyState
                icon={<IconSearch size={32} stroke={1.6} />}
                title={t('list.noMatchTitle')}
                description={t('list.noMatchDescription')}
                actionLabel={t('list.resetFilters')}
                onAction={onResetFilters}
              />
            ) : (
              <EmptyState
                icon={empty.icon}
                title={empty.title}
                description={empty.description}
                actionLabel={empty.actionLabel}
                onAction={empty.onAction}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }
    return rows.map((row) => (
      <Table.Tr
        key={getKey(row)}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        style={onRowClick ? { cursor: 'pointer' } : undefined}
      >
        {renderCells(row)}
      </Table.Tr>
    ));
  };

  return (
    <Stack gap="md">
      <Group gap="sm" align="flex-end" wrap="wrap">
        <TextInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          radius="md"
          style={{ flex: '1 1 260px', maxWidth: 420 }}
        />
        <Select
          value={statusValue || null}
          onChange={onStatusChange}
          data={statusOptions}
          placeholder={t('list.allStatuses')}
          aria-label={t('list.statusFilter')}
          clearable
          radius="md"
          w={220}
        />
        {filters}
        {totalResults > 0 && (
          <Text size="sm" c="dimmed" ml="auto" pb={8}>
            {t('list.total', { count: totalResults })}
          </Text>
        )}
      </Group>

      <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover={Boolean(onRowClick)}>
            <Table.Thead bg="var(--jurnal-color-surface-hover)">
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    ta={column.align}
                    miw={column.minWidth}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {column.label}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{body()}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {totalPages > 1 && (
        <Group justify="flex-end">
          <Pagination
            value={page}
            onChange={onPageChange}
            total={totalPages}
            radius="md"
            size="sm"
          />
        </Group>
      )}
    </Stack>
  );
}
