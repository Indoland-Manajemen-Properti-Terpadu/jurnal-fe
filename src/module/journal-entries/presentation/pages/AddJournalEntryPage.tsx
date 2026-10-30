import React, { useEffect, useState } from 'react';
import {
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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import dayjs from 'dayjs';
import AppShellLayout from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import CustomDropzone from '@/components/Dropzone/CustomDropzone';
import { useTransactionStore } from '../store/useTransactionStore';
import { useFileStore } from '../store/useFileStore';
import JournalLinesEditor from '../components/JournalLinesEditor';
import { TagInput } from '../components/TagInput';
import { useCreateJournalEntry } from '../hooks/useCreateJournalEntry';
import type { JournalEntryPayload } from '../../domain/journalEntry';
import { JournalBalanceMetrics } from '../components/JournalBalanceMetrics';
import { JournalDoubleEntryGuide } from '../components/JournalDoubleEntryGuide';
import { JournalValidationCard } from '../components/JournalValidationCard';

export const AddJournalEntryPage: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const { notes, setNotes, transactions, disableTransaction, resetTransactions } =
    useTransactionStore();

  const [transactionNumber, setTransactionNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [tags, setTags] = useState<string[]>([]);

  const { mutate, isPending } = useCreateJournalEntry();

  const [files, setFiles, clearFiles, removeFile] = useFileStore((state) => [
    state.files,
    state.setFiles,
    state.clearFiles,
    state.removeFile,
  ]);

  const handleDrop = (f: File[]) => {
    setFiles(f);
  };

  const handleReject = () => {
    notifications.show({
      color: 'red',
      title: t('toast.rejectedTitle'),
      message: t('toast.rejectedMessage'),
    });
  };

  const handleSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (!transactionDate) {
      notifications.show({
        color: 'red',
        title: t('toast.dateRequiredTitle'),
        message: t('toast.dateRequiredMessage'),
      });
      return;
    }

    if (disableTransaction()) {
      notifications.show({
        color: 'red',
        title: t('toast.invalidTitle'),
        message: t('toast.invalidMessage'),
      });
      return;
    }

    const formattedDate = dayjs(transactionDate).format('YYYY-MM-DD');
    const payload: JournalEntryPayload = {
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
  useEffect(
    () => () => {
      clearFiles();
      resetTransactions();
    },
    []
  );

  const isSaveDisabled = disableTransaction() || !transactionDate || isPending;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
          <ModuleHeader
            icon={IconReceipt}
            title={t('form.title')}
            description={t('form.description')}
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.generalJournal.main)}
              >
                {t('form.back')}
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
                        {t('form.infoTitle')}
                      </Text>
                      <Text fz={12} c="dimmed">
                        {t('form.infoSubtitle')}
                      </Text>
                    </div>
                  </Group>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <DatePickerInput
                        withAsterisk
                        label={t('form.dateLabel')}
                        value={transactionDate ? dayjs(transactionDate).toDate() : null}
                        onChange={(date) =>
                          setTransactionDate(date ? dayjs(date).format('YYYY-MM-DD') : '')
                        }
                        maxDate={new Date()}
                        placeholder={t('form.datePlaceholder')}
                        rightSection={<IconCalendar size={18} color={themeColors.gray[5]} />}
                        styles={{ input: { height: 40 } }}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('form.numberLabel')}
                        placeholder={t('form.numberPlaceholder')}
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        styles={{ input: { height: 40 } }}
                      />
                      <Text fz={11} c="dimmed" mt={4}>
                        {t('form.numberHint')}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Stack gap={4}>
                        <Text fz={14} fw={500} c="dark.8">
                          {t('form.tagLabel')}
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
                          {t('form.linesTitle')}
                        </Text>
                        <Text fz={12} c="dimmed">
                          {t('form.linesSubtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color="primary" size="sm">
                      {t('form.linesBadge', { count: transactions.length })}
                    </Badge>
                  </Group>

                  <Box>
                    <JournalLinesEditor />
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
                        {t('form.memoTitle')}
                      </Text>
                      <Text fz={12} c="dimmed">
                        {t('form.memoSubtitle')}
                      </Text>
                    </div>
                  </Group>

                  <Stack gap="md">
                    <Textarea
                      label={t('form.memoLabel')}
                      placeholder={t('form.memoPlaceholder')}
                      minRows={3}
                      autosize
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      styles={{ input: { fontSize: 13 } }}
                    />

                    <CustomDropzone
                      title={t('form.dropTitle')}
                      files={files}
                      onRemoveFile={removeFile}
                      handleDrop={handleDrop}
                      onReject={handleReject}
                      accept={[...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE]}
                      description={
                        <Stack align="center" gap={4}>
                          <Text fz="xs" fw={600} c="dark.8">
                            {t('form.dropDescription')}
                          </Text>
                          <Text fz={11} c="dimmed">
                            {t('form.dropHint')}
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
                      {t('form.save')}
                    </Button>
                    <Button
                      size="md"
                      fullWidth
                      variant="subtle"
                      color="gray"
                      onClick={() => navigate(routes.generalJournal.main)}
                      disabled={isPending}
                    >
                      {t('form.cancel')}
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

export default AddJournalEntryPage;
