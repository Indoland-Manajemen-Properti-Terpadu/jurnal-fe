import { Container, Grid, Paper, Stack, Title, Text, Group, Select, Button, Flex, Box } from "@mantine/core";
import { themeColors } from "@/theme";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown, IconFileExport } from "@tabler/icons-react";
import { formatCurrency } from "@/utils/FormatCurrency";
import BalanceSheetLayout from "./Layout";
import BalanceSheetTable from "../components/BalanceSheet/BalanceSheetTable";
import BusinessOverviewLayout from "./Layout";
import TrialBalanceTable from "../components/TrialBalance/TrialBalanceTable";
import { useState } from "react";
import FilterDate from "../components/FilterDate";
import ExportMenu from "../components/ExportMenu";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const TrialBalancePage = () => {
    const totalBalanceSheet = 200000
    const [fromDate, setFromDate] = useState<string | undefined>();
    const [toDate, setToDate] = useState<string | undefined>();
    const lastDate = "Dec 6, 2024 at 01:51:09 (GMT+7)";

    const handleFilterChange = (start: string | undefined, end: string | undefined) => {
        setFromDate(start);
        setToDate(end);
    };

    const handleExportPDF = () => {
        console.log("Exporting to PDF");
        // Add export PDF logic here
    };

    const handleExportCSV = () => {
        console.log("Exporting to CSV");
        // Add export CSV logic here
    };

    const handleExportXLSX = () => {
        console.log("Exporting to XLSX");
        // Add export XLSX logic here
    };
    return (
        <BusinessOverviewLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={1}>
                            <Grid columns={0} align='center'>
                                <Grid.Col>
                                    <Title order={3}>Trial Balance</Title>
                                </Grid.Col>

                            </Grid>
                            <Text c={themeColors.grey[6]} fz={14}>
                                Latest data : {lastDate}
                            </Text>
                        </Stack>
                    </Paper>
                    <Paper {...PAPER_PROPS} >
                        <Stack>
                            <Flex gap="xs" justify="space-between" align="center" direction="row">
                                <FilterDate onFilterChange={handleFilterChange} />
                                <ExportMenu
                                    onExportPDF={handleExportPDF}
                                    onExportCSV={handleExportCSV}
                                    onExportXLSX={handleExportXLSX}
                                />
                            </Flex>
                            <TrialBalanceTable fromDate={fromDate!} toDate={toDate!} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BusinessOverviewLayout>
    )
}

export default TrialBalancePage;