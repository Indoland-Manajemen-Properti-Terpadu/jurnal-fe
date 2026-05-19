import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from "@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts";
import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";

const HeaderTableStyle = {
    border: `1px solid ${themeColors.gray[2]}`,
    fontSize: '14',
    fontWeight: '500'
}

const WorkingPaperTable: React.FC = () => {
    const { accounts, isError } = useJournalAccounts();

    if (isError) {
        return <Text c="red">Failed to load data.</Text>;
    }

    const groupedAccounts: { [categoryName: string]: JournalAccounts[] } | undefined = accounts?.reduce(
        (acc: { [categoryName: string]: JournalAccounts[] }, account: JournalAccounts) => {
            const categoryName = account.category?.name || "Uncategorized";
            if (!acc[categoryName]) {
                acc[categoryName] = [];
            }
            acc[categoryName].push(account);
            return acc;
        },
        {}
    );

    return (
        <Stack>
            <Table withTableBorder highlightOnHover>
                <Table.Thead>
                    <Table.Tr style={{
                        backgroundColor: themeColors.teal[0],
                    }}>
                        <Table.Th colSpan={2} rowSpan={2} ta='center' style={HeaderTableStyle}>Code</Table.Th>
                        <Table.Th colSpan={2} rowSpan={2} ta='center' style={HeaderTableStyle}>Account Name</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={HeaderTableStyle}>Trial Balance</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={HeaderTableStyle}>Income Statement</Table.Th>
                        <Table.Th colSpan={2} rowSpan={1} ta='center' style={HeaderTableStyle}>Balance Sheet</Table.Th>
                    </Table.Tr>
                    <Table.Tr style={{
                        backgroundColor: themeColors.teal[0],
                    }}>
                        <Table.Th ta='center' style={HeaderTableStyle}>Debit</Table.Th>
                        <Table.Th ta='center' style={HeaderTableStyle}>Credit</Table.Th>
                        <Table.Th ta='center' style={HeaderTableStyle}>Debit</Table.Th>
                        <Table.Th ta='center' style={HeaderTableStyle}>Credit</Table.Th>
                        <Table.Th ta='center' style={HeaderTableStyle}>Debit</Table.Th>
                        <Table.Th ta='center' style={HeaderTableStyle}>Credit</Table.Th>
                    </Table.Tr>
                </Table.Thead>


                <Table.Tbody>
                    {groupedAccounts && Object.entries(groupedAccounts).map(([categoryName, items]) => {
                        const categoryTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

                        return (
                            <React.Fragment key={categoryName}>
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
                                            {categoryName}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>

                                {/* Items within the category */}
                                {items.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td
                                            colSpan={2}
                                            fz="sm"
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {item.accountNumber}
                                        </Table.Td>
                                        <Table.Td
                                            colSpan={2}
                                            fz="sm"
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {item.name}
                                        </Table.Td>
                                        {/* Beginning Balance */}
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.debit!)}
                                        </Table.Td>
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.credit!)}
                                        </Table.Td>

                                        {/* Movements */}
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.debit!)}
                                        </Table.Td>
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.credit!)}
                                        </Table.Td>

                                        {/* Closing Balance */}
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.debit!)}
                                        </Table.Td>
                                        <Table.Td
                                            fz="sm"
                                            ta='right'
                                            style={{ border: `1px solid ${themeColors.gray[2]}` }}>
                                            {formatCurrency(item.credit!)}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </React.Fragment>
                        );
                    })}
                </Table.Tbody>
                {/* End of Table Column Total */}
                <Table.Tr>
                    <Table.Td
                        fz="sm"
                        colSpan={4}
                        style={{ fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        Total
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                    <Table.Td
                        fz="sm"
                        style={{ textAlign: "right", fontWeight: 600, border: `1px solid ${themeColors.gray[2]}`, backgroundColor: themeColors.gray[1] }}>
                        {formatCurrency(0)}
                    </Table.Td>
                </Table.Tr>
            </Table>
        </Stack>
    );
};

export default WorkingPaperTable;