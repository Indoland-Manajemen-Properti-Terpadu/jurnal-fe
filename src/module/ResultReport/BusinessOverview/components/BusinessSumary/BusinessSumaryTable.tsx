import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { CashFlowfromOA, CashFlowfromIA, CashFlowfromFA, EndingCashPosition } from "../CashFlow/TableRow";
import { BalanceSheetSumary, CashFlowSumary, IncomeStatementSumary, InsightReport } from "./TableRow";



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

const BusinessSumaryTable: React.FC = () => {
    const { accounts, isError } = useJournalAccounts();
    return (
        <Stack>
            <Table
                withTableBorder
                style={rowStyle}>
                <Table.Tbody>
                    <IncomeStatementSumary total={3000} />
                    <BalanceSheetSumary total={3000} />
                    <CashFlowSumary total={3000} />
                    <InsightReport total={3000} />
                </Table.Tbody>
            </Table>
        </Stack>
    );
};

export default BusinessSumaryTable;
