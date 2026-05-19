import { Container, Grid, Paper, Stack, Title, Text, Notification, Flex } from "@mantine/core";
import { themeColors } from "@/theme";
import BusinessOverviewLayout from "./Layout";
import GeneralLedgerTable from "../components/GeneralLedger/GeneralLedgerTable";
import { useState } from "react";
import FilterDate from "../components/FilterDate";
import ExportMenu from "../components/ExportMenu";
import { exportReport } from "../services/Export.service";
import { API_EXPORT_REPORT } from "@/services/endpoint";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const GeneralLedgerReportPage = () => {
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
            // await exportReport({
            //     url: `${API_EXPORT_REPORT.EXPORT_REPORT_EC}`,
            //     fromDate,
            //     toDate,
            //     type,
            //     filenamePrefix: 'IncomeStatement',
            //     errorNoData: 'No Balance Sheet data available.',
            //     errorExportFailed: 'Failed to export Balance Sheet report.',
            // });
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
                                    <Title order={3}>General Ledger Report</Title>
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
                            <GeneralLedgerTable fromDate={fromDate} toDate={toDate} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BusinessOverviewLayout>
    )
}

export default GeneralLedgerReportPage;