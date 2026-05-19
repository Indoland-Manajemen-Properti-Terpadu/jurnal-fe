import React from "react";
import { Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { dateFormatV1, dateFormatV2 } from "@/utils/FormatDate";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { ReportJournalEntryModel } from "../../types/JournalEntry.types";


const headTableStyle = {
    backgroundColor: themeColors.teal[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
}
const categoryStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: "1px",
    borderStyle: "solid",
};
const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: "1px",
    borderStyle: "solid",
};


interface JournalEntryTableProps {
    data: ReportJournalEntryModel[] | undefined;
    isLoading: boolean;
    period: string;
    startDate?: string;
    endDate?: string;
}

const JournalEntryTable: React.FC<JournalEntryTableProps> = ({ data: JournalEntry, isLoading, period, startDate, endDate }) => {

    const formattedPeriod =
        period === "All Period"
            ? period
            : `${startDate ? dateFormatV2(startDate) : ""} - ${endDate ? dateFormatV2(endDate) : ""}`;

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!JournalEntry?.length) {
        return <EmptyState title="No journal entries available" />;
    }

    const totalDebit = JournalEntry?.reduce((total: any, JE: { transactionDetail: any[]; }) => {
        const entryDebit = JE.transactionDetail.reduce((sum: any, txn: { debit: any; }) => sum + (txn.debit || 0), 0);
        return total + entryDebit;
    }, 0);

    const totalCredit = JournalEntry?.reduce((total: any, JE: { transactionDetail: any[]; }) => {
        const entryCredit = JE.transactionDetail.reduce((sum: any, txn: { credit: any; }) => sum + (txn.credit || 0), 0);
        return total + entryCredit;
    }, 0);



    return (
        <Stack>
            <Table >
                <Table.Thead>
                    <Table.Tr style={{ ...headTableStyle, fontSize: 14, fontWeight: 500 }}>
                        <Table.Td
                            colSpan={8}
                            ta="left"
                            width='50%'
                        >
                            <>
                                Report
                                <Text c={themeColors.gray[6]} fz={14} fw={500}>
                                    Period: {formattedPeriod}
                                </Text>
                            </>
                        </Table.Td>
                        <Table.Td colSpan={2} ta="left" >
                            Debit
                        </Table.Td>
                        <Table.Td colSpan={2} ta="left" >
                            Credit
                        </Table.Td>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {JournalEntry?.sort((a, b) => new Date(a.transactionDate!).getTime() - new Date(b.transactionDate!).getTime())
                        .map((JE) => (
                            <React.Fragment key={JE.id}>
                                <Table.Tr>
                                    <Table.Td colSpan={12} style={categoryStyle}>
                                        <Text fz={14} w={500} span gradient={gradientColors.mainGR} variant="gradient">
                                            Journal Entry #{JE.transactionNumber}
                                        </Text>
                                        <Text fz={14} span c={themeColors.gray[6]} ml={8}>
                                            (Created Date: {dateFormatV1(JE.transactionDate!)})
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                                {JE.transactionDetail.map((txn) =>
                                    txn.account ? (
                                        <Table.Tr key={txn.id} style={rowStyle}>
                                            <Table.Td fz="sm" pl="xl" colSpan={8}>
                                                {txn.account?.name} ({txn.account?.accountNumber})
                                            </Table.Td>
                                            <Table.Td fz="sm" style={{ textAlign: "left" }} colSpan={2}>
                                                {formatCurrency(txn.debit || 0)}
                                            </Table.Td>
                                            <Table.Td fz="sm" style={{ textAlign: "left" }} colSpan={2}>
                                                {formatCurrency(txn.credit || 0)}
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : null
                                )}
                            </React.Fragment>
                        ))}
                    <Table.Tr style={{ ...categoryStyle, fontSize: 14, fontWeight: 500 }}>
                        <Table.Td colSpan={8} >
                            Total Journal Entry
                        </Table.Td>
                        <Table.Td colSpan={2} ta="left">
                            {formatCurrency(totalDebit)}
                        </Table.Td>
                        <Table.Td colSpan={2} ta="left">
                            {formatCurrency(totalCredit)}
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </Stack >
    );
};

export default JournalEntryTable;
