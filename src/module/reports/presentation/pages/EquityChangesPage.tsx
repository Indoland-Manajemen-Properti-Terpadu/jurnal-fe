import { Container, Grid, Paper, Stack, Title, Text, Group, Select, Button, Flex, Notification } from "@mantine/core";
import { IconArrowsExchange } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown, IconFileExport, IconX } from "@tabler/icons-react";
import { formatCurrency } from "@/utils/FormatCurrency";
import AppShellLayout from '@/components/AppShellLayout';
import EquityChangesTable from "@/module/reports/presentation/components/equity-changes/EquityChangesTable";
import { useState } from "react";
import { exportReport } from "@/module/reports/infrastructure/exportReport";
import { REPORT_EXPORT_ENDPOINTS } from "@/module/reports/infrastructure/reportEndpoints";
import ExportMenu from "@/module/reports/presentation/components/shared/ExportMenu";
import FilterDate from "@/module/reports/presentation/components/shared/FilterDate";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const EquityChangesPage = () => {
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
                url: `${REPORT_EXPORT_ENDPOINTS.EQUITY_CHANGE}`,
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
        <AppShellLayout>
            <Container fluid>
                <Stack gap="lg">
                    <ReportPageHeader icon={IconArrowsExchange} title="Perubahan Ekuitas" description="Tinjau perubahan modal dan komponen ekuitas selama periode." />
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
                            <EquityChangesTable fromDate={fromDate} toDate={toDate} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </AppShellLayout>
    )
}

export default EquityChangesPage;
