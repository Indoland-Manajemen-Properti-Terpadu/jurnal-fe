import { useState } from 'react';
import { Stack, Button, Divider, Container, Flex, Text, Stepper, Group, Progress, Paper, ThemeIcon, ActionIcon, Image } from '@mantine/core';
import { IconCircleCheck, IconFileText, IconPencil, IconUpload, IconDownload, IconBulb, IconFile, IconTrash, IconX } from '@tabler/icons-react';
import { gradientColors, themeColors } from '@/theme';
import { FileCsv, NotePencil, ArrowRight, CloudArrowUp, Files } from '@phosphor-icons/react';
import CustomConfirmModal from '@/components/Modals/ConfirmModal';
import { Dropzone, FileRejection, MIME_TYPES } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { useFileStore } from '@/store/GeneralJournal/useFileStore';
import { getImportBankStatement } from '../services/ImportBankStatement.service';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { InformationAlert } from '@/components/Alert/Alert';
import importTemplateImage from '@/assets/img/vectors/real estate _ blueprint, blueprints, plan, plans, city, development, building.svg';
import uploadTemplateImage from '@/assets/img/vectors/import.svg';

type ImportBankStatementModalProps = {
  idAccount: string;
  onContinue: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const ImportBankStatementModal: React.FC<ImportBankStatementModalProps> = ({ idAccount, onContinue, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [files, setFiles] = useFileStore((state) => [
    state.files,
    state.setFiles,
  ]);
  const { mutate: importBankStatementModal, isPending } = getImportBankStatement(idAccount)

  const handleDrop = (f: File[]) => {
    setUploadError(null);
    setFiles(f);
    simulateUpload(f[0]);
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    const totalSize = file.size;
    let uploaded = 0;
    const speed = totalSize / 50;

    const interval = setInterval(() => {
      uploaded += speed;
      const currentProgress = Math.min((uploaded / totalSize) * 100, 100);
      setProgress(currentProgress);

      const remaining = totalSize - uploaded;
      const remainingSeconds = Math.max(Math.ceil(remaining / speed / 10), 0);
      setTimeRemaining(remainingSeconds);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploading(false), 500);
      }
    }, 100);
  };

  const handleReject = (rejections: FileRejection[]) => {
    setUploadError("Gagal mengunggah, pastikan file berformat .csv");
  };

  const handleCloseModal = () => {
    if (active < 2) {
      setActive((prev) => prev + 1);
    } else {
      if (files.length > 0) {
        importBankStatementModal(files[0], {
          onSuccess: () => {
            onContinue();
            navigate(routes.generalJournal.bankStatementDraftImport.replace(':idAccount', idAccount || ''));
            setFiles([]);
            setActive(0);
            onClose();
          }
        });
      } else {
        notifications.show({
          color: 'red',
          title: 'Tidak ada file',
          message: 'Silakan unggah file terlebih dahulu',
        });
      }
    }
  };

  const handlePreviousStep = () => {
    if (active > 0) {
      setActive((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = '/templates/csv/Bank Statement Template ProApps.csv';
        link.download = 'Bank Statement Template ProApps.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    return (
      <CustomConfirmModal
        size="55rem"
        opened={isOpen}
        onClose={onClose}
        withCloseButton={true}
        title={
          <Text fw={600} fz={18} c={themeColors.black[9]}>
            Impor Rekening Koran
          </Text>
        }
        labels={{
          confirm: (
            <Button
              color={themeColors.teal[5]}
              onClick={handleCloseModal}
              disabled={uploading || (active === 2 && files.length === 0)}
              loading={isPending}
              rightSection={<ArrowRight size={18} weight="duotone" />}
            >
              Selanjutnya
            </Button>
          ),
          cancel: (
            <Button
              variant="light"
              color={themeColors.gray[7]}
              onClick={handlePreviousStep}
              disabled={uploading || isPending}
            >
              Batal
            </Button>
          ),
        }}
      >
        <Stack gap="lg" align="stretch" justify="center">
          <Stepper
            active={active}
            onStepClick={!uploading ? setActive : undefined}
            color={themeColors.teal[5]}
            radius="md"
            styles={{
              stepIcon: {
                borderWidth: 2,
              },
            }}
          >
            <Stepper.Step
              icon={
                <Flex align="center" justify="center">
                  <FileCsv size={18} weight="bold" />
                </Flex>
              }
              completedIcon={
                <Flex align="center" justify="center">
                  <FileCsv size={18} weight="bold" />
                </Flex>
              }
              progressIcon={
                <Flex align="center" justify="center">
                  <FileCsv size={18} weight="bold" />
                </Flex>
              }
              label={
                <Text fw={600} c={themeColors.black[9]}>
                  Unduh Template
                </Text>
              }
            >
              <Container fluid pt={40} pb={20}>
                <Flex gap="md" justify="center" align="center" direction="column">
                  <Image
                    src={importTemplateImage}
                    w={200}
                    h="auto"
                    fallbackSrc="https://placehold.co/200x200?text=Illustration"
                  />
                  <Text ta="center" fw={600} fz={18} c={themeColors.black[9]}>
                    Unduh Template Terlebih Dahulu
                  </Text>
                  <Text ta="center" fw={400} fz={14} c={themeColors.gray[7]} maw={800}>
                    Mulai dengan mengunduh template file CSV (Comma Separated Values) rekening koran
                    terlebih dahulu. template ini sudah dilengkapi kolom yang sesuai untuk
                    memudahkan proses impor data rekening koran.
                  </Text>
                  <Button
                    mt="md"
                    color={themeColors.blue[6]}
                    leftSection={<IconDownload size={18} />}
                    onClick={handleDownloadTemplate}
                  >
                    Unduh Template
                  </Button>
                </Flex>
              </Container>
            </Stepper.Step>
            <Stepper.Step
              icon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              completedIcon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              progressIcon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              label={
                <Text fw={600} c={themeColors.black[9]}>
                  Cara Mengisi
                </Text>
              }
            >
              <Container fluid pt={20} pb={20}>
                <Stack gap="xl">
                  <Flex gap="xs" justify="center" align="center" direction="column">
                    <Text ta="center" fw={600} fz={18} c={themeColors.black[9]}>
                      Panduan Mengisi Template CSV
                    </Text>
                    <Text ta="center" fw={400} fz={14} c={themeColors.gray[7]} maw={800}>
                      Ekspor data rekening koran dari sistem sebelumnya dalam format CSV, lalu buka
                      file tersebut menggunakan Excel atau aplikasi spreadsheet lainnya. Setelah
                      itu, salin data dan tempelkan ke template yang telah diunduh. Pastikan setiap
                      data ditempatkan sesuai nama kolom yang tersedia pada template agar proses
                      import berjalan dengan benar.
                    </Text>
                  </Flex>
                  <InformationAlert
                    title="Informasi Penting"
                    color="blue"
                    items={[
                      'Format tanggal harus menggunakan dd/mm/yyyy (English - Canada)',
                      'Maksimal transaksi per file: 1.000 baris (disarankan untuk performa optimal)',
                      'Jangan gunakan pemisah ribuan seperti koma (,) atau titik (.)',
                      'Gunakan titik (.) sebagai pemisah desimal',
                      'Jangan masukkan simbol mata uang seperti Rp, $, dan lainnya',
                      'Jangan mengubah format atau nama kolom yang sudah disediakan pada template',
                    ]}
                  />
                  <InformationAlert
                    title="Tips"
                    color="yellow"
                    variant="normal"
                    icon={<IconBulb />}
                    items={[
                      "Jika Anda menggunakan Microsoft Excel, tambahkan tanda apostrof (') di depan data yang mengandung angka atau format khusus agar nilainya tidak berubah otomatis. Contoh: '6-6003 dan '11-02-2016.",
                    ]}
                  />
                </Stack>
              </Container>
            </Stepper.Step>
            <Stepper.Step
              icon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              completedIcon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              progressIcon={
                <Flex align="center" justify="center">
                  <NotePencil size={18} weight="bold" />
                </Flex>
              }
              label={
                <Text fw={600} c={themeColors.black[9]}>
                  Unggah File
                </Text>
              }
            >
              <Container fluid pt={20} pb={20}>
                <Stack gap="xl">
                  <Group align="center" wrap="nowrap" gap="xl">
                    <Image
                      src={uploadTemplateImage}
                      w={150}
                      h="auto"
                      fallbackSrc="https://placehold.co/150x150?text=Illustration"
                    />
                    <Stack gap="xs">
                      <Text fw={600} fz={18} c={themeColors.black[9]}>
                        Unggah Template CSV
                      </Text>
                      <Text fw={400} fz={14} c={themeColors.gray[7]}>
                        Setelah selesai melakukan perubahan, silakan unggah file template yang telah
                        diperbarui. Pastikan file menggunakan format CSV, XLSX, atau XLS.
                      </Text>
                    </Stack>
                  </Group>

                <Dropzone
                  onDrop={handleDrop}
                  onReject={handleReject}
                  maxSize={30 * 1024 ** 2}
                  accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx]}
                  styles={(theme) => ({
                    root: {
                      border: `2px dashed ${themeColors.black[2]}`,
                      borderRadius: theme.radius.md,
                      padding: theme.spacing.xl,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: themeColors.teal[0],
                      },
                    },
                  })}
                >
                  <Group
                    justify="center"
                    gap="xs"
                    mih={180}
                    style={{ pointerEvents: 'none', flexDirection: 'column' }}
                  >
                    <CloudArrowUp size={56} color={themeColors.teal[5]} weight="bold" />
                    <Text size="md" fw={600} c={themeColors.black[9]} mt="md" ta="center">
                      Seret file ke sini atau klik untuk memilih file
                    </Text>
                    <Text size="sm" c="dimmed" ta="center" maw={500}>
                      Anda dapat mengunggah beberapa file sekaligus, dengan ukuran maksimal 30 MB
                      per file.
                    </Text>
                  </Group>
                </Dropzone>

                {uploadError && (
                  <Paper
                    withBorder
                    p="sm"
                    radius="md"
                    style={{ borderColor: 'red', backgroundColor: '#fff5f5' }}
                  >
                    <Group justify="space-between">
                      <Group gap="sm">
                        <IconX color="red" size={20} />
                        <Text size="sm" c="red">
                          {uploadError}
                        </Text>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => setUploadError(null)}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                )}

                {(uploading || files.length > 0) && (
                  <Stack gap="xs">
                    <Text fw={600} fz={14} c={themeColors.black[9]}>
                      File Terunggah
                    </Text>
                    {files.map((file, index) => (
                      <Paper key={index} withBorder p="md" radius="md">
                        <Stack gap="sm">
                          <Group wrap="nowrap" gap="xs" align="flex-start">
                            <Files
                              size={24}
                              color={themeColors.blue[6]}
                              weight="bold"
                              style={{ marginTop: 2 }}
                            />
                            <Stack gap={0} style={{ flex: 1 }}>
                              <Text size="sm" fw={600} c={themeColors.black[9]}>
                                {file.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {formatBytes(file.size)} | {Math.round(progress)}% •{' '}
                                {uploading ? `${timeRemaining} Detik Tersisa` : 'Complete'}
                              </Text>
                            </Stack>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              onClick={() => setFiles(files.filter((_, i) => i !== index))}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Group>
                          <Progress
                            value={progress}
                            color={themeColors.teal[5]}
                            size="md"
                            radius="xl"
                            animated={uploading}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Container>
          </Stepper.Step>
        </Stepper>
      </Stack>
    </CustomConfirmModal>
  );
};

export default ImportBankStatementModal;
