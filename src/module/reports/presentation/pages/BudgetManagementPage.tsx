import { Container, Grid, Paper, Stack, Title, Text, Group, Select, Button, Flex, Box } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown, IconFileExport, IconX } from "@tabler/icons-react";
import { formatCurrency } from "@/utils/FormatCurrency";
import BusinessOverviewLayout from "@/module/reports/presentation/pages/Layout";
import EquityChangesTable from "@/module/reports/presentation/components/equity-changes/EquityChangesTable";
import { useState } from "react";
import { navigate } from "@/router";
import { routes } from "@/router/routes";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const BudgetManagementPage = () => {
    const lastDate = '19 Sept 2021'
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>('All Period');


    return (
        <BusinessOverviewLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Group justify="space-between">
                            <Stack gap={1}>
                                <Grid columns={0} align='center'>
                                    <Grid.Col>
                                        <Title order={3}>Budget Management</Title>
                                    </Grid.Col>

                                </Grid>
                            </Stack>
                            <Group>
                                <Select
                                    checkIconPosition="right"
                                    clearable={!!selectedPeriod}
                                    rightSection={!selectedPeriod ? <IconChevronDown size={16} /> : null}
                                    data={['Budget Testing 1', 'Budget Testing 2']}
                                    placeholder="Select Period"
                                    value={selectedPeriod}
                                    onChange={setSelectedPeriod}
                                />
                                <Button
                                    variant="gradient"
                                    gradient={gradientColors.gradient}
                                // onClick={() => navigate(routes.generalJournal.addAccountJournal)}
                                >
                                    Add Budget
                                </Button>
                            </Group>
                        </Group>
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
                                            value={startDate}
                                            onChange={setStartDate}
                                            clearable={!!startDate}
                                            rightSection={!startDate ? <IconCalendar size={16} /> : null}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <DatePickerInput
                                            placeholder="End Date Period"
                                            valueFormat="DD/MM/YYYY"
                                            highlightToday
                                            size="xs"
                                            value={endDate}
                                            onChange={setEndDate}
                                            clearable={!!endDate}
                                            rightSection={!endDate ? <IconCalendar size={16} /> : null}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Select
                                            checkIconPosition="right"
                                            clearable={!!selectedPeriod}
                                            rightSection={!selectedPeriod ? <IconChevronDown size={16} /> : null}
                                            data={['All Period', 'Today', 'Yesterday', 'This Week', 'This Month', 'This Year']}
                                            placeholder="Select Period"
                                            value={selectedPeriod}
                                            onChange={setSelectedPeriod}
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
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BusinessOverviewLayout>
    )
}

export default BudgetManagementPage;