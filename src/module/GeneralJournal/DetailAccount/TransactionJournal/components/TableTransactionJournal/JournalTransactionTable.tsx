import { Text, Anchor, Group, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router/routes';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { dateFormatV1 } from '@/utils/FormatDate';
import useFilterTransaction from '../../../Main/store/FilterTransaction';
import type { TransactionByAccountModel } from '../../types/TransactionByAccountModel';
import { IconEye } from '@tabler/icons-react';

interface TableJournalTransactionProps {
  selectedRecords: TransactionByAccountModel[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
  noRecordsContent?: React.ReactNode;
  data: TransactionByAccountModel[] | undefined;
}

const headTableStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: themeColors.black[9],
};

function TableJournalTransaction({
  selectedRecords,
  setSelectedRecords,
  noRecordsContent,
  data: transaction,
}: TableJournalTransactionProps) {
  const navigate = useNavigate();
  const { searchQuery, selectedDate } = useFilterTransaction();

  const searchAndFilterTransaction = transaction?.filter((item: TransactionByAccountModel) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (item.transactionNumber !== undefined &&
        String(item.transactionNumber).toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      item.transactionDetail?.some(
        (td) =>
          td.description?.toLowerCase().includes(q) ||
          td.account?.name?.toLowerCase().includes(q) ||
          td.account?.accountNumber?.toLowerCase().includes(q)
      );

    const matchesDate =
      !selectedDate ||
      (item.transactionDate &&
        new Date(item.transactionDate).toDateString() === new Date(selectedDate).toDateString());

    return matchesQuery && matchesDate;
  });

  const columns = [
    {
      accessor: 'transactionNumber',
      title: <Text style={headTableStyle}>No Transaksi</Text>,
      render: (row: TransactionByAccountModel) => (
        <Group gap="xs" wrap="nowrap">
          {row.transactionNumber === 0 ? (
            <Badge color="gray" variant="light" size="sm">
              Saldo Awal #1
            </Badge>
          ) : (
            <Anchor
              underline="hover"
              fw={600}
              c="primary.6"
              fz={14}
              onClick={() =>
                navigate(
                  routes.generalJournal.detailTransactionJournal.replace(':idTransaction', row.id)
                )
              }
            >
              Jurnal Transaksi #{row.transactionNumber}
            </Anchor>
          )}
        </Group>
      ),
    },
    {
      accessor: 'transactionDate',
      title: <Text style={headTableStyle}>Tanggal</Text>,
      render: (row: TransactionByAccountModel) => (
        <Text c="dark.7" fz={13}>
          {dateFormatV1(row.transactionDate)}
        </Text>
      ),
    },
    {
      accessor: 'contact',
      title: <Text style={headTableStyle}>Kontak</Text>,
      render: () => (
        <Text c="dimmed" fz={13}>
          -
        </Text>
      ),
    },
    {
      accessor: 'debit',
      title: 'Debit (Rp)',
      textAlignment: 'right' as const,
      width: 170,
      titleStyle: { textAlign: 'right' as const },
      render: (row: TransactionByAccountModel) => (
        <Text
          c={row.debit && row.debit > 0 ? 'teal.7' : 'dimmed'}
          fw={row.debit && row.debit > 0 ? 600 : 400}
          fz={13}
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(row.debit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'credit',
      title: 'Kredit (Rp)',
      textAlignment: 'right' as const,
      width: 170,
      titleStyle: { textAlign: 'right' as const },
      render: (row: TransactionByAccountModel) => (
        <Text
          c={row.credit && row.credit > 0 ? 'red.7' : 'dimmed'}
          fw={row.credit && row.credit > 0 ? 600 : 400}
          fz={13}
          ta="right"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(row.credit || 0)}
        </Text>
      ),
    },
    {
      accessor: 'status',
      title: 'Saldo Berjalan',
      textAlignment: 'right' as const,
      width: 190,
      titleStyle: { textAlign: 'right' as const },
      render: (row: TransactionByAccountModel) => {
        const bal = row.balance ?? 0;
        return (
          <Text
            c="dark.8"
            fw={700}
            fz={13}
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
      title: 'Aksi',
      textAlignment: 'center' as const,
      titleStyle: { textAlign: 'center' as const },
      width: 70,
      render: (row: TransactionByAccountModel) => (
        <Group justify="center">
          <Tooltip label="Lihat Rincian Transaksi">
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
      isRecordSelectable={(row: TransactionByAccountModel) => row.transactionNumber !== 0}
      noRecordsText="Tidak ada transaksi yang sesuai dengan filter pencarian"
      verticalSpacing="sm"
    />
  );
}

export default TableJournalTransaction;
