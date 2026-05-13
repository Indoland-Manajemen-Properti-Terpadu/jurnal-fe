import React from "react";
import { ActionIcon, Box, Menu, rem, Stack, Table, Text } from "@mantine/core";
import { gradientColors, themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/hooks/useJournalAccounts';
import { IconBuildingBank, IconDots, IconFileImport } from "@tabler/icons-react";
import { NotFound } from "@/components/ErrorPage/NotFound";
import EmptyState from "@/components/EmptyState/EmptyTable";

const rowStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const BankAndCashTable: React.FC = () => {
    const { accounts, isError, isEmpty } = useJournalAccounts();

    if (isError) {
        return <NotFound />
    }
    if (isEmpty) {
        return <EmptyState />;
    }

    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const accountBankAndCash = JournalAccounts
        .filter((account) => account.isBankAndCash === true)

    return (
        <Stack>
            <Table style={{ borderRadius: 8 }} >
                <Table.Thead>
                    <Table.Tr style={{ ...headTableStyle, fontWeight: 500, fontSize: 14 }}>
                        <Table.Th colSpan={7} ta='left' >Account Name</Table.Th>
                        <Table.Th colSpan={2} ta='left' >Bank Balance</Table.Th>
                        <Table.Th colSpan={2} ta='left' >Balance in the journal</Table.Th>
                        <Table.Th colSpan={1} ta='center' >Action</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {accountBankAndCash.map((account) => (
                        <Table.Tr key={account.id} style={rowStyle} >
                            <Table.Td fz={14} colSpan={7} style={{ textAlign: "left", fontWeight: 400 }}>
                                {account.name} ({account.accountNumber})
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                {formatCurrency(account.debit)}
                            </Table.Td>
                            <Table.Td fz={14} colSpan={2} style={{ textAlign: "left", fontWeight: 400 }}>
                                {formatCurrency(account.amount)}
                            </Table.Td>
                            <Table.Td colSpan={1} style={{ textAlign: "center", fontWeight: 400 }}>
                                <Menu position="bottom-end">
                                    <Menu.Target>
                                        <ActionIcon bg={themeColors.grey[0]}>
                                            <IconDots size={14} color={themeColors.grey[6]} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item leftSection={<IconBuildingBank style={{ width: rem(14), height: rem(14) }} />}
                                            component="a"
                                        // href="https://mantine.dev"
                                        >
                                            Connect Bank
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconFileImport style={{ width: rem(14), height: rem(14) }} />}
                                            component="a"
                                            // href="https://mantine.dev"
                                            target="_blank"
                                        >
                                            Import Bank Statement
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>
    );
};



export default BankAndCashTable;
