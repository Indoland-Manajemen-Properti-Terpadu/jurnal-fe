import { useState } from 'react';
import { ActionIcon, Badge, Group, Menu, Stack, Table, Text, VisuallyHidden } from '@mantine/core';
import { IconDots, IconEdit, IconEye, IconLock, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import { grantedMenus } from '@/module/user-management/domain/rolePermissions';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useDeleteRole } from '@/module/user-management/presentation/hooks/useRoleMutations';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { isForbidden } from '@/module/user-management/infrastructure/apiError';
import { DeleteRoleModal } from './DeleteRoleModal';
import { pillProps } from './pillProps';
import { TableBody } from './TableBody';

const COLUMNS = 4;

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

  const renderRow = (role: AccessRole) => {
    const count = grantedMenus(role.permissions).length;
    return (
      <Table.Tr key={role.id}>
        <Table.Td>
          <Group gap={6} wrap="nowrap">
            {role.isDefault && <IconLock size={14} aria-hidden="true" />}
            <Text fw={500} size="sm">
              {role.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td visibleFrom="sm">
          <Text size="sm" c="dimmed" lineClamp={2} style={{ whiteSpace: 'pre-line' }}>
            {role.description.split('\n')[0] || t('roles.noDescription')}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={count > 0 ? 'primary' : 'gray'} {...pillProps}>
            {count > 0 ? t('roles.access', { count }) : t('roles.accessNone')}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Menu position="bottom-end" shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={t('roles.actionsLabel', { name: role.name })}
              >
                <IconDots size={18} />
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
        </Table.Td>
      </Table.Tr>
    );
  };

  const sectionRow = (key: string, label: string, hint?: string) => (
    <Table.Tr key={key} bg="var(--mantine-color-gray-0)">
      <Table.Td colSpan={COLUMNS}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          {label}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={440}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('roles.column.name')}</Table.Th>
              <Table.Th visibleFrom="sm">{t('roles.column.description')}</Table.Th>
              <Table.Th>{t('roles.column.access')}</Table.Th>
              <Table.Th w={56}>
                <VisuallyHidden>{t('roles.column.actions')}</VisuallyHidden>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <TableBody
            colSpan={COLUMNS}
            isLoading={roles.isLoading}
            isError={roles.isError}
            isForbidden={isForbidden(roles.error)}
            isEmpty={all.length === 0}
            onRetry={() => roles.refetch()}
            empty={{
              title: t('roles.customEmpty.title'),
              description: t('roles.customEmpty.description'),
            }}
          >
            {sectionRow('custom', t('roles.sectionCustom'))}
            {custom.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS}>
                  <Text size="sm" fw={600} ta="center" pt="sm">
                    {t('roles.customEmpty.title')}
                  </Text>
                  <Text size="sm" c="dimmed" ta="center" pb="sm">
                    {t('roles.customEmpty.description')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              custom.map(renderRow)
            )}
            <>
              {sectionRow('default', t('roles.sectionDefault'), t('roles.sectionDefaultHint'))}
              {builtIn.map(renderRow)}
            </>
          </TableBody>
        </Table>
      </Table.ScrollContainer>

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
