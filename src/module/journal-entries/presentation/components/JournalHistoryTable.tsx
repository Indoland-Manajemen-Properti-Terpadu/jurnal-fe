import { useCallback, useMemo, useState } from 'react';
import { ActionIcon, Badge, Box, Group, Menu, Text, Tooltip } from '@mantine/core';
import {
  IconBan,
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconEye,
  IconNotebook,
} from '@tabler/icons-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  HISTORY_PAGE_SIZES,
  summarizeAccounts,
  type HistorySortField,
  type JournalHistoryEntry,
  type JournalHistoryFilters,
  type JournalHistoryPage,
} from '../../domain/journalHistory';
import { voidGate } from '../../domain/journalVoid';
import classes from './JournalEntryLinesPreview.module.css';
import { JournalStatusBadge } from './JournalStatusBadge';

interface Props {
  data: JournalHistoryPage | undefined;
  filters: JournalHistoryFilters;
  isLoading: boolean;
  isFetching: boolean;
  /** Whether a filter is on, so an empty result says "no match" instead of "no journals". */
  isFiltered: boolean;
  canVoid: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sortBy: HistorySortField, order: 'asc' | 'desc') => void;
  onOpen: (entry: JournalHistoryEntry) => void;
  onVoid: (entry: JournalHistoryEntry) => void;
  onResetFilters: () => void;
}

/** Column title: the same small uppercase label as the account table header. */
const head = (label: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
    {label}
  </Text>
);
const amountStyle = { fontVariantNumeric: 'tabular-nums' } as const;

const humanize = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (char) => char.toUpperCase());

function EntryLines({ entry }: Readonly<{ entry: JournalHistoryEntry }>) {
  const { t } = useTranslation('journalEntries');
  const amount = (value: number, bold = false) => (
    <Box
      className={`${classes.amount} ${value > 0 ? '' : classes.empty} ${bold ? classes.total : ''}`}
    >
      {value > 0 || bold ? formatCurrency(value) : '—'}
    </Box>
  );
  return (
    <Box className={classes.wrap}>
      <Box className={classes.card}>
        <Box className={`${classes.row} ${classes.head}`}>
          <Box className={classes.headCell}>{t('history.lineAccount')}</Box>
          <Box className={classes.headCell}>{t('history.lineDescription')}</Box>
          <Box className={`${classes.headCell} ${classes.amount}`}>{t('history.lineDebit')}</Box>
          <Box className={`${classes.headCell} ${classes.amount}`}>{t('history.lineCredit')}</Box>
        </Box>
        {entry.lines.map((line) => (
          <Box key={line.id} className={classes.row}>
            <Box className={classes.account}>
              <Box className={classes.accountName} title={line.accountName}>
                {line.accountName}
              </Box>
              <Box className={classes.accountNumber}>{line.accountNumber}</Box>
            </Box>
            <Box className={`${classes.description} ${line.description ? '' : classes.empty}`}>
              {line.description || '—'}
            </Box>
            {amount(line.debit)}
            {amount(line.credit)}
          </Box>
        ))}
        <Box className={`${classes.row} ${classes.foot}`}>
          <Box className={`${classes.total} ${classes.description}`}>{t('history.lineTotal')}</Box>
          <Box />
          {amount(entry.totalDebit, true)}
          {amount(entry.totalCredit, true)}
        </Box>
      </Box>
    </Box>
  );
}

export function JournalHistoryTable({
  data,
  filters,
  isLoading,
  isFetching,
  isFiltered,
  canVoid,
  onPageChange,
  onLimitChange,
  onSortChange,
  onOpen,
  onVoid,
  onResetFilters,
}: Readonly<Props>) {
  const { t } = useTranslation('journalEntries');
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = useCallback(
    (id: string) =>
      setExpanded((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      ),
    []
  );

  const columns = useMemo(
    () => [
      {
        accessor: 'expand',
        title: '',
        width: 44,
        render: (row: JournalHistoryEntry) => {
          const open = expanded.includes(row.id);
          const label = open ? t('history.collapse') : t('history.expand');
          return (
            <Tooltip label={label}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={label}
                aria-expanded={open}
                onClick={(event) => {
                  event.stopPropagation();
                  toggle(row.id);
                }}
              >
                {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </ActionIcon>
            </Tooltip>
          );
        },
      },
      {
        accessor: 'transactionDate',
        sortable: true,
        width: 120,
        title: head(t('history.column.date')),
        render: (row: JournalHistoryEntry) => (
          <Text fz="var(--jurnal-text-sm)">{dateFormatV1(row.transactionDate)}</Text>
        ),
      },
      {
        accessor: 'transactionNumber',
        sortable: true,
        width: 130,
        title: head(t('history.column.number')),
        render: (row: JournalHistoryEntry) => (
          <Text
            fz="var(--jurnal-text-sm)"
            fw={600}
            c="primary.6"
            style={{ textDecoration: row.status === 'VOID' ? 'line-through' : undefined }}
          >
            #{row.transactionNumber}
          </Text>
        ),
      },
      {
        accessor: 'accounts',
        title: head(t('history.column.accounts')),
        render: (row: JournalHistoryEntry) => {
          const { names, more } = summarizeAccounts(row.lines);
          return (
            <Group gap={6} wrap="nowrap">
              <Text fz="var(--jurnal-text-sm)" maw={240} truncate="end">
                {names.join(', ') || '—'}
              </Text>
              {more > 0 && (
                <Badge variant="light" color="gray" size="sm" radius="sm" style={{ flexShrink: 0 }}>
                  {t('history.accountsMore', { count: more })}
                </Badge>
              )}
            </Group>
          );
        },
      },
      {
        accessor: 'totalDebit',
        width: 150,
        textAlign: 'right' as const,
        title: head(t('history.column.total')),
        render: (row: JournalHistoryEntry) => (
          <Text fz="var(--jurnal-text-sm)" fw={600} ta="right" style={amountStyle}>
            {formatCurrency(row.totalDebit)}
          </Text>
        ),
      },
      {
        accessor: 'status',
        width: 140,
        title: head(t('history.column.status')),
        render: (row: JournalHistoryEntry) => <JournalStatusBadge status={row.status} />,
      },
      {
        accessor: 'sourceType',
        width: 130,
        title: head(t('history.column.source')),
        render: (row: JournalHistoryEntry) => (
          <Text fz="var(--jurnal-text-sm)" c="dimmed">
            {row.sourceType ? humanize(row.sourceType) : t('history.sourceOption.manual')}
          </Text>
        ),
      },
      {
        accessor: 'actions',
        width: 96,
        textAlign: 'center' as const,
        title: head(t('history.column.action')),
        render: (row: JournalHistoryEntry) => {
          // No void item at all when the entry is already void, is a reversal, the server says no,
          // or the person lacks the delete right: the detail page explains why.
          const mayVoid = canVoid && voidGate(row).allowed;
          return (
            <Menu position="bottom-end" shadow="md" radius="md" width={220} withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label={t('history.actions')}
                  onClick={(event) => event.stopPropagation()}
                >
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
                <Menu.Item leftSection={<IconEye size={16} />} onClick={() => onOpen(row)}>
                  {t('history.view')}
                </Menu.Item>
                {mayVoid && (
                  <Menu.Item
                    color="red"
                    leftSection={<IconBan size={16} />}
                    onClick={() => onVoid(row)}
                  >
                    {t('history.void')}
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          );
        },
      },
    ],
    [expanded, canVoid, t, onOpen, onVoid, toggle]
  );

  const sortStatus: DataTableSortStatus<JournalHistoryEntry> = {
    columnAccessor: filters.sortBy,
    direction: filters.order,
  };

  return (
    <DataTable<JournalHistoryEntry>
      className={classes.table}
      withTableBorder
      borderRadius="md"
      styles={{ header: { backgroundColor: 'var(--mantine-color-gray-0)' } }}
      highlightOnHover
      verticalAlign="center"
      minHeight={data && data.entries.length === 0 ? 340 : 180}
      idAccessor="id"
      columns={columns}
      records={data?.entries ?? []}
      fetching={isLoading || isFetching}
      totalRecords={data?.total ?? 0}
      recordsPerPage={filters.limit}
      page={data?.page ?? filters.page}
      onPageChange={onPageChange}
      recordsPerPageOptions={[...HISTORY_PAGE_SIZES]}
      onRecordsPerPageChange={onLimitChange}
      recordsPerPageLabel={t('entriesTable.perPage')}
      paginationText={({ from, to, totalRecords }) =>
        t('history.paginationText', { from, to, total: totalRecords })
      }
      sortStatus={sortStatus}
      onSortStatusChange={({ columnAccessor, direction }) =>
        onSortChange(columnAccessor as HistorySortField, direction)
      }
      onRowClick={({ record }) => onOpen(record)}
      rowExpansion={{
        allowMultiple: true,
        trigger: 'never',
        expanded: { recordIds: expanded, onRecordIdsChange: setExpanded },
        content: ({ record }) => <EntryLines entry={record} />,
      }}
      noRecordsText=""
      emptyState={
        <EmptyState
          icon={<IconNotebook size={32} stroke={1.6} />}
          title={isFiltered ? t('history.noMatchTitle') : t('history.emptyTitle')}
          description={isFiltered ? t('history.noMatchDescription') : t('history.emptyDescription')}
          actionLabel={isFiltered ? t('history.resetFilters') : undefined}
          onAction={onResetFilters}
        />
      }
    />
  );
}
