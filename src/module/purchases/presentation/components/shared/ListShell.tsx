import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import type { ReactNode } from 'react';
import {
  ActionIcon,
  Box,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconAlertCircle, IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';

export interface ListColumn {
  key: string;
  label: string;
  align?: 'right';
  minWidth?: number;
}

export interface RowAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
}

const PAGE_SIZES = ['10', '20', '50'];

interface ListShellProps<T> {
  summary?: ReactNode;
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
  /** What the rows are, for the footer: "permintaan", "faktur". */
  noun: string;
  limit: number;
  onLimitChange: (limit: number) => void;
  /** The menu of the Aksi column; leave it out and the column is not shown. */
  rowActions?: (row: T) => RowAction[];
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
  summary,
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
  noun,
  limit,
  onLimitChange,
  rowActions,
  empty,
}: Readonly<ListShellProps<T>>) {
  const { t } = useTranslation('purchases');
  const span = columns.length + (rowActions ? 1 : 0);
  const from = totalResults === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalResults);

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
        {rowActions && (
          <Table.Td w={64} ta="center" onClick={(event) => event.stopPropagation()}>
            <Menu position="bottom-end" withinPortal shadow="md" radius="md">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label={t('list.actions')}>
                  <IconDotsVertical size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {rowActions(row).map((action) => (
                  <Menu.Item
                    key={action.label}
                    leftSection={action.icon}
                    color={action.color}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </Table.Td>
        )}
      </Table.Tr>
    ));
  };

  return (
    <Stack gap="lg">
      {summary}
      <Paper withBorder radius="lg" p={0} bg="white" style={{ overflow: 'hidden' }}>
        <Group
          gap="sm"
          align="center"
          wrap="wrap"
          p="md"
          bg="var(--jurnal-color-surface-muted)"
          style={{ borderBottom: '1px solid var(--jurnal-color-border-subtle)' }}
        >
          <TextInput
            value={searchValue}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            radius="md"
            style={{ flex: '1 1 260px', maxWidth: 420 }}
          />
          {statusOptions.length > 0 && (
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
          )}
          {filters}
        </Group>

        <Box p="md">
          <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
            <Table.ScrollContainer type="native" minWidth={760}>
              <Table
                className={tableClasses.table}
                verticalSpacing="sm"
                horizontalSpacing="md"
                highlightOnHover={Boolean(onRowClick)}
              >
                <Table.Thead bg="var(--jurnal-color-surface-muted)">
                  <Table.Tr>
                    {columns.map((column) => (
                      <Table.Th
                        key={column.key}
                        ta={column.align}
                        miw={column.minWidth}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <Text size="xs" fw={700} c="dark.7" tt="uppercase">
                          {column.label}
                        </Text>
                      </Table.Th>
                    ))}
                    {rowActions && (
                      <Table.Th ta="center" w={64}>
                        <Text size="xs" fw={700} c="dark.7" tt="uppercase">
                          {t('list.actionsColumn')}
                        </Text>
                      </Table.Th>
                    )}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{body()}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {totalResults > 0 && (
              <Group
                justify="space-between"
                align="center"
                wrap="wrap"
                gap="sm"
                px="md"
                py="sm"
                style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
              >
                <Text size="xs" c="dimmed">
                  {t('list.showing', { from, to, total: totalResults, noun })}
                </Text>
                <Group gap="sm" wrap="nowrap">
                  <Select
                    value={String(limit)}
                    onChange={(value) => value && onLimitChange(Number(value))}
                    data={PAGE_SIZES.map((size) => ({
                      value: size,
                      label: t('list.perPage', { count: size }),
                    }))}
                    allowDeselect={false}
                    aria-label={t('list.perPageAria')}
                    radius="md"
                    size="xs"
                    w={96}
                  />
                  {totalPages > 1 && (
                    <Pagination
                      value={page}
                      onChange={onPageChange}
                      total={totalPages}
                      radius="md"
                      size="sm"
                    />
                  )}
                </Group>
              </Group>
            )}
          </Paper>
        </Box>
      </Paper>
    </Stack>
  );
}
