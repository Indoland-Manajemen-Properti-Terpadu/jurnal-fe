import React, { useEffect, useMemo } from 'react';
import { Alert, Box, Button, Grid, Paper, Skeleton, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconCheck, IconLock, IconNotebook } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { NotFound } from '@/components/ErrorPage/NotFound';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import { useCategoryAccounts } from '@/module/chart-of-accounts/presentation/hooks/useCategoryAccounts';
import { useCategoryInfo } from '@/module/chart-of-accounts/presentation/hooks/useCategoryInfo';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { useAccountFormOptions } from '../hooks/useAccountFormOptions';
import { useAccountPlacementState } from '../hooks/useAccountPlacementState';
import {
  canChangeCategory,
  hasAccountCode,
  hasValidName,
  isHierarchyAndAccessValid,
  validateAccountCategory,
  validateAccountCode,
  validateEditName,
} from '../../domain/accountRules';
import { mapAccountDetailToFormState, unwrapAccountDetail } from '../../domain/accountFormMapper';
import { buildAccountPayload } from '../../domain/buildAccountPayload';
import { AccountPreviewCard, AccountingGuideCard } from '../components';
import { EditAccountIdentitySection } from '../components/account-form/EditAccountIdentitySection';
import { EditAccountHierarchySection } from '../components/account-form/EditAccountHierarchySection';
import { EditAccountAccessSection } from '../components/account-form/EditAccountAccessSection';
import { useRoles, useUsers } from '@/module/user-management';

export const EditAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const { t, currentLanguage } = useTranslation('chartOfAccounts');
  const validationMessage = (key: string | null) => (key ? t(key) : null);

  // Fetch Existing Account Details
  const {
    accountDetail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useDetailAccount(idAccount!);
  const rawAccountData = unwrapAccountDetail(accountDetail);
  const isLocked = Boolean(rawAccountData?.isLocked);
  const categoryEditable = canChangeCategory(isLocked);

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = useCategoryAccounts();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
  const updateAccountMutation = useUpdateAccount(idAccount!);

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

  // Populate data when accountDetail arrives
  useEffect(() => {
    const data = unwrapAccountDetail(accountDetail);
    if (!data) return;
    const state = mapAccountDetailToFormState(data);
    form.setValues(state.values);
    setSelectedAccountType(state.accountType);
    if (state.parentId) setParentAccountId(state.parentId);
    if (state.childId) setChildAccountId(state.childId);
    if (state.accessScope) setAccessScope(state.accessScope);
    if (state.specialUsers) setSpecialUsers(state.specialUsers);
    if (state.certainRoles) setCertainRoles(state.certainRoles);
  }, [accountDetail]);

  // Derived Dropdown Data
  const categoryOptions = useMemo(() => {
    return (
      categoryAccounts?.map((category) => ({
        value: category.id || '',
        label: category.name || t('form.unnamedCategory'),
      })) || []
    );
  }, [categoryAccounts, currentLanguage]);

  const selectedCategoryObj = useMemo(() => {
    return categoryAccounts?.find((cat) => cat.id === form.values.category);
  }, [categoryAccounts, form.values.category]);

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
  });

  // Validation (edit only needs a non-empty name; the 3-character rule is create only)
  const isFormValid = useMemo(() => {
    if (!hasValidName(form.values.name, 1)) return false;
    if (!form.values.category) return false;
    if (!hasAccountCode(form.values.accountNumber)) return false;
    return isHierarchyAndAccessValid({
      accountType: selectedAccountType,
      headAccountId: parentAccountId,
      accessScope,
      specialUsersCount: specialUsers.length,
      certainRolesCount: certainRoles.length,
    });
  }, [
    form.values.name,
    form.values.category,
    form.values.accountNumber,
    selectedAccountType,
    parentAccountId,
    accessScope,
    specialUsers,
    certainRoles,
  ]);

  const handleUpdateAccount = () => {
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
    navigate(routes.generalJournal.main);
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
              {/* Left Column: Form Fields (Span 8) */}
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Stack gap="lg">
                  <EditAccountIdentitySection
                    form={form}
                    categoryOptions={categoryOptions}
                    isLocked={isLocked}
                    isLoadingCategories={isLoadingCategories}
                    suggestedAccountNumber={categoryInfo?.suggestedAccountNumber}
                  />

                  {categoryEditable && (
                    <EditAccountHierarchySection
                      selectedAccountType={selectedAccountType}
                      setSelectedAccountType={setSelectedAccountType}
                      headAccountOptions={headAccountOptions}
                      subAccountOptions={subAccountOptions}
                      parentAccountId={parentAccountId}
                      setParentAccountId={setParentAccountId}
                      childAccountId={childAccountId}
                      setChildAccountId={setChildAccountId}
                    />
                  )}

                  <EditAccountAccessSection
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

              {/* Right Column: Live Preview & Accounting Assistant (Span 4) */}
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Stack gap="md" pos="sticky" top={20}>
                  {/* Live Preview Card */}
                  <AccountPreviewCard
                    accountNumber={form.values.accountNumber}
                    accountName={form.values.name}
                    categoryName={selectedCategoryObj?.name || ''}
                    isDebit={selectedCategoryObj?.isDebit ?? true}
                    isContra={form.values.isContra}
                    accountType={selectedAccountType}
                    parentAccountLabel={parentAccountLabel}
                    childAccountLabel={childAccountLabel}
                    taxType={form.values.taxType}
                    desc={form.values.desc}
                    accessType={accessScope}
                    specialUsersCount={specialUsers.length}
                    certainRolesCount={certainRoles.length}
                  />

                  {/* Accounting Standards Guide Card */}
                  <AccountingGuideCard
                    activePrefix={
                      form.values.accountNumber.trim().match(/^([1-8])/)
                        ? `${form.values.accountNumber.trim().match(/^([1-8])/)![1]}-XXXX`
                        : undefined
                    }
                  />

                  {/* Action Card */}
                  <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                    <Stack gap="xs">
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
                      <Button
                        size="md"
                        fullWidth
                        variant="subtle"
                        color="gray"
                        onClick={handleCancel}
                        disabled={updateAccountMutation.isPending}
                      >
                        {t('form.cancelBtn')}
                      </Button>
                    </Stack>
                  </Paper>
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
