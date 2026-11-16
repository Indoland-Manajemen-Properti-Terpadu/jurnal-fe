import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Center, Loader, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ConfirmModal } from '@/components';
import { useLatestClosingEnd } from '@/module/period-closing';
import deleteModalImage from '@/assets/images/illustrations/delete-confirm.svg';
import publishModalImage from '@/assets/images/illustrations/publish-balance.svg';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { OpeningRow } from '../../domain/beginningBalance';
import {
  applyAmountEntry,
  balanceToEquity,
  buildConversionWindow,
  balanceSignature,
  buildBalancePayload,
  buildOpeningRows,
  clearAccountRow,
  clearAllRows,
  conversionDateIssue,
  countProfitLossFilled,
  findOpeningEquityRow,
  filterOpeningRows,
  getBalanceState,
  openingActions,
  resolveSavedBalance,
  summarizeOpeningBalance,
} from '../../domain/openingBalanceRules';
import { BalanceNotices } from '../components/BalanceNotices';
import BalanceSummary from '../components/BalanceSummary';
import BalanceToolbar from '../components/BalanceToolbar';
import { OpeningIntro } from '../components/OpeningIntro';
import BeginningBalanceHeader from '../components/BeginningBalanceHeader';
import { BeginningBalanceLogsModal } from '../components/BeginningBalanceLogsModal';
import TableBeginningBalance from '../components/TableBeginningBalance';
import {
  useDateLocked,
  useDraftAccount,
  useDraftBalanceLogs,
  useFirstJournalDay,
  usePublishDraftBalance,
  useSetDraftBalance,
  useSimpleAccounts,
} from '../hooks/useDraftBalance';
import { useInitialBalanceStore } from '../store/useInitialBalanceStore';

const toIsoDate = (value: string | Date | null | undefined): string | null =>
  value ? dayjs(value).format('YYYY-MM-DD') : null;

const BeginningBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('beginningBalances');

  const { conversionDate, setConversionDate } = useInitialBalanceStore();
  const {
    data: simpleAccounts,
    isLoading: isLoadingAccounts,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useSimpleAccounts();
  const { draftAccounts, isLoading: isLoadingDraft, refetch: refetchDraft } = useDraftAccount();
  const isPublished = Boolean(draftAccounts?.isPublished || draftAccounts?.publishedDate);
  const { data: logs, isLoading: isLoadingLogs } = useDraftBalanceLogs(isPublished);
  const { mutate: setDraftBalance, isPending: isSavingDraft } = useSetDraftBalance();
  const { mutate: publishDraftBalance, isPending: isPublishing } = usePublishDraftBalance();

  const [rows, setRows] = useState<OpeningRow[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    conversionDate ? dayjs(conversionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [accountClass, setAccountClass] = useState<number | null>(null);
  const [onlyFilled, setOnlyFilled] = useState(false);

  const [started, setStarted] = useState(false);
  const pickedDate = useRef(false);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const hasDraft = Boolean(draftAccounts?.id);

  // What the server has: the saved balance (the draft, or the last publish) over the account list.
  const saved = useMemo(() => resolveSavedBalance(draftAccounts, logs), [draftAccounts, logs]);
  const draftPeriod = toIsoDate(saved.period);
  const savedRows = useMemo(
    () => (simpleAccounts ? buildOpeningRows(simpleAccounts, saved.entries) : []),
    [simpleAccounts, saved]
  );
  const savedSignature = useMemo(
    () => balanceSignature(savedRows, hasDraft ? draftPeriod : null),
    [savedRows, hasDraft, draftPeriod]
  );
  const currentSignature = balanceSignature(rows, hasDraft ? selectedDate : null);
  const isDirty = currentSignature !== savedSignature;

  // Fill the table once both answers are in. After that a refetch (for example when the window
  // regains focus) must not overwrite what is being typed, so it only applies while nothing is
  // changed on screen.
  const populated = useRef(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = isDirty;
  useEffect(() => {
    if (!simpleAccounts || isLoadingDraft || isLoadingLogs) return;
    if (populated.current && dirtyRef.current) return;
    populated.current = true;
    setRows(savedRows);
    if (draftPeriod && !conversionDate) setSelectedDate(draftPeriod);
    // `conversionDate` is read, not a dependency: a date change must not re-apply the saved rows.
  }, [savedRows, simpleAccounts, isLoadingDraft, isLoadingLogs]);

  const handleDateChange = (date: string | null) => {
    pickedDate.current = true;
    setSelectedDate(date);
    if (date) setConversionDate(new Date(date));
  };

  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(
    () => summarizeOpeningBalance(rows),
    [rows]
  );
  const balanceState = getBalanceState(totalDebit, totalCredit, isBalanced);
  const { data: isDateLocked } = useDateLocked(selectedDate);

  // The latest day allowed comes from the draft once one exists; before that, from the earliest journal.
  const closing = useLatestClosingEnd();
  const draftFirstDay = draftAccounts?.firstTransactionDate ?? null;
  const journalFirstDay = useFirstJournalDay(!isLoadingDraft && !draftFirstDay && !isPublished);
  const firstDay = draftFirstDay ?? journalFirstDay.data ?? null;
  const conversionWindow = useMemo(
    () =>
      buildConversionWindow({
        lastClosingEnd: closing.endDate,
        firstTransactionDate: firstDay,
        today: dayjs().format('YYYY-MM-DD'),
      }),
    [closing.endDate, firstDay]
  );
  const windowLoading = closing.isLoading || journalFirstDay.isLoading;

  const dateIssue = conversionDateIssue(
    selectedDate,
    firstDay,
    Boolean(isDateLocked),
    closing.endDate
  );
  const dateIssueMessages = {
    locked: t('date.locked'),
    beforeClosing: t('date.beforeClosing', { date: dateFormatV1(closing.endDate ?? '') }),
    afterFirstTransaction: t('date.afterFirst', { date: dateFormatV1(firstDay ?? '') }),
  };
  const dateError = dateIssue ? dateIssueMessages[dateIssue] : null;
  const equityRow = useMemo(() => findOpeningEquityRow(rows), [rows]);
  const actions = openingActions(balanceState, isDirty, isPublished, Boolean(equityRow));
  const canSaveDraft = actions.canSaveDraft && !dateIssue;
  const canPublish = actions.canPublish && !dateIssue;
  const filledCount = useMemo(
    () => rows.filter((row) => row.debit > 0 || row.credit > 0).length,
    [rows]
  );

  const visibleRows = useMemo(
    () => filterOpeningRows(rows, { query: searchQuery, accountClass, onlyFilled }),
    [rows, searchQuery, accountClass, onlyFilled]
  );

  const statusLabel = isPublished
    ? t('status.published')
    : hasDraft
      ? t('status.draft')
      : t('status.new');

  // A gap that is not traced yet is recorded to Ekuitas Saldo Awal when publishing.
  const recordsGap = balanceState === 'unbalanced' && Boolean(equityRow);
  const buildPayload = (source: OpeningRow[] = rows) =>
    buildBalancePayload(
      source,
      dayjs(selectedDate || conversionDate || new Date()).format('YYYY-MM-DD')
    );

  const handleSaveDraft = () => {
    if (!canSaveDraft) return;
    setDraftBalance(buildPayload(), { onSuccess: () => refetchDraft() });
  };

  const handleConfirmPublish = () => {
    if (!canPublish) return;
    const finalRows = recordsGap && equityRow ? balanceToEquity(rows, equityRow.id) : rows;
    publishDraftBalance(buildPayload(finalRows), {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        navigate(routes.chartOfAccounts.main);
      },
    });
  };

  const profitLossFilled = useMemo(() => countProfitLossFilled(rows), [rows]);
  const handleConfirmReset = () => {
    setRows(clearAllRows(rows));
    setIsResetModalOpen(false);
    notifications.show({
      color: 'blue',
      title: t('toast.resetTitle'),
      message: t('toast.resetMessage'),
    });
  };

  // Nothing saved yet: explain first, and start from a date that the server will accept.
  const hasSavedAmounts = savedRows.some((row) => row.debit > 0 || row.credit > 0);
  const showIntro = !isPublished && !hasSavedAmounts && !started;
  useEffect(() => {
    if (!showIntro || pickedDate.current || windowLoading) return;
    if (conversionWindow.suggested) setSelectedDate(conversionWindow.suggested);
  }, [showIntro, windowLoading, conversionWindow.suggested]);

  if (isLoadingAccounts || isLoadingDraft || isLoadingLogs || windowLoading) {
    return (
      <AppShellLayout>
        <Center h={450}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="primary.6" />
            <Text size="sm" c="dimmed">
              {t('page.loading')}
            </Text>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  if (isAccountsError) {
    return (
      <AppShellLayout>
        <Center h={450}>
          <Stack align="center" gap="sm">
            <Text size="sm" c="red.6" fw={600}>
              {t('page.loadFailed')}
            </Text>
            <Button variant="light" size="xs" onClick={() => refetchAccounts()}>
              {t('page.retry')}
            </Button>
          </Stack>
        </Center>
      </AppShellLayout>
    );
  }

  if (showIntro) {
    return (
      <OpeningIntro
        window={conversionWindow}
        lastClosingEnd={closing.endDate}
        selectedDate={selectedDate}
        dateError={dateError}
        onDateChange={handleDateChange}
        onStart={() => {
          if (selectedDate) setConversionDate(new Date(selectedDate));
          setStarted(true);
        }}
      />
    );
  }

  return (
    <>
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <BeginningBalanceHeader
              statusLabel={statusLabel}
              isPublished={isPublished}
              hasUnsavedChanges={isDirty}
              selectedDate={selectedDate}
              canSaveDraft={canSaveDraft}
              canPublish={canPublish}
              isSavingDraft={isSavingDraft}
              isPublishing={isPublishing}
              onOpenLogs={() => setIsLogsModalOpen(true)}
              onSaveDraft={handleSaveDraft}
              onPublish={() => setIsPublishModalOpen(true)}
            />

            <BalanceSummary
              totalDebit={totalDebit}
              totalCredit={totalCredit}
              difference={difference}
              balanceState={balanceState}
              filledCount={filledCount}
              accountCount={rows.length}
              autoBalance={Boolean(equityRow)}
            />

            <BalanceNotices profitLossFilled={profitLossFilled} />

            <Paper withBorder radius="lg" p="md" bg="white" shadow="none">
              <Stack gap="md">
                <BalanceToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  accountClass={accountClass}
                  onAccountClassChange={setAccountClass}
                  onlyFilled={onlyFilled}
                  onOnlyFilledChange={setOnlyFilled}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  dateError={dateError}
                  minDate={conversionWindow.earliest ?? undefined}
                  maxDate={conversionWindow.latest ?? undefined}
                  shownCount={visibleRows.length}
                  accountCount={rows.length}
                  canReset={filledCount > 0}
                  onReset={() => setIsResetModalOpen(true)}
                />
                <TableBeginningBalance
                  records={visibleRows}
                  onEnter={(id, field, raw) =>
                    setRows((prev) => applyAmountEntry(prev, id, field, raw))
                  }
                  onClear={(id) => setRows((prev) => clearAccountRow(prev, id))}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setAccountClass(null);
                    setOnlyFilled(false);
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </AppShellLayout>

      <ConfirmModal
        opened={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title={t('confirmPublish.title')}
        message={
          recordsGap ? (
            <>
              {t('confirmPublish.before')}{' '}
              <strong>{dateFormatV1(selectedDate || new Date())}</strong>?
            </>
          ) : (
            <>
              {t('confirmPublish.before')}{' '}
              <strong>{dateFormatV1(selectedDate || new Date())}</strong>{' '}
              {t('confirmPublish.middle')} <strong>{formatCurrency(totalDebit)}</strong>?
            </>
          )
        }
        helperText={
          recordsGap
            ? t('confirmPublish.gap', { amount: formatCurrency(difference) })
            : t('confirmPublish.helper')
        }
        imageSrc={publishModalImage}
        confirmButtonProps={{ color: 'primary', leftSection: <IconCheck size={18} /> }}
        confirmLabel={t('confirmPublish.confirm')}
        cancelLabel={t('confirmPublish.cancel')}
        confirmLoading={isPublishing}
      />

      <ConfirmModal
        opened={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title={t('confirmReset.title')}
        message={t('confirmReset.message')}
        helperText={t('confirmReset.helper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('confirmReset.confirm')}
        cancelLabel={t('confirmReset.cancel')}
      />

      <BeginningBalanceLogsModal
        opened={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </>
  );
};

export default BeginningBalancePage;
