import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  MultiSelect,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  IconArrowLeft,
  IconBuildingBank,
  IconCheck,
  IconChevronDown,
  IconCircleDot,
  IconCornerDownRight,
  IconFileInvoice,
  IconHierarchy2,
  IconInfoCircle,
  IconKey,
  IconNotebook,
  IconReceiptTax,
  IconRefresh,
  IconRotateClockwise,
  IconScale,
  IconShieldCheck,
  IconSparkles,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';
import { useGetAllUser } from '@/module/SettingMenu/UserManagement/User/service/User.service';
import { GetRoles } from '@/module/SettingMenu/UserManagement/Role/Service/Role.service';
import { GetCategoryAccount } from '../../services/GetCategoryAccount.service';
import { useGetCategoryInfo } from '../../services/GetCategoryInfo.service';
import { useAddAccount } from '../../services/AddAccount.service';
import { AddAccountPayload } from '../../types/AddAccountPayload';
import { CategoryAccountModel } from '../../types/CategoryAccountModel';
import { AccountPreviewCard, AccountingGuideCard } from '../../components';

const TAX_OPTIONS = [
  { value: 'PPN', label: 'PPN — Pajak Pertambahan Nilai' },
  { value: 'PPH', label: 'PPH — Pajak Penghasilan' },
  { value: 'PPNBM', label: 'PPNBM — Pajak Penjualan Barang Mewah' },
  { value: 'PBB', label: 'PBB — Pajak Bumi & Bangunan' },
];

/**
 * Maps a category model to one of the 8 standard COA numbering prefixes (1–8).
 */
export const getCategoryPrefix = (cat?: CategoryAccountModel): string => {
  if (!cat) return '';
  const code = (cat.categoryID || '').toUpperCase();
  const name = (cat.name || '').toLowerCase();

  if (code === 'BLN' || name.includes('beban lain')) return '8';
  if (code === 'PLN' || name.includes('pendapatan lain')) return '7';
  if (code === 'BEB' || name.includes('beban') || name.includes('biaya')) return '6';
  if (code === 'HPP' || name.includes('harga pokok') || name.includes('pokok penjualan')) {
    return '5';
  }
  if (code === 'PEN' || name.includes('pendapatan')) return '4';
  if (code === 'EKU' || name.includes('ekuitas') || name.includes('modal')) return '3';
  if (
    code === 'AH' ||
    code === 'KLL' ||
    code === 'KJP' ||
    name.includes('hutang') ||
    name.includes('kewajiban') ||
    name.includes('liabilitas')
  ) {
    return '2';
  }
  return '1';
};

/**
 * Shared input styles to guarantee 100% pixel-aligned side-by-side 2-column form inputs.
 */
/** Effective normal side of the account being created: the category flag, flipped by contra. */
export const resolveEffectiveDebit = (categoryIsDebit: boolean | undefined, isContra: boolean) => {
  const baseDebit = categoryIsDebit ?? true;
  return isContra ? !baseDebit : baseDebit;
};

const SYMMETRIC_INPUT_STYLES = {
  label: {
    display: 'inline-block',
    fontWeight: 600,
    fontSize: 13,
    lineHeight: 1.4,
    marginBottom: 2,
    whiteSpace: 'nowrap' as const,
  },
  description: {
    fontSize: 11.5,
    lineHeight: 1.35,
    minHeight: 16,
    marginBottom: 6,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  input: {
    height: 38,
    fontSize: 13.5,
    fontWeight: 500,
  },
};

export const AddAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('journal');

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = GetCategoryAccount();
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUser();
  const { data: rolesData, isLoading: isLoadingRoles } = GetRoles();
  const addAccountMutation = useAddAccount();

  // Form State
  const form = useForm({
    initialValues: {
      name: '',
      accountNumber: '',
      category: '',
      taxType: '',
      isBankAndCash: false,
      isContra: false,
      desc: '',
    },
    validate: {
      name: (val) => (val.trim().length < 3 ? 'Nama akun minimal 3 karakter' : null),
      accountNumber: (val) => (val.trim().length === 0 ? 'Kode akun wajib diisi' : null),
      category: (val) => (!val ? 'Kategori akun wajib dipilih' : null),
    },
  });

  // Hierarchy & Access State
  const [selectedAccountType, setSelectedAccountType] = useState<string>('SingleAccount');
  const [headAccountId, setHeadAccountId] = useState<string | null>(null);
  const [subAccountId, setSubAccountId] = useState<string | null>(null);
  const [accessScope, setAccessScope] = useState<string>('AllUsers');
  const [specialUsers, setSpecialUsers] = useState<string[]>([]);
  const [certainRoles, setCertainRoles] = useState<string[]>([]);

  // Category Info query for suggestions & hierarchy options
  const { data: categoryInfo } = useGetCategoryInfo(form.values.category);

  // Derived Grouped Dropdown Data (Grouped by Neraca 1-3 vs Laba Rugi 4-8)
  const categoryOptions = useMemo(() => {
    const list = categoryAccounts || [];
    const neracaItems: { value: string; label: string }[] = [];
    const labaRugiItems: { value: string; label: string }[] = [];

    list.forEach((cat) => {
      if (!cat.id) return;
      const prefix = getCategoryPrefix(cat);
      const item = {
        value: cat.id,
        label: `${prefix}-XXXX · ${cat.name || 'Unnamed category'}`,
      };
      if (Number(prefix) <= 3) {
        neracaItems.push(item);
      } else {
        labaRugiItems.push(item);
      }
    });

    if (neracaItems.length === 0 && labaRugiItems.length === 0) return [];

    return [
      {
        group:
          currentLanguage === 'en'
            ? 'Balance Sheet Accounts (1-XXXX – 3-XXXX)'
            : 'Kelompok Akun Neraca (1-XXXX – 3-XXXX)',
        items: neracaItems,
      },
      {
        group:
          currentLanguage === 'en'
            ? 'Profit & Loss Accounts (4-XXXX – 8-XXXX)'
            : 'Kelompok Akun Laba Rugi (4-XXXX – 8-XXXX)',
        items: labaRugiItems,
      },
    ].filter((g) => g.items.length > 0);
  }, [categoryAccounts, currentLanguage]);

  const selectedCategoryObj = useMemo(
    () => categoryAccounts?.find((cat) => cat.id === form.values.category),
    [categoryAccounts, form.values.category]
  );

  // Auto-fill suggested account number when category changes
  useEffect(() => {
    if (categoryInfo?.suggestedAccountNumber) {
      form.setFieldValue('accountNumber', categoryInfo.suggestedAccountNumber);
    }
  }, [categoryInfo?.suggestedAccountNumber]);

  // Auto-sync isBankAndCash when category is Cash & Bank
  useEffect(() => {
    if (!selectedCategoryObj) return;
    const catName = (selectedCategoryObj.name || '').toLowerCase();
    const isCashCategory =
      selectedCategoryObj.categoryID === 'KB' ||
      catName.includes('kas') ||
      catName.includes('bank');
    form.setFieldValue('isBankAndCash', isCashCategory);
  }, [selectedCategoryObj?.id]);

  // Reset hierarchy selection when changing account type
  useEffect(() => {
    if (selectedAccountType === 'SingleAccount') {
      setHeadAccountId(null);
      setSubAccountId(null);
    } else if (selectedAccountType === 'SubAccount') {
      setSubAccountId(null);
    } else if (selectedAccountType === 'HeaderAccount') {
      setHeadAccountId(null);
    }
  }, [selectedAccountType]);

  const userOptions = useMemo(
    () =>
      usersData?.results?.map((u) => ({
        value: u.id || '',
        label: u.email ? `${u.name || u.email} (${u.email})` : u.id || '',
      })) || [],
    [usersData]
  );

  const roleOptions = useMemo(
    () =>
      rolesData?.map((r) => ({
        value: r.id || '',
        label: r.name || 'Unnamed Role',
      })) || [],
    [rolesData]
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const headAccountOptions = useMemo(
    () =>
      categoryInfo?.possibleHeadAccounts?.map((acc: any) => ({
        value: acc.id,
        label: `[${acc.accountNumber}] ${acc.name}`,
      })) || [],
    [categoryInfo?.possibleHeadAccounts]
  );

  const subAccountOptions = useMemo(
    () =>
      categoryInfo?.possibleSubAccounts?.map((acc: any) => ({
        value: acc.id,
        label: `[${acc.accountNumber}] ${acc.name}`,
      })) || [],
    [categoryInfo?.possibleSubAccounts]
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Find labels for live preview
  const parentAccountLabel = useMemo(() => {
    if (!headAccountId) return undefined;
    const found = headAccountOptions.find((opt) => opt.value === headAccountId);
    return found?.label;
  }, [headAccountId, headAccountOptions]);

  const childAccountLabel = useMemo(() => {
    if (!subAccountId) return undefined;
    const found = subAccountOptions.find((opt) => opt.value === subAccountId);
    return found?.label;
  }, [subAccountId, subAccountOptions]);

  // Active Prefix (1–8) for Guide Card & Report Target
  const activePrefix = useMemo(() => {
    const codeChar = form.values.accountNumber.trim().charAt(0);
    if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(codeChar)) {
      return codeChar;
    }
    return getCategoryPrefix(selectedCategoryObj);
  }, [form.values.accountNumber, selectedCategoryObj]);

  const isIncomeStatementCategory = useMemo(() => Number(activePrefix) >= 4, [activePrefix]);

  const effectiveDebit = useMemo(() => {
    return resolveEffectiveDebit(selectedCategoryObj?.isDebit, form.values.isContra);
  }, [selectedCategoryObj?.isDebit, form.values.isContra]);

  // Readiness Checks
  const hasCategory = Boolean(form.values.category);
  const hasCode = form.values.accountNumber.trim().length > 0;
  const hasName = form.values.name.trim().length >= 3;
  const isHierarchyAndAccessValid = useMemo(() => {
    if (selectedAccountType === 'SubAccount' && !headAccountId) return false;
    if (selectedAccountType === 'SingleAccount') {
      if (accessScope === 'SpecialUsers' && specialUsers.length === 0) return false;
      if (accessScope === 'CertainRoles' && certainRoles.length === 0) return false;
    }
    return true;
  }, [selectedAccountType, headAccountId, accessScope, specialUsers.length, certainRoles.length]);

  const readinessChecks = [
    { label: t('checkCategory'), pass: hasCategory },
    { label: t('checkCode'), pass: hasCode },
    { label: t('checkName'), pass: hasName },
    { label: t('checkHierarchyAndAccess'), pass: isHierarchyAndAccessValid },
  ];
  const passedChecksCount = readinessChecks.filter((c) => c.pass).length;
  const isFormValid = passedChecksCount === readinessChecks.length;

  // Quick Preset Application Helper
  const applyPreset = (presetKey: string) => {
    if (!categoryAccounts || categoryAccounts.length === 0) return;

    const findCategory = (keywords: string[]) =>
      categoryAccounts.find((c) =>
        keywords.some(
          (kw) =>
            (c.name || '').toLowerCase().includes(kw) || (c.categoryID || '').toLowerCase() === kw
        )
      );

    if (presetKey === 'bank') {
      const cat = findCategory(['kb', 'kas & bank', 'kas', 'bank']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', true);
      form.setFieldValue('isContra', false);
      if (!form.values.name) form.setFieldValue('name', 'Bank Operasional ');
    } else if (presetKey === 'pettyCash') {
      const cat = findCategory(['kb', 'kas & bank', 'kas']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', true);
      form.setFieldValue('isContra', false);
      if (!form.values.name) form.setFieldValue('name', 'Kas Kecil Operasional');
    } else if (presetKey === 'receivable') {
      const cat = findCategory(['ap', 'piutang', 'receivable']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', false);
      form.setFieldValue('isContra', false);
      if (!form.values.name) form.setFieldValue('name', 'Piutang Usaha Pelanggan');
    } else if (presetKey === 'accumDepr') {
      const cat = findCategory(['da', 'depresiasi', 'penyusutan', 'aktiva tetap']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', false);
      form.setFieldValue('isContra', true);
      if (!form.values.name) form.setFieldValue('name', 'Akumulasi Penyusutan ');
    } else if (presetKey === 'revenue') {
      const cat = findCategory(['pen', 'pendapatan', 'revenue']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', false);
      form.setFieldValue('isContra', false);
      if (!form.values.name) form.setFieldValue('name', 'Pendapatan Jasa Operasional');
    } else if (presetKey === 'expense') {
      const cat = findCategory(['beb', 'beban', 'biaya']);
      if (cat?.id) form.setFieldValue('category', cat.id);
      form.setFieldValue('isBankAndCash', false);
      form.setFieldValue('isContra', false);
      if (!form.values.name) form.setFieldValue('name', 'Beban Operasional ');
    }
  };

  const handleResetForm = () => {
    form.reset();
    setSelectedAccountType('SingleAccount');
    setHeadAccountId(null);
    setSubAccountId(null);
    setAccessScope('AllUsers');
    setSpecialUsers([]);
    setCertainRoles([]);
  };

  // Handle Submit
  const handleAddAccount = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    if (selectedAccountType === 'SubAccount' && !headAccountId) {
      return;
    }

    const payload: AddAccountPayload = {
      name: form.values.name.trim(),
      accountNumber: form.values.accountNumber.trim(),
      category: form.values.category,
      taxType: form.values.taxType || undefined,
      isBankAndCash: form.values.isBankAndCash,
      isContra: form.values.isContra,
      desc: form.values.desc.trim() || undefined,
      isAllUser: true,
    };

    if (selectedAccountType === 'HeaderAccount') {
      payload.isAllUser = true;
      if (subAccountId) {
        payload.subAccountId = subAccountId;
      }
    } else if (selectedAccountType === 'SubAccount') {
      payload.isAllUser = true;
      if (headAccountId) {
        payload.headAccountId = headAccountId;
      }
    } else {
      // SingleAccount
      payload.isAllUser = accessScope === 'AllUsers';
      if (!payload.isAllUser) {
        if (accessScope === 'SpecialUsers') {
          payload.allowedUsers = specialUsers;
        } else if (accessScope === 'CertainRoles') {
          payload.allowedRoles = certainRoles;
        }
      }
    }

    addAccountMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(routes.generalJournal.main);
  };

  const hasSuggestedDiff =
    Boolean(categoryInfo?.suggestedAccountNumber) &&
    categoryInfo?.suggestedAccountNumber !== form.values.accountNumber;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* 1. Canonical Module Header */}
          <ModuleHeader
            icon={IconNotebook}
            title={t('addAccountTitle')}
            description={t('addAccountSubtitle')}
            actions={
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<IconRotateClockwise size={16} />}
                  onClick={handleResetForm}
                >
                  {t('resetForm')}
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleCancel}
                >
                  {t('backToCoaList')}
                </Button>
              </Group>
            }
          />

          {/* 2. Canonical Top 4-Card KPI / Configuration Summary Strip (Standard B) */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {/* Card 1: Classification & Financial Report Target */}
            <Paper withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Box style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    {t('stripCategoryLabel')}
                  </Text>
                  <Text fz={17} fw={800} c="dark.8" mt={4} lh={1.2} truncate>
                    {selectedCategoryObj?.name || t('stripCategoryUnselected')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4} truncate>
                    {selectedCategoryObj
                      ? isIncomeStatementCategory
                        ? t('stripReportIncomeStatement')
                        : t('stripReportBalanceSheet')
                      : 'Pilih kategori di bawah'}
                  </Text>
                </Box>
                <ThemeIcon size={40} radius="md" variant="light" color="primary">
                  <IconFileInvoice size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            {/* Card 2: Effective Normal Balance Side */}
            <Paper withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Box style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    {t('stripNormalBalanceLabel')}
                  </Text>
                  <Text
                    fz={17}
                    fw={800}
                    c={effectiveDebit ? 'teal.8' : 'red.8'}
                    mt={4}
                    lh={1.2}
                    truncate
                  >
                    {effectiveDebit ? t('stripDebitNormal') : t('stripCreditNormal')}
                  </Text>
                  <Text
                    size="xs"
                    c={form.values.isContra ? 'orange.7' : 'dimmed'}
                    fw={form.values.isContra ? 600 : 400}
                    mt={4}
                    truncate
                  >
                    {form.values.isContra ? t('stripContraActive') : t('stripStandardMode')}
                  </Text>
                </Box>
                <ThemeIcon
                  size={40}
                  radius="md"
                  variant="light"
                  color={effectiveDebit ? 'teal' : 'red'}
                >
                  <IconScale size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            {/* Card 3: Hierarchy Position */}
            <Paper withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Box style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    {t('stripHierarchyLabel')}
                  </Text>
                  <Text fz={17} fw={800} c="dark.8" mt={4} lh={1.2} truncate>
                    {selectedAccountType === 'SubAccount'
                      ? t('typeSubTitle')
                      : selectedAccountType === 'HeaderAccount'
                        ? t('typeHeaderTitle')
                        : t('typeSingleTitle')}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4} truncate>
                    {selectedAccountType === 'SubAccount'
                      ? parentAccountLabel || 'Pilih akun induk...'
                      : selectedAccountType === 'HeaderAccount'
                        ? childAccountLabel || 'Payung konsolidasi'
                        : 'Berdiri mandiri'}
                  </Text>
                </Box>
                <ThemeIcon size={40} radius="md" variant="light" color="teal">
                  <IconHierarchy2 size={20} />
                </ThemeIcon>
              </Group>
            </Paper>

            {/* Card 4: Configuration Readiness */}
            <Paper withBorder radius="md" p="md" bg="white">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Box style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    {t('stripReadinessLabel')}
                  </Text>
                  <Text
                    fz={17}
                    fw={800}
                    c={isFormValid ? 'teal.7' : 'dark.8'}
                    mt={4}
                    lh={1.2}
                    truncate
                  >
                    {t('stripReadinessValue', {
                      passed: passedChecksCount,
                      total: readinessChecks.length,
                    })}
                  </Text>
                  <Text size="xs" c={isFormValid ? 'teal.7' : 'dimmed'} fw={600} mt={4} truncate>
                    {isFormValid ? t('stripReadinessReady') : t('stripReadinessPending')}
                  </Text>
                </Box>
                <ThemeIcon
                  size={40}
                  radius="md"
                  variant="light"
                  color={isFormValid ? 'teal' : 'gray'}
                >
                  <IconCheck size={20} />
                </ThemeIcon>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* 3. Main 8 / 4 Split Grid (Standard B) */}
          <Grid gutter="lg" align="flex-start">
            {/* Left Column: Structured Form Cards */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                {/* SECTION 1: Identitas & Klasifikasi Akun */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon size={36} radius="md" variant="light" color="primary">
                        <IconFileInvoice size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          {t('sec1Title')}
                        </Text>
                        <Text fz={12} c="dimmed">
                          {t('sec1Subtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color="primary" size="sm">
                      Langkah 1 dari 3
                    </Badge>
                  </Group>

                  {/* Symmetrical 3x2 Quick Account Templates Grid */}
                  <Paper
                    withBorder
                    radius="md"
                    p="sm"
                    mb="lg"
                    bg="var(--mantine-color-gray-0)"
                    style={{ borderStyle: 'dashed' }}
                  >
                    <Group gap={6} mb={8}>
                      <IconSparkles size={15} color={themeColors.primary[6]} />
                      <Text fz={12} fw={700} c="dark.7">
                        {t('presetsTitle')}
                      </Text>
                    </Group>
                    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="xs">
                      {[
                        { key: 'bank', label: t('presetBank'), color: 'blue', prefix: '1-1' },
                        {
                          key: 'pettyCash',
                          label: t('presetPettyCash'),
                          color: 'cyan',
                          prefix: '1-1',
                        },
                        {
                          key: 'receivable',
                          label: t('presetReceivable'),
                          color: 'indigo',
                          prefix: '1-2',
                        },
                        {
                          key: 'accumDepr',
                          label: t('presetAccumDepr'),
                          color: 'orange',
                          prefix: '1-5',
                        },
                        { key: 'revenue', label: t('presetRevenue'), color: 'teal', prefix: '4-1' },
                        {
                          key: 'expense',
                          label: t('presetExpense'),
                          color: 'grape',
                          prefix: '6-1',
                        },
                      ].map((preset) => (
                        <Button
                          key={preset.key}
                          size="xs"
                          variant="white"
                          color="dark"
                          radius="md"
                          justify="flex-start"
                          fullWidth
                          leftSection={
                            <Badge size="xs" variant="light" color={preset.color} ff="monospace">
                              {preset.prefix}
                            </Badge>
                          }
                          styles={{
                            root: {
                              border: '1px solid var(--mantine-color-gray-3)',
                              height: 32,
                            },
                            label: {
                              fontSize: 11.5,
                              fontWeight: 600,
                            },
                          }}
                          onClick={() => applyPreset(preset.key)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </SimpleGrid>
                  </Paper>

                  <Stack gap="md">
                    {/* Row 1: 100% Symmetrical 2-Column Category & Account Code */}
                    <Grid gutter="md" align="flex-start">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Select
                          label={t('fieldCategoryLabel')}
                          description={t('fieldCategoryDesc')}
                          placeholder={t('fieldCategoryPlaceholder')}
                          data={categoryOptions}
                          withAsterisk
                          searchable
                          clearable={false}
                          disabled={isLoadingCategories}
                          rightSection={<IconChevronDown size={16} />}
                          styles={SYMMETRIC_INPUT_STYLES}
                          {...form.getInputProps('category')}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label={t('fieldCodeLabel')}
                          description={t('fieldCodeDesc')}
                          placeholder={t('fieldCodePlaceholder')}
                          withAsterisk
                          styles={SYMMETRIC_INPUT_STYLES}
                          rightSectionWidth={hasSuggestedDiff ? 36 : undefined}
                          rightSection={
                            hasSuggestedDiff && categoryInfo?.suggestedAccountNumber ? (
                              <Tooltip
                                label={t('useSuggestedCode', {
                                  code: categoryInfo.suggestedAccountNumber,
                                })}
                              >
                                <ActionIcon
                                  variant="light"
                                  color="primary"
                                  size="sm"
                                  radius="sm"
                                  onClick={() =>
                                    form.setFieldValue(
                                      'accountNumber',
                                      categoryInfo.suggestedAccountNumber
                                    )
                                  }
                                >
                                  <IconRefresh size={14} />
                                </ActionIcon>
                              </Tooltip>
                            ) : null
                          }
                          {...form.getInputProps('accountNumber')}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Row 2: Full-Width Account Name */}
                    <TextInput
                      label={t('fieldNameLabel')}
                      description={t('fieldNameDesc')}
                      placeholder={t('fieldNamePlaceholder')}
                      withAsterisk
                      styles={SYMMETRIC_INPUT_STYLES}
                      {...form.getInputProps('name')}
                    />

                    {/* Row 3: Symmetrical Equal-Height 2-Column Attribute Cards */}
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {/* Attribute 1: Cash & Bank Module Integration */}
                      <Paper
                        withBorder
                        radius="md"
                        p="sm"
                        h="100%"
                        onClick={() =>
                          form.setFieldValue('isBankAndCash', !form.values.isBankAndCash)
                        }
                        bg={form.values.isBankAndCash ? 'cyan.0' : 'gray.0'}
                        style={{
                          cursor: 'pointer',
                          borderColor: form.values.isBankAndCash
                            ? 'var(--mantine-color-cyan-4)'
                            : undefined,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Group justify="space-between" align="flex-start" wrap="nowrap" h="100%">
                          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                            <ThemeIcon
                              size={32}
                              radius="md"
                              variant="light"
                              color={form.values.isBankAndCash ? 'cyan' : 'gray'}
                            >
                              <IconBuildingBank size={17} />
                            </ThemeIcon>
                            <Box style={{ minWidth: 0 }}>
                              <Group gap={6} wrap="wrap">
                                <Text fw={700} fz={13} c="dark.8">
                                  {t('attrBankCashTitle')}
                                </Text>
                                <Badge
                                  size="xs"
                                  variant="light"
                                  color={form.values.isBankAndCash ? 'cyan' : 'gray'}
                                >
                                  {form.values.isBankAndCash
                                    ? t('badgeActive')
                                    : t('badgeInactive')}
                                </Badge>
                              </Group>
                              <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                                {t('attrBankCashDesc')}
                              </Text>
                            </Box>
                          </Group>
                          <Checkbox
                            color="cyan"
                            size="sm"
                            checked={form.values.isBankAndCash}
                            onChange={(e) =>
                              form.setFieldValue('isBankAndCash', e.currentTarget.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Group>
                      </Paper>

                      {/* Attribute 2: Contra Account Mode */}
                      <Paper
                        withBorder
                        radius="md"
                        p="sm"
                        h="100%"
                        onClick={() => form.setFieldValue('isContra', !form.values.isContra)}
                        bg={form.values.isContra ? 'orange.0' : 'gray.0'}
                        style={{
                          cursor: 'pointer',
                          borderColor: form.values.isContra
                            ? 'var(--mantine-color-orange-4)'
                            : undefined,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Group justify="space-between" align="flex-start" wrap="nowrap" h="100%">
                          <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                            <ThemeIcon
                              size={32}
                              radius="md"
                              variant="light"
                              color={form.values.isContra ? 'orange' : 'gray'}
                            >
                              <IconScale size={17} />
                            </ThemeIcon>
                            <Box style={{ minWidth: 0 }}>
                              <Group gap={6} wrap="wrap">
                                <Text fw={700} fz={13} c="dark.8">
                                  {t('attrContraTitle')}
                                </Text>
                                <Badge
                                  size="xs"
                                  variant="light"
                                  color={form.values.isContra ? 'orange' : 'gray'}
                                >
                                  {form.values.isContra ? t('badgeActive') : t('badgeInactive')}
                                </Badge>
                              </Group>
                              <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                                {t('attrContraDesc')}
                              </Text>
                            </Box>
                          </Group>
                          <Checkbox
                            color="orange"
                            size="sm"
                            checked={form.values.isContra}
                            onChange={(e) =>
                              form.setFieldValue('isContra', e.currentTarget.checked)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Group>
                      </Paper>
                    </SimpleGrid>

                    {/* Row 4: 100% Symmetrical Tax & Financial Report Target */}
                    <Grid gutter="md" align="flex-start">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Select
                          label={t('fieldTaxLabel')}
                          description={t('fieldTaxDesc')}
                          placeholder={t('fieldTaxPlaceholder')}
                          data={TAX_OPTIONS}
                          clearable
                          leftSection={<IconReceiptTax size={16} />}
                          rightSection={<IconChevronDown size={16} />}
                          styles={SYMMETRIC_INPUT_STYLES}
                          {...form.getInputProps('taxType')}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput
                          label={t('fieldReportTargetLabel')}
                          description={t('fieldReportTargetDesc')}
                          value={
                            selectedCategoryObj
                              ? isIncomeStatementCategory
                                ? t('stripReportIncomeStatement')
                                : t('stripReportBalanceSheet')
                              : '—'
                          }
                          readOnly
                          leftSection={<IconFileInvoice size={16} />}
                          styles={{
                            ...SYMMETRIC_INPUT_STYLES,
                            input: {
                              ...SYMMETRIC_INPUT_STYLES.input,
                              backgroundColor: 'var(--mantine-color-gray-0)',
                              fontWeight: 600,
                              color: 'var(--mantine-color-dark-7)',
                            },
                          }}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Row 5: Description */}
                    <Textarea
                      label={t('fieldDescLabel')}
                      placeholder={t('fieldDescPlaceholder')}
                      minRows={3}
                      autosize
                      styles={{
                        label: SYMMETRIC_INPUT_STYLES.label,
                      }}
                      {...form.getInputProps('desc')}
                    />
                  </Stack>
                </Paper>

                {/* SECTION 2: Struktur & Hierarki Akun */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon size={36} radius="md" variant="light" color="teal">
                        <IconHierarchy2 size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          {t('sec2Title')}
                        </Text>
                        <Text fz={12} c="dimmed">
                          {t('sec2Subtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color="teal" size="sm">
                      Langkah 2 dari 3
                    </Badge>
                  </Group>

                  <Stack gap="md">
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                      {[
                        {
                          value: 'SingleAccount',
                          title: t('typeSingleTitle'),
                          badge: t('typeSingleBadge'),
                          badgeColor: 'gray',
                          desc: t('typeSingleDesc'),
                        },
                        {
                          value: 'SubAccount',
                          title: t('typeSubTitle'),
                          badge: t('typeSubBadge'),
                          badgeColor: 'teal',
                          desc: t('typeSubDesc'),
                        },
                        {
                          value: 'HeaderAccount',
                          title: t('typeHeaderTitle'),
                          badge: t('typeHeaderBadge'),
                          badgeColor: 'indigo',
                          desc: t('typeHeaderDesc'),
                        },
                      ].map((opt) => {
                        const active = selectedAccountType === opt.value;
                        return (
                          <Paper
                            key={opt.value}
                            withBorder
                            radius="md"
                            p="sm"
                            h="100%"
                            onClick={() => setSelectedAccountType(opt.value)}
                            style={{
                              cursor: 'pointer',
                              borderColor: active ? themeColors.primary[6] : undefined,
                              backgroundColor: active ? 'var(--mantine-color-primary-0)' : 'white',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Group justify="space-between" align="flex-start" mb={6}>
                              <Radio
                                value={opt.value}
                                checked={active}
                                onChange={() => setSelectedAccountType(opt.value)}
                                color="primary"
                              />
                              <Badge size="xs" variant="light" color={opt.badgeColor}>
                                {opt.badge}
                              </Badge>
                            </Group>
                            <Text fw={700} fz={13} c="dark.8">
                              {opt.title}
                            </Text>
                            <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                              {opt.desc}
                            </Text>
                          </Paper>
                        );
                      })}
                    </SimpleGrid>

                    {/* Conditional Hierarchy Selector + Visual Tree Diagram */}
                    {selectedAccountType !== 'SingleAccount' && !form.values.category && (
                      <Alert icon={<IconInfoCircle size={16} />} color="yellow" radius="md">
                        {t('selectCategoryFirstAlert')}
                      </Alert>
                    )}

                    {selectedAccountType === 'SubAccount' && form.values.category && (
                      <Stack gap="xs">
                        <Select
                          label={t('selectParentLabel')}
                          description={t('selectParentHelper')}
                          placeholder={t('selectParentPlaceholder')}
                          data={headAccountOptions}
                          value={headAccountId}
                          onChange={setHeadAccountId}
                          withAsterisk
                          searchable
                          clearable
                          rightSection={<IconChevronDown size={16} />}
                          styles={SYMMETRIC_INPUT_STYLES}
                          nothingFoundMessage="Tidak ditemukan akun induk pada kategori ini"
                        />

                        {/* Visual Tree Representation */}
                        <Paper withBorder radius="md" p="sm" bg="gray.0">
                          <Text fz={11} fw={700} c="dimmed" mb={6}>
                            {t('hierarchyVisualLabel')}
                          </Text>
                          <Stack gap={4}>
                            <Group gap={6}>
                              <Badge size="xs" color="indigo" variant="light">
                                INDUK
                              </Badge>
                              <Text fz={12} fw={600} c="dark.7">
                                {parentAccountLabel || '[Pilih Akun Induk di atas]'}
                              </Text>
                            </Group>
                            <Group gap={6} pl={18}>
                              <IconCornerDownRight size={14} color={themeColors.primary[6]} />
                              <Badge size="xs" color="teal" variant="filled">
                                SUB AKUN BARU
                              </Badge>
                              <Text fz={12} fw={700} c="primary.8" ff="monospace">
                                [{form.values.accountNumber || '—'}]
                              </Text>
                              <Text fz={12} fw={700} c="dark.9">
                                {form.values.name || t('previewUnnamed')}
                              </Text>
                            </Group>
                          </Stack>
                        </Paper>
                      </Stack>
                    )}

                    {selectedAccountType === 'HeaderAccount' && form.values.category && (
                      <Stack gap="xs">
                        <Select
                          label={t('selectChildLabel')}
                          description={t('selectChildHelper')}
                          placeholder={t('selectChildPlaceholder')}
                          data={subAccountOptions}
                          value={subAccountId}
                          onChange={setSubAccountId}
                          searchable
                          clearable
                          rightSection={<IconChevronDown size={16} />}
                          styles={SYMMETRIC_INPUT_STYLES}
                          nothingFoundMessage="Tidak ditemukan sub akun pada kategori ini"
                        />

                        {/* Visual Tree Representation */}
                        <Paper withBorder radius="md" p="sm" bg="gray.0">
                          <Text fz={11} fw={700} c="dimmed" mb={6}>
                            {t('hierarchyVisualLabel')}
                          </Text>
                          <Stack gap={4}>
                            <Group gap={6}>
                              <Badge size="xs" color="indigo" variant="filled">
                                AKUN INDUK BARU
                              </Badge>
                              <Text fz={12} fw={700} c="primary.8" ff="monospace">
                                [{form.values.accountNumber || '—'}]
                              </Text>
                              <Text fz={12} fw={700} c="dark.9">
                                {form.values.name || t('previewUnnamed')}
                              </Text>
                            </Group>
                            <Group gap={6} pl={18}>
                              <IconCornerDownRight size={14} color={themeColors.slate[5]} />
                              <Badge size="xs" color="teal" variant="light">
                                SUB AKUN
                              </Badge>
                              <Text fz={12} fw={600} c="dark.7">
                                {childAccountLabel || '(Sub-akun dapat ditambahkan nanti)'}
                              </Text>
                            </Group>
                          </Stack>
                        </Paper>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                {/* SECTION 3: Hak Akses & Otorisasi Pengguna */}
                <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                  <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap="sm">
                    <Group gap="sm" wrap="nowrap">
                      <ThemeIcon size={36} radius="md" variant="light" color="indigo">
                        <IconShieldCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          {t('sec3Title')}
                        </Text>
                        <Text fz={12} c="dimmed">
                          {t('sec3Subtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Badge variant="light" color="indigo" size="sm">
                      Langkah 3 dari 3
                    </Badge>
                  </Group>

                  <Stack gap="md">
                    {selectedAccountType !== 'SingleAccount' ? (
                      <Alert
                        icon={<IconInfoCircle size={16} />}
                        title={t('centralizedAccessTitle')}
                        color="blue"
                        radius="md"
                      >
                        {t('centralizedAccessDesc')}
                      </Alert>
                    ) : (
                      <>
                        {/* Symmetrical Equal-Height 3-Card Access Scope Selector */}
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                          {[
                            {
                              value: 'AllUsers',
                              title: t('accessAllTitle'),
                              desc: t('accessAllDesc'),
                              icon: IconUsers,
                            },
                            {
                              value: 'SpecialUsers',
                              title: t('accessUsersTitle'),
                              desc: t('accessUsersDesc'),
                              icon: IconUserCheck,
                            },
                            {
                              value: 'CertainRoles',
                              title: t('accessRolesTitle'),
                              desc: t('accessRolesDesc'),
                              icon: IconKey,
                            },
                          ].map((item) => {
                            const active = accessScope === item.value;
                            const ItemIcon = item.icon;
                            return (
                              <Paper
                                key={item.value}
                                withBorder
                                radius="md"
                                p="sm"
                                h="100%"
                                onClick={() => setAccessScope(item.value)}
                                style={{
                                  cursor: 'pointer',
                                  borderColor: active ? themeColors.primary[6] : undefined,
                                  backgroundColor: active
                                    ? 'var(--mantine-color-primary-0)'
                                    : 'white',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <Group justify="space-between" align="flex-start" mb={6}>
                                  <Radio
                                    value={item.value}
                                    checked={active}
                                    onChange={() => setAccessScope(item.value)}
                                    color="primary"
                                  />
                                  <ThemeIcon
                                    size={26}
                                    radius="md"
                                    variant="light"
                                    color={active ? 'primary' : 'gray'}
                                  >
                                    <ItemIcon size={15} />
                                  </ThemeIcon>
                                </Group>
                                <Text fw={700} fz={13} c="dark.8">
                                  {item.title}
                                </Text>
                                <Text fz={11.5} c="dimmed" mt={3} lh={1.35}>
                                  {item.desc}
                                </Text>
                              </Paper>
                            );
                          })}
                        </SimpleGrid>

                        {accessScope === 'SpecialUsers' && (
                          <MultiSelect
                            label={t('selectUsersLabel')}
                            placeholder={t('selectUsersPlaceholder')}
                            data={userOptions}
                            value={specialUsers}
                            onChange={setSpecialUsers}
                            withAsterisk
                            searchable
                            clearable
                            disabled={isLoadingUsers}
                            rightSection={<IconChevronDown size={16} />}
                            styles={{ label: SYMMETRIC_INPUT_STYLES.label }}
                          />
                        )}

                        {accessScope === 'CertainRoles' && (
                          <MultiSelect
                            label={t('selectRolesLabel')}
                            placeholder={t('selectRolesPlaceholder')}
                            data={roleOptions}
                            value={certainRoles}
                            onChange={setCertainRoles}
                            withAsterisk
                            searchable
                            clearable
                            disabled={isLoadingRoles}
                            rightSection={<IconChevronDown size={16} />}
                            styles={{ label: SYMMETRIC_INPUT_STYLES.label }}
                          />
                        )}
                      </>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column: Live Preview, Readiness Checklist & 8-Group Accounting Guide */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Stack gap="md" pos="sticky" top={20}>
                {/* 1. Live Preview & Debit/Credit Impact Simulation Card */}
                <AccountPreviewCard
                  accountNumber={form.values.accountNumber}
                  accountName={form.values.name}
                  categoryName={selectedCategoryObj?.name || ''}
                  isDebit={selectedCategoryObj?.isDebit ?? true}
                  isContra={form.values.isContra}
                  isBankAndCash={form.values.isBankAndCash}
                  accountType={selectedAccountType}
                  parentAccountLabel={parentAccountLabel}
                  childAccountLabel={childAccountLabel}
                  taxType={form.values.taxType}
                  desc={form.values.desc}
                  accessType={accessScope}
                  specialUsersCount={specialUsers.length}
                  certainRolesCount={certainRoles.length}
                />

                {/* 2. Real-Time Readiness Verification Card (Poka-Yoke) */}
                <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                  <Group justify="space-between" mb="xs" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size={28}
                        radius="md"
                        variant="light"
                        color={isFormValid ? 'teal' : 'blue'}
                      >
                        <IconShieldCheck size={16} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={13} c="dark.8">
                          {t('validationCardTitle')}
                        </Text>
                        <Text fz={11} c="dimmed">
                          {t('validationCardSubtitle')}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      color={isFormValid ? 'teal' : 'gray'}
                      variant={isFormValid ? 'filled' : 'light'}
                      size="xs"
                    >
                      {passedChecksCount}/{readinessChecks.length}
                    </Badge>
                  </Group>

                  <Divider my="xs" />

                  <Stack gap={8}>
                    {readinessChecks.map((check) => (
                      <Group key={check.label} justify="space-between" wrap="nowrap">
                        <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                          <ThemeIcon
                            size={18}
                            radius="xl"
                            color={check.pass ? 'teal' : 'gray'}
                            variant={check.pass ? 'filled' : 'light'}
                          >
                            {check.pass ? (
                              <IconCheck size={12} stroke={2.5} />
                            ) : (
                              <IconCircleDot size={12} />
                            )}
                          </ThemeIcon>
                          <Text
                            fz={12}
                            c={check.pass ? 'dark.8' : 'dimmed'}
                            fw={check.pass ? 500 : 400}
                            truncate
                          >
                            {check.label}
                          </Text>
                        </Group>
                        <Badge size="xs" variant="light" color={check.pass ? 'teal' : 'gray'}>
                          {check.pass ? 'OK' : '—'}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </Paper>

                {/* 3. Accounting Standards & 8-Group Numbering Guide Card */}
                <AccountingGuideCard activePrefix={activePrefix} />

                {/* 4. Sticky Submit Action Card */}
                <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                  <Stack gap="xs">
                    <Button
                      size="md"
                      fullWidth
                      color="primary"
                      leftSection={<IconCheck size={18} />}
                      loading={addAccountMutation.isPending}
                      disabled={!isFormValid}
                      onClick={handleAddAccount}
                    >
                      {t('saveAccountBtn')}
                    </Button>
                    <Button
                      size="md"
                      fullWidth
                      variant="subtle"
                      color="gray"
                      onClick={handleCancel}
                      disabled={addAccountMutation.isPending}
                    >
                      {t('cancelBtn')}
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

export default AddAccountJournalPage;
