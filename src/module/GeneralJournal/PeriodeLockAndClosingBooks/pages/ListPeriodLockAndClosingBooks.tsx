import { Anchor, Button, Container, Group, Paper, rem, Stack, Tabs, Title, Text, Box } from "@mantine/core";
import { IconChartBar, IconExchange, IconFileDollar, IconScale } from "@tabler/icons-react";
import PeriodLockAndClosingBookLayout from "./Layout";
import { uuID } from "@/utils/uuid";
import { gradientColors, themeColors } from "@/theme";
import { navigate } from "@/router";
import { routes } from "@/router/routes";
import TrialBalanceTable from "../components/TrialBalanceTable";
import IncomeStatementTable from "../components/IncomeStatement/IncomeStatmentTable";

import BalanceSheetTable from "../components/BalanceSheet/BalanceSheetTable";
import CashFlowTable from "../components/CashFlow/CashFlowTable";
import { useState } from "react";
import SaveAsDraftModal from "../components/ModalSaveAsDraft";
import { notifications } from "@mantine/notifications";

const items = [
    { title: 'Settings', href: '#' },
    { title: 'General Journal', href: '#' },
    { title: 'Add Account', href: '#' },
].map((item) => (
    <Anchor href={item.href} key={uuID}>
        {item.title}
    </Anchor>
));


const ListPeriodLockAndClosingBooksPage = () => {
    const iconStyle = { width: rem(12), height: rem(12) };
    const [isConfirmDraftModalOpen, setIsConfirmDraftModalOpen] = useState(false);
    const openConfirmSaveDraft = () => setIsConfirmDraftModalOpen(true);
    const closeConfirmSaveDraft = () => setIsConfirmDraftModalOpen(false);

    const handleSaveAsDraft = () => {
        notifications.show({
            color: themeColors.red[6],
            autoClose: 3000,
            title: 'Successfully Delete Transaction',
            message: 'Selected transaction has been deleted',
        });
        closeConfirmSaveDraft();
    };


    const PAPER_PROPS = {
        p: 'md',
        shadow: 'md',
        radius: 'md',
    };

    return (
        <>
            <PeriodLockAndClosingBookLayout
                footer={
                    <Container fluid px="lg">
                        <Group grow>
                            <Group justify="flex-end" gap="xs" mt='md'>
                                <Button
                                    variant="light"
                                    color={themeColors.gray[7]}
                                    onClick={() => navigate(-1)}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="gradient"
                                    gradient={gradientColors.gradient}
                                    onClick={openConfirmSaveDraft}
                                >
                                    Confirm
                                </Button>
                            </Group>
                        </Group>
                    </Container>
                }
            >
                <Container fluid>
                    <Stack gap="lg">
                        <Paper {...PAPER_PROPS}>
                            <Group justify='space-between'>
                                <Title order={3}>List Period Lock & Closing the Books</Title>
                                <Group>
                                    <Button
                                        variant="light"
                                        color={themeColors.gray[7]}
                                        onClick={() => navigate(-1)}
                                    >
                                        Add Period Lock
                                    </Button>
                                    <Button
                                        variant="gradient"
                                        gradient={gradientColors.gradient}
                                        onClick={openConfirmSaveDraft}
                                    >
                                        Start Closing the Book
                                    </Button>
                                </Group>
                            </Group>
                        </Paper>
                        <Paper {...PAPER_PROPS}>
                            <Stack align="stretch" justify="flex-start" gap="sm">
                            </Stack>
                        </Paper>
                    </Stack>
                </Container>
            </PeriodLockAndClosingBookLayout>
            <SaveAsDraftModal
                opened={isConfirmDraftModalOpen}
                onClose={closeConfirmSaveDraft}
                onSave={handleSaveAsDraft}
            />
        </>

    );
}

export default ListPeriodLockAndClosingBooksPage;