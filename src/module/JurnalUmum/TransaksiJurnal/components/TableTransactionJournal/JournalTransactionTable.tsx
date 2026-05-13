import { Text, ActionIcon, Anchor, Title, Tooltip, Center } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { IconPuzzle, IconPuzzleOff } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { routes } from '@/router';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { GetTransactionByAccount } from '../../services/TransactionByAccount.service';
import { dateFormatV1 } from '@/utils/FormatDate';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import useFilterTransaction from '../../../DetailAkun/store/FilterTransaction';

interface TableJournalTransactionProps {
    selectedRecords: TransactionByAccountModel[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
}

const headTableStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: themeColors.defaultBlack[10]

}

function TableJournalTransaction({ selectedRecords, setSelectedRecords }: TableJournalTransactionProps) {
    const navigate = useNavigate();
    const { idAccount } = useParams<{ idAccount: string }>();
    const { data: transaction, isError, isLoading } = GetTransactionByAccount(idAccount!);
    const { searchQuery, setSearchQuery, selectedDate, setSelectedDate } = useFilterTransaction();

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error loading data</Text>;

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


    const badgeAction = (status: string, transactionNumber: number) => {
        if (transactionNumber === 0) {
            return (
                <ActionIcon variant="light" color={themeColors.grey[6]} disabled>
                    <Tooltip label="Not available for opening balance" offset={5}>
                        <IconPuzzleOff size={16} />
                    </Tooltip>
                </ActionIcon>
            );
        }

        switch (status) {
            case 'Reconciled':
                return (
                    <ActionIcon variant="light" color={themeColors.grey[6]}>
                        <Tooltip label="Cancel Reconciled" offset={5}>
                            <IconPuzzleOff size={16} />
                        </Tooltip>
                    </ActionIcon>
                );
            case 'Inreconciled':
                return (
                    <ActionIcon variant="light" color={themeColors.grey[6]}>
                        <Tooltip label="Reconciled" offset={5}>
                            <IconPuzzle size={16} />
                        </Tooltip>
                    </ActionIcon>
                );
            default:
                return (
                    <ActionIcon variant="light" color={themeColors.red[6]}>
                        <IconPuzzleOff size={16} />
                    </ActionIcon>
                );
        }
    };


    const columns = [
        {
            accessor: 'transactionNumber',
            title: <Text style={headTableStyle} > Transaction Name</Text >,
            render: (row: TransactionByAccountModel) => (
                <Anchor
                    underline="never"
                    onClick={() =>
                        navigate(routes.generalJournal.detailTransactionJournal.replace(':idTransaction', row.id))
                    }
                >
                    <Text c={themeColors.primary[6]} fz={14}>
                        {row.transactionNumber === 0
                            ? "Opening Balance"
                            : `Journal Entry #${row.transactionNumber}`}
                    </Text>

                </Anchor>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text style={headTableStyle} ta='center' >Transaction Date</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14} ta='center'>{dateFormatV1(row.transactionDate)}</Text>
            ),
        },
        {
            accessor: 'debit',
            title: <Text style={headTableStyle} >Received</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(row.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'credit',
            title: <Text style={headTableStyle} >Sent</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>{formatCurrency(row.credit || 0)}</Text>
            ),
        },
        {
            accessor: 'balance',
            title: <Text style={headTableStyle} >Balance</Text>,
            render: (row: TransactionByAccountModel) => (
                <Text c={themeColors.defaultBlack[10]} fz={14}>
                    {row.balance! >= 0
                        ? formatCurrency(row.balance ?? 0)
                        : `(${formatCurrency(Math.abs(row.balance ?? 0))})`}</Text>
            ),
        },
        {
            accessor: 'action',
            title: <Text style={headTableStyle} ta='center' >Action</Text>,
            render: (row: TransactionByAccountModel) =>
                <Center>
                    {badgeAction(row.status, row.transactionNumber)}
                </Center>,
        },
    ];

    return (
        !transaction || transaction.length === 0 ? (
            <EmptyState />
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