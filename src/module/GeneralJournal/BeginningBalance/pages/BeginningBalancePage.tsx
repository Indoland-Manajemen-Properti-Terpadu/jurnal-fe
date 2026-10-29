import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Group,
  Paper,
  Stack,
  Button,
  Text,
  SimpleGrid,
  ThemeIcon,
  Badge,
  Alert,
  TextInput,
  Select,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  IconScale,
  IconArrowDownRight,
  IconArrowUpRight,
  IconCheck,
  IconAlertTriangle,
  IconCalendar,
  IconSearch,
  IconX,
  IconDeviceFloppy,
  IconRotate,
  IconHistory,
  IconArrowLeft,
  IconInfoCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import { formatDate, dateFormatV1 } from '@/utils/FormatDate';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';

import BeginningBalancePageLayout from './Layout';
import TableBeginningBalance from '../components/TableBeginningBalance';
import BeginningBalanceLogsModal from '../components/BeginningBalanceLogsModal';
import {
  useDraftAccount,
  usePublishDraftBalance,
  useSetDraftBalance,
} from '../hooks/useDraftBalance';
import { useJournalAccounts } from '../../JournalAccount/hooks/useJournalAccounts';
import { JournalAccounts } from '../../JournalAccount/types/JournalAccountModel';
import { useInitialBalanceStore } from '@/store/GeneralJournal/initialBalanceAccount';
import { useTranslation } from '@/i18n';

const BeginningBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('journal');

  // Stores and Hooks
  const { conversionDate, setConverstion } = useInitialBalanceStore();
  const { accounts: rawAccounts, isLoading: isLoadingAccounts } = useJournalAccounts();
  const { draftAccounts, isLoading: isLoadingDraft, refetch: refetchDraft } = useDraftAccount();
  const { mutate: setDraftBalance, isPending: isSavingDraft } = useSetDraftBalance();
  const { mutate: publishDraftBalance, isPending: isPublishing } = usePublishDraftBalance();

  // Local state
  const [listAccounts, setListAccounts] = useState<JournalAccounts[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    conversionDate ? dayjs(conversionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Merge journal accounts with draft accounts data
  useEffect(() => {
    if (!rawAccounts || !Array.isArray(rawAccounts) || rawAccounts.length === 0) return;

    const draft = draftAccounts?.data || draftAccounts;
    const draftList: any[] = draft?.accounts || [];
    const draftPeriod = draft?.period ? dayjs(draft.period).format('YYYY-MM-DD') : null;

    if (draftPeriod && !conversionDate) {
      setConverstion(new Date(draftPeriod));
      setSelectedDate(draftPeriod);
    } else if (conversionDate) {
      setSelectedDate(dayjs(conversionDate).format('YYYY-MM-DD'));
    }

    // Map accounts with draft balances
    const mapped = rawAccounts.map((acc) => {
      const accId = acc.id || (acc as any)._id;
      const matchedDraft = draftList.find(
        (d: any) =>
          d._id === accId ||
          d.id === accId ||
          d.accounts === accId ||
          (d.accounts && (d.accounts.id === accId || d.accounts._id === accId))
      );

      return {
        ...acc,
        debit:
          matchedDraft?.debit !== undefined ? Number(matchedDraft.debit) : Number(acc.debit) || 0,
        credit:
          matchedDraft?.credit !== undefined
            ? Number(matchedDraft.credit)
            : Number(acc.credit) || 0,
      };
    });

    setListAccounts(mapped);
  }, [rawAccounts, draftAccounts]);

  // Keep conversion date in store synced
  const handleDateChange = (date: string | null) => {
    setSelectedDate(date);
    if (date) {
      setConverstion(new Date(date));
    }
  };

  // Calculate totals
  const { totalDebit, totalCredit, difference, isBalanced } = useMemo(() => {
    const sumDebit = listAccounts.reduce((sum, acc) => sum + (Number(acc.debit) || 0), 0);
    const sumCredit = listAccounts.reduce((sum, acc) => sum + (Number(acc.credit) || 0), 0);
    const diff = Math.abs(sumDebit - sumCredit);
    const balanced = sumDebit === sumCredit && sumDebit > 0;

    return {
      totalDebit: sumDebit,
      totalCredit: sumCredit,
      difference: diff,
      isBalanced: balanced,
    };
  }, [listAccounts]);

  // Categories list for filtering
  const categoryOptions = useMemo(() => {
    const categoriesSet = new Set<string>();
    listAccounts.forEach((acc) => {
      if (acc.category?.name) {
        categoriesSet.add(acc.category.name);
      }
    });

    return [
      { value: 'all', label: 'Semua Kategori' },
      ...Array.from(categoriesSet).map((cat) => ({ value: cat, label: cat })),
    ];
  }, [listAccounts]);

  // Draft status badge
  const draftData = draftAccounts?.data || draftAccounts;
  const isPublished = Boolean(draftData?.isPublished || draftData?.publishedDate);
  const statusLabel = isPublished ? 'Terpublikasi' : draftData?.id ? 'Draf Tersimpan' : 'Baru';

  // Build API payload conforming to Postman Contract
  const buildPayload = () => {
    const targetDate = selectedDate || conversionDate || new Date();
    const periodStr = dayjs(targetDate).format('YYYY-MM-DD');

    const balances = listAccounts.map((acc) => {
      const accId = acc.id || (acc as any)._id;
      const debit = Number(acc.debit) || 0;
      const credit = Number(acc.credit) || 0;
      return {
        account: accId,
        accounts: accId, // for backward-compatibility
        debit,
        credit,
      };
    });

    return {
      period: periodStr,
      balances,
      accounts: balances, // for backward-compatibility
    };
  };

  // Save as Draft handler
  const handleSaveDraft = () => {
    const payload = buildPayload();
    setDraftBalance(payload, {
      onSuccess: () => {
        refetchDraft();
      },
    });
  };

  // Pre-publish validation
  const handleInitiatePublish = () => {
    if (totalDebit === 0 && totalCredit === 0) {
      notifications.show({
        color: 'red',
        title: 'Saldo Awal Masih Kosong',
        message: 'Silakan isi saldo debit dan kredit akun terlebih dahulu sebelum publikasi.',
      });
      return;
    }

    if (totalDebit !== totalCredit) {
      notifications.show({
        color: 'orange',
        autoClose: 5000,
        title: 'Saldo Awal Belum Seimbang',
        message: `Terdapat selisih sebesar ${formatCurrency(
          difference
        )}. Harap seimbangkan debit dan kredit sebelum publikasi, atau pilih Simpan sebagai Draf.`,
      });
      return;
    }

    setIsPublishModalOpen(true);
  };

  // Publish confirmation handler
  const handleConfirmPublish = () => {
    const payload = buildPayload();
    publishDraftBalance(payload, {
      onSuccess: () => {
        setIsPublishModalOpen(false);
        navigate(routes.generalJournal.main);
      },
    });
  };

  // Reset handler
  const handleConfirmReset = () => {
    const cleared = listAccounts.map((acc) => ({
      ...acc,
      debit: 0,
      credit: 0,
    }));
    setListAccounts(cleared);
    setIsResetModalOpen(false);
    notifications.show({
      color: 'blue',
      title: 'Saldo Awal Dikosongkan',
      message: 'Seluruh input debit dan kredit saldo awal telah dikosongkan.',
    });
  };

  if (isLoadingAccounts || isLoadingDraft) {
    return (
      <BeginningBalancePageLayout>
        <Center h={450}>
          <Stack align="center" gap="sm">
            <Loader size="lg" color="primary.6" />
            <Text size="sm" c="dimmed">
              Memuat data bagan akun dan draf saldo awal...
            </Text>
          </Stack>
        </Center>
      </BeginningBalancePageLayout>
    );
  }

  return (
    <>
      <BeginningBalancePageLayout>
        <Container fluid p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="xl">
            {/* Canonical Module Header */}
            <ModuleHeader
              icon={IconScale}
              title={t('beginningBalanceTitle')}
              description={
                <Stack gap={6}>
                  <Group gap="xs" wrap="wrap" align="center">
                    <Badge
                      variant="filled"
                      color={isPublished ? 'teal' : draftData?.id ? 'yellow.8' : 'blue'}
                      radius="sm"
                    >
                      Status: {statusLabel}
                    </Badge>
                    <Badge variant="light" color="indigo" radius="sm">
                      {t('conversionDate')}: {dateFormatV1(selectedDate || new Date())}
                    </Badge>
                    <Badge
                      variant="light"
                      color={
                        isBalanced
                          ? 'teal'
                          : totalDebit === 0 && totalCredit === 0
                            ? 'gray'
                            : 'orange'
                      }
                      radius="sm"
                    >
                      {isBalanced
                        ? `${t('balanced')} (Balanced)`
                        : totalDebit === 0 && totalCredit === 0
                          ? currentLanguage === 'id'
                            ? 'Belum Ada Nilai'
                            : 'No Balances Entered'
                          : `${t('difference')}: ${formatCurrency(difference)}`}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed" mt={2}>
                    {t('beginningBalanceSubtitle')}
                  </Text>
                </Stack>
              }
              breadcrumbs={[
                { label: t('generalLedger'), to: routes.generalJournal.main },
                { label: t('chartOfAccounts'), to: routes.generalJournal.main },
                { label: t('beginningBalanceTitle') },
              ]}
              actions={
                <Group gap="xs" wrap="wrap">
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={() => navigate(routes.generalJournal.main)}
                  >
                    {currentLanguage === 'id' ? 'Kembali' : 'Back'}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconHistory size={16} />}
                    onClick={() => setIsLogsModalOpen(true)}
                  >
                    {t('changeHistory')}
                  </Button>

                  <Button
                    variant="subtle"
                    color="gray"
                    size="sm"
                    leftSection={<IconRotate size={16} />}
                    onClick={() => setIsResetModalOpen(true)}
                  >
                    {t('resetBalance')}
                  </Button>

                  <Button
                    variant="light"
                    color="primary"
                    size="sm"
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleSaveDraft}
                    loading={isSavingDraft}
                  >
                    {t('saveDraft')}
                  </Button>

                  <Button
                    variant="gradient"
                    gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
                    size="sm"
                    leftSection={<IconCheck size={16} />}
                    onClick={handleInitiatePublish}
                    loading={isPublishing}
                  >
                    {isPublished ? t('updateAndPublish') : t('publishBeginningBalance')}
                  </Button>
                </Group>
              }
            />

            {/* Quick 4 Financial KPI Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      {t('totalDebit')}
                    </Text>
                    <Text fz={22} fw={800} c="teal.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(totalDebit)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {currentLanguage === 'id'
                        ? 'Akumulasi saldo akun sisi debit'
                        : 'Total accumulated debit balance'}
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="teal">
                    <IconArrowDownRight size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      {t('totalCredit')}
                    </Text>
                    <Text fz={22} fw={800} c="red.8" mt={4} lh={1.1} ff="monospace">
                      {formatCurrency(totalCredit)}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {currentLanguage === 'id'
                        ? 'Akumulasi saldo akun sisi kredit'
                        : 'Total accumulated credit balance'}
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="red">
                    <IconArrowUpRight size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      {t('balanceStatus')}
                    </Text>
                    <Text
                      fz={22}
                      fw={800}
                      c={
                        isBalanced
                          ? 'teal.8'
                          : totalDebit === 0 && totalCredit === 0
                            ? 'dark.6'
                            : 'orange.8'
                      }
                      mt={4}
                      lh={1.1}
                    >
                      {isBalanced
                        ? t('balanced')
                        : totalDebit === 0 && totalCredit === 0
                          ? currentLanguage === 'id'
                            ? 'Belum Diisi'
                            : 'Unset'
                          : `${t('difference')} ${formatCurrency(difference)}`}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {isBalanced
                        ? currentLanguage === 'id'
                          ? 'Debit & kredit sama persis'
                          : 'Debit and credit perfectly balanced'
                        : totalDebit === 0 && totalCredit === 0
                          ? currentLanguage === 'id'
                            ? 'Masukkan nilai saldo awal'
                            : 'Enter opening balances'
                          : totalDebit > totalCredit
                            ? currentLanguage === 'id'
                              ? 'Sisi kredit kurang dari debit'
                              : 'Credit is lower than debit'
                            : currentLanguage === 'id'
                              ? 'Sisi debit kurang dari kredit'
                              : 'Debit is lower than credit'}
                    </Text>
                  </div>
                  <ThemeIcon
                    size={40}
                    radius="md"
                    variant="light"
                    color={
                      isBalanced
                        ? 'teal'
                        : totalDebit === 0 && totalCredit === 0
                          ? 'gray'
                          : 'orange'
                    }
                  >
                    {isBalanced ? <IconCheck size={20} /> : <IconAlertTriangle size={20} />}
                  </ThemeIcon>
                </Group>
              </Paper>

              <Paper withBorder radius="md" p="md" bg="white">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                      Tanggal Cutoff Konversi
                    </Text>
                    <Text fz={20} fw={800} c="blue.8" mt={4} lh={1.1}>
                      {selectedDate ? dayjs(selectedDate).format('DD MMM YYYY') : '-'}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      Mulai efektif saldo awal pembukuan
                    </Text>
                  </div>
                  <ThemeIcon size={40} radius="md" variant="light" color="blue">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>
            </SimpleGrid>

            {/* Live Accounting Balance Alert Banner */}
            {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
              <Alert
                icon={<IconAlertTriangle size={18} />}
                color="orange"
                variant="light"
                radius="md"
                title="Perhatian: Saldo Belum Seimbang (Unbalanced)"
              >
                Terdapat selisih pembukuan sebesar <strong>{formatCurrency(difference)}</strong>{' '}
                antara Total Debit dan Total Kredit. Anda dapat menyimpan data sebagai{' '}
                <strong>Draf</strong> untuk dilanjutkan nanti, namun{' '}
                <strong>Publikasi Saldo Awal</strong> mewajibkan debit dan kredit bernilai seimbang
                (selisih Rp 0).
              </Alert>
            )}

            {isBalanced && (
              <Alert
                icon={<IconCheck size={18} />}
                color="teal"
                variant="light"
                radius="md"
                title="Status Seimbang (Balance)"
              >
                Total Debit dan Total Kredit telah seimbang (selisih Rp 0). Saldo awal siap
                dipublikasikan ke buku besar.
              </Alert>
            )}

            {/* Main Table Container */}
            <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
              <Stack gap="md">
                {/* Filter and Action Toolbar */}
                <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                  <Group gap="sm" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
                    <TextInput
                      placeholder="Cari kode atau nama akun..."
                      size="sm"
                      radius="md"
                      leftSection={<IconSearch size={16} />}
                      rightSection={
                        searchQuery ? (
                          <ActionIcon variant="subtle" size="xs" onClick={() => setSearchQuery('')}>
                            <IconX size={12} />
                          </ActionIcon>
                        ) : null
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      style={{ flex: 1, minWidth: 220, maxWidth: 360 }}
                    />

                    <Select
                      placeholder="Filter Kategori"
                      size="sm"
                      radius="md"
                      data={categoryOptions}
                      value={selectedCategory || 'all'}
                      onChange={(val) => setSelectedCategory(val === 'all' ? null : val)}
                      style={{ width: 190 }}
                      clearable={false}
                    />

                    <DatePickerInput
                      placeholder="Tanggal Konversi"
                      valueFormat="DD/MM/YYYY"
                      size="sm"
                      radius="md"
                      leftSection={<IconCalendar size={16} />}
                      value={selectedDate}
                      onChange={handleDateChange}
                      style={{ width: 170 }}
                    />

                    {(searchQuery || selectedCategory) && (
                      <Button
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory(null);
                        }}
                        leftSection={<IconX size={14} />}
                      >
                        Reset Filter
                      </Button>
                    )}
                  </Group>

                  <Group gap="xs">
                    <Badge variant="light" color="gray" size="lg">
                      {listAccounts.length} Akun Terdaftar
                    </Badge>
                  </Group>
                </Group>

                {/* Editable Table */}
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
      </BeginningBalancePageLayout>

      {/* Confirmation Modal to Publish */}
      <ConfirmModal
        opened={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
        title="Publikasikan Saldo Awal"
        message={
          <>
            Apakah Anda yakin ingin mempublikasikan saldo awal per tanggal{' '}
            <strong>{dateFormatV1(selectedDate || new Date())}</strong> dengan total nilai seimbang{' '}
            <strong>{formatCurrency(totalDebit)}</strong>?
          </>
        }
        helperText="Setelah dipublikasikan, saldo awal akan dicatat sebagai entri pembuka buku besar dan saldo akun akan otomatis diperbarui."
        confirmLabel="Ya, Publikasikan Sekarang"
        cancelLabel="Batal"
        confirmLoading={isPublishing}
      />

      {/* Confirmation Modal to Reset */}
      <ConfirmModal
        opened={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Kosongkan Saldo Awal"
        message="Apakah Anda yakin ingin mengosongkan seluruh nilai debit dan kredit yang telah diisi?"
        helperText="Perubahan yang belum disimpan ke server akan dibatalkan."
        imageSrc={deleteModalImage}
        confirmLabel="Kosongkan Semua"
        cancelLabel="Batal"
      />

      {/* Audit Trail Logs Modal */}
      <BeginningBalanceLogsModal
        opened={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
      />
    </>
  );
};

export default BeginningBalancePage;
