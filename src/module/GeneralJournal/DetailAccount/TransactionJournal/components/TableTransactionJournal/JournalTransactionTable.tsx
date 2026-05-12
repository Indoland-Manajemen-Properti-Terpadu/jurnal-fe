import { Text, Anchor } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { dateFormatV1 } from '@/utils/FormatDate';
import useFilterTransaction from '../../../Main/store/FilterTransaction';

interface TableJournalTransactionProps {
    selectedRecords: TransactionByAccountModel[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
    noRecordsContent?: React.ReactNode;
    data: TransactionByAccountModel[] | undefined;
}

const headTableStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: themeColors.defaultBlack[10]
}

function TableJournalTransaction({ selectedRecords, setSelectedRecords, noRecordsContent, data: transaction }: TableJournalTransactionProps) {
    const navigate = useNavigate();
    const { searchQuery, selectedDate } = useFilterTransaction();

    const searchAndFilterTransaction = transaction?.filter((item: TransactionByAccountModel) => {
        const matchesQuery =
            (item.transactionNumber && String(item.transactionNumber)
                .toLowerCase()
                .includes(searchQuery.toLowerCase())) ||
            (item.transactionDate && new Date(item.transactionDate)
                .toISOString()
                .toLowerCase()
                .includes(searchQuery.toLowerCase()));

        const matchesDate =
            !selectedDate ||
            (item.transactionDate && new Date(item.transactionDate)
                .toDateString() === selectedDate.toDateString());

        return matchesQuery && matchesDate;
    });


const columns = [
        {
            accessor: 'transactionNumber',
            title: <Text style={headTableStyle}>No Transaksi</Text>,
            render: (row: TransactionByAccountModel) => (
                <Anchor
                    underline="never"
                    onClick={() =>
                        navigate(routes.generalJournal.detailTransactionJournal.replace(':idTransaction', row.id))
                    }
                >
                    <Text c={themeColors.primary[6]} fz={14}>
                        {row.transactionNumber === 0
                            ? "Saldo Awal #1"
                            : `Jurnal Transaksi #${row.transactionNumber}`}
                    </Text>
                </Anchor>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text style={headTableStyle}>Tanggal</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>{dateFormatV1(row.transactionDate)}</Text>
            ),
        },
        {
            accessor: 'contact',
            title: <Text style={headTableStyle}>Kontak</Text>,
            render: () => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>-</Text>
            ),
        },
        {
            accessor: 'debit',
            title: <Text style={headTableStyle}>Debit (Dalam Rp)</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(row.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'credit',
            title: <Text style={headTableStyle}>Kredit (Dalam Rp)</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(row.credit || 0)}</Text>
            ),
        },
        {
            accessor: 'balance',
            title: <Text style={headTableStyle}>Saldo</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>
                    {row.balance! >= 0
                        ? formatCurrency(row.balance ?? 0)
                        : `(${formatCurrency(Math.abs(row.balance ?? 0))})`}</Text>
            ),
        },
    ];

    return (
        !transaction || transaction.length === 0 ? (
            noRecordsContent || <EmptyState />
        ) : (
            <DataTable
                withTableBorder
                borderRadius="md"
                highlightOnHover
                columns={columns}
                selectedRecords={selectedRecords}
                onSelectedRecordsChange={setSelectedRecords}
                records={searchAndFilterTransaction || []}
                isRecordSelectable={(row: TransactionByAccountModel) => row.transactionNumber !== 0}
            />

        )
    );
}

export default TableJournalTransaction;