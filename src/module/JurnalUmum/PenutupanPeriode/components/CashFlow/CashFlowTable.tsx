import React from "react";
import { Box, Group, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from "@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts";
import { JournalAccounts } from "@/module/JurnalUmum/AkunJurnal/types/JournalAccountModel";

import EmptyState from "@/components/EmptyState/EmptyTable";
import { CashFlowfromFA, CashFlowfromIA, CashFlowfromOA, EndingCashPosition } from "./TableRow";


const rowStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.grey[0],
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
}

const CashFlowTable: React.FC = () => {
    const { accounts, isError } = useJournalAccounts();
    const lastDate = '19 Sept 2021'
    const totalBalanceSheet = 200000
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
            <Table
                withTableBorder
                style={rowStyle}>
                <Table.Tbody>
                    <CashFlowfromOA total={3000} />
                    <CashFlowfromIA total={3000} />
                    <CashFlowfromFA total={3000} />
                    <EndingCashPosition total={3000} />
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default CashFlowTable;
