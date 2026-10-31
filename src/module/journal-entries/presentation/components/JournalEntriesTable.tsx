import { Text, Anchor, Group, Badge, ActionIcon, Tooltip } from '@mantine/core';
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

  const columns = [
    {
      accessor: 'transactionNumber',
      title: <Text style={headTableStyle}>{t('entriesTable.number')}</Text>,
      render: (row: JournalEntryByAccount) => (
        <Group gap="xs" wrap="nowrap">
          {row.transactionNumber === 0 ? (
            <Badge color="gray" variant="light" size="sm">
              {t('entriesTable.openingBalance')}
            </Badge>
          ) : (
            <Anchor
              underline="hover"
              fw={600}
              c="primary.6"
              fz="var(--jurnal-text-sm)"
              onClick={() =>
                navigate(
                  routes.generalJournal.detailTransactionJournal.replace(':idTransaction', row.id)
                )
              }
            >
              {t('entriesTable.entryLink', { number: row.transactionNumber })}
            </Anchor>
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
      accessor: 'contact',
      title: <Text style={headTableStyle}>{t('entriesTable.contact')}</Text>,
      render: () => (
        <Text c="dimmed" fz="var(--jurnal-text-sm)">
          -
        </Text>
      ),
    },
    {
      accessor: 'debit',
      title: t('entriesTable.debit'),
      textAlignment: 'right' as const,
      width: 170,
      titleStyle: { textAlign: 'right' as const },
      render: (row: JournalEntryByAccount) => (
        <Text
          c={row.debit && row.debit > 0 ? 'teal.7' : 'dimmed'}
          fw={row.debit && row.debit > 0 ? 600 : 400}
          fz="var(--jurnal-text-sm)"
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(row.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'credit',
      title: t('entriesTable.credit'),
      textAlignment: 'right' as const,
      width: 170,
      titleStyle: { textAlign: 'right' as const },
      render: (row: JournalEntryByAccount) => (
        <Text
          c={row.credit && row.credit > 0 ? 'red.7' : 'dimmed'}
          fw={row.credit && row.credit > 0 ? 600 : 400}
          fz="var(--jurnal-text-sm)"
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(row.credit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'status',
      title: t('entriesTable.runningBalance'),
      textAlignment: 'right' as const,
      width: 190,
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
      width: 70,
      render: (row: JournalEntryByAccount) => (
        <Group justify="center">
          <Tooltip label={t('entriesTable.viewTooltip')}>
            <ActionIcon
              variant="subtle"
              color="primary"
              size="sm"
              radius="md"
              onClick={() =>
                navigate(
                  routes.generalJournal.detailTransactionJournal.replace(':idTransaction', row.id)
                )
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

  return (
    <DataTable
      withTableBorder
      borderRadius="md"
      highlightOnHover
      columns={columns}
      selectedRecords={selectedRecords}
      onSelectedRecordsChange={setSelectedRecords}
      records={searchAndFilterTransaction || []}
      isRecordSelectable={(row: JournalEntryByAccount) => row.transactionNumber !== 0}
      noRecordsText={t('entriesTable.noMatch')}
      verticalSpacing="sm"
    />
  );
}

export default JournalEntriesTable;
