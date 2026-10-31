import { Container, Paper, Stack, Flex } from "@mantine/core";
import { IconFileAnalytics } from '@tabler/icons-react';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown, IconFileExport } from "@tabler/icons-react";
import { formatCurrency } from "@/utils/FormatCurrency";
import AppShellLayout from '@/components/AppShellLayout';
import BalanceSheetTable from "@/module/reports/presentation/components/balance-sheet/BalanceSheetTable";
import TrialBalanceTable from "@/module/reports/presentation/components/trial-balance/TrialBalanceTable";
import { useState } from "react";
import FilterDate from "@/module/reports/presentation/components/shared/FilterDate";

const PAPER_PROPS = {
    p: 'md',
    shadow: 'md',
    radius: 'md',
};
const TrialBalancePage = () => {
    const totalBalanceSheet = 200000
    const [fromDate, setFromDate] = useState<string | undefined>();
    const [toDate, setToDate] = useState<string | undefined>();

    const handleFilterChange = (start: string | undefined, end: string | undefined) => {
        setFromDate(start);
        setToDate(end);
    };

    return (
        <AppShellLayout>
            <Container fluid>
                <Stack gap="lg">
                    <ReportPageHeader icon={IconFileAnalytics} title="Neraca Saldo" description="Periksa saldo debit dan kredit akun sebelum menyusun laporan keuangan." />
                    <Paper {...PAPER_PROPS} >
                        <Stack>
                            <Flex gap="xs" justify="space-between" align="center" direction="row">
                                <FilterDate onFilterChange={handleFilterChange} />
                            </Flex>
                            <TrialBalanceTable fromDate={fromDate!} toDate={toDate!} />
                        </Stack>
                    </Paper>
                </Stack>
            </Container>
        </AppShellLayout>
    )
}

export default TrialBalancePage;
