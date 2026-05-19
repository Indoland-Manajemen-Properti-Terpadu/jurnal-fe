/**
 * =============================================
 * Example: Refactored Table Component
 * =============================================
 * Contoh penggunaan theme constants dan global styles
 */

import React from "react";
import { ActionIcon, Box, Menu, rem, Stack, Table, Text } from "@mantine/core";
import { themeColors } from "@/theme";
import { iconSizes } from "@/theme/constants";
import { formatCurrency } from "@/utils/FormatCurrency";
import { useJournalAccounts } from "@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts";
import { IconBuildingBank, IconDots, IconFileImport } from "@tabler/icons-react";
import { NotFound } from "@/components/ErrorPage/NotFound";
import EmptyState from "@/components/EmptyState/EmptyTable";

/**
 * Refactored Component:
 * - Menggunakan theme constants
 * - Lebih clean dan konsisten
 * - Inline styles diminimalkan
 */
const BankAndCashTableRefactored: React.FC = () => {
    const { accounts, isError, isEmpty } = useJournalAccounts();

    if (isError) return <NotFound />
    if (isEmpty) return <EmptyState />;

    const JournalAccounts = Array.isArray(accounts) ? accounts : [];
    const accountBankAndCash = JournalAccounts.filter((account) => account.isBankAndCash === true);

    return (
        <Stack>
            <Table highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th ta='left'>Account Name</Table.Th>
                        <Table.Th ta='left'>Bank Balance</Table.Th>
                        <Table.Th ta='left'>Balance in the journal</Table.Th>
                        <Table.Th ta='center'>Action</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                    {accountBankAndCash.map((account) => (
                        <Table.Tr key={account.id}>
                            <Table.Td>
                                {account.name} ({account.accountNumber})
                            </Table.Td>
                            <Table.Td>
                                {formatCurrency(account.debit)}
                            </Table.Td>
                            <Table.Td>
                                {formatCurrency(account.amount)}
                            </Table.Td>
                            <Table.Td ta="center">
                                <Menu position="bottom-end" shadow="md">
                                    <Menu.Target>
                                        <ActionIcon bg={themeColors.gray[0]}>
                                            <IconDots {...iconSizes.sm} color={themeColors.gray[6]} />
                                        </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item
                                            leftSection={<IconBuildingBank {...iconSizes.sm} />}
                                        >
                                            Connect Bank
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconFileImport {...iconSizes.sm} />}
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

export default BankAndCashTableRefactored;
