import React from "react";
import { Table, Text } from "@mantine/core";
import { formatCurrency } from "@/utils/FormatCurrency";
import { gradientColors, themeColors } from "@/theme";

type RowProps = {
    total: number;
};
const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const sectionInsideCategory = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.gray[0],
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

type HeaderTableProps = {
    title: string;
};

interface TableRowProps {
    label: string;
    type?: "percentage" | "price" | "days";
    total: number;
}
const HeaderTable: React.FC<HeaderTableProps> = ({ title }) => {
    return (
        <Table.Tr>
            <Table.Td colSpan={2} style={headTableStyle}>
                <Text fz="sm" w={600} gradient={gradientColors.mainGR} variant="gradient">
                    {title}
                </Text>
            </Table.Td>
        </Table.Tr>
    );
};

const TableRow: React.FC<TableRowProps> = ({ label, type, total }) => {
    let displayTotal;

    switch (type) {
        case "percentage":
            displayTotal = `${total}%`;
            break;
        case "days":
            displayTotal = `${total} Days`;
            break;
        default:
            displayTotal = formatCurrency(total);
    }

    return (
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                {label}
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {displayTotal}
            </Table.Td>
        </Table.Tr>
    );
};


export const IncomeStatementSummary: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Income Statement Summary'} />
        <TableRow label="Revenue" total={200} />
        <TableRow label="Cost of Goods Sold" total={200} />
        <TableRow label="Operating Expenses" total={200} />
        <TableRow label="Operating Income" total={200} />
        <TableRow label="Net Profit/(Loss)" total={200} />

    </>
);
export const BalanceSheetSummary: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Balance Sheet Summary'} />
        <TableRow label="Revenue" total={200} />
        <TableRow label="Cost of Goods Sold" total={200} />
        <TableRow label="Operating Expenses" total={200} />
        <TableRow label="Operating Income" total={200} />
        <TableRow label="Net Profit/(Loss)" total={200} />

    </>
);

export const CashFlowSummary: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Cash Flow Summary'} />
        <TableRow label="Revenue" total={200} />
        <TableRow label="Cost of Goods Sold" total={200} />
        <TableRow label="Operating Expenses" total={200} />
        <TableRow label="Operating Income" total={200} />
        <TableRow label="Net Profit/(Loss)" total={200} />

    </>
);

export const InsightReport: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Insight Report'} />
        <TableRow label="Revenue" total={200} type='percentage' />
        <TableRow label="Cost of Goods Sold" total={200} type='percentage' />
        <TableRow label="Operating Expenses" total={200} type='percentage' />
        <TableRow label="Operating Income" total={200} type='days' />
        <TableRow label="Net Profit/(Loss)" total={200} type='days' />

    </>
);







