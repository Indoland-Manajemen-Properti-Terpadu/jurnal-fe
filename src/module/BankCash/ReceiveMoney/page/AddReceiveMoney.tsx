import { Anchor, Box, Button, Container, Group, Paper, Select, Stack, TagsInput, Textarea, TextInput } from "@mantine/core";
import TransferMoneyLayout from "./Layout";
import { IconCalendar, IconChevronDown, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { gradientColors, themeColors } from "@/theme";
import { PageHeader } from "@/components";
import { DatePickerInput } from "@mantine/dates";
import { TextMediumGR } from "@/components/Text/CustomText";
import CustomDropzone from "@/components/Dropzone/CustomDropzone";
import TotalAmount from "@/module/JurnalUmum/TransaksiJurnal/components/Amounts";
import TransactionForm from "@/module/JurnalUmum/TransaksiJurnal/components/Form/TransactionForm";
import ImportFiles from "@/module/JurnalUmum/TransaksiJurnal/components/ImportFile";
import { useFileStore } from "@/store/JurnalUmum/useFileStore";
import { notifications } from "@mantine/notifications";
import { navigate, routes } from "@/router";
import ReceiveMoneyLayout from "./Layout";
import ReceiveMoneyForm from "../components/ReceiveMoneyForm";
import dayjs from "dayjs";
import { useJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts';
import { useReceiveMoneyStore } from "../store/ReceiveMoneyStore";
import { useEffect, useState } from "react";
import TotalAmountReceive from "../components/TotalAmountReceive";
import PageHeaderV2 from "@/components/PageHeader/PageHeaderV2";
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";



const items = [
    { title: 'Bank & Cash', href: () => navigate(-1) },
    { title: 'Add Receive Money', href: undefined },
]

const AddReceiveMoneyPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { addTransaction, notes, setNotes, transactions } = useReceiveMoneyStore();
    const [transactionNumber, setTransactionNumber] = useState('');
    const [transactionDate, setTransactionDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    // const disableTransaction = useReceiveMoneyStore((state) => state.disableTransaction());

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

    return (
        <>
            <ReceiveMoneyLayout footer={
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
                            Add Receive
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
                                title="Add Receive Money"
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
                                        label="Deposit To"
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
                            <Stack align="stretch" justify="flex-start" gap="sm">
                                <Group justify="space-between">
                                    <TextMediumGR>Receive Money</TextMediumGR>
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
                                    <TotalAmountReceive />
                                </Box>
                                <ReceiveMoneyForm />
                                <Textarea
                                    label="Notes"
                                    placeholder="Add Notes"
                                    resize="vertical"
                                    mb={10}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <CustomDropzone
                                    loading={loading}
                                    onDrop={handleDrop}
                                    onReject={handleReject}
                                    accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                                    description="Attach images or documents, each file should not exceed 5mb"
                                />
                                <ImportFiles />
                            </Stack>
                        </Paper>
                    </Stack>
                </Container >
            </ReceiveMoneyLayout >
        </>
    );
}

export default AddReceiveMoneyPage;