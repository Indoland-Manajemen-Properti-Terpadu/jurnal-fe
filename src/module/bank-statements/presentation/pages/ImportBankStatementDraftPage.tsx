import {
  Container,
  Paper,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Flex,
  Tabs,
  Badge,
  Alert,
  List,
  ActionIcon,
  SimpleGrid,
} from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { ArrowLeftIcon, PlusIcon } from '@phosphor-icons/react';
import BankStatementLayout from './Layout';
import ImportBankStatementDraftTable from '../components/ImportBankStatementDraftTable';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBankStatementStore } from '../store/useBankStatementStore';
import { getConfirmImportBankStatement } from '../hooks/useImportBankStatement';
import { BankStatementPreviewItem } from '../../domain/importPreview';
import { ConfirmModal } from '@/components';
import importModalImage from '@/assets/img/vectors/import.svg'; // Reuse existing or use appropriate image

const PAPER_PROPS = {
  p: '0',
  shadow: 'md',
  radius: 'md',
  withBorder: true,
};

const ImportBankStatementDraft = () => {
  const navigate = useNavigate();
  const [selectedRecords, setSelectedRecords] = useState<BankStatementPreviewItem[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { idAccount } = useParams<{ idAccount: string }>();

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

  const { mutate: confirmImport, isPending: isConfirming } = getConfirmImportBankStatement(
    idAccount || ''
  );

  useEffect(() => {
    const storedBankStatementData = localStorage.getItem('bankStatementData');

    if (storedBankStatementData) {
      try {
        const parsedResponse = JSON.parse(storedBankStatementData);
        const previewData = parsedResponse.data?.preview || [];
        setImportData(previewData);
      } catch (error) {
        console.error('Failed to parse bank statement data', error);
      }
    }
  }, [setImportData]);

  const handleImport = () => {
    const payload = {
      accountId: idAccount,
      statements: totalData.map(({ TransactionDate, Received, Spent, Description }) => ({
        TransactionDate,
        Received: String(Received || '0'),
        Spent: String(Spent || '0'),
        Description: Description || '',
      })),
    };
    confirmImport(payload);
  };

  const handleDeleteSelected = () => {
    selectedRecords.forEach((record) => {
      deleteItem(record.rowIndex);
    });
    setSelectedRecords([]);
  };

  return (
    <BankStatementLayout
      footer={
        <Group p="md" justify="flex-end" bg="white" style={{ borderTop: '1px solid #E9ECEF' }}>
          <Button variant="light" color={themeColors.gray[7]} onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={gradientColors.gradient}
            onClick={() => setIsConfirmModalOpen(true)}
          >
            Import
          </Button>
        </Group>
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <Stack gap={0}>
              <Group p="md">
                <Group align="flex-start" wrap="nowrap">
                  <ActionIcon variant="subtle" color="gray" onClick={() => navigate(-1)} mt={4}>
                    <ArrowLeftIcon size={32} weight="duotone" />
                  </ActionIcon>
                  <Stack gap={2}>
                    <Title order={5}>Validasi Data Impor</Title>
                    <Text c={themeColors.gray[6]} fz={14}>
                      Periksa kembali data yang telah anda impor dan lakukan penyesuaian jika
                      diperlukan.
                    </Text>
                  </Stack>
                </Group>
              </Group>

              <Stack p="md" gap="md">
                <Tabs
                  defaultValue="all"
                  color={themeColors.primary[5]}
                  styles={{
                    tab: {
                      fontWeight: 500,
                      '&[dataActive]': {
                        backgroundColor: themeColors.primary[0],
                        color: themeColors.primary[6],
                      },
                      '&:hover': {
                        backgroundColor: themeColors.primary[0],
                      },
                    },
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Tabs.List style={{ flex: 1 }}>
                      <Tabs.Tab
                        value="all"
                        rightSection={
                          <Badge variant="light" color="gray" size="sm" radius="sm">
                            {sumTotalData}
                          </Badge>
                        }
                      >
                        All Data
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="correct"
                        rightSection={
                          <Badge variant="light" color="green" size="sm" radius="sm">
                            {totalCorrectData}
                          </Badge>
                        }
                      >
                        Correct Data
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="wrong"
                        rightSection={
                          <Badge variant="light" color="red" size="sm" radius="sm">
                            {totalWrongData}
                          </Badge>
                        }
                      >
                        Wrong Data
                      </Tabs.Tab>
                    </Tabs.List>

                    {selectedRecords.length > 0 && (
                      <Button
                        size="xs"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={handleDeleteSelected}
                        variant="light"
                      >
                        Hapus Terpilih ({selectedRecords.length})
                      </Button>
                    )}
                  </Flex>

                  {showAlert && (
                    <Alert
                      variant="light"
                      color="red"
                      title="Catatan Kesalahan"
                      icon={<IconInfoCircle />}
                      withCloseButton
                      onClose={() => setShowAlert(false)}
                      mt="md"
                    >
                      <List size="xs">
                        {errorMessages.map((error, index) => (
                          <List.Item key={index}>{error}</List.Item>
                        ))}
                      </List>
                    </Alert>
                  )}

                  <Tabs.Panel value="all" pt="md">
                    <ImportBankStatementDraftTable
                      records={totalData}
                      selectedRecords={selectedRecords}
                      onSelectedRecordsChange={setSelectedRecords}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="correct" pt="md">
                    <ImportBankStatementDraftTable
                      records={correctData}
                      selectedRecords={selectedRecords}
                      onSelectedRecordsChange={setSelectedRecords}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="wrong" pt="md">
                    <ImportBankStatementDraftTable
                      records={wrongData}
                      selectedRecords={selectedRecords}
                      onSelectedRecordsChange={setSelectedRecords}
                    />
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      <ConfirmModal
        opened={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleImport}
        title="Impor Akun"
        message={
          <>
            Apakah Anda yakin ingin mengimport <strong>{totalData.length}</strong> baris data bank
            statement?
            {totalWrongData > 0 && (
              <Text c="red" size="sm" mt="xs">
                Perhatian: Masih terdapat {totalWrongData} data yang tidak valid.
              </Text>
            )}
          </>
        }
        helperText="Data yang diimpor tidak dapat diubah kembali setelahproses berjalan."
        confirmLabel="Tambah Data"
        cancelLabel="Batal"
        confirmLoading={isConfirming}
        imageSrc={importModalImage}
        confirmButtonProps={{
          color: themeColors.primary[5],
          leftSection: <PlusIcon size={18} weight="duotone" />,
        }}
      />
    </BankStatementLayout>
  );
};
export default ImportBankStatementDraft;
