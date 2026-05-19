import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { GetTrialBalanceReport } from "../../services/TrialBalance.service";
import { NotFound } from "@/components/ErrorPage/NotFound";
import { TrialBalanceReport, Account, Reports } from "../../types/TrialBalanceReport.types";
interface TrialBalanceTableProps {
    fromDate: string;
    toDate: string;
}


const TrialBalanceTable: React.FC<TrialBalanceTableProps> = ({ fromDate, toDate }) => {
    const { data: Reports, isError } = GetTrialBalanceReport(fromDate, toDate)

    if (isError) {
        return <NotFound />;
    }

    if (!Reports?.data.length) {
        return <Text>No data available for the selected date range.</Text>;
    }

    return (
        <Stack>
            <Table withTableBorder highlightOnHover>
                <Table.Thead>
                    <Table.Tr style={{
                        backgroundColor: themeColors.teal[0],
                    }}>
                        <Table.Th colSpan={2} rowSpan={2} ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Account Name</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Beginning Balance</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Changes</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Closing Balance</Table.Th>
                    </Table.Tr>
                    <Table.Tr style={{
                        backgroundColor: themeColors.teal[0],
                    }}>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Debit</Table.Th>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Credit</Table.Th>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Debit</Table.Th>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Credit</Table.Th>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Debit</Table.Th>
                        <Table.Th ta='center' style={{ border: `1px solid ${themeColors.gray[2]}` }}>Credit</Table.Th>
                    </Table.Tr>
                </Table.Thead>


                <Table.Tbody>
                    {/* Category Name */}

                    {Reports.data?.map((item: Reports) => (
                        <React.Fragment key={item.category}>
                            {/* Category Header Section*/}
                            <Table.Tr>
                                <Table.Td
                                    colSpan={12}
                                    style={{ backgroundColor: themeColors.gray[1] }}>
                                    <Text
                                        fz="sm"
                                        w={600}
                                        variant="gradient"
                                        gradient={gradientColors.mainGR}>
                                        {item.category}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>

                            {/* AcountName Items within the category */}
                            {item.account?.map((accounts: Account) => (
                                <Table.Tr key={accounts.id}>
                                    <Table.Td
                                        colSpan={2}
                                        fz="sm"
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {accounts.name} ({accounts.accountNumber})
                                    </Table.Td>
                                    {/* Beginning Balance */}
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.beginningBalance.debit!)}
                                    </Table.Td>
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.beginningBalance.credit!)}
                                    </Table.Td>

                                    {/* Changes */}
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.changes.debit!)}
                                    </Table.Td>
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.changes.credit!)}
                                    </Table.Td>

                                    {/* Ending Balance */}
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.endingBalance.debit!)}
                                    </Table.Td>
                                    <Table.Td
                                        fz="sm"
                                        ta='center'
                                        style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                        {formatCurrency(accounts.endingBalance.credit!)}
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </React.Fragment>
                    ))}
                </Table.Tbody>
                {/* End of Table Column Total // SKIP FOR NOW */}
                <Table.Tr>
                    <Table.Td
                        fz="sm"
                        colSpan={2}
                        style={{ fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        Total
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalDebitBeginningBalance >= 0
                            ? formatCurrency(Reports.total.totalDebitBeginningBalance)
                            : `(${formatCurrency(Math.abs(Reports.total.totalDebitBeginningBalance))})`}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalCreditBeginningBalance >= 0
                            ? formatCurrency(Reports.total.totalCreditBeginningBalance)
                            : `(${formatCurrency(Math.abs(Reports.total.totalCreditBeginningBalance))})`}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalDebitChanges >= 0
                            ? formatCurrency(Reports.total.totalDebitChanges)
                            : `(${formatCurrency(Math.abs(Reports.total.totalDebitChanges))})`}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalCreditChanges >= 0
                            ? formatCurrency(Reports.total.totalCreditChanges)
                            : `(${formatCurrency(Math.abs(Reports.total.totalCreditChanges))})`}

                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalDebitBeginningBalance >= 0
                            ? formatCurrency(Reports.total.totalDebitBeginningBalance)
                            : `(${formatCurrency(Math.abs(Reports.total.totalDebitBeginningBalance))})`}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "center", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {Reports.total.totalCreditEndingBalance >= 0
                            ? formatCurrency(Reports.total.totalCreditEndingBalance)
                            : `(${formatCurrency(Math.abs(Reports.total.totalCreditEndingBalance))})`}

                    </Table.Td>
                </Table.Tr>
            </Table>
        </Stack>
    );
};

export default TrialBalanceTable;