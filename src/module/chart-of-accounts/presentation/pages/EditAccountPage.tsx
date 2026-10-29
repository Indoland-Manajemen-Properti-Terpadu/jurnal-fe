import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Grid,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconEdit,
  IconFileInvoice,
  IconHierarchy2,
  IconInfoCircle,
  IconKey,
  IconLock,
  IconNotebook,
  IconReceiptTax,
  IconRefresh,
  IconShieldCheck,
} from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { GetCategoryAccount } from '../hooks/useCategoryAccounts';
import { useGetCategoryInfo } from '../hooks/useCategoryInfo';
import { useUpdateAccount } from '../hooks/useUpdateAccount';
import { useDetailAccount } from '../hooks/useDetailAccount';
import { useGetAllUser } from '@/module/SettingMenu/UserManagement/User/service/User.service';
import { GetRoles } from '@/module/SettingMenu/UserManagement/Role/Service/Role.service';
import { AddAccountPayload } from '../../domain/addAccountPayload';
import { AccountPreviewCard, AccountingGuideCard } from '../components';

export const EditAccountJournalPage: React.FC = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();

  // Fetch Existing Account Details
  const { accountDetail, isLoading: isLoadingDetail } = useDetailAccount(idAccount!);
  const rawAccountData = (accountDetail as any)?.data || accountDetail;
  const isLocked = Boolean(rawAccountData?.isLocked);

  // Queries
  const { data: categoryAccounts, isLoading: isLoadingCategories } = GetCategoryAccount();
  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUser();
  const { data: rolesData, isLoading: isLoadingRoles } = GetRoles();
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
      name: (val) => (val.trim().length === 0 ? 'Nama akun wajib diisi' : null),
      accountNumber: (val) => (val.trim().length === 0 ? 'Kode akun wajib diisi' : null),
      category: (val) => (!val ? 'Kategori akun wajib dipilih' : null),
    },
  });

  // Hierarchy & Access State
  const [selectedAccountType, setSelectedAccountType] = useState<string>('SingleAccount');
  const [parentAccountId, setParentAccountId] = useState<string | null>(null);
  const [childAccountId, setChildAccountId] = useState<string | null>(null);
  const [accessScope, setAccessScope] = useState<string>('AllUsers');
  const [specialUsers, setSpecialUsers] = useState<string[]>([]);
  const [certainRoles, setCertainRoles] = useState<string[]>([]);

  // Category Info query for suggestions & hierarchy options
  const { data: categoryInfo } = useGetCategoryInfo(form.values.category);

  // Populate data when accountDetail arrives
  useEffect(() => {
    if (accountDetail) {
      const data = (accountDetail as any).data || accountDetail;
      form.setValues({
        name: data.name || '',
        accountNumber: data.accountNumber || '',
        category: data.category?.id || data.categoryId || '',
        taxType: data.taxType || '',
        isBankAndCash: Boolean(data.isBankAndCash),
        isContra: Boolean(data.isContra),
        desc: data.desc || '',
      });

      if (data.headAccountId) {
        setSelectedAccountType('SubAccount');
        setParentAccountId(data.headAccountId);
      } else if (data.subAccountId) {
        setSelectedAccountType('HeaderAccount');
        setChildAccountId(data.subAccountId);
      } else {
        setSelectedAccountType('SingleAccount');
      }

      if (data.isAllUser) {
        setAccessScope('AllUsers');
      } else if (data.allowedUsers && data.allowedUsers.length > 0) {
        setAccessScope('SpecialUsers');
        setSpecialUsers(
          data.allowedUsers.map((u: any) => (typeof u === 'string' ? u : u.id || u._id))
        );
      } else if (data.allowedRoles && data.allowedRoles.length > 0) {
        setAccessScope('CertainRoles');
        setCertainRoles(
          data.allowedRoles.map((r: any) => (typeof r === 'string' ? r : r.id || r._id))
        );
      }
    }
  }, [accountDetail]);

  // Derived Dropdown Data
  const categoryOptions = useMemo(() => {
    return (
      categoryAccounts?.map((category) => ({
        value: category.id || '',
        label: category.name || 'Unnamed category',
      })) || []
    );
  }, [categoryAccounts]);

  const selectedCategoryObj = useMemo(() => {
    return categoryAccounts?.find((cat) => cat.id === form.values.category);
  }, [categoryAccounts, form.values.category]);

  const userOptions = useMemo(() => {
    return (
      usersData?.results?.map((u) => ({
        value: u.id || '',
        label: u.email ? `${u.name || u.email} (${u.email})` : u.id || '',
      })) || []
    );
  }, [usersData]);

  const roleOptions = useMemo(() => {
    return (
      rolesData?.map((r) => ({
        value: r.id || '',
        label: r.name || 'Unnamed Role',
      })) || []
    );
  }, [rolesData]);

  const headAccountOptions = useMemo(() => {
    return (
      categoryInfo?.possibleHeadAccounts?.map((acc: any) => ({
        value: acc.id,
        label: `[${acc.accountNumber}] ${acc.name}`,
      })) || []
    );
  }, [categoryInfo?.possibleHeadAccounts]);

  const subAccountOptions = useMemo(() => {
    return (
      categoryInfo?.possibleSubAccounts?.map((acc: any) => ({
        value: acc.id,
        label: `[${acc.accountNumber}] ${acc.name}`,
      })) || []
    );
  }, [categoryInfo?.possibleSubAccounts]);

  // Find labels for live preview
  const parentAccountLabel = useMemo(() => {
    if (!parentAccountId) return undefined;
    const found = headAccountOptions.find((opt) => opt.value === parentAccountId);
    return found?.label;
  }, [parentAccountId, headAccountOptions]);

  const childAccountLabel = useMemo(() => {
    if (!childAccountId) return undefined;
    const found = subAccountOptions.find((opt) => opt.value === childAccountId);
    return found?.label;
  }, [childAccountId, subAccountOptions]);

  // Validation
  const isFormValid = useMemo(() => {
    const hasName = form.values.name.trim().length > 0;
    const hasCategory = !!form.values.category;
    const hasCode = form.values.accountNumber.trim().length > 0;

    if (!hasName || !hasCategory || !hasCode) return false;

    if (selectedAccountType === 'SubAccount' && !parentAccountId) {
      return false;
    }

    if (selectedAccountType === 'SingleAccount') {
      if (accessScope === 'SpecialUsers' && specialUsers.length === 0) return false;
      if (accessScope === 'CertainRoles' && certainRoles.length === 0) return false;
    }

    return true;
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
      if (childAccountId) {
        payload.subAccountId = childAccountId;
      }
    } else if (selectedAccountType === 'SubAccount') {
      payload.isAllUser = true;
      if (parentAccountId) {
        payload.headAccountId = parentAccountId;
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

    updateAccountMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(routes.generalJournal.main);
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
          <ModuleHeader
            icon={IconNotebook}
            title="Ubah Akun Jurnal (COA)"
            description="Perbarui informasi akun Chart of Accounts, kode akun, klasifikasi kategori saldo, dan otorisasi akses pengguna."
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={handleCancel}
              >
                Kembali ke Daftar Akun
              </Button>
            }
          />

          {/* Account Locked Status Notification */}
          {isLocked && (
            <Alert
              icon={<IconLock size={18} />}
              title="Akun Berstatus Terkunci (Locked Account)"
              color="orange"
              radius="md"
            >
              Akun ini berstatus terkunci karena terikat dengan periode tutup buku atau ketentuan
              saldo buku besar. Kategori akun dan struktur hierarki dinonaktifkan untuk menjaga
              konsistensi laporan keuangan.
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
                  {/* Card 1: Informasi Utama Akun */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Group gap="sm" mb="md">
                      <ThemeIcon size={36} radius="md" variant="light" color="primary">
                        <IconFileInvoice size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          Informasi Utama Akun
                        </Text>
                        <Text fz={12} c="dimmed">
                          Identitas dasar, kategori klasifikasi, dan kode rekening akun
                        </Text>
                      </div>
                    </Group>

                    <Stack gap="md">
                      <TextInput
                        label="Nama Akun"
                        placeholder="Contoh: Kas Kecil Operasional, Piutang Usaha Proyek"
                        withAsterisk
                        size="sm"
                        {...form.getInputProps('name')}
                      />

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Kategori Akun"
                            placeholder="Pilih kategori akun"
                            data={categoryOptions}
                            withAsterisk
                            searchable
                            clearable={false}
                            disabled={isLocked || isLoadingCategories}
                            rightSection={<IconChevronDown size={16} />}
                            {...form.getInputProps('category')}
                          />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <TextInput
                            label="Kode Akun"
                            placeholder="Contoh: 1-10001"
                            withAsterisk
                            rightSection={
                              categoryInfo?.suggestedAccountNumber &&
                              categoryInfo.suggestedAccountNumber !== form.values.accountNumber ? (
                                <Tooltip
                                  label={`Gunakan saran sistem: ${categoryInfo.suggestedAccountNumber}`}
                                >
                                  <ActionIcon
                                    variant="subtle"
                                    color="primary"
                                    size="sm"
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

                      {/* Akun Kontra Box */}
                      <Paper
                        withBorder
                        radius="md"
                        p="sm"
                        bg={form.values.isContra ? 'orange.0' : 'gray.0'}
                        style={{
                          borderColor: form.values.isContra
                            ? 'var(--mantine-color-orange-3)'
                            : undefined,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Group justify="space-between" align="center">
                          <Stack gap={2}>
                            <Group gap={6}>
                              <Text fw={600} fz={13} c="dark.8">
                                Tandai sebagai Akun Kontra (Contra Account)
                              </Text>
                              <Badge
                                size="xs"
                                variant="light"
                                color={form.values.isContra ? 'orange' : 'gray'}
                              >
                                {form.values.isContra ? 'Aktif' : 'Non-Aktif'}
                              </Badge>
                            </Group>
                            <Text fz={12} c="dimmed">
                              Akun kontra memiliki saldo normal berlawanan dan berfungsi mengurangi
                              nilai akun utama (misal: Akumulasi Penyusutan).
                            </Text>
                          </Stack>
                          <Checkbox
                            color="orange"
                            size="md"
                            {...form.getInputProps('isContra', { type: 'checkbox' })}
                          />
                        </Group>
                      </Paper>

                      <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                          <Select
                            label="Pajak Terkait"
                            placeholder="Pilih pajak (opsional)"
                            data={['PPH', 'PPN', 'PPNBM', 'PBB']}
                            clearable
                            rightSection={<IconChevronDown size={16} />}
                            {...form.getInputProps('taxType')}
                          />
                        </Grid.Col>
                      </Grid>

                      <Textarea
                        label="Deskripsi / Keterangan"
                        placeholder="Catatan tambahan mengenai penggunaan atau kebijakan akun ini..."
                        minRows={3}
                        autosize
                        {...form.getInputProps('desc')}
                      />
                    </Stack>
                  </Paper>

                  {/* Card 2: Struktur & Hierarki Akun */}
                  {!isLocked && (
                    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                      <Group gap="sm" mb="md">
                        <ThemeIcon size={36} radius="md" variant="light" color="teal">
                          <IconHierarchy2 size={20} />
                        </ThemeIcon>
                        <div>
                          <Text fw={700} fz={15} c="dark.8">
                            Struktur & Hierarki Akun
                          </Text>
                          <Text fz={12} c="dimmed">
                            Tentukan kedudukan akun dalam bagan akun berjenjang
                          </Text>
                        </div>
                      </Group>

                      <Stack gap="md">
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                          {/* Option 1: Akun Mandiri */}
                          <Paper
                            withBorder
                            radius="md"
                            p="sm"
                            onClick={() => setSelectedAccountType('SingleAccount')}
                            style={{
                              cursor: 'pointer',
                              borderColor:
                                selectedAccountType === 'SingleAccount'
                                  ? themeColors.primary[6]
                                  : undefined,
                              backgroundColor:
                                selectedAccountType === 'SingleAccount'
                                  ? 'var(--mantine-color-primary-0)'
                                  : 'white',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Group justify="space-between" align="flex-start" mb={4}>
                              <Radio
                                value="SingleAccount"
                                checked={selectedAccountType === 'SingleAccount'}
                                onChange={() => setSelectedAccountType('SingleAccount')}
                                color="primary"
                              />
                              <Badge size="xs" variant="light" color="gray">
                                Umum
                              </Badge>
                            </Group>
                            <Text fw={600} fz={13} c="dark.8">
                              Akun Mandiri
                            </Text>
                            <Text fz={11} c="dimmed" mt={2}>
                              Berdiri sendiri tanpa ikatan induk atau sub akun.
                            </Text>
                          </Paper>

                          {/* Option 2: Sub Akun */}
                          <Paper
                            withBorder
                            radius="md"
                            p="sm"
                            onClick={() => setSelectedAccountType('SubAccount')}
                            style={{
                              cursor: 'pointer',
                              borderColor:
                                selectedAccountType === 'SubAccount'
                                  ? themeColors.primary[6]
                                  : undefined,
                              backgroundColor:
                                selectedAccountType === 'SubAccount'
                                  ? 'var(--mantine-color-primary-0)'
                                  : 'white',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Group justify="space-between" align="flex-start" mb={4}>
                              <Radio
                                value="SubAccount"
                                checked={selectedAccountType === 'SubAccount'}
                                onChange={() => setSelectedAccountType('SubAccount')}
                                color="primary"
                              />
                              <Badge size="xs" variant="light" color="teal">
                                Turunan
                              </Badge>
                            </Group>
                            <Text fw={600} fz={13} c="dark.8">
                              Sub Akun
                            </Text>
                            <Text fz={11} c="dimmed" mt={2}>
                              Menginduk ke akun utama lain untuk rincian transaksi.
                            </Text>
                          </Paper>

                          {/* Option 3: Akun Induk */}
                          <Paper
                            withBorder
                            radius="md"
                            p="sm"
                            onClick={() => setSelectedAccountType('HeaderAccount')}
                            style={{
                              cursor: 'pointer',
                              borderColor:
                                selectedAccountType === 'HeaderAccount'
                                  ? themeColors.primary[6]
                                  : undefined,
                              backgroundColor:
                                selectedAccountType === 'HeaderAccount'
                                  ? 'var(--mantine-color-primary-0)'
                                  : 'white',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <Group justify="space-between" align="flex-start" mb={4}>
                              <Radio
                                value="HeaderAccount"
                                checked={selectedAccountType === 'HeaderAccount'}
                                onChange={() => setSelectedAccountType('HeaderAccount')}
                                color="primary"
                              />
                              <Badge size="xs" variant="light" color="indigo">
                                Induk
                              </Badge>
                            </Group>
                            <Text fw={600} fz={13} c="dark.8">
                              Akun Induk
                            </Text>
                            <Text fz={11} c="dimmed" mt={2}>
                              Payung kelompok untuk beberapa sub-akun di bawahnya.
                            </Text>
                          </Paper>
                        </SimpleGrid>

                        {/* Conditional Hierarchy Field */}
                        {selectedAccountType === 'SubAccount' && (
                          <Stack gap="xs" mt="xs">
                            <Select
                              label="Pilih Akun Induk (Parent Account)"
                              placeholder="Pilih akun induk..."
                              data={headAccountOptions}
                              value={parentAccountId}
                              onChange={setParentAccountId}
                              withAsterisk
                              searchable
                              clearable
                              rightSection={<IconChevronDown size={16} />}
                              nothingFoundMessage="Tidak ditemukan akun induk yang tersedia"
                            />
                            <Text fz={12} c="dimmed">
                              * Akun ini akan terdaftar sebagai anak cabang di bawah akun induk yang
                              dipilih.
                            </Text>
                          </Stack>
                        )}

                        {selectedAccountType === 'HeaderAccount' && (
                          <Stack gap="xs" mt="xs">
                            <Select
                              label="Pilih Sub Akun Terkait (Opsional)"
                              placeholder="Pilih sub akun untuk dihubungkan..."
                              data={subAccountOptions}
                              value={childAccountId}
                              onChange={setChildAccountId}
                              searchable
                              clearable
                              rightSection={<IconChevronDown size={16} />}
                              nothingFoundMessage="Tidak ditemukan sub akun yang tersedia"
                            />
                            <Text fz={12} c="dimmed">
                              * Anda dapat menghubungkan sub-akun awal sekarang atau menambahkannya
                              nanti.
                            </Text>
                          </Stack>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Card 3: Hak Akses & Otorisasi Pengguna */}
                  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
                    <Group gap="sm" mb="md">
                      <ThemeIcon size={36} radius="md" variant="light" color="indigo">
                        <IconShieldCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={700} fz={15} c="dark.8">
                          Hak Akses & Otorisasi Pengguna
                        </Text>
                        <Text fz={12} c="dimmed">
                          Atur batasan pengguna atau peran yang dapat melihat akun ini
                        </Text>
                      </div>
                    </Group>

                    <Stack gap="md">
                      {selectedAccountType !== 'SingleAccount' ? (
                        <Alert
                          icon={<IconInfoCircle size={16} />}
                          title="Otorisasi Terpusat"
                          color="blue"
                          radius="md"
                        >
                          Akses untuk Akun Induk dan Sub Akun otomatis disetel ke{' '}
                          <Text span fw={600}>
                            Semua Pengguna
                          </Text>{' '}
                          untuk menjamin konsistensi laporan keuangan dan buku besar.
                        </Alert>
                      ) : (
                        <>
                          <Radio.Group value={accessScope} onChange={setAccessScope}>
                            <Group gap="xl">
                              <Radio
                                value="AllUsers"
                                color="primary"
                                label={
                                  <Text fz={13} fw={500} c="dark.8">
                                    Semua Pengguna
                                  </Text>
                                }
                              />
                              <Radio
                                value="SpecialUsers"
                                color="primary"
                                label={
                                  <Text fz={13} fw={500} c="dark.8">
                                    Pengguna Tertentu
                                  </Text>
                                }
                              />
                              <Radio
                                value="CertainRoles"
                                color="primary"
                                label={
                                  <Text fz={13} fw={500} c="dark.8">
                                    Role Tertentu
                                  </Text>
                                }
                              />
                            </Group>
                          </Radio.Group>

                          {accessScope === 'SpecialUsers' && (
                            <MultiSelect
                              label="Pilih Pengguna Spesifik"
                              placeholder="Pilih satu atau lebih pengguna..."
                              data={userOptions}
                              value={specialUsers}
                              onChange={setSpecialUsers}
                              withAsterisk
                              searchable
                              clearable
                              disabled={isLoadingUsers}
                              rightSection={<IconChevronDown size={16} />}
                            />
                          )}

                          {accessScope === 'CertainRoles' && (
                            <MultiSelect
                              label="Pilih Role Spesifik"
                              placeholder="Pilih satu atau lebih role..."
                              data={roleOptions}
                              value={certainRoles}
                              onChange={setCertainRoles}
                              withAsterisk
                              searchable
                              clearable
                              disabled={isLoadingRoles}
                              rightSection={<IconChevronDown size={16} />}
                            />
                          )}
                        </>
                      )}
                    </Stack>
                  </Paper>
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
                        Simpan Perubahan Akun
                      </Button>
                      <Button
                        size="md"
                        fullWidth
                        variant="subtle"
                        color="gray"
                        onClick={handleCancel}
                        disabled={updateAccountMutation.isPending}
                      >
                        Batal
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
