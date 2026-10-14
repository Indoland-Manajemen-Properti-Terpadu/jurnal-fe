// pages/UserManagement.tsx
import { useEffect, useState } from 'react';
import {
  Anchor,
  Autocomplete,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Space,
  Stack,
  Tabs,
} from '@mantine/core';
import { IconCards, IconSearch, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader/PageHeader';
import { navigate, routes } from '@/router/index';
import { themeColors, gradientColors } from '@/theme';
// import { useRoleStore } from '@/store/useRole';
import { useGetAllUser } from '@/module/SettingMenu/UserManagement/User/service/User.service';
import UserTable from '../../User/components/UserTable/UserTable';
import ListRole from '../../Role/pages/ListRole';
import SettingMenuLayout from './Layout';
import PageHeaderV2 from '@/components/PageHeader/PageHeaderV2';


const items = [
  { title: 'Pengaturan', href: () => navigate(-1) },
  { title: 'Manajemen Pengguna', href: undefined },
];

const PAPER_PROPS = {
  p: 'md',
  shadow: 'md',
  radius: 'md',
};

const UserManagement = () => {
  const { data: userData, isError, isLoading } = useGetAllUser();
  const [activeTabUser, setActiveTabUser] = useState<string>('ListUser');
  const [activeTabRole, setActiveTabRole] = useState<string>('DefaultRole');
  const navigate = useNavigate();

  return (
    <SettingMenuLayout>
      <Container fluid>
        <Stack gap="lg">
          <Paper {...PAPER_PROPS}>

            <PageHeaderV2
              type='titleActionButton'
              title="Manajemen Pengguna"
              actionButtons={[
                {
                  label: "Add Role",
                  variant: "light",
                  color: themeColors.gray[7],
                  onClick: () => navigate(routes.userManagement.addRole),
                },
                {
                  label: "Add User",
                  variant: "gradient",
                  gradient: gradientColors.gradient,
                  onClick: () => navigate(routes.userManagement.addUser),
                },
              ]}
            />
          </Paper>
          <Paper {...PAPER_PROPS}>
            <Tabs value={activeTabUser} onChange={(value) => setActiveTabUser(value!)} color={themeColors.primary[6]} >
              <Tabs.List>
                <Tabs.Tab value="ListUser" leftSection={<IconUsers size={14} />}>
                  List User
                </Tabs.Tab>
                <Tabs.Tab value="ListRole" leftSection={<IconCards size={14} />}>
                  List Role
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="ListUser">
                <UserTable
                  data={userData || { results: [] }}
                  isError={isError}
                  isLoading={isLoading}
                />
              </Tabs.Panel>
              <Tabs.Panel value="ListRole">
                <ListRole />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Container>
    </SettingMenuLayout>
  );
};

export default UserManagement;
