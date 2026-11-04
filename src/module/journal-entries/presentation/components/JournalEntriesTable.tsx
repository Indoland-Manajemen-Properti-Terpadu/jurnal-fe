import { useEffect, useState } from 'react';
import { Text, Anchor, Group, ActionIcon, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/formatCurrency';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router/routes';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { dateFormatV1 } from '@/utils/formatDate';
import { IconEye } from '@tabler/icons-react';
import useFilterTransaction from '../store/useFilterTransactionStore';
import type { JournalEntryByAccount } from '../../domain/journalEntry';
import { filterEntries } from '../../domain/entryFilter';
import { voidGate } from '../../domain/journalVoid';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS, paginate } from '../../domain/paginate';

interface JournalEntriesTableProps {
  selectedRecords: JournalEntryByAccount[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<JournalEntryByAccount[]>>;
  noRecordsContent?: React.ReactNode;
  data: JournalEntryByAccount[] | undefined;
}

const headTableStyle = {
  fontSize: 'var(--jurnal-text-sm)',
  fontWeight: 600,
  color: themeColors.black[9],
};

function JournalEntriesTable({
  selectedRecords,
  setSelectedRecords,
  noRecordsContent,
  data: transaction,
}: JournalEntriesTableProps) {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const { searchQuery, selectedDate } = useFilterTransaction();

  const searchAndFilterTransaction = transaction
    ? filterEntries(transaction, searchQuery, selectedDate)
    : undefined;

  // The server answers the whole list; the table only shows a page of it at a time.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const filtered = searchAndFilterTransaction ?? [];
  const paged = paginate(filtered, page, pageSize);
  const showPagination = filtered.length > PAGE_SIZE_OPTIONS[0];

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedDate, pageSize]);

  const columns = [
    {
      accessor: 'transactionNumber',
      width: 260,
      title: <Text style={headTableStyle}>{t('entriesTable.number')}</Text>,
      render: (row: JournalEntryByAccount) => (
        <Group gap="xs" wrap="nowrap">
          {row.transactionNumber === 0 ? (
            <Text c="dimmed" fz="var(--jurnal-text-sm)" fw={500}>
              {t('entriesTable.openingBalance')}
            </Text>
          ) : (
            <Anchor
              underline="hover"
              fw={600}
              c="primary.6"
              fz="var(--jurnal-text-sm)"
              style={{
                whiteSpace: 'nowrap',
                textDecoration: row.status === 'VOID' ? 'line-through' : undefined,
              }}
              onClick={() =>
                navigate(routes.journalEntries.detail.replace(':idTransaction', row.id))
              }
            >
              {t('entriesTable.entryLink', { number: row.transactionNumber })}
            </Anchor>
          )}
          {row.status === 'VOID' && (
            <Text c="red.7" fz="var(--jurnal-text-xs)" fw={600}>
              {t('entriesTable.statusVoid')}
            </Text>
          )}
          {row.status === 'REVERSAL' && (
            <Text c="dimmed" fz="var(--jurnal-text-xs)" fw={600}>
              {t('entriesTable.statusReversal')}
            </Text>
          )}
        </Group>
      ),
    },
    {
      accessor: 'transactionDate',
      title: <Text style={headTableStyle}>{t('entriesTable.date')}</Text>,
      render: (row: JournalEntryByAccount) => (
        <Text c="dark.7" fz="var(--jurnal-text-sm)">
          {dateFormatV1(row.transactionDate)}
        </Text>
      ),
    },
    {
      accessor: 'notes',
      title: <Text style={headTableStyle}>{t('entriesTable.notes')}</Text>,
      render: (row: JournalEntryByAccount) => (
        <Text
          c={row.notes ? 'dark.7' : 'dimmed'}
          fz="var(--jurnal-text-sm)"
          w={120}
          truncate="end"
          title={row.notes || undefined}
        >
          {row.notes || '—'}
        </Text>
      ),
    },
    {
      accessor: 'debit',
      title: t('entriesTable.debit'),
      textAlignment: 'right' as const,
      width: 140,
      titleStyle: { textAlign: 'right' as const },
      render: (row: JournalEntryByAccount) => (
        <Text
          c={row.debit && row.debit > 0 ? 'dark.8' : 'dimmed'}
          fw={row.debit && row.debit > 0 ? 600 : 400}
          fz="var(--jurnal-text-sm)"
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {row.debit && row.debit > 0 ? formatCurrency(row.debit) : '—'}
        </Text>
      ),
    },
    {
      accessor: 'credit',
      title: t('entriesTable.credit'),
      textAlignment: 'right' as const,
      width: 140,
      titleStyle: { textAlign: 'right' as const },
      render: (row: JournalEntryByAccount) => (
        <Text
          c={row.credit && row.credit > 0 ? 'dark.8' : 'dimmed'}
          fw={row.credit && row.credit > 0 ? 600 : 400}
          fz="var(--jurnal-text-sm)"
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {row.credit && row.credit > 0 ? formatCurrency(row.credit) : '—'}
        </Text>
      ),
    },
    {
      accessor: 'status',
      title: t('entriesTable.runningBalance'),
      textAlignment: 'right' as const,
      width: 160,
      titleStyle: { textAlign: 'right' as const },
      render: (row: JournalEntryByAccount) => {
        const bal = row.balance ?? 0;
        return (
          <Text
            c="dark.8"
            fw={700}
            fz="var(--jurnal-text-sm)"
            ta="right"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {bal >= 0 ? formatCurrency(bal) : `(${formatCurrency(Math.abs(bal))})`}
          </Text>
        );
      },
    },
    {
      accessor: 'aksi',
      title: t('entriesTable.action'),
      textAlignment: 'center' as const,
      titleStyle: { textAlign: 'center' as const },
      width: 84,
      render: (row: JournalEntryByAccount) => (
        <Group justify="center">
          <Tooltip label={t('entriesTable.viewTooltip')}>
            <ActionIcon
              variant="subtle"
              color="primary"
              size="sm"
              radius="md"
              onClick={() =>
                navigate(routes.journalEntries.detail.replace(':idTransaction', row.id))
              }
            >
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  if (!transaction || transaction.length === 0) {
    return <>{noRecordsContent || <EmptyState />}</>;
  }

  const common = {
    withTableBorder: true,
    borderRadius: 'md' as const,
    highlightOnHover: true,
    columns,
    selectedRecords,
    onSelectedRecordsChange: setSelectedRecords,
    records: paged.rows,
    isRecordSelectable: (row: JournalEntryByAccount) =>
      row.transactionNumber !== 0 && voidGate(row).allowed,
    noRecordsText: t('entriesTable.noMatch'),
    verticalSpacing: 'sm' as const,
  };

  if (!showPagination) return <DataTable {...common} />;

  return (
    <DataTable
      {...common}
      totalRecords={filtered.length}
      page={paged.page}
      onPageChange={setPage}
      recordsPerPage={pageSize}
      recordsPerPageOptions={PAGE_SIZE_OPTIONS}
      onRecordsPerPageChange={setPageSize}
      recordsPerPageLabel={t('entriesTable.perPage')}
      paginationText={({ from, to, totalRecords }) =>
        t('entriesTable.paginationText', { from, to, total: totalRecords })
      }
    />
  );
}

export default JournalEntriesTable;
