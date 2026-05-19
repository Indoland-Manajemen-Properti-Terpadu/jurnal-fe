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
        <Stack gap="md">
            {transaction && transaction.length > 0 && (
                <Flex justify="flex-end" align="center" mt="md">
                    <Menu position="bottom-end" offset={5}>
                        <Menu.Target>
                            <Button
                                size="xs"
                                variant="filled"
                                bg={themeColors.teal[6]}
                                rightSection={<IconPlus size={16} />}
                            >
                                Add Transaction
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconPlus size={14} />}
                                onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                            >
                                Transaction Journal
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconPlus size={14} />}
                                onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                            >
                                Transfer Money
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Flex>
            )}
            <TableJournalTransaction
                selectedRecords={selectedRecords}
                setSelectedRecords={setSelectedRecords}
                data={transaction}
                noRecordsContent={noRecordsContent}
            />
        </Stack>
    );
};

export default JournalTransactionTab;
