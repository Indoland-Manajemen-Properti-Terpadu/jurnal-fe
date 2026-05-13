import {
    Container,
    Group,
    Paper,
    Stack,
    Button,
    Text,
    Title,
    Tabs,
    Input,
    SimpleGrid,
    Grid,
    Flex,
    Loader,
    Center,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { TextMediumGR } from '@/components/Text/CustomText';
import { gradientColors, themeColors } from '@/theme';
import { IconSettings, IconSearch, IconEdit, IconTrash, IconPlus, IconCalendar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import DetailAccountLayout from './Layout';
import TableJournalTransaction from '../../TransaksiJurnal/components/TableTransactionJournal/JournalTransactionTable';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { accountDetailData } from '../types/DetailAccountModel';
import { routes } from '@/router';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};

const DetailAccountNonCashBank = () => {
    const navigate = useNavigate();
    const { idAccount } = useParams<{ idAccount: string }>();
    const { accountDetail, isError, isLoading } = useDetailAccount(idAccount!);
    
    // Improved data extraction to handle various API response structures
    const rawData = (accountDetail as any)?.data?.data || (accountDetail as any)?.data || accountDetail;
    const accountData = accountDetailData(rawData);

    const journalSelection = useSelectionHandler<TransactionByAccountModel>();
    const [dateValue, setDateValue] = useState<Date | null>(null);
    function useSelectionHandler<T>(initialSelection: T[] = []) {
        const [selectedRecords, setSelectedRecords] = useState<T[]>(initialSelection);
        return { selectedRecords, setSelectedRecords };
    }

    if (isLoading) {
        return (
            <DetailAccountLayout>
                <Center h={300}>
                    <Loader color={themeColors.primary[6]} />
                </Center>
            </DetailAccountLayout>
        );
    }

    return (
        <DetailAccountLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <SimpleGrid cols={2}>
                            <Stack gap={2}>
                                <Title order={3}>
                                    {accountData.name}{' '}
                                    <Text span c={themeColors.primary[6]} inherit>
                                        ({accountData.accountNumber})
                                    </Text>
                                </Title>
                                <Text c={themeColors.grey[6]} fz={14}>
                                    Kategori {accountData.category?.name}
                                </Text>
                            </Stack>
                            <Group justify="flex-end">
                                <Button
                                    variant="light"
                                    color={themeColors.grey[7]}
                                    leftSection={<IconEdit size={14} />}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="gradient"
                                    gradient={gradientColors.gradient}
                                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                                >
                                    Add Transaction
                                </Button>

                            </Group>
                        </SimpleGrid>
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack gap='md'>
                            <TextMediumGR>Detail Account</TextMediumGR>
                            <Flex justify="space-between" align="center">
                                <Grid columns={24} gutter="sm" align="center" style={{ flex: 1 }}>
                                    {/* Input */}
                                    <Grid.Col span={8}>
                                        <Input
                                            placeholder="Find transaction"
                                            size="xs"
                                            leftSection={<IconSearch size={16} />}
                                        />
                                    </Grid.Col>

                                    {/* DatePicker */}
                                    <Grid.Col span={6}>
                                        <DatePickerInput
                                            placeholder="Date"
                                            valueFormat="DD/MM/YYYY"
                                            highlightToday
                                            size="xs"
                                            value={dateValue}
                                            onChange={setDateValue}
                                            clearable={!!dateValue}
                                            rightSection={!dateValue ? <IconCalendar size={16} /> : null}
                                        />
                                    </Grid.Col>

                                    {/* Delete Button */}
                                    <Grid.Col span={6} >
                                        <Button
                                            size="xs"
                                            color="red"
                                            leftSection={<IconTrash size={16} />}
                                            onClick={() => journalSelection.setSelectedRecords([])}
                                            style={{ visibility: journalSelection.selectedRecords.length > 0 ? 'visible' : 'hidden' }}
                                        >
                                            Delete All
                                        </Button>
                                    </Grid.Col>
                                </Grid>

                                {/* Add Transaction Button aligned to the end */}
                                <Button
                                    size="xs"
                                    variant='gradient'
                                    gradient={gradientColors.gradient}
                                    rightSection={<IconPlus size={16} />}
                                    onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                                >
                                    Add Transaction
                                </Button>
                            </Flex>
                            <TableJournalTransaction
                                selectedRecords={journalSelection.selectedRecords}
                                setSelectedRecords={journalSelection.setSelectedRecords} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container >
        </DetailAccountLayout >


    );
};

export default DetailAccountNonCashBank;
