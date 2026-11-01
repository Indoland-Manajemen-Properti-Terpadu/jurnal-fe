import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Pagination,
  Stack,
  Table,
  Text,
  VisuallyHidden,
} from '@mantine/core';
import { IconDots, IconEdit, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { deactivateBlockReason } from '@/module/user-management/domain/userRules';
import type { ManagedUser } from '@/module/user-management/domain/userTypes';
import { useMyGrants, useMyId } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { useSetUserActive } from '@/module/user-management/presentation/hooks/useUserMutations';
import { useUsers } from '@/module/user-management/presentation/hooks/useUsers';
import { isForbidden } from '@/module/user-management/infrastructure/apiError';
import { DeactivateUserModal } from './DeactivateUserModal';
import { formatDay } from './formatters';
import { pillProps } from './pillProps';
import { StatusBadge } from './StatusBadge';
import { TableBody } from './TableBody';

const PAGE_SIZE = 10;
const SITE_USERS_LIMIT = 100;
const MAX_VISIBLE_ROLES = 2;

export default function UsersTab() {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<ManagedUser | null>(null);

  const users = useUsers({ page, limit: PAGE_SIZE });
  const roles = useRoles();
  const { canUsers } = useMyGrants();
  const { data: myId } = useMyId();
  // Used only to tell whether a user is the last active Super Admin; the API stays the final judge.
  const siteUsers = useUsers({ page: 1, limit: SITE_USERS_LIMIT }, { enabled: pending !== null });
  const setActive = useSetUserActive(() => setPending(null));

  const roleName = useMemo(
    () => new Map((roles.data ?? []).map((role) => [role.id, role.name])),
    [roles.data]
  );

  const blocked = pending
    ? deactivateBlockReason({
        user: pending,
        currentUserId: myId,
        roles: roles.data ?? [],
        siteUsers: siteUsers.data?.results ?? [],
      })
    : null;

  const results = users.data?.results ?? [];
  const total = users.data?.totalResults ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const canCreate = canUsers('create');

  const toggle = (user: ManagedUser) => {
    if (user.isActive) {
      setPending(user);
    } else {
      setActive.mutate({ user, isActive: true });
    }
  };

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={480}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('users.column.name')}</Table.Th>
              <Table.Th>{t('users.column.roles')}</Table.Th>
              <Table.Th>{t('users.column.status')}</Table.Th>
              <Table.Th visibleFrom="xl">{t('users.column.created')}</Table.Th>
              <Table.Th w={56}>
                <VisuallyHidden>{t('users.column.actions')}</VisuallyHidden>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <TableBody
            colSpan={5}
            isLoading={users.isLoading}
            isError={users.isError}
            isForbidden={isForbidden(users.error)}
            isEmpty={results.length === 0}
            onRetry={() => users.refetch()}
            empty={{
              title: t('users.empty.title'),
              description: t('users.empty.description'),
              actionLabel: canCreate ? t('users.add') : undefined,
              onAction: canCreate ? () => navigate(routes.userManagement.addUser) : undefined,
            }}
          >
            {results.map((user) => {
              const names = user.accessRoleIds.map((id) => roleName.get(id) ?? '').filter(Boolean);
              return (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">
                      {user.name || t('common.unnamed')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {user.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {names.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        {t('users.noRole')}
                      </Text>
                    ) : (
                      <Group gap={4}>
                        {names.slice(0, MAX_VISIBLE_ROLES).map((name) => (
                          <Badge key={name} variant="light" color="primary" {...pillProps}>
                            {name}
                          </Badge>
                        ))}
                        {names.length > MAX_VISIBLE_ROLES && (
                          <Text size="xs" c="dimmed">
                            {t('users.moreRoles', { count: names.length - MAX_VISIBLE_ROLES })}
                          </Text>
                        )}
                      </Group>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge active={user.isActive} />
                  </Table.Td>
                  <Table.Td visibleFrom="xl">
                    <Text size="sm">{formatDay(user.createdAt)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {canUsers('update') && (
                      <Menu position="bottom-end" shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            aria-label={t('users.actionsLabel', { name: user.name || user.email })}
                          >
                            <IconDots size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={16} />}
                            onClick={() =>
                              navigate(routes.userManagement.editUser.replace(':userId', user.id), {
                                state: { user },
                              })
                            }
                          >
                            {t('users.menu.edit')}
                          </Menu.Item>
                          <Menu.Item
                            leftSection={
                              user.isActive ? (
                                <IconPlayerPause size={16} />
                              ) : (
                                <IconPlayerPlay size={16} />
                              )
                            }
                            onClick={() => toggle(user)}
                          >
                            {user.isActive ? t('users.menu.deactivate') : t('users.menu.activate')}
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </TableBody>
        </Table>
      </Table.ScrollContainer>

      {total > 0 && (
        <Group justify="space-between" wrap="wrap">
          <Text size="sm" c="dimmed">
            {t('users.pagination', { from, to, total })}
          </Text>
          <Pagination
            total={users.data?.totalPages ?? 1}
            value={page}
            onChange={setPage}
            size="sm"
            color="primary"
          />
        </Group>
      )}

      <DeactivateUserModal
        opened={pending !== null}
        name={pending?.name || pending?.email || ''}
        blocked={blocked}
        isPending={setActive.isPending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && setActive.mutate({ user: pending, isActive: false })}
      />
    </Stack>
  );
}
