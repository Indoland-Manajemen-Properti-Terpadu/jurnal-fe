import React, { useEffect, useRef } from 'react';
import { Alert, Box, Button, Grid, Paper, Skeleton, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconCheck, IconLock, IconNotebook } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { NotFound } from '@/components/ErrorPage/NotFound';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useCategoryAccounts } from '@/module/chart-of-accounts/presentation/hooks/useCategoryAccounts';
import { useCategoryInfo } from '@/module/chart-of-accounts/presentation/hooks/useCategoryInfo';
import { useRoles, useUsers } from '@/module/user-management';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { useAccountFormOptions } from '../hooks/useAccountFormOptions';
import { useAccountPlacementState } from '../hooks/useAccountPlacementState';
import { useAccountCategoryOptions } from '../hooks/useAccountCategoryOptions';
import {
  canEditAccount,
  hasAccountCode,
  hasValidName,
  isHierarchyAndAccessValid,
  validateAccountCategory,
  validateAccountCode,
  validateEditName,
} from '../../domain/accountRules';
import { mapAccountDetailToFormState, unwrapAccountDetail } from '../../domain/accountFormMapper';
import { buildAccountPayload } from '../../domain/buildAccountPayload';
import { AccountPreviewCard } from '../components';
import { useTaxOptions } from '../hooks/useTaxOptions';
import { AccountIdentitySection } from '../components/account-form/AccountIdentitySection';
import { AccountHierarchySection } from '../components/account-form/AccountHierarchySection';
import { AccountAccessSection } from '../components/account-form/AccountAccessSection';
import { AccountReadinessCard } from '../components/account-form/AccountReadinessCard';
import { FormLock } from '../components/account-form/FormLock';

export const EditAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const { t } = useTranslation('chartOfAccounts');
  const validationMessage = (key: string | null) => (key ? t(key) : null);

  // Fetch Existing Account Details
  const {
    accountDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useDetailAccount(idAccount!);
  const rawAccountData = unwrapAccountDetail(accountDetail);
  const currentParent = rawAccountData?.headerAccount;
  const isLocked = Boolean(rawAccountData?.isLocked);
  const editable = canEditAccount({ isLocked });

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = useCategoryAccounts();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const { options: taxOptions, isLoading: isLoadingTaxes } = useTaxOptions();
  const updateAccountMutation = useUpdateAccount(idAccount!);

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
      name: (value: string) => validationMessage(validateEditName(value)),
      accountNumber: (value: string) => validationMessage(validateAccountCode(value)),
      category: (value: string) => validationMessage(validateAccountCategory(value)),
    },
  });

  // Hierarchy & Access State
  const {
    accountType: selectedAccountType,
    setAccountType: setSelectedAccountType,
    parentId: parentAccountId,
    setParentId: setParentAccountId,
    childId: childAccountId,
    setChildId: setChildAccountId,
    accessScope,
    setAccessScope,
    specialUsers,
    setSpecialUsers,
    certainRoles,
    setCertainRoles,
  } = useAccountPlacementState();

  // Category Info query for suggestions & hierarchy options
  const { data: categoryInfo } = useCategoryInfo(form.values.category);

  // Populate once per account, so a refetch never overwrites what the user already changed
  const populatedFor = useRef<string | null>(null);
  useEffect(() => {
    const data = unwrapAccountDetail(accountDetail);
    if (!data || populatedFor.current === idAccount) return;
    populatedFor.current = idAccount ?? null;
    const state = mapAccountDetailToFormState(data);
    form.setValues(state.values);
    setSelectedAccountType(state.accountType);
    if (state.parentId) setParentAccountId(state.parentId);
    if (state.childId) setChildAccountId(state.childId);
    if (state.accessScope) setAccessScope(state.accessScope);
    if (state.specialUsers) setSpecialUsers(state.specialUsers);
    if (state.certainRoles) setCertainRoles(state.certainRoles);
  }, [accountDetail, idAccount]);

  const { categoryOptions, selectedCategoryObj, isIncomeStatementCategory } =
    useAccountCategoryOptions(categoryAccounts, form.values.category, form.values.accountNumber);

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
    parentId: parentAccountId,
    childId: childAccountId,
    currentParent: currentParent?.id
      ? {
          id: currentParent.id,
          accountNumber: currentParent.accountNumber ?? '',
          name: currentParent.name ?? '',
        }
      : undefined,
  });

  // Readiness (edit only needs a non-empty name; the 3-character rule is create only)
  const readinessChecks = [
    { label: t('form.checkCategory'), pass: Boolean(form.values.category) },
    { label: t('form.checkCode'), pass: hasAccountCode(form.values.accountNumber) },
    { label: t('form.checkNameEdit'), pass: hasValidName(form.values.name, 1) },
    {
      label: t('form.checkHierarchyAndAccess'),
      pass: isHierarchyAndAccessValid({
        accountType: selectedAccountType,
        headAccountId: parentAccountId,
        accessScope,
        specialUsersCount: specialUsers.length,
        certainRolesCount: certainRoles.length,
      }),
    },
  ];
  const passedChecksCount = readinessChecks.filter((check) => check.pass).length;
  const isFormValid = passedChecksCount === readinessChecks.length;

  const hasSuggestedDiff =
    Boolean(categoryInfo?.suggestedAccountNumber) &&
    categoryInfo?.suggestedAccountNumber !== form.values.accountNumber;

  const handleUpdateAccount = () => {
    if (!editable) return;
    const validation = form.validate();
    if (validation.hasErrors) return;

    if (selectedAccountType === 'SubAccount' && !parentAccountId) {
      return;
    }

    updateAccountMutation.mutate(
      buildAccountPayload(form.values, {
        accountType: selectedAccountType,
        parentId: parentAccountId,
        childId: childAccountId,
        accessScope,
        specialUsers,
        certainRoles,
      })
    );
  };

  const handleCancel = () => {
    navigate(routes.chartOfAccounts.main);
  };

  if (isDetailError) {
    return (
      <AppShellLayout>
        <NotFound />
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
          <ModuleHeader
            icon={IconNotebook}
            title={t('edit.title')}
            description={t('edit.description')}
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleCancel}
              >
                {t('form.backToCoaList')}
              </Button>
            }
          />

          {/* Account Locked Status Notification */}
          {isLocked && (
            <Alert
              icon={<IconLock size={18} />}
              title={t('edit.lockedTitle')}
              color="orange"
              radius="md"
            >
              {t('edit.lockedBody')}
            </Alert>
          )}

          {isLoadingDetail ? (
            <Paper withBorder radius="md" p="xl" bg="white">
              <Stack gap="md">
                <Skeleton height={40} width="40%" />
                <Skeleton height={50} />
                <Skeleton height={50} />
                <Skeleton height={100} />
              </Stack>
            </Paper>
          ) : (
            <Grid gutter="lg" align="flex-start">
              {/* Left Column: Structured Form Cards */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <FormLock locked={!editable}>
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
                    />

                    <AccountHierarchySection
                      form={form}
                      isEdit
                      selectedAccountType={selectedAccountType}
                      setSelectedAccountType={setSelectedAccountType}
                      headAccountOptions={headAccountOptions}
                      subAccountOptions={subAccountOptions}
                      headAccountId={parentAccountId}
                      setHeadAccountId={setParentAccountId}
                      subAccountId={childAccountId}
                      setSubAccountId={setChildAccountId}
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
                </FormLock>
              </Grid.Col>

              {/* Right Column: Live Preview, Readiness Checklist and the save action */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="md" pos="sticky" top={20}>
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

                  {editable && (
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
                          loading={updateAccountMutation.isPending}
                          disabled={!isFormValid}
                          onClick={handleUpdateAccount}
                        >
                          {t('edit.save')}
                        </Button>
                      }
                    />
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
};

export default EditAccountJournalPage;
