import React from "react";
import { Table, Text } from "@mantine/core";
import { formatCurrency } from "@/utils/FormatCurrency";
import { gradientColors, themeColors } from "@/theme";

type RowProps = {
    total: number;
};
const rowStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const sectionInsideCategory = {
    backgroundColor: themeColors.grey[0],
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.grey[0],
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

type HeaderTableProps = {
    title: string;
};

interface TableRowProps {
    label: string;
    value: number;
    fontWeight?: number;
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

const TableRow: React.FC<TableRowProps> = ({ label, value, fontWeight = 400 }) => (
    <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight }}>
            {label}
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: "right", fontWeight }}>
            {formatCurrency(value)}
        </Table.Td>
    </Table.Tr>
);

export const CashFlowfromOA: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Cash Flow From Operating Activities'} />
        <Table.Tr style={sectionInsideCategory} >
            <Table.Td fz="sm" style={{ fontWeight: 600 }} colSpan={2}>
                Cash Inflows
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Cash received from customer
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Other Income
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={sectionInsideCategory}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }} colSpan={2}>
                Cash Outflows
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Payment to suppliers
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Operational expenditures
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Credit card and other short-term liabilities
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Net cash obtained from operating activities
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);


export const CashFlowfromIA: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Cash Flow From Investing Activities'} />
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Acquistion of assets
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Sale of assets
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Other investing activities
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Net cash obtained from investing activities
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);

export const CashFlowfromFA: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Cash Flow From Financing Activities'} />
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Payments of loans
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Receipts of loans
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Equity/Capital
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Dividens paid
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Net cash obtained from financing activities
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);


export const EndingCashPosition: React.FC<RowProps> = ({ total }) => (
    <>
        <HeaderTable title={'Cash Flow From Financing Activities'} />
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Net Increase/Decrease in Cash
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Cash at Beginning of Period
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Cash at End of Period
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);






