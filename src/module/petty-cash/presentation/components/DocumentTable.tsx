import type { KeyboardEvent, ReactNode } from 'react';
import { Group, Pagination, Paper, Skeleton, Stack, Table, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import classes from '@/module/petty-cash/presentation/components/DocumentTable.module.css';

export interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right';
  /** Figures: right aligned, digits lined up. */
  numeric?: boolean;
}

interface Props<T> {
  /** Filters of the list, left of the count. */
  filters: ReactNode;
  /** "12 vouchers", or another short summary; shown once the list has loaded. */
  countLabel?: ReactNode;
  /** The tab's create action, right of the count. */
  action?: ReactNode;
  columns: Column[];
  items: T[] | undefined;
  rowKey: (item: T) => string;
  /** Accessible name of a row, read when it receives focus. Only for rows that open something. */
  rowLabel?: (item: T) => string;
  /** Without it the rows are plain (for example cash book entries, which have no detail). */
  onOpen?: (item: T) => void;
  cells: (item: T) => ReactNode[];
  minWidth: number;
  loading: boolean;
  fetching: boolean;
  stale: boolean;
  error: { title: string; error: unknown; onRetry: () => void } | null;
  empty: {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  /** A totals bar inside the card, under the rows (reports). */
  footer?: ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    totalResults: number;
    limit: number;
    onChange: (page: number) => void;
  };
}

/**
 * The list frame every petty cash tab shares, so vouchers, cash counts, replenishments and advances
 * look and behave alike: filters and the create action above, a quiet header, whole rows that open
 * the document (mouse or Enter), and paging inside the card. The table keeps its shell when empty.
 */
export function DocumentTable<T>({
  filters,
  countLabel,
  action,
  columns,
  items,
  rowKey,
  rowLabel,
  onOpen,
  cells,
  minWidth,
  loading,
  fetching,
  stale,
  error,
  empty,
  footer,
  pagination,
}: Readonly<Props<T>>) {
  const { t } = useTranslation('pettyCash');
  const span = columns.length;
  const alignOf = (column: Column) => (column.numeric ? 'right' : (column.align ?? 'left'));
  const onKey = (event: KeyboardEvent, item: T) => {
    if (onOpen && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onOpen(item);
    }
  };
  const first = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const last = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.totalResults)
    : 0;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" gap="sm" wrap="wrap">
        <Group gap="sm" wrap="wrap" align="center" style={{ flex: 1 }}>
          {filters}
        </Group>
        <Group gap="md" wrap="nowrap">
          {countLabel && (
            <Text size="xs" c="dimmed" aria-live="polite" component="div">
              {countLabel}
            </Text>
          )}
          {action}
        </Group>
      </Group>

      {error && <QueryErrorState title={error.title} error={error.error} onRetry={error.onRetry} />}

      <Paper
        withBorder
        radius="md"
        bg="white"
        p={0}
        className={classes.frame}
        data-stale={stale ? 'true' : undefined}
        aria-busy={fetching}
      >
        <Table.ScrollContainer minWidth={minWidth}>
          <Table verticalSpacing="md" horizontalSpacing="md" withRowBorders={false}>
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th key={column.key} className={classes.th} ta={alignOf(column)}>
                    {column.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading &&
                Array.from({ length: 4 }, (_, index) => (
                  <Table.Tr key={`loading-${index}`}>
                    <Table.Td colSpan={span} className={classes.td}>
                      <Skeleton height={18} radius="sm" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              {items?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={span}>
                    <EmptyState {...empty} />
                  </Table.Td>
                </Table.Tr>
              )}
              {items?.map((item) => (
                <Table.Tr
                  key={rowKey(item)}
                  className={onOpen ? classes.row : undefined}
                  tabIndex={onOpen ? 0 : undefined}
                  aria-label={onOpen && rowLabel ? rowLabel(item) : undefined}
                  onClick={onOpen ? () => onOpen(item) : undefined}
                  onKeyDown={onOpen ? (event) => onKey(event, item) : undefined}
                >
                  {cells(item).map((cell, index) => {
                    const column = columns[index];
                    return (
                      <Table.Td
                        key={column.key}
                        ta={alignOf(column)}
                        className={column.numeric ? `${classes.td} ${classes.num}` : classes.td}
                      >
                        {cell}
                      </Table.Td>
                    );
                  })}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {footer && items && items.length > 0 && (
          <Group justify="flex-end" gap="xl" px="md" py="sm" bg="gray.0" className={classes.footer}>
            {footer}
          </Group>
        )}
        {pagination && pagination.totalPages > 1 && (
          <Group justify="space-between" align="center" px="md" py="sm" className={classes.footer}>
            <Text size="xs" c="dimmed">
              {t('common.showing', { from: first, to: last, total: pagination.totalResults })}
            </Text>
            <Pagination
              value={pagination.page}
              onChange={pagination.onChange}
              total={pagination.totalPages}
              size="sm"
            />
          </Group>
        )}
      </Paper>
    </Stack>
  );
}

/** The document number in the first column: the row is already the link, so this is plain text. */
export function DocumentNumber({ number, tag }: Readonly<{ number: string; tag?: ReactNode }>) {
  return (
    <Stack gap={2}>
      <Text size="sm" fw={600} c="primary.7">
        {number}
      </Text>
      {tag}
    </Stack>
  );
}

/** Two lines in one cell: the main value and a dimmed detail beneath it. */
export function TwoLine({
  primary,
  secondary,
}: Readonly<{ primary: ReactNode; secondary?: ReactNode }>) {
  return (
    <Stack gap={2} miw={0}>
      <Text size="sm" c="dark.8" lineClamp={1}>
        {primary}
      </Text>
      {secondary && (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {secondary}
        </Text>
      )}
    </Stack>
  );
}

/** One figure in a totals bar: label and amount on one line. */
export function TotalFigure({ label, value }: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <Group gap={8} wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={700} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    </Group>
  );
}
