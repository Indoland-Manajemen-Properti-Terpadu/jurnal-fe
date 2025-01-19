import PageHeader from '@/components/PageHeader/PageHeader';
import {
  ActionIcon,
  Anchor,
  Autocomplete,
  Box,
  Container,
  Grid,
  Group,
  Paper,
  Space,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import {
  IconCards,
  IconDotsVertical,
  IconMessageCircle,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import SettingMenuLayout from '../layout';
import UserTable from '@/components/UserTable/UserTable';
import useFetchData from '@/../hooks/useFetchData';
import { useState } from 'react';
import DefaultRole from './ListRole/DefaultRole';
import classes from './UserManagement.module.css';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '@/router/index';
import { useGetUsers } from '@/hooks/Users/useGetUsers';

const items = [
  { title: 'Settings', href: '#' },
  { title: 'User Management', href: '#' },
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

const UserManagement = () => {
  const { data, isLoading } = useGetUsers();
  const [activeTabUser, setActiveTabUser] = useState<string>('ListUser');
  const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');
  const navigate = useNavigate();
  const {
    data: UsersData,
    loading: UsersLoading,
    error: UsersError,
  } = useFetchData('/mocks/Users.json');

  const actionButtons = [
    {
      label: 'Add Role',
      variant: 'light',
      color: '#F1F3F5',
      textColor: '#495057',
      onClick: () => console.log('Add Role Clicked'),
    },
    {
      label: 'Add User',
      variant: 'gradient',
      gradient: { from: 'blue', to: 'cyan', deg: 90 },
      textColor: 'white',
      onClick: () => navigate(routes.addUserForm),
    },
  ];

  return (
    <SettingMenuLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>
            <PageHeader
              title="User Management"
              breadcrumbItems={items}
              actionButtons={actionButtons}
            />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Tabs value={activeTabUser} onChange={(value) => setActiveTabUser(value!)} color="cyan">
              <Tabs.List>
                <Tabs.Tab value="ListUser" leftSection={<IconUsers size={14} />}>
                  List User
                </Tabs.Tab>
                <Tabs.Tab value="ListRole" leftSection={<IconCards size={14} />}>
                  List Role
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="ListUser">
                <Box>
                  <h1>Users List</h1>
                  {data &&
                    data.map((user:any) => (
                      <Box key={user.id} mb="sm">
                        <Text>{user.name}</Text>
                        <Text>{user.email}</Text>
                      </Box>
                    ))}
                </Box>
                <Space h="sm" />
                <UserTable data={UsersData} error={UsersError} loading={UsersLoading} />
              </Tabs.Panel>
              <Tabs.Panel value="ListRole">
                <Stack bg="var(--mantine-color-body)" align="stretch" justify="flex-start" gap="sm">
                  <Space h="sm" />
                  <Grid>
                    <Grid.Col span={4}>
                      {' '}
                      <Autocomplete
                        rightSection={<IconSearch size={12} />}
                        width={10}
                        placeholder="Find Role"
                        data={['React', 'Angular', 'Vue', 'Svelte']}
                      />
                    </Grid.Col>
                  </Grid>
                  <Tabs
                    value={activeTabRole}
                    onChange={(value) => setActiveTabRole(value!)}
                    variant="outline"
                    classNames={{
                      tabLabel: classes.tabLabel,
                    }}
                  >
                    <Tabs.List>
                      <Tabs.Tab value="DefaultRole" leftSection={<IconUsers size={14} />}>
                        Default Role
                      </Tabs.Tab>
                      <Tabs.Tab value="AdditionalRole" leftSection={<IconCards size={14} />}>
                        Additional Role
                      </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="DefaultRole">
                      <Space h="sm" />
                      <Text>
                        <DefaultRole />
                      </Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="AdditionalRole">
                      <Space h="sm" />
                      <Text>Additional</Text>
                    </Tabs.Panel>
                  </Tabs>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </SettingMenuLayout>
  );
};

export default UserManagement;
