import {
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { roleCounts } from '@/module/user-management/domain/userDirectory';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { useUsers } from '@/module/user-management/presentation/hooks/useUsers';
import { SITE_USERS_LIMIT, initialsOf } from './directory';
import { pillProps } from './pillProps';
import { StatusBadge } from './StatusBadge';

const SHOWN_ROLES = 3;
const SHOWN_MEMBERS = 3;

/** The roles in use with the people who hold them, so access can be read at a glance. */
export default function RoleOverviewStrip() {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { canRoles } = useMyGrants();
  const users = useUsers({ page: 1, limit: SITE_USERS_LIMIT });
  const roles = useRoles();

  if (users.isLoading || roles.isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} height={210} radius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  const everyone = users.data?.results ?? [];
  const top = roleCounts(everyone, roles.data ?? []).slice(0, SHOWN_ROLES);
  if (top.length === 0) return null;
  const canOpenRoles = canRoles('read');
  const openRole = (id: string) => navigate(routes.userManagement.roleDetail.replace(':id', id));

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <div>
          <Text fw={600} fz={15}>
            {t('strip.title')}
          </Text>
          <Text fz={12} c="dimmed">
            {t('strip.subtitle')}
          </Text>
        </div>
        {canOpenRoles && (
          <Button variant="default" size="xs" onClick={() => navigate(routes.userManagement.roles)}>
            {t('strip.viewAll')}
          </Button>
        )}
      </Group>
      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
        {top.map((entry) => {
          const members = everyone.filter((user) => user.accessRoleIds.includes(entry.roleId));
          return (
            <Paper key={entry.roleId} withBorder radius="lg" p="md" bg="white">
              <Stack gap="sm" h="100%" justify="space-between">
                <Stack gap="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={600} truncate>
                      {entry.name}
                    </Text>
                    <Badge variant="light" color="gray" {...pillProps}>
                      {t('strip.members', { count: entry.count })}
                    </Badge>
                  </Group>
                  <Stack gap="xs">
                    {members.slice(0, SHOWN_MEMBERS).map((user) => (
                      <Group key={user.id} gap="sm" wrap="nowrap" justify="space-between">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                          <Avatar color="primary" variant="light" radius="xl" size={32}>
                            {initialsOf(user.name || user.email)}
                          </Avatar>
                          <div style={{ minWidth: 0 }}>
                            <Text size="sm" fw={500} truncate>
                              {user.name || t('common.unnamed')}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                              {user.email}
                            </Text>
                          </div>
                        </Group>
                        <StatusBadge active={user.isActive} />
                      </Group>
                    ))}
                    {members.length > SHOWN_MEMBERS && (
                      <Text size="xs" c="dimmed">
                        {t('strip.moreMembers', { count: members.length - SHOWN_MEMBERS })}
                      </Text>
                    )}
                  </Stack>
                </Stack>
                {canOpenRoles && (
                  <Button
                    variant="light"
                    color="gray"
                    fullWidth
                    leftSection={<IconSettings size={16} />}
                    onClick={() => openRole(entry.roleId)}
                  >
                    {t('strip.manage')}
                  </Button>
                )}
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
