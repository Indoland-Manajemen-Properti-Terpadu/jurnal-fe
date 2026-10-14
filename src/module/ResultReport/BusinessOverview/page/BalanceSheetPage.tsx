import { Container, Paper, Stack, Flex, Notification } from "@mantine/core";
import { IconScale } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/ResultReport/components/ReportPageHeader';
import BalanceSheetTable from "../components/BalanceSheet/BalanceSheetTable";
import BusinessOverviewLayout from "./Layout";
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
const BalanceSheetPage = () => {
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
                url: `${API_EXPORT_REPORT.EXPORT_REPORT_BS}`,
                fromDate,
                toDate,
                type,
                filenamePrefix: 'BalanceSheet',
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
                    <ReportPageHeader icon={IconScale} title="Neraca" description="Lihat posisi aset, liabilitas, dan ekuitas pada tanggal laporan." />
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
                            <BalanceSheetTable fromDate={fromDate!} toDate={toDate!} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </BusinessOverviewLayout>
    )
}

export default BalanceSheetPage;
