import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { SettingsLayout } from '@/module/settings';
import RoleList from '@/module/user-management/presentation/components/RoleList';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';

/** Settings > Users & Access > Roles & Permissions: built-in and custom roles. */
export default function RolesPage() {
  const { t } = useTranslation('settings');
  const { t: tu } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { canRoles } = useMyGrants();

  return (
    <SettingsLayout
      title={t('item.roles')}
      description={t('description.roles')}
      action={
        canRoles('create') ? (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.userManagement.addRole)}
          >
            {tu('roles.add')}
          </Button>
        ) : undefined
      }
    >
      <RoleList />
    </SettingsLayout>
  );
}
