import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Center, Loader, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/images/illustrations/delete-confirm.svg';
import publishModalImage from '@/assets/images/illustrations/publish-balance.svg';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { OpeningRow } from '../../domain/beginningBalance';
import {
  applyAmountEntry,
  balanceSignature,
  buildBalancePayload,
  buildOpeningRows,
  clearAccountRow,
  clearAllRows,
  conversionDateIssue,
  filterOpeningRows,
  getBalanceState,
  openingActions,
  resolveSavedBalance,
  summarizeOpeningBalance,
} from '../../domain/openingBalanceRules';
import BalanceSummary from '../components/BalanceSummary';
import BalanceToolbar from '../components/BalanceToolbar';
import BeginningBalanceHeader from '../components/BeginningBalanceHeader';
import { BeginningBalanceLogsModal } from '../components/BeginningBalanceLogsModal';
import TableBeginningBalance from '../components/TableBeginningBalance';
import {
  useDateLocked,
  useDraftAccount,
  useDraftBalanceLogs,
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
    setSelectedDate(date);
    if (date) setConversionDate(new Date(date));
  };

  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(
    () => summarizeOpeningBalance(rows),
    [rows]
  );
  const balanceState = getBalanceState(totalDebit, totalCredit, isBalanced);
  const { data: isDateLocked } = useDateLocked(selectedDate);
  const dateIssue = conversionDateIssue(
    selectedDate,
    draftAccounts?.firstTransactionDate,
    Boolean(isDateLocked)
  );
  const dateError = dateIssue
    ? dateIssue === 'locked'
      ? t('date.locked')
      : t('date.afterFirst', { date: dateFormatV1(draftAccounts?.firstTransactionDate ?? '') })
    : null;
  const actions = openingActions(balanceState, isDirty, isPublished);
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

  const saveDraftHint = canSaveDraft ? null : (dateError ?? t('action.saveDraftNothing'));
  const publishHint = canPublish
    ? null
    : (dateError ??
      (balanceState === 'empty'
        ? t('action.publishEmpty')
        : t('action.publishUnbalanced', { amount: formatCurrency(difference) })));

  const buildPayload = () =>
    buildBalancePayload(
      rows,
      dayjs(selectedDate || conversionDate || new Date()).format('YYYY-MM-DD')
    );

  const handleSaveDraft = () => {
    if (!canSaveDraft) return;
    setDraftBalance(buildPayload(), { onSuccess: () => refetchDraft() });
  };

  const handleConfirmPublish = () => {
    if (!canPublish) return;
    publishDraftBalance(buildPayload(), {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        navigate(routes.chartOfAccounts.main);
      },
    });
  };

  const handleConfirmReset = () => {
    setRows(clearAllRows(rows));
    setIsResetModalOpen(false);
    notifications.show({
      color: 'blue',
      title: t('toast.resetTitle'),
      message: t('toast.resetMessage'),
    });
  };

  if (isLoadingAccounts || isLoadingDraft || isLoadingLogs) {
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
              saveDraftHint={saveDraftHint}
              canPublish={canPublish}
              publishHint={publishHint}
              isSavingDraft={isSavingDraft}
              isPublishing={isPublishing}
              onBack={() => navigate(routes.chartOfAccounts.main)}
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
            />

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
                  maxDate={draftAccounts?.firstTransactionDate ?? undefined}
                  shownCount={visibleRows.length}
                  accountCount={rows.length}
                  canReset={filledCount > 0}
                  onReset={() => setIsResetModalOpen(true)}
                />
                <TableBeginningBalance
                  records={visibleRows}
                  resetKey={`${searchQuery}|${accountClass}|${onlyFilled}`}
                  onEnter={(id, field, raw) =>
                    setRows((prev) => applyAmountEntry(prev, id, field, raw))
                  }
                  onClear={(id) => setRows((prev) => clearAccountRow(prev, id))}
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
          <>
            {t('confirmPublish.before')} <strong>{dateFormatV1(selectedDate || new Date())}</strong>{' '}
            {t('confirmPublish.middle')} <strong>{formatCurrency(totalDebit)}</strong>?
          </>
        }
        helperText={t('confirmPublish.helper')}
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
