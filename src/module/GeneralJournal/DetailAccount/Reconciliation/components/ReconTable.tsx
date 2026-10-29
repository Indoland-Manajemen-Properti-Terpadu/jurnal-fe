import React, { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Badge,
} from '@mantine/core';
import { themeColors } from '@/theme';
import { formatCurrency } from '@/utils/FormatCurrency';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { useParams } from 'react-router-dom';
import { dateFormatV1 } from '@/utils/FormatDate';
import {
  ArrowsCounterClockwise,
  CloudArrowUp,
  MagnifyingGlass,
  ArrowCircleDown,
  ArrowCircleUp,
  Trash,
  CheckCircle,
  PuzzlePieceIcon,
} from '@phosphor-icons/react';
import { NotFound } from '@/components/ErrorPage/NotFound';
import { ImportBankStatementModal } from '@/module/bank-statements';
import { useDetailAccount } from '@/module/chart-of-accounts';
import { FindAndReconModal } from './FindAndReconModal';
import { BankStatementData } from '../types/GetReconciliationModel';
import { GetReconciliation } from '../services/GetReconciliation.service';
import { useMatchReconciliation } from '../services/MatchReconciliation.service';

const ReconciliationTable: React.FC = () => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const [modalOpened, setModalOpened] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBankStatement, setSelectedBankStatement] = useState<BankStatementData | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manualMatches, setManualMatches] = useState<Record<string, any>>({});
  const [removedRecommendations, setRemovedRecommendations] = useState<string[]>([]);

  const { accountDetail } = useDetailAccount(idAccount!);
  const { data: ReconData, isLoading, isError, refetch } = GetReconciliation(idAccount!);
  const { mutate: matchRecon, isPending: isMatching } = useMatchReconciliation();

  console.log('Reconciliation Data Log:', {
    ReconData,
    hasBankStatements: !!ReconData?.bankStatements,
    bankStatementsLength: ReconData?.bankStatements?.length || 0,
    isLoading,
    isError,
  });

  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  if (isError) {
    return <NotFound />;
  }
  if (isLoading) {
    return <Text c={themeColors.red[6]}>Loading data...</Text>;
  }

  if (!ReconData || !ReconData.bankStatements || ReconData.bankStatements.length === 0) {
    return (
      <>
        <JournalEmptyState
          onButtonClick={handleOpenImportModal}
          title="Rekonsiliasi Belum Tersedia"
          description="Rekening koran belum diimpor. Import rekening koran terlebih dahulu untuk memulai rekonsiliasi."
          buttonLabel="Impor Rekening Koran"
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

  const handleManualMatch = (journals: any[]) => {
    if (selectedBankStatement) {
      const journalDetailIds = journals.map((jt) => {
        if (jt.transactionDetail && Array.isArray(jt.transactionDetail)) {
          const detail = jt.transactionDetail.find((d: any) => d.account === idAccount);
          return detail ? detail.id : jt.id;
        }
        return jt.id;
      });

      matchRecon(
        {
          matches: [
            {
              bankStatementId: selectedBankStatement.id,
              journalDetailIds,
            },
          ],
        },
        {
          onSuccess: () => {
            setManualMatches({});
            setSelectedIds([]);
            refetch();
          },
        }
      );
    }
  };

  const handleRemoveMatch = (bsId: string) => {
    setManualMatches((prev) => {
      const next = { ...prev };
      delete next[bsId];
      return next;
    });
    setRemovedRecommendations((prev) => [...prev, bsId]);
    // Automatically unselect the row when match is removed
    setSelectedIds((prev) => prev.filter((id) => id !== bsId));
  };

  const rows = ReconData.bankStatements.map((BS) => {
    let matchingJournals: any[] = [];
    let isRecommendation = false;

    if (manualMatches[BS.id]) {
      matchingJournals = Array.isArray(manualMatches[BS.id])
        ? manualMatches[BS.id]
        : [manualMatches[BS.id]];
    } else if (BS.matchedJournalDetail) {
      matchingJournals = [BS.matchedJournalDetail];
    } else if (
      BS.recommendations &&
      BS.recommendations.length > 0 &&
      !removedRecommendations.includes(BS.id)
    ) {
      matchingJournals = BS.recommendations.map((rec) => rec.journalDetail);
      isRecommendation = true;
    }

    return { bankStatement: BS, journalTransactions: matchingJournals, isRecommendation };
  });

  const handleMatch = () => {
    const matches = rows
      .filter((r) => selectedIds.includes(r.bankStatement.id) && r.journalTransactions.length > 0)
      .map((r) => ({
        bankStatementId: r.bankStatement.id,
        journalDetailIds: r.journalTransactions.map((jt) => {
          if (jt.transactionDetail && Array.isArray(jt.transactionDetail)) {
            const detail = jt.transactionDetail.find((d: any) => d.account === idAccount);
            return detail ? detail.id : jt.id;
          }
          return jt.id;
        }),
      }));

    if (matches.length > 0) {
      matchRecon(
        { matches },
        {
          onSuccess: () => {
            setManualMatches({});
            setRemovedRecommendations([]);
            setSelectedIds([]);
            refetch();
          },
        }
      );
    }
  };

  return (
    <Stack gap="md" mt="md">
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        {/* Header Section */}
        <SimpleGrid cols={2} spacing={0}>
          <Box bg={themeColors.blue[1]} p="md">
            <Group justify="space-between" align="flex-start">
              <Stack gap={0}>
                <Text size="xs" fw={500} c={themeColors.blue[6]}>
                  Sumber Data
                </Text>
                <Text size="sm" fw={600} c={themeColors.black[9]}>
                  Rekening Koran
                </Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                <Text size="xs" fw={500} c={themeColors.gray[6]}>
                  Saldo
                </Text>
                <Text size="sm" fw={600} c={themeColors.black[9]}>
                  {(ReconData as any)?.balance
                    ? (ReconData as any).balance < 0
                      ? `(${formatCurrency(Math.abs((ReconData as any).balance))})`
                      : formatCurrency((ReconData as any).balance)
                    : formatCurrency(0)}
                </Text>
              </Stack>
            </Group>
          </Box>
          <Box
            bg={themeColors.primary[1]}
            p="md"
            style={{ borderLeft: `1px solid ${themeColors.gray[1]}` }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={0}>
                <Text size="xs" fw={500} c={themeColors.primary[6]}>
                  Pembukuan
                </Text>
                <Text size="sm" fw={600} c={themeColors.black[9]}>
                  Jurnal Transaksi
                </Text>
              </Stack>
              <Stack gap={0} align="flex-end">
                <Text size="xs" fw={500} c={themeColors.gray[6]}>
                  Saldo
                </Text>
                <Text size="sm" fw={600} c={themeColors.black[9]}>
                  {accountDetail?.amount
                    ? accountDetail.amount < 0
                      ? `(${formatCurrency(Math.abs(accountDetail.amount))})`
                      : formatCurrency(accountDetail.amount)
                    : formatCurrency(0)}
                </Text>
              </Stack>
            </Group>
          </Box>
        </SimpleGrid>

        {/* Rows Section */}
        <Stack gap={0}>
          {rows.map(({ bankStatement, journalTransactions, isRecommendation }, index) => {
            const hasJournals = journalTransactions && journalTransactions.length > 0;
            return (
              <SimpleGrid
                key={index}
                cols={2}
                spacing={0}
                style={{ borderTop: `1px solid ${themeColors.gray[1]}` }}
              >
                {/* Left Side: Bank Statement (Sumber Data) */}
                <Box p="md" bg={themeColors.blue[0]} style={{ position: 'relative' }}>
                  <Group wrap="nowrap" align="center" gap="md">
                    <Checkbox
                      size="xs"
                      radius="xs"
                      disabled={!hasJournals}
                      checked={selectedIds.includes(bankStatement.id)}
                      onChange={() => toggleSelection(bankStatement.id)}
                      color={themeColors.primary[6]}
                      styles={{
                        input: {
                          cursor: !hasJournals ? 'not-allowed' : 'pointer',
                          '&:not(:checked)': {
                            backgroundColor: 'white',
                          },
                        },
                      }}
                    />
                    <Paper
                      withBorder
                      p="sm"
                      radius="md"
                      flex={1}
                      bg="white"
                      style={{ borderLeft: `4px solid ${themeColors.blue[6]}` }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Stack gap={0}>
                            <Text size="xs" c={themeColors.gray[6]} fw={400}>
                              {dateFormatV1(bankStatement.date)}
                            </Text>
                            <Text size="sm" fw={600} c={themeColors.black[9]} lineClamp={1}>
                              {bankStatement.description}
                            </Text>
                          </Stack>
                          <Stack align="flex-end" gap={4}>
                            <Badge
                              variant="light"
                              color={bankStatement.amount > 0 ? 'green' : 'red'}
                              leftSection={
                                bankStatement.amount > 0 ? (
                                  <ArrowCircleDown size={14} />
                                ) : (
                                  <ArrowCircleUp size={14} />
                                )
                              }
                              style={{ textTransform: 'capitalize' }}
                            >
                              <Text
                                size="xs"
                                fw={700}
                                c={
                                  bankStatement.amount > 0
                                    ? themeColors.green[8]
                                    : themeColors.red[8]
                                }
                              >
                                {bankStatement.amount > 0 ? 'Diterima' : 'Dikirim'}
                              </Text>
                            </Badge>
                            <Text size="md" fw={700} c={themeColors.black[9]}>
                              {formatCurrency(Math.abs(bankStatement.amount))}
                            </Text>
                          </Stack>
                        </Group>
                        <Group justify="space-between" align="flex-end">
                          {hasJournals ? (
                            <Group gap={4}>
                              <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                              <Text size="xs" c={themeColors.green[6]} fw={500}>
                                Cocok dengan {journalTransactions.length} Jurnal
                              </Text>
                            </Group>
                          ) : (
                            <Group
                              gap={4}
                              style={{ cursor: 'pointer' }}
                              onClick={() => openReconModal(bankStatement)}
                            >
                              <MagnifyingGlass size={16} color={themeColors.gray[5]} />
                              <Text size="xs" c={themeColors.gray[6]} fw={500}>
                                Belum dipasangkan
                              </Text>
                            </Group>
                          )}
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={() => handleRemoveMatch(bankStatement.id)}
                          >
                            <Trash size={18} weight="regular" color={themeColors.gray[5]} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Paper>
                  </Group>
                </Box>

                {/* Right Side: Journal Match (Pembukuan) */}
                <Box
                  p="md"
                  bg={themeColors.primary[0]}
                  style={{ borderLeft: `1px solid ${themeColors.gray[1]}` }}
                >
                  {hasJournals ? (
                    <Stack gap="sm" h="100%" justify="center">
                      {journalTransactions.map((jt: any, idx: number) => (
                        <Paper
                          key={idx}
                          withBorder
                          p="sm"
                          radius="md"
                          bg="white"
                          style={{ borderLeft: `4px solid ${themeColors.primary[6]}` }}
                        >
                          <Stack gap="xs">
                            <Group justify="space-between" align="flex-start">
                              <Stack gap={0}>
                                <Text size="xs" c={themeColors.gray[6]} fw={400}>
                                  {dateFormatV1(jt.transactionDate)}
                                </Text>
                                <Text size="sm" fw={600} c={themeColors.black[9]} lineClamp={1}>
                                  {jt.transactionNumber
                                    ? `Jurnal Transaksi #${jt.transactionNumber}`
                                    : jt.description}
                                </Text>
                              </Stack>
                              <Stack align="flex-end" gap={4}>
                                <Badge
                                  variant="light"
                                  color={jt.debit > 0 ? 'green' : 'red'}
                                  leftSection={
                                    jt.debit > 0 ? (
                                      <ArrowCircleDown size={14} />
                                    ) : (
                                      <ArrowCircleUp size={14} />
                                    )
                                  }
                                  style={{ textTransform: 'capitalize' }}
                                >
                                  <Text
                                    size="xs"
                                    fw={700}
                                    c={jt.debit > 0 ? themeColors.green[8] : themeColors.red[8]}
                                  >
                                    {jt.debit > 0 ? 'Diterima' : 'Dikirim'}
                                  </Text>
                                </Badge>
                                <Text size="md" fw={700} c={themeColors.black[9]}>
                                  {formatCurrency(jt.credit || jt.debit)}
                                </Text>
                              </Stack>
                            </Group>
                            <Group justify="space-between" align="flex-end">
                              <Group gap={4}>
                                <CheckCircle size={16} color={themeColors.green[6]} weight="fill" />
                                <Text size="xs" c={themeColors.green[6]} fw={500}>
                                  Cocok dengan {bankStatement.description}
                                </Text>
                              </Group>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                onClick={() => handleRemoveMatch(bankStatement.id)}
                              >
                                <Trash size={18} weight="regular" color={themeColors.gray[5]} />
                              </ActionIcon>
                            </Group>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  ) : (
                    <Box
                      h="100%"
                      style={{
                        border: `1px dashed ${themeColors.primary[4]}`,
                        borderRadius: '12px',
                        backgroundColor: themeColors.primary[0],
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        minHeight: '110px',
                      }}
                      onClick={() => openReconModal(bankStatement)}
                    >
                      <Group gap={6}>
                        <MagnifyingGlass size={20} weight="bold" color={themeColors.primary[5]} />
                        <Text size="sm" fw={600} c={themeColors.primary[6]}>
                          Cari & Cocokkan
                        </Text>
                      </Group>
                      <Text size="xs" c={themeColors.primary[6]} fw={500}>
                        Pilih jurnal untuk dipasangkan
                      </Text>
                    </Box>
                  )}
                </Box>
              </SimpleGrid>
            );
          })}
        </Stack>
      </Paper>

      {/* Footer Buttons */}
      <Group justify="flex-end" mt="xl">
        <Button
          variant="subtle"
          color="gray"
          fw={500}
          onClick={() => {
            setSelectedIds([]);
            setManualMatches({});
            setRemovedRecommendations([]);
          }}
        >
          Reset
        </Button>
        <Button
          loading={isMatching}
          disabled={selectedIds.length === 0}
          leftSection={<PuzzlePieceIcon size={16} weight="duotone" />}
          variant="filled"
          bg={selectedIds.length > 0 ? themeColors.primary[8] : themeColors.gray[2]}
          onClick={handleMatch}
          styles={{
            root: {
              color: selectedIds.length > 0 ? 'white' : themeColors.gray[5],
              '&:disabled': {
                backgroundColor: themeColors.gray[2],
              },
            },
          }}
        >
          Rekonsiliasi {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
        </Button>
      </Group>

      <FindAndReconModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleManualMatch}
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
