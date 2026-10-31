import { Container, Grid, Paper, Stack, Title, Text, Group, Select, Button, Flex, Box } from "@mantine/core";
import { themeColors } from "@/theme";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown, IconFileExport } from "@tabler/icons-react";
import { formatCurrency } from "@/utils/FormatCurrency";
import BalanceSheetTable from "@/module/reports/presentation/components/balance-sheet/BalanceSheetTable";
import AppShellLayout from '@/components/AppShellLayout';
import IncomeStatementTable from "@/module/reports/presentation/components/income-statement/IncomeStatementTable";
import CashFlowTable from "@/module/reports/presentation/components/cash-flow/CashFlowTable";
import BusinessSummaryTable from "@/module/reports/presentation/components/business-summary/BusinessSummaryTable";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const BusinessSummaryPage = () => {
    const lastDate = 'Sept 19, 2024 at 12:22:12 (GMT+7)'
    const totalBalanceSheet = 200000
    return (
        <AppShellLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={1}>
                            <Grid columns={0} align='center'>
                                <Grid.Col>
                                    <Title order={3}>Business Sumary Report</Title>
                                </Grid.Col>

                            </Grid>
                            <Text c={themeColors.gray[6]} fz={14}>
                                Latest data : {lastDate}
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper {...PAPER_PROPS} >
                        <Stack>
                            <Flex gap="xs" justify="space-between" align="center" direction="row">
                                <Grid columns={24} gutter="sm" style={{ flexGrow: 1 }}>
                                    <Grid.Col span={6}>
                                        <DatePickerInput
                                            placeholder="Start Date Period"
                                            valueFormat="DD/MM/YYYY"
                                            highlightToday
                                            size="xs"
                                            clearable={true}
                                            rightSection={<IconCalendar size={16} />}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <DatePickerInput
                                            placeholder="End Date Period"
                                            valueFormat="DD/MM/YYYY"
                                            highlightToday
                                            size="xs"
                                            rightSection={<IconCalendar size={16} />}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Select
                                            checkIconPosition="right"
                                            rightSection={<IconChevronDown size={16} />}
                                            data={['All Period', 'Today', 'Yesterday', 'This Week', 'This Month', 'This Year']}
                                            placeholder="Select Period"
                                            defaultValue="All Period"
                                            size="xs"
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Button
                                    leftSection={<IconFileExport size={14} />}
                                    variant="default"
                                    size="xs"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Export
                                </Button>

                            </Flex>
                            <Stack gap={0}>
                                <Box
                                    bg={themeColors.primary[0]}
                                    bd="sm"
                                    p={10}
                                    style={{
                                        borderTopLeftRadius: 5,
                                        borderTopRightRadius: 5,
                                        borderColor: themeColors.gray[1],
                                        borderStyle: 'solid',
                                        borderWidth: '1px',
                                        borderBottomWidth: '0px'
                                    }}
                                >
                                    <Group justify="space-between">
                                        <Stack gap={1}>
                                            <Text c={themeColors.black[9]} fz={14} fw={500}>Report</Text>
                                            <Text c={themeColors.gray[6]} fz={14} fw={500}>Period : {lastDate}</Text>
                                        </Stack>
                                        <Text c={themeColors.black[9]} fz={14} fw={500}>Total : {formatCurrency(totalBalanceSheet)}</Text>
                                    </Group>
                                </Box>
                                <BusinessSummaryTable />

                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </AppShellLayout>
    )
}

export default BusinessSummaryPage;