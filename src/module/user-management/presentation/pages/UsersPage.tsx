import { Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { SettingsLayout } from '@/module/settings';
import RoleOverviewStrip from '@/module/user-management/presentation/components/RoleOverviewStrip';
import UserDirectory from '@/module/user-management/presentation/components/UserDirectory';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';

/** Settings > Users & Access > Users: who can sign in, the role cards and the people table. */
export default function UsersPage() {
  const { t } = useTranslation('settings');
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { canUsers } = useMyGrants();

  return (
    <SettingsLayout
      title={t('item.users')}
      description={t('description.users')}
      action={
        canUsers('create') ? (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.userManagement.addUser)}
          >
            {tu('users.add')}
          </Button>
        ) : undefined
      }
    >
      <Stack gap="lg">
        <RoleOverviewStrip />
        <UserDirectory />
      </Stack>
    </SettingsLayout>
  );
}
