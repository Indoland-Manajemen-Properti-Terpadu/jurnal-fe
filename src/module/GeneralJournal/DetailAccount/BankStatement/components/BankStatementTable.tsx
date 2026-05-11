// components/BankStatementTable.tsx
import { Anchor, Button, Center, Container, Stack, Text, Title } from '@mantine/core';
import { useNavigate, useParams } from 'react-router';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { formatCurrency } from '@/utils/FormatCurrency';
import { BankStatementModelV2, Result } from '../types/BankStatementModel';
import { dateFormatV1 } from '@/utils/FormatDate';
import EmptyState from '@/components/EmptyState/EmptyTable';
import { themeColors } from '@/theme';
import BadgeStatusReconciled from './BadgeStatus';
import { useQueryClient } from '@tanstack/react-query';
import { getBankStatement } from '../services/ListBankStatement.service';
import ImportBankStatementModal from './ImportBankStatementModal';
import { useState } from 'react';


interface BankStatementTableProps {
    selectedRecords: Result[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<Result[]>>;
}

export default function BankStatementTable({ selectedRecords, setSelectedRecords }: BankStatementTableProps) {
    const navigate = useNavigate();
    const { idAccount } = useParams<{ idAccount: string }>();
    const queryClient = useQueryClient()
    let { data: bankStatement, isLoading, isError } = getBankStatement(idAccount!);
    const isEmpty = bankStatement?.results?.length === 0;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);


    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] })
    }

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <EmptyState />;

    const columns = [
        {
            accessor: 'transactionName',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Transaction Name</Text>,
            render: (element: Result) => (
                <Anchor underline="never" onClick={() => navigate(`/transaction/${element.id}`)}>
                    <Text c={themeColors.primary[6]} size="sm">
                        {element.transactionName}
                    </Text>
                </Anchor>
            ),
        },
        {
            accessor: 'transactionDate',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Transaction Date</Text>,
            render: (element: Result) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} ta='center'>
                    {element.transactionDate
                        ? dateFormatV1(element.transactionDate)
                        : '-'
                    }
                </Text>
            ),
        },
        {
            accessor: 'receive',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Received</Text>,
            render: (element: Result) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} >{formatCurrency(element.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'sent',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Sent</Text>,
            render: (element: Result) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} >{formatCurrency(element.credit || 0)}</Text>
            ),
        },
        {
            accessor: 'balance',
            title: <Text size="sm" fz={14} fw={500} c={themeColors.defaultBlack[10]} >Balance</Text>,
            render: (element: Result) => (
                <Text size="sm" fz={14} fw={400} c={themeColors.defaultBlack[10]} >{formatCurrency(element.debit || 0)}</Text>
            ),
        },
        {
            accessor: 'reconciled',
            title: <Text size="sm" fz={14} fw={500} ta='center' c={themeColors.defaultBlack[10]} >Status</Text>,
            render: (element: Result) => <Center><BadgeStatusReconciled reconciled={!!element.reconciled} /></Center>
        }

    ];

    return (
        <>
            {isEmpty ? (
                <>
                    <Container fluid p='xl'>
                        <Stack gap='md'>
                            <EmptyState />
                            <Button
                                variant="outline"
                                radius="md"
                                color={themeColors.blue[6]}
                                onClick={handleOpenModal}
                            >
                                Import Bank Statement
                            </Button>
                        </Stack>
                    </Container>
                </>
            ) : (
                <DataTable
                    withTableBorder
                    borderRadius="md"
                    highlightOnHover
                    fz="sm"
                    selectedRecords={selectedRecords}
                    onSelectedRecordsChange={setSelectedRecords}
                    columns={columns}
                    records={bankStatement?.results || []}
                />
            )
            }

            <ImportBankStatementModal
                idAccount={idAccount!}
                onContinue={handleRefresh}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

