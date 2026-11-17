import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Input,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { useDateLock } from '@/module/period-closing';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconFileInvoice,
  IconListNumbers,
  IconLock,
  IconPaperclip,
  IconReceipt,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { IMAGE_MIME_TYPE, PDF_MIME_TYPE } from '@mantine/dropzone';
import dayjs from 'dayjs';
import { AppShellLayout } from '@/components/AppShellLayout';
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
import { MAX_REFERENCE_LENGTH, normalizeReferenceNumber } from '../../domain/journalRules';
import { JournalDoubleEntryGuide } from '../components/JournalDoubleEntryGuide';
import { JournalValidationCard } from '../components/JournalValidationCard';

export const AddJournalEntryPage: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const { notes, setNotes, transactions, disableTransaction, resetTransactions } =
    useTransactionStore();

  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [tags, setTags] = useState<string[]>([]);

  const { mutate, isPending } = useCreateJournalEntry();
  const dateLock = useDateLock(transactionDate || null);

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

    if (dateLock.isLocked) {
      notifications.show({
        color: 'red',
        title: t('toast.invalidTitle'),
        message: t('form.dateLocked', { name: dateLock.periodName || '—' }),
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
      referenceNumber: normalizeReferenceNumber(referenceNumber),
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

  const isSaveDisabled = disableTransaction() || !transactionDate || isPending || dateLock.isLocked;

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
                onClick={() => navigate(routes.journalEntries.main)}
              >
                {t('form.back')}
              </Button>
            }
          />

          {/* Form Layout: 8 cols Inputs / 4 cols Verification & Assistance */}
          <Grid gutter="lg" align="flex-start">
            {/* Left Column: Form Sections */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                {/* Card 1: Informasi Transaksi */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="none">
                  <Group gap="sm" mb="md">
                    <ThemeIcon size={36} radius="md" variant="light" color="primary">
                      <IconFileInvoice size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                        {t('form.infoTitle')}
                      </Text>
                      <Text fz="var(--jurnal-text-xs)" c="dimmed">
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
                        error={dateLock.isLocked ? ' ' : undefined}
                        styles={{ input: { height: 38 } }}
                      />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('form.numberLabel')}
                        placeholder={t('form.numberPlaceholder')}
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        maxLength={MAX_REFERENCE_LENGTH}
                        styles={{ input: { height: 38 } }}
                      />
                      <Text fz="var(--jurnal-text-xs)" c="dimmed" mt={4}>
                        {t('form.numberHint')}
                      </Text>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Input.Wrapper label={t('form.tagLabel')}>
                        <TagInput value={tags} onChange={setTags} />
                      </Input.Wrapper>
                    </Grid.Col>
                  </Grid>

                  {dateLock.isLocked && (
                    <Alert
                      color="orange"
                      variant="light"
                      radius="md"
                      mt="md"
                      icon={<IconLock size={18} />}
                      role="alert"
                    >
                      {dateLock.periodName
                        ? t('form.dateLocked', { name: dateLock.periodName })
                        : t('form.dateLockedNoName')}
                    </Alert>
                  )}
                </Paper>

                {/* Card 2: Baris Ayat Jurnal (Table) */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="none">
                  <Group justify="space-between" align="flex-start" mb="md">
                    <Group gap="sm">
                      <ThemeIcon size={36} radius="md" variant="light" color="primary">
                        <IconListNumbers size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                          {t('form.linesTitle')}
                        </Text>
                        <Text fz="var(--jurnal-text-xs)" c="dimmed">
                          {t('form.linesSubtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Text fz="var(--jurnal-text-xs)" fw={600} c="dimmed">
                      {t('form.linesBadge', { count: transactions.length })}
                    </Text>
                  </Group>

                  <Box>
                    <JournalLinesEditor />
                  </Box>
                </Paper>

                {/* Card 3: Memo & Berkas Lampiran */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="none">
                  <Group gap="sm" mb="md">
                    <ThemeIcon size={36} radius="md" variant="light" color="primary">
                      <IconPaperclip size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                        {t('form.memoTitle')}
                      </Text>
                      <Text fz="var(--jurnal-text-xs)" c="dimmed">
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
                      styles={{ input: { fontSize: 'var(--jurnal-text-sm)' } }}
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
                          <Text fz="var(--jurnal-text-xs)" c="dimmed">
                            {t('form.dropHint')}
                          </Text>
                        </Stack>
                      }
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column: Verification (it owns the save button) & Guide */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="md" pos="sticky" top={20}>
                <JournalValidationCard
                  transactionDate={transactionDate}
                  dateLocked={dateLock.isLocked}
                  action={
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
                  }
                />

                <JournalDoubleEntryGuide />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default AddJournalEntryPage;
