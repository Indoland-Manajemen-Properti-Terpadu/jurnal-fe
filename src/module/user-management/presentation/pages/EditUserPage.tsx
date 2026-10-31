import {
  Stack,
  Paper,
  Container,
  Input,
  Autocomplete,
  Loader,
  useCombobox,
  Combobox,
  InputBase,
  TextInput,
  Switch,
  Group,
  Tabs,
  Button,
  Space,
  Text,
} from '@mantine/core';
import { useRef, useState } from 'react';
import { IconCards, IconChevronDown, IconUsers } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { gradientColors, themeColors } from '@/theme';
import { USER_TYPES } from '@/module/user-management/domain/userTypeOptions';
import { TextMediumGR } from '@/components/Text/CustomText';
// import { useRoleStore } from '@/store/useRole';

import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';
import AppShellLayout from '@/components/AppShellLayout';
import classes from '@/module/user-management/presentation/pages/EditUserPage.module.css';
import { useUserByEmail } from '@/module/user-management/presentation/hooks/useUserByEmail';

import { useTranslation } from '@/i18n';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

function EditUserPage() {
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const items = [
    { title: tu('common.userManagement'), href: () => navigate(-1) },
    { title: tu('user.add'), href: undefined },
  ];
  const location = useLocation();
  const { email: emailParam } = useParams();
  // The list passes the email in the router state; the URL also carries it so a reload still works.
  const userEmail = location.state?.email ?? emailParam;
  const { data: UserDetail, isLoading, error } = useUserByEmail(userEmail);

  const timeoutRef = useRef<number>(-1);
  const [email, setEmail] = useState('');
  const [emailDisplay, setEmailDisplay] = useState<string[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');

  // * Combobox USER_TYPES Handler
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const options = USER_TYPES.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  // * Input Email Handler
  const handleChange = (val: string) => {
    window.clearTimeout(timeoutRef.current);
    setEmail(val);
    setEmailDisplay([]);
    if (val.trim().length === 0 || val.includes('@')) {
      setLoading(false);
    } else {
      setLoading(true);
      timeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        setEmailDisplay(
          ['gmail.com', 'outlook.com', 'yahoo.com'].map((provider) => `${val}@${provider}`)
        );
      }, 1000);
    }
  };

  if (isLoading) {
    return <div>{tu('user.loading')}</div>;
  }

  if (error) {
    return (
      <div>
        {tu('user.errorPrefix')} {error.message}
      </div>
    );
  }

  return (
    <AppShellLayout
      footer={
        <div className={classes.footer}>
          <Group h="100%" px="md">
            <Group justify="space-between" style={{ flex: 1 }}>
              <Switch
                defaultChecked
                color={themeColors.primary[6]}
                label={tu('common.active')}
                size="lg"
              />
              <Group>
                <Button variant="light" color={themeColors.gray[7]} onClick={() => navigate(-1)}>
                  {tu('common.cancel')}
                </Button>
                <Button
                  variant="gradient"
                  gradient={gradientColors.gradient}
                  onClick={() => navigate(routes.userManagement.main)}
                >
                  {tu('user.finish')}
                </Button>
              </Group>
            </Group>
          </Group>
        </div>
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeaderV2 type="withBreadcrumbs" title={tu('user.edit')} breadcrumbItems={items} />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack align="stretch" justify="flex-start" gap="sm">
              <TextInput label={tu('user.name')} withAsterisk />
              <Text>{UserDetail?.name} </Text>

              <Autocomplete
                value={email}
                data={emailDisplay}
                withAsterisk
                onChange={handleChange}
                rightSection={loading ? <Loader size="1rem" /> : null}
                label={tu('common.email')}
                placeholder={tu('common.yourEmail')}
              />
              <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  setUserType(val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    withAsterisk
                    pointer
                    label={tu('common.typeUser')}
                    rightSection={<IconChevronDown size={14} />}
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}
                  >
                    {userType ?? <Input.Placeholder>{tu('common.chooseType')}</Input.Placeholder>}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <TextMediumGR>{tu('common.roleAccess')} </TextMediumGR>
              <Tabs
                variant="outline"
                value={activeTabRole}
                onChange={(value) => setActiveTabRole(value!)}
                color={themeColors.primary[6]}
                styles={{ tabLabel: { color: themeColors.primary[6] } }}
              >
                <Tabs.List>
                  <Tabs.Tab value="DefaultRole" leftSection={<IconUsers size={14} />}>
                    {tu('common.defaultRole')}
                  </Tabs.Tab>
                  <Tabs.Tab value="AdditionalRole" leftSection={<IconCards size={14} />}>
                    {tu('common.additionalRole')}
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="DefaultRole">
                  <Space h="xs" />
                  {/* <AcordionRoleAccess roles={defaultRoles} /> */}
                </Tabs.Panel>
                <Tabs.Panel value="AdditionalRole">
                  <Space h="xs" />
                  {/* <AcordionRoleAccess roles={additionalRoles} /> */}
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AppShellLayout>
  );
}

export default EditUserPage;
