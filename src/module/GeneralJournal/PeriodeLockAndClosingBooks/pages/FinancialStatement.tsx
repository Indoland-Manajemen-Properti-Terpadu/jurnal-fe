import { Anchor, Button, Container, Group, Paper, rem, Stack, Tabs, Title, Text, Box } from "@mantine/core";
import { IconChartBar, IconExchange, IconFileDollar, IconMessageCircle, IconPhoto, IconScale, IconSettings } from "@tabler/icons-react";
import PeriodLockAndClosingBookLayout from "./Layout";
import { uuID } from "@/utils/uuid";
import { gradientColors, themeColors } from "@/theme";
import { navigate } from "@/router";
import { routes } from "@/router/routes";
import WorkingPaperTable from "../components/WorkingPaperTable";
import TrialBalanceTable from "../components/TrialBalanceTable";
import IncomeStatementTable from "../components/IncomeStatement/IncomeStatmentTable";
import { formatCurrency } from "@/utils/FormatCurrency";
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


const FinancialstatementPage = () => {
    const iconStyle = { width: rem(12), height: rem(12) };


    const PAPER_PROPS = {
        p: 'md',
        shadow: 'md',
        radius: 'md',
    };

    return (
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
                                onClick={() => navigate(routes.PeriodAndClosingBook.ListPLandCB)}
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
                        <Stack gap={2}>
                            <Title order={3}>Financial Statement</Title>
                            <Text c={themeColors.gray[6]} fz={14}>
                                From start to 31/07/2024
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper {...PAPER_PROPS}>
                        <Stack align="stretch" justify="flex-start" gap="sm">
                            <Tabs color={themeColors.primary[6]} defaultValue="trial-balance">
                                <Tabs.List>
                                    <Tabs.Tab value="trial-balance" leftSection={<IconScale style={iconStyle} />}>
                                        Trial Balance
                                    </Tabs.Tab>
                                    <Tabs.Tab value="income-statement" leftSection={<IconChartBar style={iconStyle} />}>
                                        Income Statement
                                    </Tabs.Tab>
                                    <Tabs.Tab value="balance-sheet" leftSection={<IconFileDollar style={iconStyle} />}>
                                        Balance Sheet
                                    </Tabs.Tab>
                                    <Tabs.Tab value="cash-flow" leftSection={<IconExchange style={iconStyle} />}>
                                        Cash Flow
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="trial-balance">
                                    <Stack gap='md' mt='md'>
                                        <Group justify='space-between'>
                                            <Stack gap={1}>
                                                <Text fw={500} fz={18} c={themeColors.slate[8]}> Trial Balance</Text>
                                                <Text fw={400} fz={14} c={themeColors.gray[6]}> Period 31/07/2024</Text>
                                            </Stack>
                                            <Text fw={500} fz={18} c={themeColors.slate[8]}> PT Kolang Kaling Keliling</Text>
                                        </Group>
                                        <TrialBalanceTable />
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="income-statement">
                                    <Stack gap='md' mt='md'>
                                        <Group justify='space-between'>
                                            <Stack gap={1}>
                                                <Text fw={500} fz={18} c={themeColors.slate[8]}> Income Statement</Text>
                                                <Text fw={400} fz={14} c={themeColors.gray[6]}> Period 31/07/2024</Text>
                                            </Stack>
                                            <Text fw={500} fz={18} c={themeColors.slate[8]}> PT Kolang Kaling Keliling</Text>
                                        </Group>
                                        <IncomeStatementTable />
                                    </Stack>
                                </Tabs.Panel>

                                <Tabs.Panel value="balance-sheet">
                                    <Stack gap='md' mt='md'>
                                        <Group justify='space-between'>
                                            <Stack gap={1}>
                                                <Text fw={500} fz={18} c={themeColors.slate[8]}> Balance Sheet</Text>
                                                <Text fw={400} fz={14} c={themeColors.gray[6]}> Period 31/07/2024</Text>
                                            </Stack>
                                            <Text fw={500} fz={18} c={themeColors.slate[8]}> PT Kolang Kaling Keliling</Text>
                                        </Group>
                                        <BalanceSheetTable />
                                    </Stack>
                                </Tabs.Panel>
                                <Tabs.Panel value="cash-flow">
                                    <Stack gap='md' mt='md'>
                                        <Group justify='space-between'>
                                            <Stack gap={1}>
                                                <Text fw={500} fz={18} c={themeColors.slate[8]}> Cash Flow</Text>
                                                <Text fw={400} fz={14} c={themeColors.gray[6]}> Period 31/07/2024</Text>
                                            </Stack>
                                            <Text fw={500} fz={18} c={themeColors.slate[8]}> PT Kolang Kaling Keliling</Text>
                                        </Group>
                                        <CashFlowTable />
                                    </Stack>
                                </Tabs.Panel>
                            </Tabs>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </PeriodLockAndClosingBookLayout>

    );
}

export default FinancialstatementPage;