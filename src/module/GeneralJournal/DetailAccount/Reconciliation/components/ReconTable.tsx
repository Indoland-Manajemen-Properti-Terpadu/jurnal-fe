import React, { useState } from "react";
import { ActionIcon, Box, Button, Checkbox, Group, Paper, SimpleGrid, Stack, Text, Badge } from "@mantine/core";
import { themeColors } from "@/theme";
import { formatCurrency } from "@/utils/FormatCurrency";
import { JournalEmptyState } from "@/components/EmptyState/JournalEmptyState";
import { GetReconciliation } from "../services/GetReconciliation.service";
import { useParams } from "react-router-dom";
import { dateFormatV1 } from "@/utils/FormatDate";
import { ArrowsCounterClockwise, CloudArrowUp, MagnifyingGlass, ArrowCircleDown, ArrowCircleUp, Trash, CheckCircle } from "@phosphor-icons/react";
import { NotFound } from "@/components/ErrorPage/NotFound";
import { FindAndReconModal } from "./FindAndReconModal";
import { BankStatementData } from "../types/GetReconciliationModel";
import ImportBankStatementModal from "../../BankStatement/components/ImportBankStatementModal";
import { useDetailAccount } from "../../Main/hooks/useDetailAccount";

const ReconciliationTable: React.FC = () => {
    const { idAccount } = useParams<{ idAccount: string }>();
    const [modalOpened, setModalOpened] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedBankStatement, setSelectedBankStatement] = useState<BankStatementData | null>(null);
    
    const { accountDetail } = useDetailAccount(idAccount!);
    let { data: ReconData, isLoading, isError, refetch } = GetReconciliation(idAccount!);

    console.log("Reconciliation Data Log:", ReconData);

    const handleOpenImportModal = () => setIsImportModalOpen(true);
    const handleCloseImportModal = () => setIsImportModalOpen(false);

    if (isError) {
        return <NotFound />;
    }
    if (isLoading) {
        return <Text c="red">Failed to load data.</Text>;
    }

    if (!ReconData || !ReconData.bankStatements || !ReconData.journalDetails || (ReconData.bankStatements.length === 0 && ReconData.journalDetails.length === 0)) {
        return (
            <>
                <JournalEmptyState
                    onButtonClick={handleOpenImportModal}
                    title="Rekonsiliasi Belum Tersedia"
                    description="Rekening koran belum diimpor. Import rekening koran terlebih dahulu untuk memulai rekonsiliasi."
                    buttonLabel="Import Rekening Koran"
                    buttonIcon={<CloudArrowUp size={16} />}
                />
                <ImportBankStatementModal
                    idAccount={idAccount!}
                    onContinue={refetch}
                    isOpen={isImportModalOpen}
                    onClose={handleCloseImportModal}
                />
            </>
        );
    }

    const openReconModal = (bankStatement: any) => {
        setSelectedBankStatement(bankStatement);
        setModalOpened(true);
    };

    const rows = ReconData.bankStatements.map((BS) => {
        let matchingJournal = BS.matchedJournalDetail || null;
        let isRecommendation = false;

        if (!matchingJournal && BS.recommendations && BS.recommendations.length > 0) {
            matchingJournal = BS.recommendations[0].journalDetail;
            isRecommendation = true;
        }

        return { bankStatement: BS, journalTransaction: matchingJournal, isRecommendation };
    });

    return (
        <Stack gap="md" mt="md">
            <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
                {/* Header Section */}
                <SimpleGrid cols={2} spacing={0}>
                    <Box bg={themeColors.blue[1]} p="md">
                        <Group justify="space-between" align="flex-start">
                            <Stack gap={0}>
                                <Text size="xs" fw={500} c={themeColors.blue[6]}>Sumber Data</Text>
                                <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>Rekening Koran</Text>
                            </Stack>
                            <Stack gap={0} align="flex-end">
                                <Text size="xs" fw={500} c={themeColors.grey[6]}>Saldo</Text>
                                <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>{formatCurrency(accountDetail?.draftAmount || 0)}</Text>
                            </Stack>
                        </Group>
                    </Box>
                    <Box bg={themeColors.figmaTeal[1]} p="md" style={{ borderLeft: `1px solid ${themeColors.grey[1]}` }}>
                        <Group justify="space-between" align="flex-start">
                            <Stack gap={0}>
                                <Text size="xs" fw={500} c={themeColors.figmaTeal[6]}>Pembukuan</Text>
                                <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>Jurnal Transaksi</Text>
                            </Stack>
                            <Stack gap={0} align="flex-end">
                                <Text size="xs" fw={500} c={themeColors.grey[6]}>Saldo</Text>
                                <Text size="sm" fw={600} c={themeColors.defaultBlack[10]}>{formatCurrency(accountDetail?.amount || 0)}</Text>
                            </Stack>
                        </Group>
                    </Box>
                </SimpleGrid>

                {/* Rows Section */}
                <Stack gap={0}>
                    {rows.map(({ bankStatement, journalTransaction, isRecommendation }, index) => (
                        <SimpleGrid key={index} cols={2} spacing={0} style={{ borderTop: `1px solid ${themeColors.grey[1]}` }}>
                            {/* Left Side: Bank Statement (Sumber Data) */}
                            <Box p="md" bg={themeColors.blue[0]} style={{ position: 'relative' }}>
                                <Group wrap="nowrap" align="flex-start" gap="md">
                                    <Checkbox mt="xs" styles={{ input: { backgroundColor: 'white' } }} />
                                    <Paper withBorder p="sm" radius="sm" flex={1} bg="white" style={{ borderLeft: `4px solid ${themeColors.blue[6]}` }}>
                                        <Stack gap="xs">
                                            <Group justify="space-between" align="flex-start">
                                                <Stack gap={0}>
                                                    <Text size="xs" c={themeColors.grey[6]} fw={400}>{dateFormatV1(bankStatement.date)}</Text>
                                                    <Text size="sm" fw={600} c={themeColors.defaultBlack[10]} lineClamp={1}>{bankStatement.description}</Text>
                                                </Stack>
                                                <Stack align="flex-end" gap={4}>
                                                    <Badge 
                                                        variant="light" 
                                                        color={bankStatement.amount > 0 ? "green" : "red"}
                                                        leftSection={bankStatement.amount > 0 ? <ArrowCircleDown size={14} /> : <ArrowCircleUp size={14} />}
                                                        style={{ textTransform: 'capitalize' }}
                                                    >
                                                        {bankStatement.amount > 0 ? "Diterima" : "Dikirim"}
                                                    </Badge>
                                                    <Text size="sm" fw={700} c={themeColors.defaultBlack[10]}>{formatCurrency(Math.abs(bankStatement.amount))}</Text>
                                                </Stack>
                                            </Group>
                                            <Group justify="space-between" align="flex-end">
                                                {journalTransaction ? (
                                                    <Group gap={4}>
                                                        <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                                                        <Text size="xs" c={themeColors.green[6]} fw={500}>
                                                            Cocok dengan {journalTransaction.transactionNumber ? `Jurnal Transaksi #${journalTransaction.transactionNumber}` : journalTransaction.description}
                                                        </Text>
                                                    </Group>
                                                ) : (
                                                    <Group gap={4} style={{ cursor: 'pointer' }}>
                                                        <MagnifyingGlass size={16} color={themeColors.grey[5]} />
                                                        <Text size="xs" c={themeColors.grey[6]} fw={500}>Belum dipasangkan</Text>
                                                    </Group>
                                                )}
                                                <ActionIcon variant="subtle" color="gray" size="sm">
                                                    <Trash size={18} weight="regular" />
                                                </ActionIcon>
                                            </Group>
                                        </Stack>
                                    </Paper>
                                </Group>
                            </Box>

                            {/* Right Side: Journal Match (Pembukuan) */}
                            <Box p="md" bg={themeColors.figmaTeal[0]} style={{ borderLeft: `1px solid ${themeColors.grey[1]}` }}>
                                {journalTransaction ? (
                                    <Paper withBorder p="sm" radius="sm" bg="white" style={{ borderLeft: `4px solid ${themeColors.figmaTeal[6]}`, height: '100%' }}>
                                        <Stack gap="xs" h="100%" justify="center">
                                            <Group justify="space-between" align="flex-start">
                                                <Stack gap={0}>
                                                    <Text size="xs" c={themeColors.grey[6]} fw={400}>{dateFormatV1(journalTransaction.transactionDate)}</Text>
                                                    <Text size="sm" fw={600} c={themeColors.defaultBlack[10]} lineClamp={1}>
                                                        {journalTransaction.transactionNumber ? `Jurnal Transaksi #${journalTransaction.transactionNumber}` : journalTransaction.description}
                                                    </Text>
                                                </Stack>
                                                <Text size="sm" fw={700} c={themeColors.defaultBlack[10]}>{formatCurrency(journalTransaction.credit || journalTransaction.debit)}</Text>
                                            </Group>
                                            <Group justify="space-between" align="flex-end">
                                                <Group gap={4}>
                                                    <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                                                    <Text size="xs" c={themeColors.green[6]} fw={500}>
                                                        Cocok dengan {bankStatement.description}
                                                    </Text>
                                                </Group>
                                                <ActionIcon variant="subtle" color="gray" size="sm">
                                                    <Trash size={18} weight="regular" />
                                                </ActionIcon>
                                            </Group>
                                        </Stack>
                                    </Paper>
                                ) : (
                                    <Box 
                                        h="100%" 
                                        style={{ 
                                            border: `1px dashed ${themeColors.figmaTeal[4]}`, 
                                            borderRadius: '8px',
                                            backgroundColor: themeColors.figmaTeal[0],
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            minHeight: '110px'
                                        }}
                                        onClick={() => openReconModal(bankStatement)}
                                    >
                                        <Group gap={6}>
                                            <MagnifyingGlass size={20} weight="bold" color={themeColors.figmaTeal[5]} />
                                            <Text size="sm" fw={600} c={themeColors.figmaTeal[6]}>Cari & Cocokkan</Text>
                                        </Group>
                                        <Text size="xs" c={themeColors.figmaTeal[6]} fw={500}>Pilih jurnal untuk dipasangkan</Text>
                                    </Box>
                                )}
                            </Box>
                        </SimpleGrid>
                    ))}
                </Stack>
            </Paper>

            {/* Footer Buttons */}
            <Group justify="flex-end" mt="xl">
                <Button variant="subtle" color="gray" fw={500}>Reset</Button>
                <Button 
                    disabled={rows.every(r => !r.journalTransaction)} 
                    leftSection={<ArrowsCounterClockwise size={16} />}
                    variant="filled"
                    bg={themeColors.grey[2]}
                    styles={{
                        root: {
                            '--button-color': themeColors.grey[2],
                            '&:disabled': {
                                backgroundColor: themeColors.grey[2],
                                color: themeColors.grey[5],
                            }
                        }
                    }}
                >
                    Rekonsiliasi
                </Button>
            </Group>

            <FindAndReconModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                SelectedBankStatament={selectedBankStatement}
            />
            <ImportBankStatementModal
                idAccount={idAccount!}
                onContinue={refetch}
                isOpen={isImportModalOpen}
                onClose={handleCloseImportModal}
            />
        </Stack>
    );
};

export default ReconciliationTable;
