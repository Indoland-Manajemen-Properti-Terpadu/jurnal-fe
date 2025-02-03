import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { GetJournalAccounts } from "@/module/GeneralJournal/JournalAccount/service/AccountJournal.service";
import { JournalAccounts } from "@/module/GeneralJournal/JournalAccount/types/JournalAccountModel";

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
    const { accounts, isError } = GetJournalAccounts();
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
