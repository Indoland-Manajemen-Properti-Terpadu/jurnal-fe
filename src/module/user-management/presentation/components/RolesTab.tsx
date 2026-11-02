import { useState } from 'react';
import {
  ActionIcon,
  Menu,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconEye,
  IconLock,
  IconShieldCheck,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import { grantedMenus } from '@/module/user-management/domain/rolePermissions';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useDeleteRole } from '@/module/user-management/presentation/hooks/useRoleMutations';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { isForbidden } from '@/module/user-management/infrastructure/apiError';
import { DeleteRoleModal } from './DeleteRoleModal';
import { InfoCard } from './InfoCard';

const roleRoute = (path: string, id: string) => path.replace(':id', id);

export default function RolesTab() {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const roles = useRoles();
  const { canRoles } = useMyGrants();
  const [pending, setPending] = useState<AccessRole | null>(null);
  const remove = useDeleteRole(() => setPending(null));

  const all = roles.data ?? [];
  const builtIn = all.filter((role) => role.isDefault);
  const custom = all.filter((role) => !role.isDefault);

  const renderCard = (role: AccessRole) => {
    const count = grantedMenus(role.permissions).length;
    return (
      <InfoCard
        key={role.id}
        interactive
        label={count > 0 ? t('roles.access', { count }) : t('roles.accessNone')}
        value={role.name}
        hint={role.description.split('\n')[0] || t('roles.noDescription')}
        visual={
          <ThemeIcon
            size={44}
            radius="md"
            variant="light"
            color={role.isDefault ? 'gray' : 'primary'}
          >
            {role.isDefault ? <IconLock size={22} /> : <IconShieldCheck size={22} />}
          </ThemeIcon>
        }
        action={
          <Menu position="bottom-end" shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={t('roles.actionsLabel', { name: role.name })}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEye size={16} />}
                onClick={() => navigate(roleRoute(routes.userManagement.roleDetail, role.id))}
              >
                {t('roles.menu.view')}
              </Menu.Item>
              {!role.isDefault && canRoles('update') && (
                <Menu.Item
                  leftSection={<IconEdit size={16} />}
                  onClick={() => navigate(roleRoute(routes.userManagement.editRole, role.id))}
                >
                  {t('roles.menu.edit')}
                </Menu.Item>
              )}
              {!role.isDefault && canRoles('delete') && (
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setPending(role)}
                >
                  {t('roles.menu.delete')}
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        }
      />
    );
  };

  const section = (label: string, hint: string | undefined, children: React.ReactNode) => (
    <Stack gap="sm">
      <div>
        <Text size="xs" fw={700} tt="uppercase" lts="0.06em" c="dimmed">
          {label}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </div>
      {children}
    </Stack>
  );

  const grid = (items: React.ReactNode) => (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
      {items}
    </SimpleGrid>
  );

  if (roles.isLoading) {
    return grid([0, 1, 2].map((key) => <Skeleton key={key} height={104} radius="lg" />));
  }

  if (roles.isError) {
    const denied = isForbidden(roles.error);
    return denied ? (
      <EmptyState
        title={t('common.noAccess')}
        description={t('common.noAccessHint')}
        icon={<IconLock size={32} stroke={1.6} />}
      />
    ) : (
      <EmptyState
        title={t('common.loadFailed')}
        description=""
        actionLabel={t('common.retry')}
        onAction={() => roles.refetch()}
        color="red"
      />
    );
  }

  return (
    <Stack gap="xl">
      {section(
        t('roles.sectionCustom'),
        undefined,
        custom.length === 0 ? (
          <Paper withBorder radius="lg" p="xl" bg="gray.0" style={{ borderStyle: 'dashed' }}>
            <Text size="sm" fw={600} ta="center">
              {t('roles.customEmpty.title')}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              {t('roles.customEmpty.description')}
            </Text>
          </Paper>
        ) : (
          grid(custom.map(renderCard))
        )
      )}
      {section(
        t('roles.sectionDefault'),
        t('roles.sectionDefaultHint'),
        grid(builtIn.map(renderCard))
      )}

      <DeleteRoleModal
        opened={pending !== null}
        name={pending?.name ?? ''}
        isPending={remove.isPending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && remove.mutate(pending)}
      />
    </Stack>
  );
}
