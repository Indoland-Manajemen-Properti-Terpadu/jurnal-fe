import { useState } from 'react';
import { Button, Group, Paper, Tabs } from '@mantine/core';
import { IconCards, IconPlus, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { SettingsLayout } from '@/module/settings';
import { useGetAllUser } from '@/module/user-management/infrastructure/User.service';
import UserTable from '@/module/user-management/presentation/components/user-table/UserTable';
import ListRole from '@/module/user-management/presentation/components/roles/ListRole';

export default function UserManagementPage() {
  const { t } = useTranslation('settings');
  const { data: userData, isError, isLoading } = useGetAllUser();
  const [activeTab, setActiveTab] = useState<string | null>('users');
  const navigate = useNavigate();

  return (
    <SettingsLayout
      title={t('item.users')}
      description={t('description.users')}
      action={
        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.userManagement.addRole)}
          >
            {t('addRole')}
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.userManagement.addUser)}
          >
            {t('addUser')}
          </Button>
        </Group>
      }
    >
      <Paper withBorder radius="lg" p="md">
        <Tabs value={activeTab} onChange={setActiveTab} color="primary" variant="pills" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              {t('usersTab')}
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconCards size={16} />}>
              {t('rolesTab')}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="users">
            <UserTable data={userData || { results: [] }} isError={isError} isLoading={isLoading} />
          </Tabs.Panel>
          <Tabs.Panel value="roles">
            <ListRole />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </SettingsLayout>
  );
}
