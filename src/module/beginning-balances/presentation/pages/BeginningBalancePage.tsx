import React, { useEffect, useMemo, useState } from 'react';
import { Center, Container, Loader, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import AppShellLayout from '@/components/AppShellLayout';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import { useJournalAccounts, type JournalAccounts } from '@/module/chart-of-accounts';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1 } from '@/utils/FormatDate';
import {
  buildBalancePayload,
  checkOpeningPublish,
  getBalanceState,
  mergeDraftIntoAccounts,
  summarizeOpeningBalance,
} from '../../domain/openingBalanceRules';
import BalanceSummary from '../components/BalanceSummary';
import BalanceToolbar from '../components/BalanceToolbar';
import BeginningBalanceHeader from '../components/BeginningBalanceHeader';
import { BeginningBalanceLogsModal } from '../components/BeginningBalanceLogsModal';
import TableBeginningBalance from '../components/TableBeginningBalance';
import {
  useDraftAccount,
  usePublishDraftBalance,
  useSetDraftBalance,
} from '../hooks/useDraftBalance';
import { useInitialBalanceStore } from '../store/useInitialBalanceStore';

const BeginningBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('beginningBalances');

  const { conversionDate, setConversionDate } = useInitialBalanceStore();
  const { accounts: rawAccounts, isLoading: isLoadingAccounts } = useJournalAccounts();
  const { draftAccounts, isLoading: isLoadingDraft, refetch: refetchDraft } = useDraftAccount();
  const { mutate: setDraftBalance, isPending: isSavingDraft } = useSetDraftBalance();
  const { mutate: publishDraftBalance, isPending: isPublishing } = usePublishDraftBalance();

  const [listAccounts, setListAccounts] = useState<JournalAccounts[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    conversionDate ? dayjs(conversionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Merge journal accounts with draft accounts data. `conversionDate` is read but deliberately not
  // a dependency: re-running on a date change would overwrite the amounts the user is typing.
  useEffect(() => {
    if (!rawAccounts || !Array.isArray(rawAccounts) || rawAccounts.length === 0) return;

    const draftPeriod = draftAccounts?.period
      ? dayjs(draftAccounts.period).format('YYYY-MM-DD')
      : null;

    if (draftPeriod && !conversionDate) {
      setConversionDate(new Date(draftPeriod));
      setSelectedDate(draftPeriod);
    } else if (conversionDate) {
      setSelectedDate(dayjs(conversionDate).format('YYYY-MM-DD'));
    }

    setListAccounts(mergeDraftIntoAccounts(rawAccounts, draftAccounts?.accounts || []));
  }, [rawAccounts, draftAccounts]);

  const handleDateChange = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      setConversionDate(new Date(date));
    }
  };

  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(
    () => summarizeOpeningBalance(listAccounts),
    [listAccounts]
  );
  const balanceState = getBalanceState(totalDebit, totalCredit, isBalanced);

  const categoryNames = useMemo(() => {
    const categories = new Set<string>();
    listAccounts.forEach((acc) => {
      if (acc.category?.name) categories.add(acc.category.name);
    });
    return Array.from(categories);
  }, [listAccounts]);
  const categoryOptions = [
    { value: 'all', label: t('toolbar.allCategories') },
    ...categoryNames.map((cat) => ({ value: cat, label: cat })),
  ];

  const isPublished = Boolean(draftAccounts?.isPublished || draftAccounts?.publishedDate);
  const statusLabel = isPublished
    ? t('status.published')
    : draftAccounts?.id
      ? t('status.draft')
      : t('status.new');
  const statusColor = isPublished ? 'teal' : draftAccounts?.id ? 'yellow.8' : 'blue';

  const buildPayload = () => {
    const targetDate = selectedDate || conversionDate || new Date();
    return buildBalancePayload(listAccounts, dayjs(targetDate).format('YYYY-MM-DD'));
  };

  const handleSaveDraft = () => {
    setDraftBalance(buildPayload(), {
      onSuccess: () => {
        refetchDraft();
      },
    });
  };

  const handleInitiatePublish = () => {
    const gate = checkOpeningPublish(totalDebit, totalCredit);
    if (gate === 'empty') {
      notifications.show({
        color: 'red',
        title: t('toast.emptyTitle'),
        message: t('toast.emptyMessage'),
      });
      return;
    }
    if (gate === 'unbalanced') {
      notifications.show({
        color: 'orange',
        autoClose: 5000,
        title: t('toast.unbalancedTitle'),
        message: t('toast.unbalancedMessage', { amount: formatCurrency(difference) }),
      });
      return;
    }
    setIsPublishModalOpen(true);
  };

  const handleConfirmPublish = () => {
    publishDraftBalance(buildPayload(), {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        navigate(routes.generalJournal.main);
      },
    });
  };

  const handleConfirmReset = () => {
    setListAccounts(listAccounts.map((acc) => ({ ...acc, debit: 0, credit: 0 })));
    setIsResetModalOpen(false);
    notifications.show({
      color: 'blue',
      title: t('toast.resetTitle'),
      message: t('toast.resetMessage'),
    });
  };

  if (isLoadingAccounts || isLoadingDraft) {
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

  return (
    <>
      <AppShellLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="xl">
            <BeginningBalanceHeader
              statusLabel={statusLabel}
              statusColor={statusColor}
              isPublished={isPublished}
              selectedDate={selectedDate}
              balanceState={balanceState}
              difference={difference}
              isSavingDraft={isSavingDraft}
              isPublishing={isPublishing}
              onBack={() => navigate(routes.generalJournal.main)}
              onOpenLogs={() => setIsLogsModalOpen(true)}
              onOpenReset={() => setIsResetModalOpen(true)}
              onSaveDraft={handleSaveDraft}
              onPublish={handleInitiatePublish}
            />

            <BalanceSummary
              totalDebit={totalDebit}
              totalCredit={totalCredit}
              difference={difference}
              balanceState={balanceState}
              selectedDate={selectedDate}
            />

            <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
              <Stack gap="md">
                <BalanceToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categoryOptions={categoryOptions}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                  accountCount={listAccounts.length}
                />
                <TableBeginningBalance
                  data={listAccounts}
                  onChange={setListAccounts}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              </Stack>
            </Paper>
          </Stack>
        </Container>
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
