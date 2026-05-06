import { Box, Button, Container, Group, Paper, Select, Stack, Tabs, TagsInput, Textarea, TextInput } from "@mantine/core";
import { IconCalendar, IconChevronDown, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { gradientColors, themeColors } from "@/theme";
import { DatePickerInput } from "@mantine/dates";
import { TextMediumGR } from "@/components/Text/CustomText";
import CustomDropzone from "@/components/Dropzone/CustomDropzone";
import ImportFiles from "@/module/GeneralJournal/DetailAccount/TransactionJournal/components/ImportFile";
import { useFileStore } from "@/store/GeneralJournal/useFileStore";
import { notifications } from "@mantine/notifications";
import { navigate } from "@/router";
import dayjs from "dayjs";
import { useState } from "react";
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import PageHeaderV2 from "@/components/PageHeader/PageHeaderV2";
import { useReceiveMoneyStore } from "../../ReceiveMoney/store/ReceiveMoneyStore";
import SentMoneyLayout from "./Layout";
import TotalAmountReceive from "../../ReceiveMoney/components/TotalAmountReceive";
import ReceiveMoneyForm from "../../ReceiveMoney/components/ReceiveMoneyForm";
import SentMoneyForm from "../components/SentMoneyForm";
import TotalAmountSent from "../components/TotalAmountSent";
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";



const items = [
    { title: 'Bank & Cash', href: () => navigate(-1) },
    { title: 'Add Sent Money', href: undefined },
]

const AddSentMoneyPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { addTransaction, notes, setNotes, transactions } = useReceiveMoneyStore();
    const [transactionNumber, setTransactionNumber] = useState('');
    const [transactionDate, setTransactionDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

    const { accounts } = useJournalAccounts();
    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const accountBankAndCash = JournalAccounts
        .filter((account) => account.isBankAndCash === true)
        .map((account) => ({
            value: account.id!!,
            label: `${account.name} (${account.accountNumber}${account.category ? ` - ${account.category.name}` : ''})`,
        }));


    const [files, setFiles, clearFiles] = useFileStore((state) => [
        state.files,
        state.setFiles,
        state.clearFiles,
    ]);
    const handleDrop = (f: File[]) => {
        // const dataTransfer = new DataTransfer();
        // files.forEach((file: File) => dataTransfer.items.add(file));
        setFiles(f);
        setTimeout(() => setLoading(false), 2000);
    };


    const handleReject = () => {
        notifications.show({
            color: 'red',
            title: 'Unsupported Files',
            message: 'Sorry, your file is not supported, please try again with supported files',
        });
    };

    const PaymentForAccountTabs = () => {
        return (
            <Stack align="stretch" justify="flex-start" gap="sm" pt='md'>
                <Group justify="space-between">
                    <TextMediumGR>Sent Money</TextMediumGR>
                    <Button
                        variant="filled"
                        color={themeColors.defaultBlack[10]}
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => addTransaction()}
                    >
                        Add Account
                    </Button>
                </Group>
                <Box bg={themeColors.grey[0]} bd="sm" p={10} style={{ borderRadius: 8 }}>
                    <TotalAmountSent />
                </Box>
                <SentMoneyForm />
                <Textarea
                    label="Notes"
                    placeholder="Add Notes"
                    resize="vertical"
                    mb={10}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <CustomDropzone
                    onDrop={handleDrop}
                    onReject={handleReject}
                    accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                    description="Attach images or documents, each file should not exceed 5mb"
                />
                <ImportFiles />
            </Stack>
        )
    }
    const PaymentForExpenseTabs = () => {
        return (
            <Stack align="stretch" justify="flex-start" gap="sm" pt='md'>
                <Group justify="space-between">
                    <TextMediumGR>Sent Money Expense</TextMediumGR>
                    <Button
                        variant="filled"
                        color={themeColors.defaultBlack[10]}
                        size="xs"
                        leftSection={<IconPlus size={14} />}
                        onClick={() => addTransaction()}
                    >
                        Add Account
                    </Button>
                </Group>
                <Box bg={themeColors.grey[0]} bd="sm" p={10} style={{ borderRadius: 8 }}>
                    <TotalAmountSent />
                </Box>
                <SentMoneyForm />
                <Textarea
                    label="Notes"
                    placeholder="Add Notes"
                    resize="vertical"
                    mb={10}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <CustomDropzone
                    onDrop={handleDrop}
                    onReject={handleReject}
                    accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                    description="Attach images or documents, each file should not exceed 5mb"
                />
                <ImportFiles />
            </Stack>
        )
    }
    return (
        <SentMoneyLayout footer={
            <Group grow justify="flex-end" p='md'>
                <TagsInput
                    key="tags"
                    placeholder="Tags"
                    data={['React', 'Angular', 'Svelte']}
                    rightSection={<IconSearch size={14} />}
                />
                <Group justify="flex-end" gap="xs" >
                    <Button
                        variant="light"
                        color={themeColors.grey[7]}
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gradient"
                        gradient={gradientColors.gradient}
                    >
                        Add Sent
                    </Button>
                </Group>
            </Group>
        }
        >
            <Container fluid>
                <Stack gap="lg">
                    <Paper p="md" shadow="md" radius="md">
                        <PageHeaderV2
                            type="withBreadcrumbs"
                            title="Add Sent Money"
                            breadcrumbItems={items}
                        />
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Stack gap='md'>
                            <Group grow>
                                <TextInput
                                    key="transactionNumber"
                                    label="Transaction Number"
                                    placeholder="Add name"
                                    withAsterisk
                                    onChange={(e) => setTransactionNumber(e.target.value)}
                                    value={transactionNumber}
                                />
                                <DatePickerInput
                                    label="Transaction Date"
                                    dropdownType="popover"
                                    value={dayjs(transactionDate).toDate()}
                                    onChange={(date) => setTransactionDate(dayjs(date).format('YYYY-MM-DD'))}
                                    withAsterisk
                                    placeholder="Add Date"
                                    rightSection={<IconCalendar size={14} />}
                                />
                            </Group>
                            <Group grow>
                                <Select
                                    label="Paid From"
                                    key="depositTo"
                                    placeholder="Choose account"
                                    rightSection={<IconChevronDown size={14} />}
                                    data={accountBankAndCash}
                                    value={selectedAccount}
                                    onChange={setSelectedAccount}
                                    withAsterisk
                                    comboboxProps={{ width: 500, position: 'bottom-start' }}
                                />
                                <Select
                                    label="Payer's Contact"
                                    key="payersContact"
                                    placeholder="Choose contact"
                                    rightSection={<IconChevronDown size={14} />}
                                    data={["Raga", "Murthada"]}
                                    // value={item.accountFrom}
                                    // onChange={(value) => updateTransaction(index, 'accountFrom', value)}

                                    withAsterisk
                                    comboboxProps={{ width: 500, position: 'bottom-start' }}
                                />
                            </Group>
                        </Stack>
                    </Paper>
                    <Paper p="md" shadow="md" radius="md">
                        <Tabs defaultValue="paymentForAccount" color={themeColors.primary[6]}>
                            <Tabs.List>
                                <Tabs.Tab value="paymentForAccount">
                                    Payment For Account
                                </Tabs.Tab>
                                <Tabs.Tab value="paymentForExpense">
                                    Payment For Expense
                                </Tabs.Tab>
                            </Tabs.List>
                            <Tabs.Panel value="paymentForAccount">
                                <PaymentForAccountTabs />
                            </Tabs.Panel>
                            <Tabs.Panel value="paymentForExpense">
                                <PaymentForExpenseTabs />
                            </Tabs.Panel>
                        </Tabs>

                    </Paper>
                </Stack>
            </Container >
        </SentMoneyLayout >
    );
}

export default AddSentMoneyPage;