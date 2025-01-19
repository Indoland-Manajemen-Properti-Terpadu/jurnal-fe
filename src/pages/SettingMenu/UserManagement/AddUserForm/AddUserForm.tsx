import { PageHeader } from '@/components';
import {
  Stack,
  Paper,
  Anchor,
  Container,
  Input,
  Autocomplete,
  Loader,
  Text,
  useCombobox,
  Combobox,
  InputBase,
  TextInput,
  Accordion,
  Switch,
  Group,
  List,
  Tabs,
  Space,
} from '@mantine/core';
import { useRef, useState } from 'react';
import classes from './AddUserForm.module.css';
import AddUserFormLayout from './Layout';
import UserType from '@/../public/mocks/UserType.json';
import UserRole from '@/../public/mocks/Role.json';
import { IconCards, IconUsers } from '@tabler/icons-react';
const items = [
  { title: 'Settings', href: '#' },
  { title: 'User Management', href: '#' },
  { title: 'Add User', href: '#' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

export default function AddUserForm() {
  const timeoutRef = useRef<number>(-1);
  const [email, emailValue] = useState('');
  const [data, emailDisplay] = useState<string[]>([]);
  const [userType, userTypeValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    emailValue(val);
    emailDisplay([]);
    if (val.trim().length === 0 || val.includes('@')) {
      setLoading(false);
    } else {
      setLoading(true);
      timeoutRef.current = window.setTimeout(() => {
        setLoading(false);
        emailDisplay(
          ['gmail.com', 'outlook.com', 'yahoo.com'].map((provider) => `${val}@${provider}`)
        );
      }, 1000);
    }
  };

  // * Role Access Handler
  const roleData = UserRole.map((item) => (
    <Accordion.Item key={item.roleName} value={item.roleName}>
      <Group grow gap="xl">
        <Accordion.Control>{item.roleName} </Accordion.Control>
        <Switch defaultChecked color="cyan" size="sm" className={classes.switch}>
          {item.roleName}
        </Switch>
      </Group>

      <Accordion.Panel classNames={{ panel: classes.accordionDesc }}>
        <Text variant="gradient" gradient={{ from: '#00b194', to: '#1c8fd4', deg: 90 }}>
          Description
        </Text>
        <List size="xs" withPadding className={classes.accordionList}>
          {item.access.map((accessItem, index) => (
            <List.Item key={index}>{accessItem}</List.Item>
          ))}
        </List>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <AddUserFormLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeader title="User Management" breadcrumbItems={items} />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Stack bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="sm">
              <Text
                variant="gradient"
                gradient={{ from: '#00b194', to: '#1c8fd4', deg: 120 }}
                fw={500}
                size="lg"
              >
                User Information
              </Text>
              <TextInput
                label="Full Name"
                placeholder="full name"
                withAsterisk
                // error="This field can’t be empty"
                // {...accountInfoForm.getInputProps('firstname')}
              />
              <Autocomplete
                value={email}
                data={data}
                withAsterisk
                onChange={handleChange}
                rightSection={loading ? <Loader size="1rem" /> : null}
                label="Email"
                placeholder="Your email"
                // error="This field can’t be empty"
              />
              <Combobox
                store={combobox}
                onOptionSubmit={(val) => {
                  userTypeValue(val);
                  combobox.closeDropdown();
                }}
              >
                <Combobox.Target>
                  <InputBase
                    component="button"
                    type="button"
                    withAsterisk
                    pointer
                    label="Type User"
                    // error="This field can’t be empty"
                    rightSection={<Combobox.Chevron />}
                    rightSectionPointerEvents="none"
                    onClick={() => combobox.toggleDropdown()}
                  >
                    {userType || <Input.Placeholder>Chose type user</Input.Placeholder>}
                  </InputBase>
                </Combobox.Target>

                <Combobox.Dropdown>
                  <Combobox.Options>{options}</Combobox.Options>
                </Combobox.Dropdown>
              </Combobox>
              <Text
                variant="gradient"
                gradient={{ from: '#00b194', to: '#1c8fd4', deg: 120 }}
                fw={500}
                fz={18}
              >
                User Role
              </Text>
              <Tabs
                variant="outline"
                value={activeTabUser}
                onChange={(value) => setActiveTabUser(value!)}
                color="cyan"
              >
                <Tabs.List>
                  <Tabs.Tab value="ListUser" leftSection={<IconUsers size={14} />}>
                    Default Role
                  </Tabs.Tab>
                  <Tabs.Tab value="ListRole" leftSection={<IconCards size={14} />}>
                    Additional Role
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="ListUser">
                  <Space h="md" />
                  <Accordion variant="contained" radius="md" chevronPosition="left" multiple>
                    {roleData}
                  </Accordion>
                </Tabs.Panel>
              </Tabs>
              {/* <Text component="div">
                <TypographyStylesProvider c="black">
                  <Text c="black">Role Access</Text>
                  <Text c="black">
                    If you choose a role that can access all features then you cannot choose another
                    role
                  </Text>
                </TypographyStylesProvider>
              </Text> */}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </AddUserFormLayout>
  );
}
