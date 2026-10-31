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
  Space,
  Button,
} from '@mantine/core';
import { useRef, useState } from 'react';
import { IconCards, IconUsers } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { useNavigate } from 'react-router-dom';
import { gradientColors, themeColors } from '@/theme';
import UserType from '@/../public/mocks/UserType.json';
import AppShellLayout from '@/components/AppShellLayout';
import { TextMediumGR } from '@/components/Text/CustomText';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';

import { useTranslation } from '@/i18n';

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

export default function AddUserPage() {
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const items = [
    { title: tu('common.userManagement'), href: () => navigate(-1) },
    { title: tu('user.add'), href: undefined },
  ];
  const timeoutRef = useRef<number>(-1);
  const [email, setEmail] = useState('');
  const [emailDisplay, setEmailDisplay] = useState<string[]>([]);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const { defaultRoles, additionalRoles } = useRoleStore();
  const [activeTabUser, setActiveTabUser] = useState<string>('ListUser');

  // * Combobox UserType Handler
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const options = UserType.map((item) => (
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

  return (
    <AppShellLayout
      footer={
        <Group h="100%" px="xl">
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
                {tu('user.addTransaction')}
              </Button>
            </Group>
          </Group>
        </Group>
      }
    >
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeaderV2
              type="withBreadcrumbs"
              title={tu('common.userManagement')}
              breadcrumbItems={items}
            />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="sm">
              <TextMediumGR>{tu('user.info')}</TextMediumGR>
              <TextInput
                label={tu('common.fullName')}
                placeholder={tu('user.fullNameField')}
                withAsterisk
                // error="This field can’t be empty"
                // {...accountInfoForm.getInputProps('firstname')}
              />
              <Autocomplete
                value={email}
                data={emailDisplay}
                withAsterisk
                onChange={handleChange}
                rightSection={loading ? <Loader size="1rem" /> : null}
                label={tu('common.email')}
                placeholder={tu('common.yourEmail')}
                // error="This field can’t be empty"
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
                    // error="This field can’t be empty"
                    rightSection={<Combobox.Chevron />}
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
              <TextMediumGR>{tu('user.userRole')} </TextMediumGR>
              <Tabs
                variant="outline"
                value={activeTabUser}
                onChange={(value) => setActiveTabUser(value!)}
                color="primary"
              >
                <Tabs.List>
                  <Tabs.Tab value="ListUser" leftSection={<IconUsers size={14} />}>
                    {tu('common.defaultRole')}
                  </Tabs.Tab>
                  <Tabs.Tab value="ListRole" leftSection={<IconCards size={14} />}>
                    {tu('common.additionalRole')}
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="ListUser">
                  <Space h="md" />
                  {/* <AcordionRoleAccess roles={defaultRoles} /> */}
                </Tabs.Panel>
                <Tabs.Panel value="ListRole">
                  <Space h="md" />
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
