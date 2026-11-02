import { SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconShieldLock, IconUserCog, IconUsers } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { useUsers } from '@/module/user-management/presentation/hooks/useUsers';
import { InfoCard } from './InfoCard';

const visual = (StatIcon: Icon, color: string) => (
  <ThemeIcon size={44} radius="md" variant="light" color={color}>
    <StatIcon size={22} stroke={1.7} />
  </ThemeIcon>
);

/** At-a-glance counts shown above the tabs. */
export default function OverviewStats() {
  const { t } = useTranslation('userManagement');
  const users = useUsers({ page: 1, limit: 10 });
  const roles = useRoles();
  const all = roles.data ?? [];

  return (
    <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
      <InfoCard
        label={t('overview.users')}
        value={users.data?.totalResults ?? '—'}
        loading={users.isLoading}
        visual={visual(IconUsers, 'primary')}
      />
      <InfoCard
        label={t('overview.roles')}
        value={roles.data ? all.length : '—'}
        loading={roles.isLoading}
        visual={visual(IconShieldLock, 'teal')}
      />
      <InfoCard
        label={t('overview.customRoles')}
        value={roles.data ? all.filter((role) => !role.isDefault).length : '—'}
        loading={roles.isLoading}
        visual={visual(IconUserCog, 'orange')}
      />
    </SimpleGrid>
  );
}
