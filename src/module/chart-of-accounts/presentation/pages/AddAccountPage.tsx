import React, { useEffect, useMemo } from 'react';
import { Box, Button, Grid, Group, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconCheck, IconNotebook, IconRotateClockwise } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useRoles, useUsers } from '@/module/user-management';
import { useCategoryAccounts } from '@/module/chart-of-accounts/presentation/hooks/useCategoryAccounts';
import { useCategoryInfo } from '@/module/chart-of-accounts/presentation/hooks/useCategoryInfo';
import { useAddAccount } from '../hooks/useAddAccount';
import { useAccountFormOptions } from '../hooks/useAccountFormOptions';
import { useAccountPlacementState } from '../hooks/useAccountPlacementState';
import { useAccountCategoryOptions } from '../hooks/useAccountCategoryOptions';
import {
  hasAccountCode,
  hasValidName,
  isHierarchyAndAccessValid,
  MIN_CREATE_NAME_LENGTH,
  validateAccountCategory,
  validateAccountCode,
  validateCreateName,
} from '../../domain/accountRules';
import { ACCOUNT_PRESETS, findPresetCategory } from '../../domain/accountPresets';
import { buildAccountPayload } from '../../domain/buildAccountPayload';
import { AccountPreviewCard } from '../components';
import { useTaxOptions } from '../hooks/useTaxOptions';
import { AccountIdentitySection } from '../components/account-form/AccountIdentitySection';
import { AccountHierarchySection } from '../components/account-form/AccountHierarchySection';
import { AccountAccessSection } from '../components/account-form/AccountAccessSection';
import { AccountReadinessCard } from '../components/account-form/AccountReadinessCard';

export const AddAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('chartOfAccounts');
  const validationMessage = (key: string | null) => (key ? t(key) : null);

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = useCategoryAccounts();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const { options: taxOptions, isLoading: isLoadingTaxes } = useTaxOptions();
  const addAccountMutation = useAddAccount();

  // Form State
  const form = useForm({
    initialValues: {
      name: '',
      accountNumber: '',
      category: '',
      defaultTax: '',
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

  const { categoryOptions, selectedCategoryObj, isIncomeStatementCategory } =
    useAccountCategoryOptions(categoryAccounts, form.values.category, form.values.accountNumber);

  // Auto-fill suggested account number when category changes
  useEffect(() => {
    if (categoryInfo?.suggestedAccountNumber) {
      form.setFieldValue('accountNumber', categoryInfo.suggestedAccountNumber);
    }
  }, [categoryInfo?.suggestedAccountNumber]);

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
      buildAccountPayload(
        form.values,
        {
          accountType: selectedAccountType,
          parentId: headAccountId,
          childId: subAccountId,
          accessScope,
          specialUsers,
          certainRoles,
        },
        { includeBankCash: false }
      )
    );
  };

  const handleCancel = () => {
    navigate(routes.chartOfAccounts.main);
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

          {/* Form and live review */}
          <Grid gutter="lg" align="flex-start">
            {/* Left Column: Structured Form Cards */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Stack gap="lg">
                <AccountIdentitySection
                  form={form}
                  categoryOptions={categoryOptions}
                  isLoadingCategories={isLoadingCategories}
                  suggestedAccountNumber={categoryInfo?.suggestedAccountNumber}
                  hasSuggestedDiff={hasSuggestedDiff}
                  selectedCategoryObj={selectedCategoryObj}
                  isIncomeStatementCategory={isIncomeStatementCategory}
                  taxOptions={taxOptions}
                  isLoadingTaxes={isLoadingTaxes}
                  applyPreset={applyPreset}
                />

                <AccountHierarchySection
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

                <AccountAccessSection
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
                  accountType={selectedAccountType}
                  parentAccountLabel={parentAccountLabel}
                  childAccountLabel={childAccountLabel}
                  taxName={
                    taxOptions.find((option) => option.value === form.values.defaultTax)?.label
                  }
                  desc={form.values.desc}
                  accessType={accessScope}
                  specialUsersCount={specialUsers.length}
                  certainRolesCount={certainRoles.length}
                />

                <AccountReadinessCard
                  readinessChecks={readinessChecks}
                  passedChecksCount={passedChecksCount}
                  isFormValid={isFormValid}
                  action={
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
                  }
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default AddAccountJournalPage;
