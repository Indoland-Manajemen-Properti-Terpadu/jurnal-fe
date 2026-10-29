import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconFileInvoice,
  IconListNumbers,
  IconPaperclip,
  IconReceipt,
  IconTag,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import dayjs from 'dayjs';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { useTransactionStore } from '../store/useTransactionStore';
import { useFileStore } from '../store/useFileStore';
import TransactionForm from '../components/JournalLinesEditor';
import { TagInput } from '../components/TagInput';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useSubmitTransactionJournal } from '../hooks/useCreateJournalEntry';
import { TransactionJournalPayload } from '../../domain/journalEntryPayload';
import { JournalBalanceMetrics } from '../components/JournalBalanceMetrics';
import { JournalDoubleEntryGuide } from '../components/JournalDoubleEntryGuide';
import { JournalValidationCard } from '../components/JournalValidationCard';

export const AddJournalTransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { notes, setNotes, transactions, disableTransaction, resetTransactions } =
    useTransactionStore();

  const [transactionNumber, setTransactionNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [tags, setTags] = useState<string[]>([]);

  const { mutate, isPending } = useSubmitTransactionJournal();

  const [files, setFiles, clearFiles] = useFileStore((state) => [
    state.files,
    state.setFiles,
    state.clearFiles,
  ]);

  const handleDrop = (f: File[]) => {
    setFiles(f);
  };

  const handleReject = () => {
    notifications.show({
      color: 'red',
      title: 'Format Berkas Tidak Didukung',
      message: 'Format berkas tidak sesuai. Harap unggah dokumen PDF atau Gambar (PNG/JPG).',
    });
  };

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (!transactionDate) {
      notifications.show({
        color: 'red',
        title: 'Tanggal Wajib Diisi',
        message: 'Silakan pilih tanggal transaksi sebelum menyimpan.',
      });
      return;
    }

    if (disableTransaction()) {
      notifications.show({
        color: 'red',
        title: 'Transaksi Belum Sah',
        message: 'Pastikan seluruh baris akun terisi dan total debit seimbang dengan total kredit.',
      });
      return;
    }

    const formattedDate = dayjs(transactionDate).format('YYYY-MM-DD');
    const payload: TransactionJournalPayload = {
      transactionNumber: transactionNumber.trim() ? parseInt(transactionNumber, 10) : undefined,
      transactionDate: formattedDate,
      transactionDetail: transactions.map((detail) => ({
        account: detail.account,
        description: detail.description,
        debit: detail.debit || 0,
        credit: detail.credit || 0,
      })),
      notes: notes.trim(),
      attachments: files,
      tags,
    };

    mutate(payload);
  };

  // Reset store on unmount to keep clean state
  useEffect(() => {
    return () => {
      clearFiles();
      resetTransactions();
    };
  }, []);

  const isSaveDisabled = disableTransaction() || !transactionDate || isPending;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
          <ModuleHeader
            icon={IconReceipt}
            title="Tambah Transaksi Jurnal Umum"
            description="Catat ayat jurnal penyesuaian atau transaksi operasional manual dengan memastikan prinsip double-entry (keseimbangan debit dan kredit)."
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.generalJournal.main)}
              >
                Kembali ke Daftar Akun
              </Button>
            }
          />

          {/* Quick Metrics & Balance Summary Bar */}
          <JournalBalanceMetrics />

          {/* Form Layout: 8 cols Inputs / 4 cols Verification & Assistance */}
          <Grid gutter="lg" align="flex-start">
            {/* Left Column: Form Sections */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                {/* Card 1: Informasi Transaksi */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group gap="sm" mb="md">
                    <ThemeIcon size={36} radius="md" variant="light" color="primary">
                      <IconFileInvoice size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} fz={15} c="dark.8">
                        Informasi Transaksi Jurnal
                      </Text>
                      <Text fz={12} c="dimmed">
                        Waktu pembukuan, referensi bukti transaksi, dan label penanda
                      </Text>
                    </div>
                  </Group>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <DatePickerInput
                        withAsterisk
                        label="Tanggal Transaksi"
                        value={transactionDate ? dayjs(transactionDate).toDate() : null}
                        onChange={(date) =>
                          setTransactionDate(date ? dayjs(date).format('YYYY-MM-DD') : '')
                        }
                        maxDate={new Date()}
                        placeholder="Pilih tanggal..."
                        rightSection={<IconCalendar size={18} color={themeColors.gray[5]} />}
                        styles={{ input: { height: 40 } }}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label="Nomor Transaksi (Opsional)"
                        placeholder="Contoh: 20260501"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        styles={{ input: { height: 40 } }}
                      />
                      <Text fz={11} c="dimmed" mt={4}>
                        * Kosongkan untuk nomor otomatis
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Stack gap={4}>
                        <Text fz={14} fw={500} c="dark.8">
                          Tag Transaksi
                        </Text>
                        <TagInput value={tags} onChange={setTags} />
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Paper>

                {/* Card 2: Baris Ayat Jurnal (Table) */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group justify="space-between" align="flex-start" mb="md">
                    <Group gap="sm">
                      <ThemeIcon size={36} radius="md" variant="light" color="teal">
                        <IconListNumbers size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          Ayat Jurnal (Double-Entry)
                        </Text>
                        <Text fz={12} c="dimmed">
                          Minimal 2 baris akun. Nilai debit dan kredit harus seimbang.
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color="primary" size="sm">
                      {transactions.length} Akun
                    </Badge>
                  </Group>

                  {/* Transaction Table */}
                  <Box>
                    <TransactionForm />
                  </Box>
                </Paper>

                {/* Card 3: Memo & Berkas Lampiran */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group gap="sm" mb="md">
                    <ThemeIcon size={36} radius="md" variant="light" color="indigo">
                      <IconPaperclip size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} fz={15} c="dark.8">
                        Catatan Memo & Bukti Transaksi
                      </Text>
                      <Text fz={12} c="dimmed">
                        Keterangan latar belakang dan dokumen pendukung transaksi
                      </Text>
                    </div>
                  </Group>

                  <Stack gap="md">
                    <Textarea
                      label="Catatan Memo / Penjelasan"
                      placeholder="Contoh: Penyesuaian amortisasi biaya sewa kantor bulan Mei 2026..."
                      minRows={3}
                      autosize
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      styles={{ input: { fontSize: 13 } }}
                    />

                    <CustomDropzone
                      title="Lampiran Dokumen Bukti (Opsional)"
                      handleDrop={handleDrop}
                      onReject={handleReject}
                      accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                      description={
                        <Stack align="center" gap={4}>
                          <Text fz="xs" fw={600} c="dark.8">
                            Seret berkas bukti ke sini atau klik untuk memilih file
                          </Text>
                          <Text fz={11} c="dimmed">
                            Mendukung PDF, PNG, JPG hingga 30 MB per berkas
                          </Text>
                        </Stack>
                      }
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column: Validation & Assistant */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="md" pos="sticky" top={20}>
                {/* Live Verification Checklist Card */}
                <JournalValidationCard transactionDate={transactionDate} />

                {/* Accounting Guidelines Card */}
                <JournalDoubleEntryGuide />

                {/* Quick Actions Panel */}
                <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                  <Stack gap="xs">
                    <Button
                      size="md"
                      fullWidth
                      color="primary"
                      leftSection={<IconCheck size={18} />}
                      loading={isPending}
                      disabled={isSaveDisabled}
                      onClick={() => handleSubmit()}
                    >
                      Simpan Transaksi Jurnal
                    </Button>
                    <Button
                      size="md"
                      fullWidth
                      variant="subtle"
                      color="gray"
                      onClick={() => navigate(routes.generalJournal.main)}
                      disabled={isPending}
                    >
                      Batal
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default AddJournalTransactionForm;
