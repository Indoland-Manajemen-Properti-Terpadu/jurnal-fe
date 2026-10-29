import React from "react";
import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts, type JournalAccounts } from "@/module/chart-of-accounts";
import IncomeStatementTableRow, { CostofRevenueRow, NonOperatingExpensesRow, NonOperatingIncomeRow, ProfitandTaxRow } from "./TableRow";
import EmptyState from "@/components/EmptyState/EmptyTable";

const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
}

const IncomeStatementTable: React.FC = () => {
    const { accounts, isError } = useJournalAccounts();

    if (isError) {
        return <Text c="red">Failed to load data.</Text>;
    }
    if (!accounts || accounts.length === 0) {
        return <EmptyState />
    }


    // Helper function to filter accounts by category
    const filterByCategory = (accounts: JournalAccounts[], category: string) => {
        return accounts.filter((account) => account.category?.name?.toLowerCase() === category.toLowerCase());
    };

    // Filter accounts by specific categories
    const operatingRevenue = filterByCategory(accounts, "sales revenue");
    const operatingExpenses = filterByCategory(accounts, "operating expenses");
    const nonOperatingIncome = filterByCategory(accounts, "other revenue");


    // Calculate totals for each category
    const calculateTotal = (items: JournalAccounts[]) =>
        items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const operatingRevenueTotal = calculateTotal(operatingRevenue);
    const operatingExpenseTotal = calculateTotal(operatingExpenses);
    const nonOperatingIncomeTotal = calculateTotal(nonOperatingIncome);


    return (
        <Stack gap={0}>
            <Box
                bg={themeColors.primary[0]}
                bd="sm"
                p={10}
                style={{
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderColor: themeColors.gray[1],
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderBottomWidth: '0px'
                }}
            >
                <Group justify="space-between">
                    <Text c={themeColors.black[9]} fz={14} fw={500}>Report</Text>
                    <Text c={themeColors.black[9]} fz={14} fw={500}>Total : {formatCurrency(200)}</Text>
                </Group>
            </Box>
            <Table
                withTableBorder
                style={rowStyle}>
                <Table.Tbody>

                    {/* Operating Revenue */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Operating Revenue
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    {operatingRevenue.map((account: JournalAccounts) => (
                        <Table.Tr
                            key={account.id}
                            style={rowStyle}>
                            <Table.Td fz="sm" style={{ width: "70%" }}>
                                {account.name} ({account.accountNumber})
                            </Table.Td>
                            <Table.Td fz="sm" style={{ textAlign: "right" }}>
                                {formatCurrency(account.amount || 0)}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    <IncomeStatementTableRow categoryName="sales revenue" categoryTotal={operatingRevenueTotal} />

                    {/* Cost of Revenue */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Cost of Revenue
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    <CostofRevenueRow total={50000} />

                    {/* Operating Expense */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Operating Expense
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    {operatingExpenses.map((account: JournalAccounts) => (
                        <Table.Tr key={account.id} style={rowStyle}>
                            <Table.Td fz="sm" style={{ width: "70%" }}>
                                {account.name} ({account.accountNumber})
                            </Table.Td>
                            <Table.Td fz="sm" style={{ textAlign: "right" }}>
                                {formatCurrency(account.amount || 0)}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    <IncomeStatementTableRow categoryName="operating expenses" categoryTotal={operatingExpenseTotal} />

                    {/* Non-Operating Expenses */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Non-Operating Expenses
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    <NonOperatingExpensesRow total={30000} />

                    {/* Non-Operating Income */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Non-Operating Income
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    {nonOperatingIncome.map((account: JournalAccounts) => (
                        <Table.Tr key={account.id} style={rowStyle}>
                            <Table.Td fz="sm" style={{ width: "70%" }}>
                                {account.name} ({account.accountNumber})
                            </Table.Td>
                            <Table.Td fz="sm" style={{ textAlign: "right" }}>
                                {formatCurrency(account.amount || 0)}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    <IncomeStatementTableRow categoryName="other revenue" categoryTotal={nonOperatingIncomeTotal} />

                    {/* Profit & Tax */}
                    <Table.Tr>
                        <Table.Td colSpan={2} style={headTableStyle}>
                            <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                Profit & Tax
                            </Text>
                        </Table.Td>
                    </Table.Tr>
                    <ProfitandTaxRow total={30000} />

                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default IncomeStatementTable;
