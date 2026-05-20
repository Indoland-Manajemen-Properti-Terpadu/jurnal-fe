import {
    Container,
    Group,
    Paper,
    Stack,
    Button,
    Text,
    Title,
    Grid,
    Box,
    Divider,
    List,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HeadingText, TextAmount, TextMediumGR } from '@/components/Text/CustomText';
import { routes } from '@/router/routes';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import { buttonGradient, gradientColors, themeColors } from '@/theme';
import { useInitialBalanceStore } from '@/store/GeneralJournal/initialBalanceAccount';
import { formatCurrency } from '@/utils/FormatCurrency';
import { useJournalAccounts } from '../../JournalAccount/hooks/useJournalAccounts';
import TableBeginningBalance from '../components/TableBeginningBalance';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import BeginningBalancePageLayout from './Layout';
import { formatDate } from '@/utils/FormatDate';
import { useDraftAccount, usePublishDraftBalance, useSetDraftBalance } from '../hooks/useDraftBalance';
import { JournalAccounts } from '../../JournalAccount/types/JournalAccountModel';
import { DraftAccount } from '../types/DraftAccount.types';

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const BeginningBalancePage = () => {
    const navigate = useNavigate();
    const { accounts: JournalAccount, isError } = useJournalAccounts();
    const [listAccounts, setListAccounts] = useState<JournalAccounts[]>([]);
    const { files, removeFile } = useFileStore((state) => ({
        files: state.files,
        removeFile: state.removeFile,
    }));

    const [continueModalOpen, setContinueModalOpen] = useState(false);
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const {
        setConverstion,
        conversionDate,
        totalDebit,
        totalCredit,
        countData,
        accounts: locAccounts,
        draftStatus,
        setDraftStatus
    } = useInitialBalanceStore();
    const { mutate: publishDraftBalance } = usePublishDraftBalance();
    const { mutate: setDraftBalance } = useSetDraftBalance();
    const { draftAccounts, isLoading } = useDraftAccount();

    useEffect(() => {
        const fetchDraft = async () => {
            try {
                if (draftAccounts.status === false && conversionDate === null) {
                    navigate(routes.generalJournal.main)
                } else if (draftAccounts.id) {
                    const transformedArray = draftAccounts.accounts
                        .map((item: DraftAccount) => ({
                            ...(item.accounts as object),
                            debit: item.debit,
                            credit: item.credit

                        }));
                    setConverstion(new Date(draftAccounts.period))
                    countData(transformedArray)
                    setDraftStatus(draftAccounts.publishedDate ? '[Published]' : '[Draft]')
                    setListAccounts(transformedArray)
                } else {
                    setDraftStatus(null)
                    setListAccounts(JournalAccount)
                }

            } catch (error) {
                console.error('Error fetching draft account:', error);
            }
        };

        fetchDraft();
    }, [draftAccounts]);

    const dataFiltering = () => {
        const filteredData = locAccounts
            .map(({ id, debit, credit }: Partial<JournalAccounts>) => {
                const result: DraftAccount = {};
                result.accounts = id;

                if (debit !== undefined) {
                    result.debit = debit;
                }

                if (credit !== undefined) {
                    result.credit = credit;
                }

                return result;
            });

        return filteredData
    }

    const handleSaveDraft = () => {
        const filteredData = dataFiltering()

        setContinueModalOpen(false);
        const payload = {
            'period': conversionDate,
            'accounts': filteredData
        }
        setDraftBalance(payload)
        setDraftStatus('[Draft]')
    }

    const handleContinue = () => {
        setContinueModalOpen(true);
    };

    const handleReset = () => {
        setResetModalOpen(true);
    };

    const handleContinueTrue = () => {
        // const filteredData = {
        //     accounts: locAccounts
        //         .map(({ id, debit, credit }: JournalAccounts) => {
        //             if ((debit === undefined || debit === 0) && (credit === undefined || credit === 0)) {
        //                 return null;
        //             }

        //             const result: DraftAccount = { id };

        //             if (debit !== undefined && debit !== 0) {
        //                 result.debit = debit;
        //             }

        //             if (credit !== undefined && credit !== 0) {
        //                 result.credit = credit;
        //             }

        //             return result;
        //         })
        //         .filter(Boolean)
        // }
        const filteredDraftData = dataFiltering()
        const payload = {
            'period': conversionDate,
            'accounts': filteredDraftData
        }
        publishDraftBalance(payload)
        setContinueModalOpen(false);
        navigate(routes.generalJournal.main);
    };

    const handleResetTrue = () => {
        countData([])
        setResetModalOpen(false);
        navigate(routes.generalJournal.main);
    };


    const cancelButton = draftStatus !== '[Published]' ? (
        <Button
            variant="light"
            color={themeColors.gray[7]}
            onClick={handleSaveDraft}
        >
            Save as Draft
        </Button>
    ) : null;

    return (
        <BeginningBalancePageLayout
            footer={
                <Group mt="md" justify="flex-end">
                    {
                        draftStatus != '[Published]'
                            ? (
                                <Button
                                    variant="light"
                                    color={themeColors.gray[7]}
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                            ) :
                            (<></>)
                    }
                    <Button
                        variant="gradient"
                        gradient={gradientColors.gradient}
                        onClick={handleContinue}
                    >
                        {
                            draftStatus != '[Published]'
                                ? 'Continue'
                                : 'Update'
                        }
                    </Button>
                </Group>
            }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={1}>
                            <Grid columns={0} align='center'>
                                <Grid.Col>
                                    <Title order={3}>Beginning Balance</Title>
                                </Grid.Col>
                                <Grid.Col>
                                    <Title order={5} c={
                                        draftStatus == '[Published]' ? themeColors.green[6] :
                                            draftStatus == '[Draft]' ? themeColors.yellow[6] : ''
                                    }>{draftStatus}</Title>
                                </Grid.Col>
                            </Grid>
                            <Text c={themeColors.gray[6]} fz={14}>
                                Please enter the beginning balance as of the date {formatDate(conversionDate)}
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack>
                            <Box bg={themeColors.gray[0]} bd="sm" p={10}>
                                <Grid columns={24} grow justify="space-between" align="center">
                                    <Grid.Col span={12}>
                                        <HeadingText fz={14}>Total</HeadingText>
                                    </Grid.Col>
                                    <Grid.Col span="auto">
                                        <TextAmount
                                            key='totalDebit'
                                            mainColor="gray"
                                            colorTextAmont="black"
                                        >
                                            Total Debit {formatCurrency(totalDebit)}
                                        </TextAmount>
                                    </Grid.Col>
                                    <Grid.Col span="auto">
                                        <TextAmount
                                            key='totalCredit'
                                            mainColor="gray"
                                            colorTextAmont="black"
                                        >
                                            Total Credit {formatCurrency(totalCredit)}
                                        </TextAmount>
                                    </Grid.Col>
                                </Grid>
                            </Box>
                            <TableBeginningBalance data={listAccounts || []} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
            <CustomConfirmModal
                opened={continueModalOpen}
                onClose={() => setContinueModalOpen(false)}
                withCloseButton={true}
                title={<TextMediumGR>Save or Publish Balance</TextMediumGR>}
                labels={{
                    confirm:
                        <Button variant="gradient" gradient={buttonGradient.gradient} onClick={handleContinueTrue}>Publish</Button>,
                    cancel: cancelButton
                }}
            >
                <Stack gap='md' align="stretch" justify="center">
                    <Divider />
                    <Text fw={400} c={themeColors.gray[7]} fz={14}>If you proceed with publishing, you will not be able to:</Text>
                    <List fw={400} c={themeColors.gray[7]} fz={14}>
                        <List.Item>Reissue the initial balance</List.Item>
                        <List.Item>Add a comparative balance</List.Item>
                        <List.Item>Reset accounts</List.Item>
                    </List>
                    <Text fw={400} c={themeColors.gray[7]} fz={14}>However, if you save as a draft, you can make changes at any time.</Text>
                    <Divider />
                </Stack>
            </CustomConfirmModal>
            <CustomConfirmModal
                opened={resetModalOpen}
                onClose={() => setResetModalOpen(false)}
                withCloseButton={true}
                title={<Text c={themeColors.black[9]} fw={500} fz={16}>Reset Balance</Text>}
                labels={{
                    confirm:
                        <Button variant="filled" color={themeColors.red[6]} onClick={handleResetTrue}>Reset</Button>,
                    cancel: <Button variant="light" color={themeColors.gray[7]} onClick={() => setResetModalOpen(false)}>Cancel</Button>
                }}
            >
                <Stack gap='md' align="stretch" justify="center">
                    <Divider />
                    <Text fw={400} c={themeColors.gray[7]} fz={14}>Are you sure you want to reset the beginning balance data to default?</Text>
                    <Divider />
                </Stack>
            </CustomConfirmModal>
        </BeginningBalancePageLayout>
    );
};

export default BeginningBalancePage;
