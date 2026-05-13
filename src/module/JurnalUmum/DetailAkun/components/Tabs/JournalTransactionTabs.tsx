import React from 'react';
import { Stack, Flex, Button, Menu } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { IconPlus } from '@tabler/icons-react';
import { routes } from '@/router';
import { useNavigate, useParams } from 'react-router-dom';
import SearchActions from '../SearchAction';
import TableJournalTransaction from '../../../TransaksiJurnal/components/TableTransactionJournal/JournalTransactionTable';
import { DeleteTransactionAccounts } from '../../../TransaksiJurnal/services/DeleteTransactionAccount.service';


interface Props {
    selectedRecords: TransactionByAccountModel[];
    setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
}

const JournalTransactionTab = ({ selectedRecords, setSelectedRecords }: Props) => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const navigate = useNavigate();
    const deleteMutation = DeleteTransactionAccounts();

    const handleDelete = () => {
        if (!idAccount) return;
        const selectedIds = selectedRecords.map((record) => record.id);
        deleteMutation.mutate({ ids: selectedIds, idAccount }, {
            onSuccess: () => {
                setSelectedRecords([]);
            },
        });
    };
    return (
        <Stack gap="md">
            <Flex justify="space-between" align="center" mt="md">
                <SearchActions
                    onDelete={handleDelete}
                    hasSelection={selectedRecords.length > 0}
                />
                <Menu position="bottom-end" offset={5}>
                    <Menu.Target>
                        <Button
                            size="xs"
                            variant="filled"
                            bg={themeColors.primary[6]}
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
            <TableJournalTransaction
                selectedRecords={selectedRecords}
                setSelectedRecords={setSelectedRecords}
            />
        </Stack>
    );
};

export default JournalTransactionTab;
