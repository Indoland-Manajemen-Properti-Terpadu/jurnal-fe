import React, { useState } from 'react';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { CloudArrowUp, PuzzlePieceIcon } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import { NotFound } from '@/components/ErrorPage/NotFound';
import { ImportBankStatementModal } from '@/module/bank-statements';
import { useDetailAccount } from '@/module/chart-of-accounts';
import type { BankStatementData, JournalDetail } from '../../domain/reconciliation';
import { useReconciliation } from '../hooks/useReconciliation';
import { useReconciliationMatches } from '../hooks/useReconciliationMatches';
import { FindAndReconModal } from './FindAndReconModal';
import ReconciliationBalanceHeader from './ReconciliationBalanceHeader';
import ReconciliationRowItem from './ReconciliationRowItem';

const ReconciliationTable: React.FC = () => {
  const { t } = useTranslation('reconciliation');
  const { idAccount } = useParams<{ idAccount: string }>();
  const [modalOpened, setModalOpened] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBankStatement, setSelectedBankStatement] = useState<BankStatementData | null>(
    null
  );

  const { accountDetail } = useDetailAccount(idAccount!);
  const { data: reconData, isLoading, isError, refetch } = useReconciliation(idAccount!);
  const {
    rows,
    selectedIds,
    isMatching,
    toggleSelection,
    removeMatch,
    reset,
    matchManual,
    matchSelected,
  } = useReconciliationMatches(idAccount, reconData, refetch);

  const handleOpenImportModal = () => setIsImportModalOpen(true);
  const handleCloseImportModal = () => setIsImportModalOpen(false);

  if (isError) {
    return <NotFound />;
  }
  if (isLoading) {
    return <Text c={themeColors.red[6]}>{t('loading')}</Text>;
  }

  const importModal = (
    <ImportBankStatementModal
      idAccount={idAccount!}
      onContinue={refetch}
      isOpen={isImportModalOpen}
      onClose={handleCloseImportModal}
    />
  );

  if (!reconData || !reconData.bankStatements || reconData.bankStatements.length === 0) {
    return (
      <>
        <JournalEmptyState
          onButtonClick={handleOpenImportModal}
          title={t('empty.title')}
          description={t('empty.description')}
          buttonLabel={t('empty.button')}
          buttonIcon={<CloudArrowUp size={16} />}
        />
        {importModal}
      </>
    );
  }

  const openReconModal = (bankStatement: BankStatementData) => {
    setSelectedBankStatement(bankStatement);
    setModalOpened(true);
  };

  const handleManualMatch = (journals: JournalDetail[]) => {
    if (selectedBankStatement) {
      matchManual(selectedBankStatement, journals);
    }
  };

  return (
    <Stack gap="md" mt="md">
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <ReconciliationBalanceHeader
          bankBalance={reconData.balance}
          bookBalance={accountDetail?.amount}
        />
        <Stack gap={0}>
          {rows.map(({ bankStatement, journalTransactions }, index) => (
            <ReconciliationRowItem
              key={index}
              bankStatement={bankStatement}
              journalTransactions={journalTransactions}
              selected={selectedIds.includes(bankStatement.id)}
              onToggle={toggleSelection}
              onRemove={removeMatch}
              onFind={openReconModal}
            />
          ))}
        </Stack>
      </Paper>

      <Group justify="flex-end" mt="xl">
        <Button variant="subtle" color="gray" fw={500} onClick={reset}>
          {t('actions.reset')}
        </Button>
        <Button
          loading={isMatching}
          disabled={selectedIds.length === 0}
          leftSection={<PuzzlePieceIcon size={16} weight="duotone" />}
          variant="filled"
          bg={selectedIds.length > 0 ? themeColors.primary[8] : themeColors.gray[2]}
          onClick={matchSelected}
          styles={{
            root: {
              color: selectedIds.length > 0 ? 'white' : themeColors.gray[5],
              '&:disabled': {
                backgroundColor: themeColors.gray[2],
              },
            },
          }}
        >
          {selectedIds.length > 0
            ? t('actions.reconcileCount', { count: selectedIds.length })
            : t('actions.reconcile')}
        </Button>
      </Group>

      <FindAndReconModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onConfirm={handleManualMatch}
        selectedBankStatement={selectedBankStatement}
      />
      {importModal}
    </Stack>
  );
};

export default ReconciliationTable;
