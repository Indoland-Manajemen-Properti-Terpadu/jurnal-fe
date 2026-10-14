import { Container, Paper, Stack, Flex, Notification } from "@mantine/core";
import { IconChartBar } from '@tabler/icons-react';
import { ReportPageHeader } from '../../../presentation/components/ReportPageHeader';
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
                    <ReportPageHeader icon={IconChartBar} title="Laba Rugi" description="Tinjau pendapatan dan beban untuk memahami hasil usaha selama periode." />
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
