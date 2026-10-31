import React from "react";
import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useIncomeStatementReport } from "@/module/reports/presentation/hooks/useIncomeStatementReport";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { IncomeStatementReport } from "@/module/reports/domain/IncomeStatement.types";
import { NotFound } from "@/components/ErrorPage/NotFound";
import ReportHeaderPeriod from "@/module/reports/presentation/components/shared/ReportHeaderPeriod";

const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: "1px",
    borderStyle: "solid",
};

const headTableStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: "1px",
    borderStyle: "solid",
};

interface IncomeStatementTableProps {
    fromDate?: string;
    toDate?: string;
}

const IncomeStatementTable: React.FC<IncomeStatementTableProps> = ({ fromDate, toDate }) => {
    const { data: reports, isError, isLoading } = useIncomeStatementReport({ fromDate: fromDate!, toDate: toDate! });
    if (isError) {
        return <NotFound />;
    }

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!reports) {
        return <EmptyState />
    }

    return (
        <Stack gap={0}>
            <ReportHeaderPeriod fromDate={fromDate!!} toDate={toDate!!} />
            <Table withTableBorder style={rowStyle}>
                <Table.Tbody>
                    {reports?.map((report: IncomeStatementReport) => (
                        <React.Fragment key={report.name}>
                            <Table.Tr>
                                <Table.Td colSpan={2} style={headTableStyle}>
                                    <Text fz={14} w={500} gradient={gradientColors.mainGR} variant="gradient">
                                        {report.name}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>

                            {/* List of accounts */}
                            {report.accounts?.map((account) => (
                                <Table.Tr key={account.name} style={rowStyle}>
                                    <Table.Td
                                        style={{
                                            fontWeight: account.isBold ? 600 : 400,
                                        }}
                                    >
                                        {account.name}
                                        {!account.isBold && ` (${account.accountNumber})`}
                                    </Table.Td>
                                    <Table.Td
                                        style={{
                                            textAlign: "right",
                                            fontWeight: account.isBold ? 600 : 400,
                                        }}
                                    >
                                        {account.totalAmount >= 0
                                            ? formatCurrency(account.totalAmount ?? 0)
                                            : `(${formatCurrency(Math.abs(account.totalAmount ?? 0))})`}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </React.Fragment>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default IncomeStatementTable;
