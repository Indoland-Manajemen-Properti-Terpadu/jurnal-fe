import React, { useState } from "react";
import { ActionIcon, Box, Button, Group, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import EmptyState from "@/components/EmptyState/EmptyTable";
import { GetReconciliation } from "../services/GetReconciliation.service";
import { useParams } from "react-router-dom";
import { dateFormatV1 } from "@/utils/FormatDate";
import { IconTrash } from "@tabler/icons-react";
import { NotFound } from "@/components/ErrorPage/NotFound";
import { FindAndReconModal } from "./FindAndReconModal";
import { BankStatementModel } from "../../LaporanBank/types/BankStatementModel";
import { BankStatementData } from "../types/GetReconciliationModel";

const rowStyle = {
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
};

const headTableStyle = {
    backgroundColor: themeColors.primary[0],
    borderColor: themeColors.grey[1],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderCollapse: 'collapse' as const,
};

const headTableFont = {
    fontSize: 14,
    fontWeight: 500,
    color: themeColors.defaultBlack[10]
};

const columnTableFont = {
    fontSize: 14,
    fontWeight: 400,
    color: themeColors.defaultBlack[10]
};

const ReconciliationTable: React.FC = () => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedBankStatement, setSelectedBankStatement] = useState<BankStatementData | null>(null);
    let { data: ReconData, isLoading, isError } = GetReconciliation(idAccount!);
    // const [selectedJournalTransaction, setSelectedJournalTransaction] = useState(null);


    if (isError) {
        return <NotFound />;
    }
    if (isLoading) {
        return <Text c="red">Failed to load data.</Text>;
    }

    if (!ReconData || !ReconData.bankStatementData || !ReconData.journalTransaction || (ReconData.bankStatementData.length === 0 && ReconData.journalTransaction.length === 0)) {
        return <EmptyState />;
    }

    const openReconModal = (journalTransaction: any, bankStatement: any) => {
        setSelectedBankStatement(bankStatement);
        setModalOpened(true);
        // setSelectedJournalTransaction(journalTransaction);
    };

    // const matchTransactions = (bankStatement: { debit: number; transactionDate: string }) => {
    //     return ReconData.journalTransaction.find((journalTransaction) => {
    //         return (
    //             (journalTransaction.reconciled ?? false) &&
    //             journalTransaction.credit === bankStatement.debit &&
    //             dateFormatV1(journalTransaction.transactionDate).slice(0, 10) === bankStatement.transactionDate.slice(0, 10)
    //         );
    //     });
    // };

    const matchTransactions = (bankStatement: { debit: number; transactionDate: string }) => {
        return ReconData.journalTransaction.find((journalTransaction) => {
            if (!journalTransaction) return false; // Skip null entries
            return (
                (journalTransaction.reconciled ?? false) &&
                journalTransaction.credit === bankStatement.debit &&
                dateFormatV1(journalTransaction.transactionDate).slice(0, 10) === bankStatement.transactionDate.slice(0, 10)
            );
        });
    };


    // Reconciliation Rows
    // const rows = ReconData.bankStatementData.map((BS) => {
    //     const matchingJournal = matchTransactions({
    //         debit: BS.debit,
    //         transactionDate: dateFormatV1(BS.transactionDate).slice(0, 10),
    //     });
    //     return { bankStatement: BS, journalTransaction: matchingJournal || null };
    // });

    const rows = ReconData.bankStatementData.map((BS) => {
        const matchingJournal = matchTransactions({
            debit: BS.debit,
            transactionDate: dateFormatV1(BS.transactionDate).slice(0, 10),
        });
        return { bankStatement: BS, journalTransaction: matchingJournal || null };
    });


    return (
        <>
            <SimpleGrid cols={2} mt="md">
                {/* Bank Statement Table */}
                <Stack>
                    <Box bg={themeColors.primary[5]} p={10} style={{ borderRadius: 5 }}>
                        <Group grow justify="space-between" align="center">
                            <Text fz={14} fw={600} lineClamp={1}>Total Balance in Bank</Text>
                            <Text fz={14} fw={600} ta='right'>Rp.0</Text>
                        </Group>
                    </Box>
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr style={headTableStyle}>
                                <Table.Th colSpan={4} style={headTableFont}>Bank Statement</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='left'>Received</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='left'>Sent</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='center'>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map(({ bankStatement }, index) => (
                                <Table.Tr key={index} style={rowStyle}>
                                    <Table.Td colSpan={4} style={{ ...columnTableFont, textAlign: "left" }}>
                                        <Stack gap={0}>
                                            <Text fz={12} fw={400} c={themeColors.grey[5]}>{dateFormatV1(bankStatement.transactionDate)}</Text>
                                            <Text fz={12} fw={400} c={themeColors.defaultBlack[10]} lineClamp={1}> {bankStatement.transactionName}</Text>
                                        </Stack>
                                    </Table.Td>
                                    <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
                                        {formatCurrency(bankStatement.debit)}
                                    </Table.Td>
                                    <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
                                        {formatCurrency(bankStatement.credit)}
                                    </Table.Td>
                                    <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "center" }}>
                                        <ActionIcon variant="light" color={themeColors.grey[5]} aria-label="find" >
                                            <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Stack>
                {/* Journal Transaction Table */}
                <Stack>
                    <Box bg={themeColors.grey[5]} p={10} style={{ borderRadius: 5 }}>
                        <Group grow justify="space-between" align="center">
                            <Text fz={14} fw={600} lineClamp={1}>Total Balance in Proapps Journal</Text>
                            <Text fz={14} fw={600} ta='right'>Rp.0</Text>
                        </Group>
                    </Box>
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr style={headTableStyle}>
                                <Table.Th colSpan={4} style={headTableFont}>Transaction</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='left'>Received</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='left'>Sent</Table.Th>
                                <Table.Th colSpan={2} style={headTableFont} ta='center'>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.map(({ bankStatement, journalTransaction }, index) => (
                                <Table.Tr key={index} style={rowStyle}>
                                    {journalTransaction ? (
                                        <>
                                            <Table.Td colSpan={4} style={{ ...columnTableFont, textAlign: "left" }}>
                                                <Stack gap={0}>
                                                    <Text fz={12} fw={400} c={themeColors.grey[5]}>{dateFormatV1(journalTransaction.transactionDate)}</Text>
                                                    <Text fz={12} fw={400} c={themeColors.defaultBlack[10]} lineClamp={1}> {journalTransaction.transactionNumber}</Text>
                                                </Stack>
                                            </Table.Td>
                                            <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
                                                {journalTransaction.transactionNumber}
                                            </Table.Td>
                                            <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
                                                {formatCurrency(journalTransaction.credit)}
                                            </Table.Td>
                                            <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "center", color: "green" }}>
                                                <Button variant="filled">Find</Button>;
                                            </Table.Td>
                                        </>
                                    ) : (
                                        <>
                                            <Table.Td colSpan={8} style={{ ...columnTableFont, textAlign: "left", color: "red" }}>
                                                <Text fz={12} fw={400} c={themeColors.grey[5]}>{dateFormatV1(bankStatement.transactionDate)}</Text>
                                                <Text fz={12} fw={400} c={themeColors.defaultBlack[10]} lineClamp={1}> There is no suitable match for this transaction.</Text>
                                            </Table.Td>
                                            <Table.Td style={{ ...columnTableFont, textAlign: "center", color: "green" }}>
                                                <Button variant="filled" size="xs" bg={themeColors.blue[5]} onClick={() => openReconModal(journalTransaction, bankStatement)}>Find</Button>
                                            </Table.Td>
                                        </>
                                    )}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Stack>
            </SimpleGrid>
            <FindAndReconModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                SelectedBankStatament={selectedBankStatement}
            />
        </>
    );
};

export default ReconciliationTable;

//     const ReconBankStatementTable = () => {
//         return (
//             <Stack>
//                 <Box bg={themeColors.primary[5]} p={10} style={{ borderRadius: 5 }}>
//                     <Group grow justify="space-between" align="center">
//                         <Text fz={14} fw={600} lineClamp={1}>Total Balance in Bank</Text>
//                         <Text fz={14} fw={600} ta='right'>Rp.0</Text>
//                     </Group>
//                 </Box>
//                 <Table highlightOnHover>
//                     <Table.Thead>
//                         <Table.Tr style={headTableStyle}>
//                             <Table.Th colSpan={4} style={headTableFont}>Bank Statement</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='left'>Received</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='left'>Sent</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='center'>Match</Table.Th>
//                         </Table.Tr>
//                     </Table.Thead>

//                     <Table.Tbody>
//                         {ReconData.bankStatementData.map((BS) => {
//                             const matchingTransaction = getMatchTransaction({
//                                 debit: BS.debit,
//                                 transactionDate: dateFormatV1(BS.transactionDate).slice(0, 10),
//                             });

//                             return (
//                                 <Table.Tr key={BS.id} style={rowStyle}>
//                                     <Table.Td colSpan={4} style={{ ...columnTableFont, textAlign: "left" }}>
//                                         <Stack gap={0}>
//                                             <Text fz={12} fw={400} c={themeColors.grey[5]}>{dateFormatV1(BS.transactionDate)}</Text>
//                                             <Text fz={12} fw={400} c={themeColors.defaultBlack[10]} lineClamp={1}>{BS.transactionName}</Text>
//                                         </Stack>
//                                     </Table.Td>
//                                     <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
//                                         {formatCurrency(BS.credit)}
//                                     </Table.Td>
//                                     <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
//                                         {formatCurrency(BS.debit)}
//                                     </Table.Td>
//                                     <Table.Td colSpan={2} style={{ textAlign: "center", ...columnTableFont }}>
//                                         {matchingTransaction ? <Text c="green">Matched</Text> : <Text c="red">Unmatched</Text>}
//                                     </Table.Td>
//                                 </Table.Tr>
//                             );
//                         })}
//                     </Table.Tbody>
//                 </Table>
//             </Stack>
//         );
//     };

//     const ReconTransactionTable = () => {
//         return (
//             <Stack>
//                 <Box bg={themeColors.grey[5]} p={10} style={{ borderRadius: 5 }}>
//                     <Group grow justify="space-between" align="center">
//                         <Text fz={14} fw={600} lineClamp={1}>Total Balance in Proapps Journal</Text>
//                         <Text fz={14} fw={600} ta='right'>Rp.0</Text>
//                     </Group>
//                 </Box>
//                 <Table highlightOnHover>
//                     <Table.Thead>
//                         <Table.Tr style={headTableStyle}>
//                             <Table.Th colSpan={4} style={headTableFont}>Transaction</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='left'>Received</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='left'>Sent</Table.Th>
//                             <Table.Th colSpan={2} style={headTableFont} ta='center'>Action</Table.Th>
//                         </Table.Tr>
//                     </Table.Thead>
//                     <Table.Tbody>
//                         {ReconData.journalTransaction.map((JT) => (
//                             <Table.Tr key={JT.id} style={rowStyle}>
//                                 <Table.Td colSpan={4} style={{ ...columnTableFont, textAlign: "left" }}>
//                                     <Stack gap={0}>
//                                         <Text fz={12} fw={400} c={themeColors.grey[5]}>{dateFormatV1(JT.transactionDate)}</Text>
//                                         <Text fz={12} fw={400} c={themeColors.defaultBlack[10]} lineClamp={1}>{JT.transactionNumber}</Text>
//                                     </Stack>
//                                 </Table.Td>
//                                 <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
//                                     {formatCurrency(JT.debit)}
//                                 </Table.Td>
//                                 <Table.Td colSpan={2} style={{ ...columnTableFont, textAlign: "left" }}>
//                                     {formatCurrency(JT.credit)}
//                                 </Table.Td>
//                                 <Table.Td colSpan={2} style={{ textAlign: "center", ...columnTableFont }}>
//                                     {matchedTransactions.has(JT.id) ? (
//                                         <Text c="green">Matched</Text>
//                                     ) : (
//                                         <Group gap="xs">
//                                             <ActionIcon variant="filled" color={themeColors.primary[6]} aria-label="recon">
//                                                 <IconPuzzle style={{ width: '70%', height: '70%' }} stroke={1.5} />
//                                             </ActionIcon>
//                                             <ActionIcon variant="filled" color={themeColors.blue[6]} aria-label="find">
//                                                 <IconSearch style={{ width: '70%', height: '70%' }} stroke={1.5} />
//                                             </ActionIcon>
//                                         </Group>
//                                     )}
//                                 </Table.Td>
//                             </Table.Tr>
//                         ))}
//                     </Table.Tbody>
//                 </Table>
//             </Stack>
//         );
//     };

//     return (
//         <SimpleGrid cols={2} mt='md'>
//             <Stack>
//                 <ReconBankStatementTable />
//             </Stack>
//             <Stack>
//                 <ReconTransactionTable />
//             </Stack>
//         </SimpleGrid>
//     );
// }

// export default ReconciliationTable;