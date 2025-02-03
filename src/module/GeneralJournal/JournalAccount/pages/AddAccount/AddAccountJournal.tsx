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
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconAdjustments, IconChevronDown, IconInfoCircle, IconSquareRounded } from '@tabler/icons-react';
import { routes } from '@/router';
import { gradientColors, themeColors } from '@/theme';
import { TextMediumGR } from '@/components/Text/CustomText';
import { GetCategoryAccount } from '../../service/GetCategoryAccount.service';
import { useForm } from '@mantine/form';
import { AddAccountPayload } from '../../types/AddAccountPayload';
import AddAccountLedgerFormLayout from './Layout';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';
import { useState } from 'react';
import { useGetAllUser } from '@/module/SettingMenu/UserManagement/User/service/User.service';
import { GetRoles } from '@/module/SettingMenu/UserManagement/Role/Service/Role.service';
import { useAddAccount } from '../../service/AddAccount.service';
import { GetJournalAccounts } from '../../service/AccountJournal.service';
import { useHeadAccounts, useSubAccounts } from '../../store/useAccount';



const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};
type IconWithTooltipProps = {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
};



const AddAccountLedgerPage = () => {
  const navigate = useNavigate();
  const { data: categoryAccounts } = GetCategoryAccount();
  const { accounts, isLoading } = GetJournalAccounts();
  const { data: User } = useGetAllUser();
  const { data: Role, } = GetRoles();
  const subAccountData = useSubAccounts(accounts || []);
  const headAccountData = useHeadAccounts(accounts || []);
  const [selectedOption, setSelectedOption] = useState<string>('AllUsers');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('SingleAccount');
  const [specialUsers, setSpecialUsers] = useState<string[]>([]);
  const [certainRoles, setCertainRoles] = useState<string[]>([]);
  const [headAccounts, setHeadAccounts] = useState<string>();
  const [subAccounts, setSubAccounts] = useState<string>();
  const addAccountMutation = useAddAccount();
  console.log(certainRoles);
  const NothingFoundTitle = 'Nothing Found...'

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

  const HeadAccountData = headAccountData.map((headAccount) => ({
    value: headAccount.id,
    label: headAccount.name,
  }));
  const SubAccountData = subAccountData.map((subAccount) => ({
    value: subAccount.id,
    label: subAccount.name,
  }));





  const form = useForm<AddAccountPayload>({
    initialValues: {
      name: '',
      accountNumber: '',
      category: '',
      taxType: '',
      isBankAndCash: false,
      isAllUser: false,
      allowedUsers: [],
      allowedRoles: [],
    },
  });

  const handleAddAccount = () => {
    const { name, accountNumber, category, taxType, isBankAndCash, isAllUser, allowedUsers, allowedRoles } = form.values;

    const payload: AddAccountPayload = {
      name,
      accountNumber,
      category,
      taxType,
      isBankAndCash,
      isAllUser,
      allowedUsers: isAllUser ? [] : allowedUsers,
      allowedRoles: isAllUser ? [] : allowedRoles,
    };
    // console.log(payload)
    addAccountMutation.mutate(payload);
  };
  const handleCancel = () => {
    navigate(routes.generalJournal.main);
  };

  const IconWithTooltip: React.FC<IconWithTooltipProps> = ({ label, onClick, ariaLabel = 'Icon' }) => (
    <Tooltip
      label={label}
      transitionProps={{ duration: 200 }}
      color="blue"
    >
      <ActionIcon variant="transparent" radius="xl" aria-label={ariaLabel} onClick={onClick}>
        <IconInfoCircle style={{ width: '70%', height: '70%', color: themeColors.blue[6] }} stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );

  const UserAccessSection = () => {
    return (
      <Stack>
        <Group justify="space-between" grow>
          <Grid>
            <Grid.Col span={6}>
              <Text fz={14} fw={600} c={themeColors.dark[6]}>
                User Access <span style={{ color: 'red' }}>*</span>
              </Text>
              <Text c={themeColors.grey[6]} w={400} fz={12}>Select the parties who can access this account</Text>
            </Grid.Col>
            <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Radio.Group
                withAsterisk
                value={selectedOption}
                onChange={setSelectedOption}
                name="user-access"
              >
                <Group gap="xs">
                  <Radio color={themeColors.primary[6]} value="AllUsers" label="All Users" />
                  <Radio color={themeColors.primary[6]} value="SpecialUsers" label="Special Users" />
                  <Radio color={themeColors.primary[6]} value="CertainRoles" label="Certain Roles" />
                </Group>
              </Radio.Group>
            </Grid.Col>
          </Grid>
        </Group>
        {selectedOption === 'SpecialUsers' && (
          <MultiSelect
            label="Special User"
            placeholder="Select special users"
            data={UserData}
            value={specialUsers}
            onChange={setSpecialUsers}
            nothingFoundMessage={NothingFoundTitle}
            searchable
            clearable={!!specialUsers}
            rightSection={!specialUsers.length ? <IconChevronDown size={16} /> : null}
            required
          />
        )}

        {selectedOption === 'CertainRoles' && (
          <MultiSelect
            label="Certain Roles"
            placeholder="Select certain roles"
            data={RoleData}
            value={certainRoles}
            onChange={setCertainRoles}
            nothingFoundMessage={NothingFoundTitle}
            searchable
            clearable={!!certainRoles}
            rightSection={!certainRoles.length ? <IconChevronDown size={16} /> : null}
            required
          />
        )}
      </Stack>
    )
  }

  const AccountTypeSection = () => {
    return (
      <Stack>
        <Group justify="space-between" grow>
          <Grid>
            <Grid.Col span={6}>
              <Text fz={14} fw={600} c={themeColors.dark[6]}>
                Account Type <span style={{ color: 'red' }}>*</span>
              </Text>
              <Text c={themeColors.grey[6]} w={400} fz={12}>Select the type of account you want to create</Text>
            </Grid.Col>
            <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Radio.Group
                withAsterisk
                value={selectedAccountType}
                onChange={setSelectedAccountType}
                name="accountType"
              >
                <Group gap="xs">
                  <Radio color={themeColors.primary[6]} value="SingleAccount" label="Single Account" />
                  <Radio color={themeColors.primary[6]} value="HeaderAccount" label="Header Account" />
                  <Radio color={themeColors.primary[6]} value="SubAccount" label="Sub Account" />
                </Group>
              </Radio.Group>
            </Grid.Col>
          </Grid>
        </Group>
        {selectedAccountType === 'HeaderAccount' && (
          <Select
            label="Header Account From"
            placeholder="Chose Account"
            data={HeadAccountData}
            value={headAccounts}
            onChange={(value) => setHeadAccounts(value || undefined)}
            nothingFoundMessage={NothingFoundTitle}
            clearable={!!headAccounts}
            rightSection={!headAccounts?.length ? <IconChevronDown size={16} /> : null}
            searchable
            required
          />
        )}

        {selectedAccountType === 'SubAccount' && (
          <Select
            label="Sub Account From"
            placeholder="Choose Account"
            data={SubAccountData}
            value={subAccounts}
            onChange={(value) => setSubAccounts(value || undefined)}
            nothingFoundMessage={NothingFoundTitle}
            clearable={!!subAccounts}
            rightSection={!subAccounts?.length ? <IconChevronDown size={16} /> : null}
            searchable
            required
          />

        )}
      </Stack>
    )
  }

  return (
    <AddAccountLedgerFormLayout
      footer={
        <Group justify="flex-end" gap="xs" mt="md">
          <Button
            variant="light"
            color={themeColors.grey[7]}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            bg={themeColors.primary[6]}
            onClick={handleAddAccount}
          >
            Add Account
          </Button>
        </Group>
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeaderV2 type='titleOnly' title="Add Account" />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack align="stretch" justify="flex-start" gap="sm">
              <TextMediumGR>Account Information</TextMediumGR>
              <TextInput
                label="Account Name"
                placeholder="Add name"
                withAsterisk
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Account Number"
                placeholder="Add number"
                withAsterisk
                {...form.getInputProps('accountNumber')}
              />
              <Select
                label="Category"
                placeholder="Choose category"
                data={categoryData}
                withAsterisk
                clearable={!!form.values.category}
                rightSection={!form.values.category ? <IconChevronDown size={16} /> : null}
                {...form.getInputProps('category')}
              />
              {form.values.category && (
                <Group>
                  <Group gap={0}>
                    <Checkbox
                      key='category'
                      label="Is this account a contra account within its category?"
                      color={themeColors.primary[6]}
                    />
                    <IconWithTooltip
                      label="A contra account is an account that has an opposite balance to its related account and reduces the balance of the related account."
                      onClick={() => console.log('Action 1 clicked')}
                      ariaLabel="Contra Category"
                    />
                  </Group>
                  <Group gap={0}>
                    <Checkbox
                      key='bankncash'
                      label="Is this account part of the bank & cash category?"
                      color={themeColors.primary[6]}
                    />
                    <IconWithTooltip
                      label="Bank & cash features refer to accounts used to record transactions related to cash and funds held in bank accounts."
                      onClick={() => console.log('Action 1 clicked')}
                      ariaLabel="Bank And Cash"
                    />
                  </Group>
                </Group>
              )}
              <Select
                label="Type Tax"
                placeholder="Choose tax"
                data={['PPH', 'PPN', 'PPNBM', 'PBB']}
                withAsterisk
                clearable={!!form.values.taxType}
                rightSection={!form.values.taxType ? <IconChevronDown size={16} /> : null}
                {...form.getInputProps('tax')}
              />

              <Textarea
                label="Description"
                placeholder="Add Description"
                resize="vertical"
                {...form.getInputProps('description')}
              />

              <TextMediumGR>User Access</TextMediumGR>
              <UserAccessSection />
              <TextMediumGR>Account Type</TextMediumGR>
              <AccountTypeSection />
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AddAccountLedgerFormLayout>
  );
};

export default AddAccountLedgerPage;
