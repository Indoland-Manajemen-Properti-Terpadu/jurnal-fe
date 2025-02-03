import {
    Container,
    Group,
    Paper,
    Stack,
    Button,
    Text,
    Title,
    Tabs,
    SimpleGrid,
    Menu,
    rem,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { themeColors } from '@/theme';
import { IconPencil, IconReportSearch, IconArchive, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { getDetailAccount } from '../service/DetailAccount.service';
import { accountDetailData } from '../types/DetailAccountModel';
import DetailAccountLayout from './Layout';
import DeleteTransactionModal from '../components/DeleteTransactionModal';
import { Result } from '../../BankStatement/types/BankStatementModel';
import { useQueryClient } from '@tanstack/react-query';
import useFilterTransaction from '../store/FilterTransaction';
import BankStatementTab from '../components/Tabs/BankStatamentTabs';
import CashMappingTab from '../components/Tabs/CashMappingTabs';
import JournalTransactionTab from '../components/Tabs/JournalTransactionTabs';
import ReconciliationTab from '../components/Tabs/ReconciliationTabs';

// Constants
const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const DetailAccount = () => {
    const queryClient = useQueryClient()
    const { idAccount } = useParams<{ idAccount: string }>();
    const { accountDetail } = getDetailAccount(idAccount!);
    const accountData = accountDetailData(accountDetail);

    const journalSelection = useSelectionHandler<TransactionByAccountModel>();
    const bankStatementSelection = useSelectionHandler<Result>();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] })
    }

    const handleDeleteTransaction = () => {
        notifications.show({
            color: themeColors.red[6],
            autoClose: 3000,
            title: 'Successfully Deleted Transaction',
            message: 'Selected transaction has been deleted',
        });
        setIsDeleteModalOpen(false);
    };

    // Custom hook for managing selections
    function useSelectionHandler<T>(initialSelection: T[] = []) {
        const [selectedRecords, setSelectedRecords] = useState<T[]>(initialSelection);
        return { selectedRecords, setSelectedRecords };
    }

    return (
        <>
            <DetailAccountLayout>
                <Container fluid>
                    <Stack gap="lg">
                        <Paper {...PAPER_PROPS}>
                            <SimpleGrid cols={2}>
                                <Stack gap={2}>
                                    <Group>
                                        <Title order={3}>{accountData?.name} - {accountData?.accountNumber}</Title>
                                    </Group>
                                    <Text c={themeColors.grey[6]} fz={14}>{accountData?.category?.name}</Text>
                                </Stack>
                                <Group justify="flex-end">
                                    <Menu position="bottom-end" offset={5} withArrow>
                                        <Menu.Target>
                                            <Button variant="light" size="sm" color={themeColors.grey[7]} rightSection={<IconChevronUp style={{ width: rem(14), height: rem(14) }} />}>
                                                Other Action
                                            </Button>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconReportSearch style={{ width: rem(14), height: rem(14) }} />}>Report Reconciliation</Menu.Item>
                                            <Menu.Item leftSection={<IconPencil style={{ width: rem(14), height: rem(14) }} />}>Edit Account</Menu.Item>
                                            <Menu.Item leftSection={<IconArchive style={{ width: rem(14), height: rem(14) }} />}>Archive Account</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </SimpleGrid>
                        </Paper>
                        <Paper p="md" shadow="md" radius="md">
                            <Stack gap="md">
                                <TextMediumGR>Detail Account</TextMediumGR>
                                <Tabs defaultValue="transaction" color={themeColors.primary[6]}>
                                    <Tabs.List>
                                        <Tabs.Tab value="transaction">Journal Transaction</Tabs.Tab>
                                        <Tabs.Tab value="bankStatement">Bank Statement</Tabs.Tab>
                                        <Tabs.Tab value="reconciliation">Reconciliation</Tabs.Tab>
                                        <Tabs.Tab value="cashMapping">Cash Mapping</Tabs.Tab>
                                    </Tabs.List>

                                    <Tabs.Panel value="transaction">
                                        <JournalTransactionTab
                                            selectedRecords={journalSelection.selectedRecords}
                                            setSelectedRecords={journalSelection.setSelectedRecords}
                                        />
                                    </Tabs.Panel>

                                    <Tabs.Panel value="bankStatement">
                                        <BankStatementTab
                                            selectedRecords={bankStatementSelection.selectedRecords}
                                            setSelectedRecords={bankStatementSelection.setSelectedRecords}
                                            idAccount={idAccount!}
                                            onRefresh={handleRefresh}
                                        />
                                    </Tabs.Panel>

                                    <Tabs.Panel value="reconciliation">
                                        <ReconciliationTab />
                                    </Tabs.Panel>

                                    <Tabs.Panel value="cashMapping">
                                        <CashMappingTab />
                                    </Tabs.Panel>
                                </Tabs>
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </DetailAccountLayout>

            <DeleteTransactionModal
                opened={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteTransaction}
            />
        </>
    );
};

export default DetailAccount;

