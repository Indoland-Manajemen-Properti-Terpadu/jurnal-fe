import { Container, Grid, Paper, Stack, Title, Text, Flex, Notification } from "@mantine/core";
import { themeColors } from "@/theme";
import BusinessOverviewLayout from "./Layout";
import IncomeStatementTable from "../components/IncomeStatement/IncomeStatmentTable";
import { useState } from "react";
import FilterDate from "../components/FilterDate";
import ExportMenu from "../components/ExportMenu";
import { API_EXPORT_REPORT } from "@/services/endpoint";
import { exportReport } from "../services/Export.service";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const IncomeStatementPage = () => {
    const [fromDate, setFromDate] = useState<string | undefined>();
    const [toDate, setToDate] = useState<string | undefined>();
    const lastDate = "Dec 6, 2024 at 01:51:09 (GMT+7)";

    const handleFilterChange = (start: string | undefined, end: string | undefined) => {
        setFromDate(start);
        setToDate(end);
    };

    const handleExport = async (type: 'pdf' | 'csv' | 'xlsx') => {
        if (!fromDate || !toDate) {
            <Notification color="red" title="Period must be choosed">
                Please select a date range or period before exporting.
            </Notification>
            return;
        }
        try {
            await exportReport({
                url: `${API_EXPORT_REPORT.EXPORT_REPORT_IS}`,
                fromDate,
                toDate,
                type,
                filenamePrefix: 'IncomeStatement',
                errorNoData: 'No Balance Sheet data available.',
                errorExportFailed: 'Failed to export Balance Sheet report.',
            });
        } catch (error) {
            alert("Failed to export the report. Please try again.");
        }
    };

    return (
        <BusinessOverviewLayout>
            <Container fluid>
                <Stack gap="lg">
                    <Paper {...PAPER_PROPS}>
                        <Stack gap={1}>
                            <Grid columns={0} align='center'>
                                <Grid.Col>
                                    <Title order={3}>Income Statement</Title>
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
                                <FilterDate onFilterChange={handleFilterChange} />
                                <ExportMenu
                                    onExportPDF={() => handleExport("pdf")}
                                    onExportCSV={() => handleExport("csv")}
                                    onExportXLSX={() => handleExport("xlsx")}
                                />
                            </Flex>
                            <IncomeStatementTable fromDate={fromDate} toDate={toDate} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BusinessOverviewLayout>
    )
}

export default IncomeStatementPage;