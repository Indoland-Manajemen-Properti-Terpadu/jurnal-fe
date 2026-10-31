import React, { useEffect, useMemo } from 'react';
import { Box, Button, Grid, Group, Paper, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconCheck, IconNotebook, IconRotateClockwise } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useRoles, useUsers } from '@/module/user-management';
import { useCategoryAccounts } from '@/module/chart-of-accounts/presentation/hooks/useCategoryAccounts';
import { useCategoryInfo } from '@/module/chart-of-accounts/presentation/hooks/useCategoryInfo';
import { useAddAccount } from '../hooks/useAddAccount';
import { useAccountFormOptions } from '../hooks/useAccountFormOptions';
import { useAccountPlacementState } from '../hooks/useAccountPlacementState';
import {
  getCategoryPrefix,
  hasAccountCode,
  hasValidName,
  isCashBankCategory,
  isHierarchyAndAccessValid,
  MIN_CREATE_NAME_LENGTH,
  resolveEffectiveDebit,
  validateAccountCategory,
  validateAccountCode,
  validateCreateName,
} from '../../domain/accountRules';
import { ACCOUNT_PRESETS, findPresetCategory } from '../../domain/accountPresets';
import { groupCategoryOptions } from '../../domain/categoryOptions';
import { buildAccountPayload } from '../../domain/buildAccountPayload';
import { AccountPreviewCard, AccountingGuideCard } from '../components';
import { AddAccountSummaryStrip } from '../components/account-form/AddAccountSummaryStrip';
import { AddAccountIdentitySection } from '../components/account-form/AddAccountIdentitySection';
import { AddAccountHierarchySection } from '../components/account-form/AddAccountHierarchySection';
import { AddAccountAccessSection } from '../components/account-form/AddAccountAccessSection';
import { AddAccountReadinessCard } from '../components/account-form/AddAccountReadinessCard';

export const AddAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('chartOfAccounts');
  const validationMessage = (key: string | null) => (key ? t(key) : null);

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = useCategoryAccounts();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
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
      name: (value: string) => validationMessage(validateCreateName(value)),
      accountNumber: (value: string) => validationMessage(validateAccountCode(value)),
      category: (value: string) => validationMessage(validateAccountCategory(value)),
    },
  });

  // Hierarchy & Access State
  const {
    accountType: selectedAccountType,
    setAccountType: setSelectedAccountType,
    parentId: headAccountId,
    setParentId: setHeadAccountId,
    childId: subAccountId,
    setChildId: setSubAccountId,
    accessScope,
    setAccessScope,
    specialUsers,
    setSpecialUsers,
    certainRoles,
    setCertainRoles,
  } = useAccountPlacementState();

  // Category Info query for suggestions & hierarchy options
  const { data: categoryInfo } = useCategoryInfo(form.values.category);

  // Derived Grouped Dropdown Data (Grouped by Neraca 1-3 vs Laba Rugi 4-8)
  const categoryOptions = useMemo(
    () =>
      groupCategoryOptions(categoryAccounts || [], {
        balanceSheet: t('form.balanceSheetGroup'),
        profitLoss: t('form.profitLossGroup'),
        unnamed: t('form.unnamedCategory'),
      }),
    [categoryAccounts, currentLanguage]
  );

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
    form.setFieldValue('isBankAndCash', isCashBankCategory(selectedCategoryObj));
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

  const {
    userOptions,
    roleOptions,
    headAccountOptions,
    subAccountOptions,
    parentAccountLabel,
    childAccountLabel,
  } = useAccountFormOptions({
    usersData,
    rolesData,
    possibleHeadAccounts: categoryInfo?.possibleHeadAccounts,
    possibleSubAccounts: categoryInfo?.possibleSubAccounts,
    parentId: headAccountId,
    childId: subAccountId,
  });

  // Active Prefix (1–8) for Guide Card & Report Target
  const activePrefix = useMemo(() => {
    const codeChar = form.values.accountNumber.trim().charAt(0);
    if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(codeChar)) {
      return codeChar;
    }
    return getCategoryPrefix(selectedCategoryObj);
  }, [form.values.accountNumber, selectedCategoryObj]);

  const isIncomeStatementCategory = useMemo(() => Number(activePrefix) >= 4, [activePrefix]);

  const effectiveDebit = useMemo(
    () => resolveEffectiveDebit(selectedCategoryObj?.isDebit, form.values.isContra),
    [selectedCategoryObj?.isDebit, form.values.isContra]
  );

  // Readiness Checks
  const hasCategory = Boolean(form.values.category);
  const hasCode = hasAccountCode(form.values.accountNumber);
  const hasName = hasValidName(form.values.name, MIN_CREATE_NAME_LENGTH);
  const isHierarchyAndAccessOk = useMemo(
    () =>
      isHierarchyAndAccessValid({
        accountType: selectedAccountType,
        headAccountId,
        accessScope,
        specialUsersCount: specialUsers.length,
        certainRolesCount: certainRoles.length,
      }),
    [selectedAccountType, headAccountId, accessScope, specialUsers.length, certainRoles.length]
  );

  const readinessChecks = [
    { label: t('form.checkCategory'), pass: hasCategory },
    { label: t('form.checkCode'), pass: hasCode },
    { label: t('form.checkName'), pass: hasName },
    { label: t('form.checkHierarchyAndAccess'), pass: isHierarchyAndAccessOk },
  ];
  const passedChecksCount = readinessChecks.filter((c) => c.pass).length;
  const isFormValid = passedChecksCount === readinessChecks.length;

  // Quick Preset Application Helper
  const applyPreset = (presetKey: string) => {
    const preset = ACCOUNT_PRESETS[presetKey];
    if (!categoryAccounts || categoryAccounts.length === 0 || !preset) return;

    const cat = findPresetCategory(presetKey, categoryAccounts);
    if (cat?.id) form.setFieldValue('category', cat.id);
    form.setFieldValue('isBankAndCash', preset.isBankAndCash);
    form.setFieldValue('isContra', preset.isContra);
    if (!form.values.name) form.setFieldValue('name', t(preset.defaultNameKey));
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

    addAccountMutation.mutate(
      buildAccountPayload(form.values, {
        accountType: selectedAccountType,
        parentId: headAccountId,
        childId: subAccountId,
        accessScope,
        specialUsers,
        certainRoles,
      })
    );
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
            title={t('form.addAccountTitle')}
            description={t('form.addAccountSubtitle')}
            actions={
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<IconRotateClockwise size={16} />}
                  onClick={handleResetForm}
                >
                  {t('form.resetForm')}
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleCancel}
                >
                  {t('form.backToCoaList')}
                </Button>
              </Group>
            }
          />

          <AddAccountSummaryStrip
            selectedCategoryObj={selectedCategoryObj}
            isIncomeStatementCategory={isIncomeStatementCategory}
            effectiveDebit={effectiveDebit}
            isContra={form.values.isContra}
            selectedAccountType={selectedAccountType}
            parentAccountLabel={parentAccountLabel}
            childAccountLabel={childAccountLabel}
            isFormValid={isFormValid}
            passedChecksCount={passedChecksCount}
            totalChecks={readinessChecks.length}
          />

          {/* 3. Main 8 / 4 Split Grid (Standard B) */}
          <Grid gutter="lg" align="flex-start">
            {/* Left Column: Structured Form Cards */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <AddAccountIdentitySection
                  form={form}
                  categoryOptions={categoryOptions}
                  isLoadingCategories={isLoadingCategories}
                  suggestedAccountNumber={categoryInfo?.suggestedAccountNumber}
                  hasSuggestedDiff={hasSuggestedDiff}
                  selectedCategoryObj={selectedCategoryObj}
                  isIncomeStatementCategory={isIncomeStatementCategory}
                  applyPreset={applyPreset}
                />

                <AddAccountHierarchySection
                  form={form}
                  selectedAccountType={selectedAccountType}
                  setSelectedAccountType={setSelectedAccountType}
                  headAccountOptions={headAccountOptions}
                  subAccountOptions={subAccountOptions}
                  headAccountId={headAccountId}
                  setHeadAccountId={setHeadAccountId}
                  subAccountId={subAccountId}
                  setSubAccountId={setSubAccountId}
                  parentAccountLabel={parentAccountLabel}
                  childAccountLabel={childAccountLabel}
                />

                <AddAccountAccessSection
                  selectedAccountType={selectedAccountType}
                  accessScope={accessScope}
                  setAccessScope={setAccessScope}
                  specialUsers={specialUsers}
                  setSpecialUsers={setSpecialUsers}
                  certainRoles={certainRoles}
                  setCertainRoles={setCertainRoles}
                  userOptions={userOptions}
                  roleOptions={roleOptions}
                  isLoadingUsers={isLoadingUsers}
                  isLoadingRoles={isLoadingRoles}
                />
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

                <AddAccountReadinessCard
                  readinessChecks={readinessChecks}
                  passedChecksCount={passedChecksCount}
                  isFormValid={isFormValid}
                />

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
                      {t('form.saveAccountBtn')}
                    </Button>
                    <Button
                      size="md"
                      fullWidth
                      variant="subtle"
                      color="gray"
                      onClick={handleCancel}
                      disabled={addAccountMutation.isPending}
                    >
                      {t('form.cancelBtn')}
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
