import {
  ActionIcon,
  Button,
  Checkbox,
  Container,
  Grid,
  Group,
  MultiSelect,
  Paper,
  Radio,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  Title,
  Center,
  Loader,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconChevronDown, IconInfoCircle, IconFileDescription, IconKey } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { themeColors } from '@/theme';
import { GetCategoryAccount } from '../../services/GetCategoryAccount.service';
import { useForm } from '@mantine/form';
import { AddAccountPayload } from '../../types/AddAccountPayload';
import AddAccountLedgerFormLayout from '../AddAccount/Layout';
import { useState, useEffect } from 'react';
import { useGetAllUser } from '@/module/SettingMenu/UserManagement/User/service/User.service';
import { GetRoles } from '@/module/SettingMenu/UserManagement/Role/Service/Role.service';
import { useUpdateAccount } from '../../services/UpdateAccount.service';
import { useGetCategoryInfo } from '../../services/GetCategoryInfo.service';
import { useDetailAccount } from '@/module/GeneralJournal/DetailAccount/Main/hooks/useDetailAccount';

const PAPER_PROPS = {
  p: '0',
  shadow: 'sm',
  radius: 'md',
  withBorder: true,
  style: { borderColor: '#E9ECEF', overflow: 'hidden' }
};

type IconWithTooltipProps = {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};

const EditAccountJournalPage = () => {
  const navigate = useNavigate();
  const { idAccount } = useParams<{ idAccount: string }>();
  const { accountDetail, isLoading: isLoadingDetail } = useDetailAccount(idAccount!);

  const rawAccountData = (accountDetail as any)?.data || accountDetail;
  const isLocked = rawAccountData?.isLocked || false;

  const { data: categoryAccounts } = GetCategoryAccount();
  const { data: User } = useGetAllUser();
  const { data: Role } = GetRoles();

  const [selectedOption, setSelectedOption] = useState<string>('AllUsers');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('SingleAccount');
  const [specialUsers, setSpecialUsers] = useState<string[]>([]);
  const [certainRoles, setCertainRoles] = useState<string[]>([]);
  const [headAccounts, setHeadAccounts] = useState<string>();
  const [subAccounts, setSubAccounts] = useState<string>();

  const updateAccountMutation = useUpdateAccount(idAccount!);

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
  });

  const { data: categoryInfo } = useGetCategoryInfo(form.values.category);

  useEffect(() => {
    if (accountDetail) {
      const data = (accountDetail as any).data || accountDetail;
      form.setValues({
        name: data.name || '',
        accountNumber: data.accountNumber || '',
        category: data.category?.id || '',
        taxType: data.taxType || '',
        isBankAndCash: data.isBankAndCash || false,
        isContra: data.isContra || false,
        desc: data.desc || '',
      });

      if (data.headAccountId) {
        setSelectedAccountType('SubAccount');
        setSubAccounts(data.headAccountId);
      } else if (data.subAccountId) {
        setSelectedAccountType('HeaderAccount');
        setHeadAccounts(data.subAccountId);
      } else {
        setSelectedAccountType('SingleAccount');
      }

      if (data.isAllUser) {
        setSelectedOption('AllUsers');
      } else if (data.allowedUsers && data.allowedUsers.length > 0) {
        setSelectedOption('SpecialUsers');
        setSpecialUsers(data.allowedUsers.map((u: any) => typeof u === 'string' ? u : u.id));
      } else if (data.allowedRoles && data.allowedRoles.length > 0) {
        setSelectedOption('CertainRoles');
        setCertainRoles(data.allowedRoles.map((r: any) => typeof r === 'string' ? r : r.id));
      }
    }
  }, [accountDetail]);

  const NothingFoundTitle = 'Nothing Found...';

  const categoryData = categoryAccounts?.map((category) => ({
    value: category.id || '',
    label: category.name || 'Unnamed category',
  })) || [];

  const UserData = User?.results?.map((users) => ({
    value: users.id || '',
    label: users.email || 'Unnamed User',
  })) || [];

  const RoleData = [
    ...(Role || [])
  ].map((role) => ({
    value: role.id || '',
    label: role.name || 'Unnamed Role',
  }));

  const HeadAccountData = categoryInfo?.possibleHeadAccounts?.map((headAccount: any) => ({
    value: headAccount.id,
    label: `(${headAccount.accountNumber}) ${headAccount.name}`,
  })) || [];

  const SubAccountData = categoryInfo?.possibleSubAccounts?.map((subAccount: any) => ({
    value: subAccount.id,
    label: `(${subAccount.accountNumber}) ${subAccount.name}`,
  })) || [];


  const handleUpdateAccount = () => {
    const payload: AddAccountPayload = {
      name: form.values.name,
      accountNumber: form.values.accountNumber,
      category: form.values.category,
      taxType: form.values.taxType,
      isBankAndCash: form.values.isBankAndCash,
      isContra: form.values.isContra,
      desc: form.values.desc,
      isAllUser: true,
    };

    if (selectedAccountType === 'HeaderAccount') {
      payload.isAllUser = true;
      if (headAccounts) {
        payload.subAccountId = headAccounts;
      }
    } else if (selectedAccountType === 'SubAccount') {
      payload.isAllUser = true;
      if (subAccounts) {
        payload.headAccountId = subAccounts;
      }
    } else {
      payload.isAllUser = selectedOption === 'AllUsers';
      if (!payload.isAllUser) {
        if (selectedOption === 'SpecialUsers') {
          payload.allowedUsers = specialUsers;
        } else if (selectedOption === 'CertainRoles') {
          payload.allowedRoles = certainRoles;
        }
      }
    }

    updateAccountMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ label, onClick, ariaLabel = 'Icon' }) => (
    <Tooltip
      label={label}
      transitionProps={{ duration: 200 }}
      color="blue"
    >
      <ActionIcon variant="transparent" radius="xl" aria-label={ariaLabel} onClick={onClick}>
        <IconInfoCircle style={{ width: '16px', height: '16px', color: themeColors.blue[6] }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <Group gap="sm" px="md" py="xs" bg="#F4FAF8" style={{ borderTop: '1px solid #E9ECEF', borderBottom: '1px solid #E9ECEF' }}>
      <Icon size={20} color={themeColors.primary[6]} />
      <Text fw={600} fz={14} c={themeColors.slate[8]}>{title}</Text>
    </Group>
  );

  const isFormValid = form.values.name && form.values.category && form.values.accountNumber && form.values.taxType;

  const inputStyles = {
    label: {
      color: themeColors.slate[8],
      fontWeight: 500,
      fontSize: 14,
      marginBottom: 4,
    },
  };

  if (isLoadingDetail) {
    return (
      <AddAccountLedgerFormLayout footer={<></>}>
        <Center h={400}>
          <Loader color={themeColors.primary[6]} />
        </Center>
      </AddAccountLedgerFormLayout>
    );
  }

  return (
    <AddAccountLedgerFormLayout footer={<></>}>
      <Container fluid p={0}>
        <Paper {...PAPER_PROPS} mt="sm">
          <Stack gap={0}>
            {/* Header */}
            <Group align="flex-start" gap="sm" p="md">
              <ActionIcon variant="transparent" c={themeColors.slate[6]} onClick={handleCancel} mt={4}>
                <IconArrowLeft size={24} />
              </ActionIcon>
              <Stack gap={2}>
                <Title order={4} fw={600} c={themeColors.slate[8]}>Ubah Akun</Title>
                <Text c={themeColors.slate[4]} fz={13}>Perbarui informasi akun Chart of Accounts.</Text>
              </Stack>
            </Group>

            {/* Informasi Akun Section */}
            <SectionHeader icon={IconInfoCircle} title="Informasi Akun" />
            <Stack gap="sm" p="md">
              <TextInput
                label="Nama Akun"
                styles={inputStyles}
                placeholder="Masukan nama akun"
                withAsterisk
                {...form.getInputProps('name')}
              />

              <Grid align="flex-start">
                <Grid.Col span={6}>
                  <Select
                    label="Kategori Akun"
                    styles={inputStyles}
                    placeholder="Kas & Bank"
                    data={categoryData}
                    withAsterisk
                    disabled={isLocked}
                    clearable={!!form.values.category && !isLocked}
                    rightSection={<IconChevronDown size={16} />}
                    {...form.getInputProps('category')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Kode Akun"
                    styles={inputStyles}
                    placeholder="1-10099"
                    withAsterisk
                    {...form.getInputProps('accountNumber')}
                  />
                </Grid.Col>
              </Grid>

              <Group gap="sm" mt={0}>
                <Group gap={4}>
                  <Checkbox
                    label={<Text span fz={12} c={themeColors.slate[6]}>Akun Contra</Text>}
                    color={themeColors.primary[6]}
                    size="xs"
                    {...form.getInputProps('isContra', { type: 'checkbox' })}
                  />
                  <IconWithTooltip
                    label="Akun Contra memiliki saldo berlawanan dengan akun terkait."
                    ariaLabel="Contra Category"
                  />
                </Group>
              </Group>

              <Select
                label="Pajak"
                styles={inputStyles}
                placeholder="Pilih pajak"
                data={['PPH', 'PPN', 'PPNBM', 'PBB']}
                withAsterisk
                clearable={!!form.values.taxType}
                rightSection={<IconChevronDown size={16} />}
                {...form.getInputProps('taxType')}
              />

              <Textarea
                label="Deskripsi"
                styles={inputStyles}
                placeholder="Masukan deskripsi"
                resize="vertical"
                minRows={3}
                {...form.getInputProps('desc')}
              />
            </Stack>

            {/* Jenis Akun Section */}
            {!isLocked && (
              <>
                <SectionHeader icon={IconFileDescription} title="Jenis Akun" />
                <Stack gap="sm" p="md">
                  <Group justify="space-between" align="flex-start">
                    <Stack gap={2}>
                      <Text fz={14} fw={500} c={themeColors.slate[8]}>Tentukan Jenis Akun <span style={{ color: 'red' }}>*</span></Text>
                      <Text c={themeColors.slate[4]} fz={12}>Pilih apakah akun ini sebagai induk, sub akun, atau akun mandiri</Text>
                    </Stack>
                    <Radio.Group
                      value={selectedAccountType}
                      onChange={setSelectedAccountType}
                      name="accountType"
                    >
                      <Group gap="lg">
                        <Radio color={themeColors.primary[6]} value="SingleAccount" label={<Text span fz={13} c={themeColors.slate[8]}>Akun Mandiri</Text>} />
                        <Radio color={themeColors.primary[6]} value="SubAccount" label={<Text span fz={13} c={themeColors.slate[8]}>Sub Akun</Text>} />
                        <Radio color={themeColors.primary[6]} value="HeaderAccount" label={<Text span fz={13} c={themeColors.slate[8]}>Akun Induk</Text>} />
                      </Group>
                    </Radio.Group>
                  </Group>

                  {selectedAccountType === 'HeaderAccount' && (
                    <Select
                      label="Pilih Sub Akun Untuk Akun Induk Ini (Opsional)"
                      styles={inputStyles}
                      placeholder="Pilih Akun"
                      data={SubAccountData}
                      value={headAccounts}
                      onChange={(value) => setHeadAccounts(value || undefined)}
                      nothingFoundMessage={NothingFoundTitle}
                      clearable={!!headAccounts}
                      rightSection={<IconChevronDown size={16} />}
                      searchable
                    />
                  )}

                  {selectedAccountType === 'SubAccount' && (
                    <Select
                      label="Sub Akun Dari (Pilih Akun Induk)"
                      styles={inputStyles}
                      placeholder="Pilih Akun"
                      data={HeadAccountData}
                      value={subAccounts}
                      onChange={(value) => setSubAccounts(value || undefined)}
                      nothingFoundMessage={NothingFoundTitle}
                      clearable={!!subAccounts}
                      rightSection={<IconChevronDown size={16} />}
                      searchable
                      required
                    />
                  )}
                </Stack>
              </>
            )}

            {/* Akses Akun Section */}
            <SectionHeader icon={IconKey} title="Akses Akun" />
            <Stack gap="sm" p="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={2}>
                  <Text fz={14} fw={500} c={themeColors.slate[8]}>Atur akses akun <span style={{ color: 'red' }}>*</span></Text>
                  <Text c={themeColors.slate[4]} fz={12}>Pilih pengguna yang dapat melihat atau menggunakan akun ini</Text>
                </Stack>
                <Radio.Group
                  value={selectedOption}
                  onChange={setSelectedOption}
                  name="userAccess"
                  disabled={selectedAccountType !== 'SingleAccount'}
                >
                  <Group gap="lg">
                    <Radio color={themeColors.primary[6]} value="AllUsers" label={<Text span fz={13} c={themeColors.slate[8]}>Semua Pengguna</Text>} />
                    <Radio color={themeColors.primary[6]} value="SpecialUsers" label={<Text span fz={13} c={themeColors.slate[8]}>Pengguna Tertentu</Text>} />
                    <Radio color={themeColors.primary[6]} value="CertainRoles" label={<Text span fz={13} c={themeColors.slate[8]}>Role Tertentu</Text>} />
                  </Group>
                </Radio.Group>
              </Group>

              {selectedAccountType !== 'SingleAccount' && (
                <Text fz={12} c={themeColors.slate[4]} mt={-8}>
                  * Akses akun otomatis disetel ke "Semua Pengguna" untuk Akun Induk atau Sub Akun.
                </Text>
              )}

              {selectedAccountType === 'SingleAccount' && selectedOption === 'SpecialUsers' && (
                <MultiSelect
                  label="Pengguna Tertentu"
                  styles={inputStyles}
                  placeholder="Pilih pengguna"
                  data={UserData}
                  value={specialUsers}
                  onChange={setSpecialUsers}
                  nothingFoundMessage={NothingFoundTitle}
                  searchable
                  clearable={!!specialUsers}
                  rightSection={<IconChevronDown size={16} />}
                  required
                />
              )}
              {selectedAccountType === 'SingleAccount' && selectedOption === 'CertainRoles' && (
                <MultiSelect
                  label="Role Tertentu"
                  styles={inputStyles}
                  placeholder="Pilih role"
                  data={RoleData}
                  value={certainRoles}
                  onChange={setCertainRoles}
                  nothingFoundMessage={NothingFoundTitle}
                  searchable
                  clearable={!!certainRoles}
                  rightSection={<IconChevronDown size={16} />}
                  required
                />
              )}
            </Stack>

            {/* Footer Buttons */}
            <Group justify="flex-end" gap="sm" p="md" style={{ borderTop: '1px solid #E9ECEF' }}>
              <Button
                variant="light"
                color="gray"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                color={themeColors.primary[5]}
                onClick={handleUpdateAccount}
                disabled={!isFormValid || (selectedAccountType === 'SubAccount' && !subAccounts)}
                loading={updateAccountMutation.isPending}
              >
                Perbarui
              </Button>
            </Group>

          </Stack>
        </Paper>
      </Container>
    </AddAccountLedgerFormLayout>
  );
};

export default EditAccountJournalPage;
