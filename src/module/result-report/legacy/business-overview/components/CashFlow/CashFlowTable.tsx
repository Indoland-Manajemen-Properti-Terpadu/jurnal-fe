import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';

import EmptyState from "@/components/EmptyState/EmptyTable";
import { CashFlowfromFA, CashFlowfromIA, CashFlowfromOA, EndingCashPosition } from "./TableRow";


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

const CashFlowTable: React.FC = () => {
    const { accounts, isError } = useJournalAccounts();
    return (
        <Stack>
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
