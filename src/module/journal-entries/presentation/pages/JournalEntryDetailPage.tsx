import React from 'react';
import {
  Alert,
  Anchor,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconInfoCircle,
  IconNotebook,
  IconPrinter,
  IconBan,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { ConfirmModal } from '@/components';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import deleteModalImage from '@/assets/images/illustrations/delete-confirm.svg';
import { SummaryBar, type SummaryItem } from '@/components/SummaryBar';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { absoluteDifference, isDetailBalanced, sumAmounts } from '../../domain/journalRules';
import { voidGate } from '../../domain/journalVoid';
import { useJournalEntryDetail } from '../hooks/useJournalEntryDetail';
import { useVoidJournalEntry } from '../hooks/useVoidJournalEntry';
import JournalEntryLinesTable from '../components/JournalEntryLinesTable';
import JournalEntryMeta from '../components/JournalEntryMeta';
import JournalEntrySidebar from '../components/JournalEntrySidebar';

export const JournalEntryDetailPage: React.FC = () => {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();
  const { idTransaction } = useParams<{ idTransaction: string }>();
  const { journalEntry, isError, isLoading } = useJournalEntryDetail(idTransaction!);
  const [voidOpened, { open: openVoid, close: closeVoid }] = useDisclosure(false);
  const voidMutation = useVoidJournalEntry();

  const lines = journalEntry?.transactionDetail || [];
  const totalDebit = sumAmounts(lines.map((item) => Number(item.debit) || 0));
  const totalCredit = sumAmounts(lines.map((item) => Number(item.credit) || 0));
  const isBalanced = isDetailBalanced(totalDebit, totalCredit);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={120} radius="lg" />
            <Skeleton height={86} radius="md" />
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  if (isError || !journalEntry) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder radius="lg" bg="white" p={0}>
            <EmptyState
              icon={<IconAlertCircle size={32} stroke={1.6} />}
              color="red"
              title={t('detail.notFoundTitle')}
              description={t('detail.notFoundBody')}
              actionLabel={t('detail.backToJournal')}
              actionIcon={<IconArrowLeft size={16} />}
              onAction={() => navigate(routes.chartOfAccounts.main)}
            />
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const hasMemo = journalEntry.notes && journalEntry.notes !== '-';
  const gate = voidGate(journalEntry);
  const openEntry = (id: string) =>
    navigate(routes.journalEntries.detail.replace(':idTransaction', id));
  const linkedId =
    !gate.allowed && gate.kind === 'void'
      ? journalEntry.reversedBy
      : !gate.allowed && gate.kind === 'reversal'
        ? journalEntry.reverses
        : null;
  const numberText = String(journalEntry.transactionNumber ?? '-');

  const handleConfirmVoid = () => {
    if (!idTransaction) return;
    voidMutation.mutate({ id: idTransaction, number: numberText }, { onSettled: closeVoid });
  };

  const summary: SummaryItem[] = [
    {
      key: 'debit',
      label: t('detail.totalDebit'),
      value: formatCurrency(totalDebit),
      hint: t('detail.debitHint'),
    },
    {
      key: 'credit',
      label: t('detail.totalCredit'),
      value: formatCurrency(totalCredit),
      hint: t('detail.creditHint'),
    },
    {
      key: 'status',
      label: t('detail.balanceGap'),
      value: isBalanced
        ? t('detail.balanced')
        : formatCurrency(absoluteDifference(totalDebit, totalCredit)),
      hint: isBalanced ? t('detail.balancedHint') : t('detail.unbalancedHint'),
      tone: isBalanced ? 'success' : 'danger',
    },
    {
      key: 'lines',
      label: t('detail.linesCard'),
      value: t('detail.linesBadge', { count: lines.length }),
      hint: t('detail.linesHint'),
    },
  ];

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconNotebook}
            title={t('detail.heading', { number: numberText })}
            description={<JournalEntryMeta entry={journalEntry} isBalanced={isBalanced} />}
            actions={
              <Group gap="xs" wrap="wrap">
                <Button
                  variant="default"
                  size="md"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={() => navigate(-1)}
                >
                  {t('detail.back')}
                </Button>
                <Button
                  variant="default"
                  size="md"
                  leftSection={<IconPrinter size={16} />}
                  onClick={() => window.print()}
                >
                  {t('detail.print')}
                </Button>
                {gate.allowed && (
                  <Button
                    variant="light"
                    color="red"
                    size="md"
                    leftSection={<IconBan size={16} />}
                    loading={voidMutation.isPending}
                    onClick={openVoid}
                  >
                    {t('detail.void')}
                  </Button>
                )}
              </Group>
            }
          />

          {!gate.allowed && (
            <Alert variant="light" color="gray" radius="md" icon={<IconInfoCircle size={18} />}>
              <Group gap="xs" wrap="wrap">
                <Text fz="var(--jurnal-text-sm)">
                  {gate.kind === 'blocked' && gate.reason
                    ? gate.reason
                    : t(`detail.notice.${gate.kind}`)}
                </Text>
                {linkedId && (
                  <Anchor
                    component="button"
                    type="button"
                    fz="var(--jurnal-text-sm)"
                    fw={600}
                    onClick={() => openEntry(linkedId)}
                  >
                    {t(`detail.noticeLink.${gate.kind}`)}
                  </Anchor>
                )}
              </Group>
            </Alert>
          )}

          <SummaryBar items={summary} />

          <Grid gutter="lg" align="flex-start">
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="md">
                <Paper withBorder radius="md" p="md" bg="white" shadow="none">
                  <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
                    {t('detail.linesCard')}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" c="dimmed" mb="sm">
                    {t('detail.linesSubtitle')}
                  </Text>
                  <JournalEntryLinesTable
                    transactionDetails={journalEntry.transactionDetail}
                    isLoading={isLoading}
                  />
                </Paper>

                <Paper withBorder radius="md" p="md" bg="white" shadow="none">
                  <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8" mb="xs">
                    {t('detail.memoCard')}
                  </Text>
                  <Text
                    fz="var(--jurnal-text-sm)"
                    c={hasMemo ? 'dark.8' : 'dimmed'}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {hasMemo ? journalEntry.notes : t('detail.memoEmpty')}
                  </Text>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 4 }}>
              <JournalEntrySidebar entry={journalEntry} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <ConfirmModal
        opened={voidOpened}
        onClose={closeVoid}
        onConfirm={handleConfirmVoid}
        title={t('void.confirmTitle')}
        message={t('void.confirmMessage', { number: numberText })}
        helperText={t('void.confirmHelper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('void.confirmLabel')}
        cancelLabel={t('void.cancel')}
        confirmLoading={voidMutation.isPending}
      />
    </AppShellLayout>
  );
};

export default JournalEntryDetailPage;
