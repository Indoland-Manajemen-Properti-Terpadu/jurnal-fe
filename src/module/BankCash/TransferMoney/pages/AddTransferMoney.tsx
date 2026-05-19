import { Anchor, Box, Button, Container, Group, Paper, Stack, TagsInput, Textarea, TextInput } from "@mantine/core";
import TransferMoneyLayout from "./Layout";
import { IconCalendar, IconPlus, IconSearch } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { gradientColors, themeColors } from "@/theme";
import { PageHeader } from "@/components";
import { DatePickerInput } from "@mantine/dates";
import { TextMediumGR } from "@/components/Text/CustomText";
import CustomDropzone from "@/components/Dropzone/CustomDropzone";
import TotalAmount from "@/module/GeneralJournal/DetailAccount/TransactionJournal/components/Amounts";
import TransactionForm from "@/module/GeneralJournal/DetailAccount/TransactionJournal/components/Form/TransactionForm";
import ImportFiles from "@/module/GeneralJournal/DetailAccount/TransactionJournal/components/ImportFile";
import { useFileStore } from "@/store/GeneralJournal/useFileStore";
import { notifications } from "@mantine/notifications";
import { routes } from "@/router/routes";
import TransferMoneyForm from "../components/TransferMoneyForm";


const items = [
    { title: 'Settings', href: '#' },
    { title: 'General Journal', href: '#' },
    { title: 'Add Transaction', href: '#' },
].map((item) => (
    <Anchor href={item.href} key={item.title}>
        {item.title}
    </Anchor>
));

const AddTransferMoneyPage = () => {
    const navigate = useNavigate();
    const [files, setFiles, clearFiles] = useFileStore((state) => [
        state.files,
        state.setFiles,
        state.clearFiles,
    ]);
    const handleDrop = (f: File[]) => {
        setFiles(f);
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
            <TransferMoneyLayout footer={
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
                            color={themeColors.gray[7]}
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="gradient"
                            gradient={gradientColors.gradient}
                        >
                            Add Transfer
                        </Button>
                    </Group>
                </Group>
            }
            >
                <Container fluid>
                    <Stack gap="lg">
                        <Paper p="md" shadow="md" radius="md">
                            <PageHeader title="Add Transfer Money" breadcrumbItems={items} />
                        </Paper>
                        <Paper p="md" shadow="md" radius="md">
                            <Group grow>
                                <TextInput
                                    key="transactionNumber"
                                    label="Transaction Number"
                                    placeholder="Add name"
                                    withAsterisk
                                // onChange={(e) => setTransactionNumber(e.target.value)}
                                // value={transactionNumber}
                                />
                                <DatePickerInput
                                    label="Transaction Date"
                                    dropdownType="popover"
                                    // value={dayjs(transactionDate).toDate()}
                                    // onChange={(date) => setTransactionDate(dayjs(date).format('YYYY-MM-DD'))}
                                    withAsterisk
                                    placeholder="Add Date"
                                    rightSection={<IconCalendar size={14} />}
                                />
                            </Group>
                        </Paper>
                        <Paper p="md" shadow="md" radius="md">
                            <Stack align="stretch" justify="flex-start" gap="sm">
                                <TextMediumGR>Transaction Account</TextMediumGR>
                                <TransferMoneyForm />
                                <Textarea
                                    label="Notes"
                                    placeholder="Add Notes"
                                    resize="vertical"
                                    mb={10}
                                // value={notes}
                                // onChange={(e) => setNotes(e.target.value)}
                                />
                                <CustomDropzone
                                    onDrop={handleDrop}
                                    onReject={handleReject}
                                    description="Attach images or documents, each file should not exceed 5mb"
                                />
                                <ImportFiles />
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </TransferMoneyLayout>
        </>
    );
}

export default AddTransferMoneyPage;