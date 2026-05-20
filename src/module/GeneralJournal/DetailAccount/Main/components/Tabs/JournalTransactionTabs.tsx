import React from 'react';
import { Stack, Flex, Button, Menu, Text } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { IconPlus } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { useNavigate, useParams } from 'react-router-dom';
import SearchActions from '../SearchAction';
import TableJournalTransaction from '../../../TransactionJournal/components/TableTransactionJournal/JournalTransactionTable';
import { DeleteTransactionAccounts } from '../../../TransactionJournal/services/DeleteTransactionAccount.service';
import { GetTransactionByAccount } from '../../../TransactionJournal/services/TransactionByAccount.service';
import { TransactionByAccountModel } from '../../../TransactionJournal/types/TransactionByAccountModel';


interface Props {
    selectedRecords: TransactionByAccountModel[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
    noRecordsContent?: React.ReactNode;
}

const JournalTransactionTab = ({ selectedRecords, setSelectedRecords, noRecordsContent }: Props) => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const navigate = useNavigate();
    const deleteMutation = DeleteTransactionAccounts();
    const { data: transaction, isError, isLoading } = GetTransactionByAccount(idAccount!);

    const handleDelete = () => {
        if (!idAccount) return;
        const selectedIds = selectedRecords.map((record) => record.id);
        deleteMutation.mutate({ ids: selectedIds, idAccount }, {
            onSuccess: () => {
                setSelectedRecords([]);
            },
        });
    };

    if (isLoading) return <Text>Loading...</Text>;
    if (isError) return <Text>Error loading data</Text>;

    return (

        <TableJournalTransaction
            selectedRecords={selectedRecords}
            setSelectedRecords={setSelectedRecords}
            data={transaction}
            noRecordsContent={noRecordsContent}
        />

    );
};

export default JournalTransactionTab;
