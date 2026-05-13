import React from "react";
import { Table } from "@mantine/core";
import { formatCurrency } from "@/utils/FormatCurrency";
import { themeColors } from "@/theme";

type RowProps = {
    total: number;
};

const rowStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

export const SalesRevenueRow: React.FC<RowProps> = ({ total }) => (
    <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
            Total Operating Revenue
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
            {formatCurrency(total)}
        </Table.Td>
    </Table.Tr>
);

export const CostofRevenueRow: React.FC<RowProps> = ({ total }) => (
    <>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Total Cost of Revenue
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Gross Profit
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);

export const OperatingExpensesRow: React.FC<RowProps> = ({ total }) => (
    <>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Total Operating Expenses
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Operating Profit
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);

export const NonOperatingExpensesRow: React.FC<RowProps> = ({ total }) => (
    <Table.Tr style={rowStyle}>
        <Table.Td fz="sm" style={{ fontWeight: 600 }}>
            Total Non-Operating Expenses
        </Table.Td>
        <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
            {formatCurrency(total)}
        </Table.Td>
    </Table.Tr>
);

export const NonOperatingIncomeRow: React.FC<RowProps> = ({ total }) => (
    <>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Total Non-Operating Income
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Total Non-Operating Expenses & Income
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
    </>
);

export const ProfitandTaxRow: React.FC<RowProps> = ({ total }) => (
    <>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Profit Before Tax
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Income Tax
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                Net Income
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 600 }}>
                {formatCurrency(total)}
            </Table.Td>
        </Table.Tr>
        <Table.Tr style={rowStyle}>
            <Table.Td fz="sm" style={{ fontWeight: 400 }}>
                Earnings Per Share
            </Table.Td>
            <Table.Td fz="sm" style={{ textAlign: "right", fontWeight: 400 }}>
                {formatCurrency(total)} / Share
            </Table.Td>
        </Table.Tr>
    </>
);

type IncomeStatementTableRowProps = {
    categoryName: string;
    categoryTotal: number;
};

const IncomeStatementTableRow: React.FC<IncomeStatementTableRowProps> = ({ categoryName, categoryTotal }) => {
    switch (categoryName.toLowerCase()) {
        case "sales revenue":
            return <SalesRevenueRow total={categoryTotal} />;
        case "operating expenses":
            return <OperatingExpensesRow total={categoryTotal} />;
        case "non-operating expenses":
            return <NonOperatingExpensesRow total={categoryTotal} />;
        case "other revenue":
            return <NonOperatingIncomeRow total={categoryTotal} />;
        default:
            return null;
    }
};

export default IncomeStatementTableRow;
