import React, { useMemo, useState } from 'react';
import { Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconChecks, IconFileSpreadsheet, IconUpload } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { ImportBankStatementModal, useBankStatement } from '@/module/bank-statements';
import { blockedBySharedJournal, rowsSharingSuggestion } from '../../domain/matchGuards';
import type { BankStatementData, JournalDetail } from '../../domain/reconciliation';
import { summarizeUnmatched } from '../../domain/unmatchedSummary';
import { useReconciliation } from '../hooks/useReconciliation';
import { useReconciliationMatches } from '../hooks/useReconciliationMatches';
import { FindAndReconModal } from './FindAndReconModal';
import ReconciliationRowItem from './ReconciliationRowItem';
import ReconciliationSummary from './ReconciliationSummary';
import UnmatchedJournals from './UnmatchedJournals';

const SKELETON_ROWS = 4;

/** "Rekonsiliasi Bank" tab: statement rows that still wait for a journal, and the journals that wait for a statement. */
const ReconciliationTable: React.FC = () => {
  const { t } = useTranslation('reconciliation');
  const { idAccount = '' } = useParams<{ idAccount: string }>();
  const [findOpened, setFindOpened] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedBankStatement, setSelectedBankStatement] = useState<BankStatementData | null>(
    null
  );

  const { data: reconData, isLoading, isError, refetch } = useReconciliation(idAccount);
  // The reconciliation lists only unmatched rows; the statement list tells "nothing imported" from "all matched".
  const { data: statementData } = useBankStatement(idAccount);
  const importedCount = (statementData?.results || statementData?.resultTransaction || []).length;

  const {
    rows,
    selectedIds,
    isMatching,
    dismissedCount,
    toggleSelection,
    dismissSuggestion,
    clearSelection,
    restoreSuggestions,
    matchManual,
    matchSelected,
  } = useReconciliationMatches(idAccount, reconData, refetch);

  const journals = reconData?.unreconciledJournalDetails ?? [];
  const summary = useMemo(
    () => summarizeUnmatched(reconData?.bankStatements ?? [], journals),
    [reconData, journals]
  );
  const sharing = useMemo(() => rowsSharingSuggestion(rows, idAccount), [rows, idAccount]);

  const importModal = (
    <ImportBankStatementModal
      idAccount={idAccount}
      onContinue={refetch}
      isOpen={isImportOpen}
      onClose={() => setIsImportOpen(false)}
    />
  );

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={86} radius="md" />
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={index} height={72} radius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<IconAlertCircle size={32} stroke={1.6} />}
        color="red"
        title={t('error.title')}
        description={t('error.description')}
        actionLabel={t('error.retry')}
        onAction={() => refetch()}
      />
    );
  }

  const hasPending = (reconData?.bankStatements?.length ?? 0) > 0;

  if (!hasPending && importedCount === 0) {
    return (
      <>
        <EmptyState
          icon={<IconFileSpreadsheet size={32} stroke={1.6} />}
          title={t('empty.title')}
          description={t('empty.description')}
          actionLabel={t('empty.button')}
          actionIcon={<IconUpload size={16} />}
          onAction={() => setIsImportOpen(true)}
        />
        {importModal}
      </>
    );
  }

  const handleManualMatch = (selected: JournalDetail[]) => {
    if (selectedBankStatement) matchManual(selectedBankStatement, selected);
  };

  const openFind = (bankStatement: BankStatementData) => {
    setSelectedBankStatement(bankStatement);
    setFindOpened(true);
  };

  return (
    <Stack gap="md">
      <ReconciliationSummary summary={summary} />

      {hasPending ? (
        <Paper withBorder radius="md" bg="white" shadow="none" p={0} style={{ overflow: 'hidden' }}>
          <Group justify="space-between" p="md" gap="sm">
            <div>
              <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                {t('list.title', { count: rows.length })}
              </Text>
              <Text fz="var(--jurnal-text-xs)" c="dimmed">
                {t('list.hint')}
              </Text>
            </div>
            <Button
              variant="default"
              size="sm"
              leftSection={<IconUpload size={16} />}
              onClick={() => setIsImportOpen(true)}
            >
              {t('empty.button')}
            </Button>
          </Group>

          {rows.map(({ bankStatement, journalTransactions, dayDifference }) => (
            <ReconciliationRowItem
              key={bankStatement.id}
              bankStatement={bankStatement}
              journalTransactions={journalTransactions}
              dayDifference={dayDifference}
              selected={selectedIds.includes(bankStatement.id)}
              blocked={blockedBySharedJournal(
                rows,
                [...selectedIds.filter((id) => id !== bankStatement.id), bankStatement.id],
                idAccount
              ).has(bankStatement.id)}
              sharesSuggestion={sharing.has(bankStatement.id)}
              onToggle={toggleSelection}
              onDismiss={dismissSuggestion}
              onFind={openFind}
            />
          ))}

          <Group
            justify="space-between"
            p="md"
            gap="sm"
            style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
          >
            <Group gap="sm">
              <Text fz="var(--jurnal-text-sm)" c={selectedIds.length > 0 ? 'dark.8' : 'dimmed'}>
                {selectedIds.length > 0
                  ? t('actions.selected', { count: selectedIds.length })
                  : t('actions.nothingSelected')}
              </Text>
              {dismissedCount > 0 && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  onClick={restoreSuggestions}
                >
                  {t('actions.restore', { count: dismissedCount })}
                </Button>
              )}
            </Group>
            <Group gap="xs">
              {selectedIds.length > 0 && (
                <Button variant="subtle" color="gray" size="sm" onClick={clearSelection}>
                  {t('actions.clear')}
                </Button>
              )}
              <Button
                color="primary"
                size="sm"
                loading={isMatching}
                disabled={selectedIds.length === 0}
                leftSection={<IconChecks size={16} />}
                onClick={matchSelected}
              >
                {selectedIds.length > 0
                  ? t('actions.reconcileCount', { count: selectedIds.length })
                  : t('actions.reconcile')}
              </Button>
            </Group>
          </Group>
        </Paper>
      ) : (
        <Paper withBorder radius="md" bg="white" shadow="none" p={0}>
          <EmptyState
            icon={<IconChecks size={32} stroke={1.6} />}
            color="teal"
            title={t('allMatched.title')}
            description={t('allMatched.description')}
            actionLabel={t('empty.button')}
            actionIcon={<IconUpload size={16} />}
            onAction={() => setIsImportOpen(true)}
            py={36}
          />
        </Paper>
      )}

      <UnmatchedJournals journals={journals} />

      <FindAndReconModal
        opened={findOpened}
        onClose={() => setFindOpened(false)}
        onConfirm={handleManualMatch}
        selectedBankStatement={selectedBankStatement}
      />
      {importModal}
    </Stack>
  );
};

export default ReconciliationTable;
