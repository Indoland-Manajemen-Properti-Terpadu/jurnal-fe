import React from 'react';
import { Table, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/FormatCurrency';
import { themeColors } from '@/theme';
import { TransactionDetail } from '../../types/TransactionDetailModel';
import { useDetailTransaction } from '../../hooks/useDetailTransaction';
import { useParams } from 'react-router-dom';

const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const totalRowStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const JournalTransactionTable = () => {
    const { idTransaction } = useParams<{ idTransaction: string }>();
    const { detailTransaction, isError, isLoading } = useDetailTransaction(idTransaction!);

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error loading transaction data.</Text>;
    if (!detailTransaction) return <Text>No transaction data available.</Text>;

    return (
        <Table style={rowStyle} >
            <Table.Thead>
                <Table.Tr style={{ backgroundColor: themeColors.primary[0] }}>
                    <Table.Th colSpan={8} ta='left' c={themeColors.black[9]} >
                        Transaction Account
                    </Table.Th>
                    <Table.Th colSpan={2} ta='left' >
                        Description
                    </Table.Th>
                    <Table.Th colSpan={2} ta='left' >
                        Debit
                    </Table.Th>
                    <Table.Th colSpan={2} ta='left' >
                        Credit
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {detailTransaction?.transactionDetail?.map((txn: TransactionDetail) => (
                    <Table.Tr key={txn.id} style={rowStyle}>
                        <Table.Td fz="sm" colSpan={8}>
                            {txn.account?.name} ({txn.account?.accountNumber})
                        </Table.Td>
                        <Table.Td fz="sm" style={{ textAlign: "left" }} colSpan={2}>
                            {txn.description}
                        </Table.Td>
                        <Table.Td fz="sm" style={{ textAlign: "left" }} colSpan={2}>
                            {txn.debit ? formatCurrency(txn.debit) : '-'}
                        </Table.Td>
                        <Table.Td fz="sm" style={{ textAlign: "left" }} colSpan={2}>
                            {txn.credit ? formatCurrency(txn.credit) : '-'}
                        </Table.Td>
                    </Table.Tr>
                ))}
                <Table.Tr style={totalRowStyle}>
                    <Table.Td colSpan={10} fz="sm" style={{ fontWeight: 600 }}>
                        Total Debit & Credit
                    </Table.Td>
                    <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }} colSpan={2}>
                        {formatCurrency(detailTransaction?.transactionDetail?.reduce((sum, txn) => sum + (txn.debit || 0), 0) || 0)}
                    </Table.Td>
                    <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }} colSpan={2}>
                        {formatCurrency(detailTransaction?.transactionDetail?.reduce((sum, txn) => sum + (txn.credit || 0), 0) || 0)}
                    </Table.Td>
                </Table.Tr>
            </Table.Tbody>

        </Table>
    );
};

export default JournalTransactionTable;
