import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { GetBalanceSheetReport } from "../../services/BalanceSheet.service";
import React from "react";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { NotFound } from "@/components/ErrorPage/NotFound";
import { Account, Reports } from "../../types/BalanceSheet.types";
import ReportHeaderPeriod from "../ReportHeaderPeriod";

interface BalanceSheetTableProps {
    fromDate: string;
    toDate: string;
}

const BalanceSheetTable: React.FC<BalanceSheetTableProps> = ({ fromDate, toDate }) => {
    const { data: reports, isError } = GetBalanceSheetReport({ fromDate: fromDate, toDate: toDate });
    if (isError) {
        return <NotFound />
    }
    if (!reports) {
        return <EmptyState />
    }

    return (
        <Stack gap={0}>
            <ReportHeaderPeriod fromDate={fromDate!!} toDate={toDate!!} />
            <Table withTableBorder highlightOnHover>
                <Table.Tbody>
                    {reports.account?.map((report: Reports) => (
                        <React.Fragment key={report.name}>
                            {/* Header Kategori */}
                            <Table.Tr>
                                <Table.Td colSpan={2} style={{
                                    backgroundColor: themeColors.gray[1],
                                }}>
                                    <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                        {report.name}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>

                            {/* List account of category */}
                            {report.accounts?.map((account: Account) => (
                                <Table.Tr key={account.accountNumber}>
                                    <Table.Td
                                        style={{
                                            fontWeight: account.isBold ? 600 : 400,
                                        }}
                                    >
                                        {account.name}
                                        {!account.isBold && account.accountNumber ? ` (${account.accountNumber})` : ''}
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

export default BalanceSheetTable;
