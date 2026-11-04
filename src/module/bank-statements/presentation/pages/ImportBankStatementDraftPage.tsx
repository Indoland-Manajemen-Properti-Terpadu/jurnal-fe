import { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Flex,
  Group,
  List,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconArrowLeft, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ConfirmModal } from '@/components';
import importModalImage from '@/assets/images/illustrations/import.svg';
import { useTranslation } from '@/i18n';
import { buildConfirmPayload } from '../../domain/importDraft';
import type { BankStatementPreviewItem } from '../../domain/importPreview';
import { findDuplicateRows } from '../../domain/statementSummary';
import { loadImportPreview } from '../../infrastructure/importDraftStorage';
import ImportBankStatementDraftTable from '../components/ImportBankStatementDraftTable';
import { useBankStatement } from '../hooks/useBankStatement';
import { useConfirmImportBankStatement } from '../hooks/useImportBankStatement';
import { useBankStatementStore } from '../store/useBankStatementStore';

/** Plain number next to a tab label, like the other tab bars. */
const TabCount = ({ value }: { value: number }) => (
  <Text span fz="var(--jurnal-text-xs)" fw={600} style={{ opacity: 0.7 }}>
    {value}
  </Text>
);

const ImportBankStatementDraftPage = () => {
  const { t } = useTranslation('bankStatements');
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const [selectedRecords, setSelectedRecords] = useState<BankStatementPreviewItem[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    showAlert,
    setShowAlert,
    totalData,
    wrongData,
    correctData,
    sumTotalData,
    totalWrongData,
    totalCorrectData,
    errorMessages,
    setImportData,
    deleteItem,
  } = useBankStatementStore();

  const { mutate: confirmImport, isPending: isConfirming } = useConfirmImportBankStatement(
    idAccount || ''
  );
  const { data: imported } = useBankStatement(idAccount || '');

  useEffect(() => {
    const previewData = loadImportPreview();
    if (previewData) setImportData(previewData);
  }, [setImportData]);

  // The server does not look for repeats, so the draft does: same day, amount and description.
  const duplicates = useMemo(
    () =>
      findDuplicateRows(
        totalData,
        (imported?.results || imported?.resultTransaction || []).filter(
          (row): row is NonNullable<typeof row> => Boolean(row)
        )
      ),
    [totalData, imported]
  );

  // Only valid rows go to the server: it accepts a row with an empty description or two sides.
  const handleImport = () => {
    confirmImport(buildConfirmPayload(idAccount, correctData));
  };

  const handleDeleteSelected = () => {
    selectedRecords.forEach((record) => deleteItem(record.rowIndex));
    setSelectedRecords([]);
  };

  const handleRemoveDuplicates = () => {
    duplicates.forEach((_reason, rowIndex) => deleteItem(rowIndex));
    setSelectedRecords([]);
  };

  return (
    <AppShellLayout
      footer={
        <Group
          p="md"
          justify="flex-end"
          bg="white"
          style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
        >
          <Button variant="default" onClick={() => navigate(-1)}>
            {t('importDraft.cancel')}
          </Button>
          <Button
            color="primary"
            disabled={totalCorrectData === 0}
            onClick={() => setIsConfirmModalOpen(true)}
          >
            {t('importDraft.importCount', { count: totalCorrectData })}
          </Button>
        </Group>
      }
    >
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Paper withBorder radius="lg" bg="white" shadow="none">
          <Group p="md" align="flex-start" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              aria-label={t('importDraft.cancel')}
              onClick={() => navigate(-1)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Stack gap={2}>
              <Title order={4}>{t('importDraft.title')}</Title>
              <Text c="dimmed" fz="var(--jurnal-text-sm)">
                {t('importDraft.subtitle')}
              </Text>
            </Stack>
          </Group>

          <Stack p="md" gap="md" pt={0}>
            <Tabs defaultValue="all" color="primary" variant="pills" radius="md">
              <Flex justify="space-between" align="center" gap="sm" wrap="wrap">
                <Tabs.List>
                  <Tabs.Tab value="all" rightSection={<TabCount value={sumTotalData} />}>
                    {t('importDraft.tabAll')}
                  </Tabs.Tab>
                  <Tabs.Tab value="correct" rightSection={<TabCount value={totalCorrectData} />}>
                    {t('importDraft.tabCorrect')}
                  </Tabs.Tab>
                  <Tabs.Tab value="wrong" rightSection={<TabCount value={totalWrongData} />}>
                    {t('importDraft.tabWrong')}
                  </Tabs.Tab>
                </Tabs.List>

                {selectedRecords.length > 0 && (
                  <Button
                    size="sm"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    onClick={handleDeleteSelected}
                  >
                    {t('importDraft.deleteSelected', { count: selectedRecords.length })}
                  </Button>
                )}
              </Flex>

              {duplicates.size > 0 && (
                <Alert
                  variant="light"
                  color="yellow"
                  title={t('importDraft.duplicates.alertTitle')}
                  icon={<IconAlertTriangle size={18} />}
                  mt="md"
                >
                  <Group justify="space-between" align="center" gap="sm">
                    <Text fz="var(--jurnal-text-sm)">
                      {t('importDraft.duplicates.alertBody', { count: duplicates.size })}
                    </Text>
                    <Button size="compact-sm" variant="default" onClick={handleRemoveDuplicates}>
                      {t('importDraft.duplicates.remove')}
                    </Button>
                  </Group>
                </Alert>
              )}

              {showAlert && (
                <Alert
                  variant="light"
                  color="red"
                  title={t('importDraft.errorsTitle')}
                  icon={<IconInfoCircle size={18} />}
                  withCloseButton
                  onClose={() => setShowAlert(false)}
                  mt="md"
                >
                  <List size="xs">
                    {errorMessages.map((error) => (
                      <List.Item key={error}>{error}</List.Item>
                    ))}
                  </List>
                </Alert>
              )}

              <Tabs.Panel value="all" pt="md">
                <ImportBankStatementDraftTable
                  records={totalData}
                  selectedRecords={selectedRecords}
                  onSelectedRecordsChange={setSelectedRecords}
                  duplicates={duplicates}
                />
              </Tabs.Panel>
              <Tabs.Panel value="correct" pt="md">
                <ImportBankStatementDraftTable
                  records={correctData}
                  selectedRecords={selectedRecords}
                  onSelectedRecordsChange={setSelectedRecords}
                  duplicates={duplicates}
                />
              </Tabs.Panel>
              <Tabs.Panel value="wrong" pt="md">
                <ImportBankStatementDraftTable
                  records={wrongData}
                  selectedRecords={selectedRecords}
                  onSelectedRecordsChange={setSelectedRecords}
                  duplicates={duplicates}
                />
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>
      </Box>

      <ConfirmModal
        opened={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleImport}
        title={t('importDraft.confirmTitle')}
        message={
          <>
            {t('importDraft.confirmBefore')}
            <strong>{totalCorrectData}</strong>
            {t('importDraft.confirmAfter')}
            {totalWrongData > 0 && (
              <Text c="orange.8" size="sm" mt="xs">
                {t('importDraft.skippedWarning', { count: totalWrongData })}
              </Text>
            )}
          </>
        }
        helperText={t('importDraft.helperText')}
        confirmLabel={t('importDraft.confirmLabel')}
        cancelLabel={t('importDraft.cancelLabel')}
        confirmLoading={isConfirming}
        imageSrc={importModalImage}
      />
    </AppShellLayout>
  );
};

export default ImportBankStatementDraftPage;
