import React, { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  FileInput,
  Flex,
  Group,
  Image,
  Modal,
  Paper,
  ScrollArea,
  SegmentedControl,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
  rem,
} from '@mantine/core';
import ImageImport from '@/assets/img/SettingsAccount-Import.svg';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconFileText,
  IconInfoCircle,
  IconSearch,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import { useAccountSettings } from '../../hooks/useAccountSettings';
import {
  AccountImportItem,
  AccountImportParsedData,
  WrongDataItem,
} from '../../../domain/settingAccount';
import { formatCurrency } from '@/utils/FormatCurrency';

interface ImportAccountWizardModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportAccountWizardModal: React.FC<ImportAccountWizardModalProps> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<AccountImportParsedData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    downloadTemplate,
    isDownloadingTemplate,
    uploadImport,
    isUploading,
    commitImport,
    isCommitting,
  } = useAccountSettings();

  const handleResetWizard = () => {
    setActiveStep(0);
    setSelectedFile(null);
    setParsedData(null);
    setFilterType('all');
    setSearchQuery('');
  };

  const handleClose = () => {
    handleResetWizard();
    onClose();
  };

  // Step 1: Upload & Parse
  const handleUploadAndValidate = async () => {
    if (!selectedFile) return;
    try {
      const result = await uploadImport(selectedFile);
      setParsedData(result);
      setActiveStep(1);
    } catch {
      // Error handled in hook notification
    }
  };

  // Step 2: Commit correct data
  const handleCommit = async () => {
    if (!parsedData || parsedData.correctData.length === 0) return;
    try {
      await commitImport({ correctData: parsedData.correctData });
      setActiveStep(2);
      onSuccess?.();
    } catch {
      // Error handled in hook notification
    }
  };

  // Filter preview table items
  const correctItems = parsedData?.correctData || [];
  const wrongItems = parsedData?.wrongData || [];

  const combinedItems = React.useMemo(() => {
    const list: Array<{ item: AccountImportItem; isValid: boolean; errors?: string[] }> = [];

    correctItems.forEach((it) => {
      list.push({ item: it, isValid: true });
    });

    wrongItems.forEach((wd) => {
      list.push({ item: wd.item, isValid: false, errors: wd.errorItem });
    });

    return list.filter((row) => {
      if (filterType === 'valid' && !row.isValid) return false;
      if (filterType === 'invalid' && row.isValid) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const code = String(row.item.accountNumber || '').toLowerCase();
        const name = String(row.item.name || '').toLowerCase();
        const category = String(row.item.categoryName || '').toLowerCase();
        return code.includes(query) || name.includes(query) || category.includes(query);
      }
      return true;
    });
  }, [correctItems, wrongItems, filterType, searchQuery]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={34} radius="md" color="primary" variant="light">
            <IconUpload size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              Impor Bagan Akun (Chart of Accounts)
            </Text>
            <Text size="xs" c="dimmed">
              Tambah akun pembukuan secara massal dari berkas Excel atau CSV
            </Text>
          </Box>
        </Group>
      }
      size="xl"
      radius="md"
      centered
    >
      <Stack gap="md" mt="xs">
        {/* Step Indicator */}
        <Stepper
          active={activeStep}
          onStepClick={() => {}}
          size="xs"
          completedIcon={<IconCircleCheck style={{ width: rem(16), height: rem(16) }} />}
        >
          <Stepper.Step
            icon={<IconFileSpreadsheet style={{ width: rem(16), height: rem(16) }} />}
            label="1. Unggah Berkas"
            description="Pilih template & file"
          />
          <Stepper.Step
            icon={<IconCheck style={{ width: rem(16), height: rem(16) }} />}
            label="2. Validasi & Pratinjau"
            description="Periksa keabsahan data"
          />
          <Stepper.Step
            icon={<IconCircleCheck style={{ width: rem(16), height: rem(16) }} />}
            label="3. Selesai"
            description="Akun tersimpan"
          />
        </Stepper>

        <Divider />

        {/* STEP 0: Upload File & Template Download */}
        {activeStep === 0 && (
          <Stack gap="md">
            {/* Top Vector Illustration Frame */}
            <Box
              style={{
                height: 124,
                borderRadius: 12,
                background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(14, 165, 233, 0.15)',
              }}
            >
              <Image src={ImageImport} alt="Impor Akun" h={88} fit="contain" />
            </Box>

            {/* Template Information Card */}
            <Paper
              withBorder
              radius="md"
              p="md"
              bg="blue.0"
              style={{ borderColor: 'var(--mantine-color-blue-2)' }}
            >
              <Flex
                direction={{ base: 'column', sm: 'row' }}
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                gap="sm"
              >
                <Box>
                  <Text fw={700} size="sm" c="blue.9">
                    Unduh Template Standar Terlebih Dahulu
                  </Text>
                  <Text size="xs" c="blue.8" mt={2}>
                    Pastikan kolom Nomor Akun, Nama Akun, Kategori, dan Saldo Awal sesuai susunan
                    template resmi.
                  </Text>
                </Box>
                <Button
                  variant="white"
                  color="blue"
                  size="xs"
                  radius="md"
                  leftSection={<IconDownload size={15} />}
                  onClick={() => downloadTemplate()}
                  loading={isDownloadingTemplate}
                >
                  Unduh Template (.xlsx)
                </Button>
              </Flex>
            </Paper>

            {/* File Input Card */}
            <Paper withBorder radius="md" p="lg" bg="gray.0">
              <Stack gap="sm">
                <FileInput
                  label="Pilih Berkas Akun"
                  description="Format yang didukung: .xlsx, .xls, atau .csv (Maksimal 5MB)"
                  placeholder="Klik untuk memilih file dari komputer Anda..."
                  leftSection={<IconUpload size={16} color="var(--mantine-color-dimmed)" />}
                  accept=".xlsx,.xls,.csv"
                  value={selectedFile}
                  onChange={setSelectedFile}
                  clearable
                  size="sm"
                  required
                />

                {selectedFile && (
                  <Paper withBorder radius="md" p="xs" bg="white">
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <ThemeIcon size={30} radius="sm" color="teal" variant="light">
                          <IconFileSpreadsheet size={16} />
                        </ThemeIcon>
                        <Box>
                          <Text size="xs" fw={700} c="dark.8" lineClamp={1}>
                            {selectedFile.name}
                          </Text>
                          <Text size="10px" c="dimmed">
                            {(selectedFile.size / 1024).toFixed(1)} KB • Siap diproses
                          </Text>
                        </Box>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        aria-label="Hapus file"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                )}
              </Stack>
            </Paper>

            <Group justify="flex-end" gap="sm" mt="sm">
              <Button variant="default" size="sm" radius="md" onClick={handleClose}>
                Batal
              </Button>
              <Button
                color="primary"
                size="sm"
                radius="md"
                rightSection={<IconChevronRight size={16} />}
                disabled={!selectedFile}
                onClick={handleUploadAndValidate}
                loading={isUploading}
              >
                Validasi & Pratinjau
              </Button>
            </Group>
          </Stack>
        )}

        {/* STEP 1: Preview & Validation Table */}
        {activeStep === 1 && (
          <Stack gap="md">
            {/* Metrics Bar */}
            <Group justify="space-between" align="center" wrap="wrap">
              <Group gap="xs">
                <Badge color="gray" variant="light" size="sm">
                  Total: {parsedData?.totalData?.length || 0} Baris
                </Badge>
                <Badge color="teal" variant="filled" size="sm">
                  {correctItems.length} Siap Diimpor
                </Badge>
                {wrongItems.length > 0 && (
                  <Badge color="red" variant="filled" size="sm">
                    {wrongItems.length} Perlu Koreksi
                  </Badge>
                )}
              </Group>

              <SegmentedControl
                size="xs"
                radius="md"
                value={filterType}
                onChange={(val) => setFilterType(val as any)}
                data={[
                  { label: 'Semua', value: 'all' },
                  { label: `Valid (${correctItems.length})`, value: 'valid' },
                  { label: `Error (${wrongItems.length})`, value: 'invalid' },
                ]}
              />
            </Group>

            {/* Error Notification Alert */}
            {wrongItems.length > 0 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="orange"
                variant="light"
                radius="md"
                title="Perhatian Data Bermasalah"
              >
                Terdapat {wrongItems.length} baris akun yang tidak memenuhi validasi (misal: nomor
                akun duplikat atau kategori tidak cocok). Hanya baris yang valid (
                {correctItems.length} akun) yang akan disimpan ke buku besar.
              </Alert>
            )}

            {/* Search Filter */}
            <TextInput
              placeholder="Cari kode akun atau nama akun hasil verifikasi..."
              leftSection={<IconSearch size={15} color="var(--mantine-color-dimmed)" />}
              size="sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />

            {/* Preview Table */}
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <ScrollArea.Autosize mah={320} type="always">
                <Table striped highlightOnHover verticalSpacing="xs" fz="xs">
                  <Table.Thead bg="gray.1">
                    <Table.Tr>
                      <Table.Th style={{ width: 130 }}>Nomor Akun</Table.Th>
                      <Table.Th>Nama Akun</Table.Th>
                      <Table.Th style={{ width: 160 }}>Kategori</Table.Th>
                      <Table.Th style={{ width: 130, textAlign: 'right' }}>Saldo Awal</Table.Th>
                      <Table.Th style={{ width: 120, textAlign: 'center' }}>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {combinedItems.length === 0 ? (
                      <Table.Tr>
                        <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                          <Text size="xs" c="dimmed">
                            Tidak ada data akun yang cocok dengan filter.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ) : (
                      combinedItems.map((row, idx) => (
                        <Table.Tr
                          key={`import-row-${idx}`}
                          style={{
                            backgroundColor: row.isValid ? undefined : 'var(--mantine-color-red-0)',
                          }}
                        >
                          <Table.Td fw={700} c={row.isValid ? 'dark.8' : 'red.9'}>
                            {row.item.accountNumber || '-'}
                          </Table.Td>
                          <Table.Td fw={600} c="dark.8">
                            {row.item.name || '-'}
                          </Table.Td>
                          <Table.Td c="dimmed">
                            {row.item.categoryName || row.item.categoryID || '-'}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'right' }} fw={600}>
                            {formatCurrency(Number(row.item.amount) || 0)}
                          </Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>
                            {row.isValid ? (
                              <Badge color="teal" size="xs" variant="light">
                                Valid
                              </Badge>
                            ) : (
                              <Tooltip
                                label={
                                  row.errors && row.errors.length > 0
                                    ? row.errors.join(', ')
                                    : 'Format data tidak valid'
                                }
                                withArrow
                                multiline
                                w={220}
                              >
                                <Badge
                                  color="red"
                                  size="xs"
                                  variant="filled"
                                  style={{ cursor: 'pointer' }}
                                >
                                  Error
                                </Badge>
                              </Tooltip>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea.Autosize>
            </Paper>

            <Group justify="space-between" align="center" mt="sm">
              <Button
                variant="default"
                size="sm"
                radius="md"
                leftSection={<IconChevronLeft size={16} />}
                onClick={() => setActiveStep(0)}
                disabled={isCommitting}
              >
                Ganti Berkas
              </Button>

              <Button
                color="primary"
                size="sm"
                radius="md"
                rightSection={<IconCheck size={16} />}
                onClick={handleCommit}
                loading={isCommitting}
                disabled={correctItems.length === 0}
              >
                Simpan & Impor ({correctItems.length} Akun)
              </Button>
            </Group>
          </Stack>
        )}

        {/* STEP 2: Success Screen */}
        {activeStep === 2 && (
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={64} radius="xl" color="teal" variant="light">
              <IconCheck size={36} stroke={2.5} />
            </ThemeIcon>

            <Box style={{ textAlign: 'center' }}>
              <Text fw={700} size="lg" c="dark.9">
                Impor Bagan Akun Berhasil!
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Sebanyak <strong>{correctItems.length}</strong> akun telah sukses disimpan dan
                terintegrasi ke buku besar.
              </Text>
            </Box>

            <Button color="primary" size="sm" radius="md" onClick={handleClose} mt="md">
              Selesai & Tutup
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};
