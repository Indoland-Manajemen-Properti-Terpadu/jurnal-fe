import { Group, Stack, Table, Text } from "@mantine/core";
import { themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import React, { useState } from "react";
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { NotFound } from "@/components/ErrorPage/NotFound";
import { GetGeneralLedgerReport } from "../../services/GeneralLedger.service";
import { dateFormatV1, dateFormatV2 } from '../../../../../utils/FormatDate';


const rowStyle = {
    borderColor: themeColors.gray[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const totalRowStyle = {
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


interface GeneralLedgerTableProps {
    fromDate?: string;
    toDate?: string;
}

const GeneralLedgerTable: React.FC<GeneralLedgerTableProps> = ({ fromDate, toDate }) => {
    const { data, isError } = GetGeneralLedgerReport({ fromDate: fromDate!, toDate: toDate! });
    const [expandedAccounts, setExpandedAccounts] = useState<{ [accountName: string]: boolean }>({});

    if (isError) {
        return <NotFound />;
    }

    const toggleAccount = (accountName: string) => {
        setExpandedAccounts((prev) => ({
            ...prev,
            [accountName]: !prev[accountName],
        }));
    };

    return (
        <Table>
            <Table.Thead>
                <Table.Tr style={{
                    backgroundColor: themeColors.primary[0],
                    borderColor: themeColors.gray[1],
                    borderWidth: '1px',
                    borderStyle: 'solid',
                }}>
                    <Table.Th ta='left' c={themeColors.black[9]} fw={600} fz={14}>
                        Account Name
                    </Table.Th>
                    <Table.Th ta='left' c={themeColors.black[9]} fw={600} fz={14} >
                        Transaction Date
                    </Table.Th>
                    <Table.Th ta='left' c={themeColors.black[9]} fw={600} fz={14} >
                        Transaction Name
                    </Table.Th>
                    <Table.Th ta='left' fw={600} fz={14}>
                        Debit
                    </Table.Th>
                    <Table.Th ta='left' fw={600} fz={14} >
                        Credit
                    </Table.Th>
                    <Table.Th ta='left' fw={600} fz={14}>
                        Balance
                    </Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {data?.map((account) => {
                    const isExpanded = expandedAccounts[account.name];
                    return (
                        <React.Fragment key={account.name}>
                            <Table.Tr
                                onClick={() => toggleAccount(account.name)}
                                style={{
                                    cursor: "pointer",
                                    // backgroundColor: themeColors.gray[0],
                                    borderColor: themeColors.gray[1],
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                }}
                            >
                                <Table.Td >
                                    <Group>
                                        {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                                        <Text fw={600} fz={14} c={themeColors.black[9]}>{`${account.name} (${account.accountNumber})`}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {account.beginningBalance.transactionDate ? dateFormatV1(account.beginningBalance.transactionDate) : null}
                                </Table.Td>
                                <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                                    Beginning Balance
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {formatCurrency(account.beginningBalance.debit || 0)}
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {formatCurrency(account.beginningBalance.credit || 0)}
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {account.beginningBalance.total >= 0
                                        ? formatCurrency(account.beginningBalance.total ?? 0)
                                        : `(${formatCurrency(Math.abs(account.beginningBalance.total ?? 0))})`}
                                </Table.Td>
                            </Table.Tr>

                            {isExpanded && account.transactions.length > 0 && account.transactions.map((transaction, index) => (
                                <Table.Tr key={`${account.name}-${index}`} style={rowStyle}>
                                    <Table.Td></Table.Td>
                                    <Table.Td>{transaction.transactionDate ? dateFormatV1(transaction.transactionDate) : null}</Table.Td>
                                    <Table.Td>{transaction.transactionName}</Table.Td>
                                    <Table.Td>{formatCurrency(transaction.debit)}</Table.Td>
                                    <Table.Td>{formatCurrency(transaction.credit)}</Table.Td>
                                    <Table.Td>
                                        {transaction.total >= 0
                                            ? formatCurrency(transaction.total ?? 0)
                                            : `(${formatCurrency(Math.abs(transaction.total ?? 0))})`}
                                    </Table.Td>
                                </Table.Tr>
                            ))}

                            {/* No Transactions */}
                            {isExpanded && account.transactions.length === 0 && (
                                <Table.Tr style={{
                                    cursor: "pointer",
                                    borderColor: themeColors.gray[1],
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                }}>
                                    <Table.Td colSpan={6} style={{ textAlign: "center", color: themeColors.gray[6] }}>
                                        No transactions available.
                                    </Table.Td>
                                </Table.Tr>
                            )}

                            <Table.Tr style={{
                                backgroundColor: themeColors.gray[1],
                                borderColor: themeColors.gray[1],
                                borderWidth: '1px',
                                borderStyle: 'solid',
                            }}>
                                <Table.Td colSpan={2} fz="sm" style={{ textAlign: "right", fontWeight: 600 }} />
                                <Table.Td fz="sm" style={{ fontWeight: 600 }}>
                                    Ending Balance
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {formatCurrency(account.endingBalance.debit || 0)}
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {formatCurrency(account.endingBalance.credit || 0)}
                                </Table.Td>
                                <Table.Td fz="sm" style={{ textAlign: "left", fontWeight: 600 }}>
                                    {account.endingBalance.total >= 0
                                        ? formatCurrency(account.endingBalance.total ?? 0)
                                        : `(${formatCurrency(Math.abs(account.endingBalance.total ?? 0))})`}
                                </Table.Td>
                            </Table.Tr>

                        </React.Fragment>
                    );
                })}
            </Table.Tbody>
        </Table>
    );
};

export default GeneralLedgerTable;

