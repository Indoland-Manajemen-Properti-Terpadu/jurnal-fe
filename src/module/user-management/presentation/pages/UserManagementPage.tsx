import { useState } from 'react';
import { Button, Paper, Tabs } from '@mantine/core';
import { IconHistory, IconPlus, IconShieldLock, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { SettingsLayout } from '@/module/settings';
import HistoryTab from '@/module/user-management/presentation/components/HistoryTab';
import RolesTab from '@/module/user-management/presentation/components/RolesTab';
import UsersTab from '@/module/user-management/presentation/components/UsersTab';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';

type TabValue = 'users' | 'roles' | 'history';

export default function UserManagementPage() {
  const { t } = useTranslation('settings');
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { canUsers, canRoles } = useMyGrants();
  const [tab, setTab] = useState<TabValue>('users');

  // One main action at a time: the one that belongs to the tab being looked at.
  let action = null;
  if (tab === 'users' && canUsers('create')) {
    action = (
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate(routes.userManagement.addUser)}
      >
        {tu('users.add')}
      </Button>
    );
  } else if (tab === 'roles' && canRoles('create')) {
    action = (
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate(routes.userManagement.addRole)}
      >
        {tu('roles.add')}
      </Button>
    );
  }

  return (
    <SettingsLayout title={t('item.users')} description={t('description.users')} action={action}>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Tabs
          value={tab}
          onChange={(value) => setTab((value as TabValue | null) ?? 'users')}
          color="primary"
          variant="pills"
          radius="md"
          keepMounted={false}
        >
          <Tabs.List mb="md">
            <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
              {tu('tab.users')}
            </Tabs.Tab>
            <Tabs.Tab value="roles" leftSection={<IconShieldLock size={16} />}>
              {tu('tab.roles')}
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
              {tu('tab.history')}
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="users">
            <UsersTab />
          </Tabs.Panel>
          <Tabs.Panel value="roles">
            <RolesTab />
          </Tabs.Panel>
          <Tabs.Panel value="history">
            <HistoryTab />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </SettingsLayout>
  );
}
