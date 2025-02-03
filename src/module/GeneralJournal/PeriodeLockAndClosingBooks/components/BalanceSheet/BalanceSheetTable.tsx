import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import React from "react";
import { GetJournalAccounts } from "@/module/GeneralJournal/JournalAccount/service/AccountJournal.service";
import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";

const BalanceSheetTable: React.FC = () => {
    const { accounts, isError } = GetJournalAccounts();
    const lastDate = '19 Sept 2021'
    const totalBalanceSheet = 200000

    if (isError) {
        return <Text c="red">Failed to load data.</Text>;
    }

    // Define the type explicitly for groupedAccounts to avoid unknown type issues
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
        <Stack gap={0}>
            <Box
                bg={themeColors.primary[0]}
                bd="sm"
                p={10}
                style={{
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    borderColor: themeColors.grey[1],
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    borderBottomWidth: '0px'
                }}
            >
                <Group justify="space-between">
                    <Stack gap={1}>
                        <Text c={themeColors.defaultBlack[10]} fz={14} fw={500}>Report</Text>
                        <Text c={themeColors.grey[6]} fz={14} fw={500}>Period : {lastDate}</Text>
                    </Stack>
                    <Text c={themeColors.defaultBlack[10]} fz={14} fw={500}>Total : {formatCurrency(totalBalanceSheet)}</Text>
                </Group>
            </Box>
            <Table withTableBorder highlightOnHover>
                <Table.Tbody>
                    {groupedAccounts && Object.entries(groupedAccounts).map(([categoryName, items]) => {
                        const categoryTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

                        return (
                            <React.Fragment key={categoryName}>
                                {/* Category Header */}
                                <Table.Tr>
                                    <Table.Td colSpan={2} style={{
                                        backgroundColor: themeColors.grey[1],
                                    }}>
                                        <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                                            {categoryName}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>

                                {/* Items within the category */}
                                {items.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td fz="sm" style={{ width: "70%" }}>
                                            {item.name} ({item.accountNumber})
                                        </Table.Td>
                                        <Table.Td fz="sm" style={{ textAlign: "right" }}>
                                            {formatCurrency(item.amount || 0)}
                                        </Table.Td>
                                    </Table.Tr>
                                ))}

                                {/* Category Total Row */}
                                <Table.Tr>
                                    <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                                        Total {categoryName}
                                    </Table.Td>
                                    <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                                        {formatCurrency(categoryTotal)}
                                    </Table.Td>
                                </Table.Tr>
                            </React.Fragment>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default BalanceSheetTable;
