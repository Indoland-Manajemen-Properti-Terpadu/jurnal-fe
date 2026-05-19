import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { GetEquityChangeReport } from "../../services/EquityChange.service";
import { NotFound } from "@/components/ErrorPage/NotFound";
import { dateFormatV2 } from "@/utils/FormatDate";

const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    bg: themeColors.teal[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderCollapse: 'collapse' as const,
};

const sectionCategoryStyle = {
    backgroundColor: themeColors.gray[1],

};

interface EquityChangeTableProps {
    fromDate?: string;
    toDate?: string;
}

const EquityChangesTable: React.FC<EquityChangeTableProps> = ({ fromDate, toDate }) => {
    const { data: reports, isError, isLoading } = GetEquityChangeReport({ fromDate: fromDate!, toDate: toDate! });
    const lastDate = '19 Sept 2021'

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
        <Stack>
            <Table highlightOnHover>
                <Table.Thead>
                    <Table.Tr style={{
                        backgroundColor: themeColors.teal[0],
                        borderColor: themeColors.gray[1],
                        borderWidth: '1px',
                        borderStyle: 'solid',
                    }}>
                        <Table.Th colSpan={4}  >
                            <Stack gap={1}>
                                <Text c={themeColors.black[9]} fz={14} fw={500}>Report</Text>
                                <Text c={themeColors.gray[6]} fz={14} fw={500}>  Period : {dateFormatV2(fromDate!!)} - {dateFormatV2(toDate!!)}</Text>
                            </Stack>
                        </Table.Th>
                        <Table.Th colSpan={2} ta='left' >Beginning Balance</Table.Th>
                        <Table.Th colSpan={2} ta='left' >Debit</Table.Th>
                        <Table.Th colSpan={2} ta='left' >Credit</Table.Th>
                        <Table.Th colSpan={2} ta='left' >Ending Balance</Table.Th>
                    </Table.Tr>
                </Table.Thead>


                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td colSpan={12} style={{
                            ...sectionCategoryStyle,
                            borderColor: themeColors.gray[1],
                            borderWidth: '1px',
                            borderStyle: 'solid',
                        }}>
                            <Text fz={14} w={500} gradient={gradientColors.mainGR} variant="gradient">
                                Owner Equity
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    {reports.accounts.map((account) => (
                        <Table.Tr key={account.name} style={rowStyle}>
                            <Table.Td fz={14} colSpan={4} style={{ textAlign: "left", fontWeight: account.isBold ? 600 : 400, }}>
                                {account.name && account.accountNumber
                                    ? `${account.name} (${account.accountNumber})`
                                    : account.name || account.accountNumber}
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: account.isBold ? 600 : 400, }}>
                                {formatCurrency(account.beginningBalance || 0)}
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: account.isBold ? 600 : 400, }}>
                                {formatCurrency(account.changesDebit || 0)}
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: account.isBold ? 600 : 400, }}>
                                {formatCurrency(account.changesCredit || 0)}
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: account.isBold ? 600 : 400, }}>
                                {formatCurrency(account.endingBalance || 0)}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default EquityChangesTable;
