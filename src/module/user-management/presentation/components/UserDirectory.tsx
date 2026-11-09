import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Menu,
  Pagination,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  VisuallyHidden,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconPlayerPause,
  IconPlayerPlay,
  IconSearch,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { deactivateBlockReason } from '@/module/user-management/domain/userRules';
import {
  accessLevelOf,
  filterUsers,
  pageOf,
  roleCounts,
} from '@/module/user-management/domain/userDirectory';
import type { ManagedUser } from '@/module/user-management/domain/userTypes';
import { useMyGrants, useMyId } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { useSetUserActive } from '@/module/user-management/presentation/hooks/useUserMutations';
import { useUsers } from '@/module/user-management/presentation/hooks/useUsers';
import { isForbidden } from '@/module/user-management/infrastructure/apiError';
import { AccessLevelBadge } from './AccessLevelBadge';
import { DeactivateUserModal } from './DeactivateUserModal';
import { SITE_USERS_LIMIT, initialsOf } from './directory';
import { formatDay } from './formatters';
import { pillProps } from './pillProps';
import { StatusBadge } from './StatusBadge';
import { TableBody } from './TableBody';

const PAGE_SIZE = 10;
const MAX_VISIBLE_ROLES = 2;
const ALL_TAB = 'all';

/** The people of the site: a tab per role in use, a search box and the table. */
export default function UserDirectory() {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [roleId, setRoleId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<ManagedUser | null>(null);

  const users = useUsers({ page: 1, limit: SITE_USERS_LIMIT });
  const roles = useRoles();
  const { canUsers } = useMyGrants();
  const { data: myId } = useMyId();
  const setActive = useSetUserActive(() => setPending(null));

  const everyone = useMemo(() => users.data?.results ?? [], [users.data]);
  const allRoles = useMemo(() => roles.data ?? [], [roles.data]);
  const roleName = useMemo(() => new Map(allRoles.map((role) => [role.id, role.name])), [allRoles]);
  const tabs = useMemo(() => roleCounts(everyone, allRoles), [everyone, allRoles]);
  const filtered = useMemo(
    () => filterUsers(everyone, { roleId, query }),
    [everyone, roleId, query]
  );
  const results = pageOf(filtered, page, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const total = users.data?.totalResults ?? 0;
  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, filtered.length);
  const canCreate = canUsers('create');
  const isFiltered = roleId !== null || query.trim() !== '';

  // The list already holds the whole site, so it also tells whether this is the last active Super Admin;
  // the API stays the final judge.
  const blocked = pending
    ? deactivateBlockReason({
        user: pending,
        currentUserId: myId,
        roles: allRoles,
        siteUsers: everyone,
      })
    : null;

  const resetFilters = () => {
    setRoleId(null);
    setQuery('');
    setPage(1);
  };

  const toggle = (user: ManagedUser) => {
    if (user.isActive) {
      setPending(user);
    } else {
      setActive.mutate({ user, isActive: true });
    }
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white">
      <Stack gap="md">
        <Tabs
          value={roleId ?? ALL_TAB}
          onChange={(value) => {
            setRoleId(value === ALL_TAB ? null : value);
            setPage(1);
          }}
          color="primary"
          variant="pills"
          radius="md"
        >
          <ScrollArea type="never">
            <Tabs.List style={{ flexWrap: 'nowrap' }}>
              <Tabs.Tab value={ALL_TAB}>{t('users.tabAll', { count: everyone.length })}</Tabs.Tab>
              {tabs.map((entry) => (
                <Tabs.Tab key={entry.roleId} value={entry.roleId}>
                  {entry.name} ({entry.count})
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>
        </Tabs>

        <TextInput
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setPage(1);
          }}
          placeholder={t('users.search')}
          aria-label={t('users.search')}
          leftSection={<IconSearch size={16} />}
          maw={420}
        />

        <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={560}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th>{t('users.column.name')}</Table.Th>
                  <Table.Th>{t('users.column.roles')}</Table.Th>
                  <Table.Th visibleFrom="sm">{t('users.column.access')}</Table.Th>
                  <Table.Th>{t('users.column.status')}</Table.Th>
                  <Table.Th visibleFrom="md">{t('users.column.created')}</Table.Th>
                  <Table.Th w={56}>
                    <VisuallyHidden>{t('users.column.actions')}</VisuallyHidden>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <TableBody
                colSpan={6}
                isLoading={users.isLoading}
                isError={users.isError}
                isForbidden={isForbidden(users.error)}
                isEmpty={results.length === 0}
                onRetry={() => users.refetch()}
                empty={
                  isFiltered
                    ? {
                        title: t('users.noMatch.title'),
                        description: t('users.noMatch.description'),
                        actionLabel: t('users.noMatch.reset'),
                        onAction: resetFilters,
                      }
                    : {
                        title: t('users.empty.title'),
                        description: t('users.empty.description'),
                        actionLabel: canCreate ? t('users.add') : undefined,
                        onAction: canCreate
                          ? () => navigate(routes.userManagement.addUser)
                          : undefined,
                      }
                }
              >
                {results.map((user) => {
                  const names = user.accessRoleIds
                    .map((id) => roleName.get(id) ?? '')
                    .filter(Boolean);
                  return (
                    <Table.Tr key={user.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar color="primary" variant="light" radius="xl" size={38}>
                            {initialsOf(user.name || user.email)}
                          </Avatar>
                          <div style={{ minWidth: 0 }}>
                            <Text fw={600} size="sm" truncate>
                              {user.name || t('common.unnamed')}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                              {user.email}
                            </Text>
                          </div>
                        </Group>
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
                      <Table.Td visibleFrom="sm">
                        <AccessLevelBadge level={accessLevelOf(user, allRoles)} />
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge active={user.isActive} />
                      </Table.Td>
                      <Table.Td visibleFrom="md">
                        <Text size="sm">{formatDay(user.createdAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        {canUsers('update') && (
                          <Menu position="bottom-end" shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                aria-label={t('users.actionsLabel', {
                                  name: user.name || user.email,
                                })}
                              >
                                <IconDots size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={16} />}
                                onClick={() =>
                                  navigate(
                                    routes.userManagement.editUser.replace(':userId', user.id),
                                    {
                                      state: { user },
                                    }
                                  )
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
                                {user.isActive
                                  ? t('users.menu.deactivate')
                                  : t('users.menu.activate')}
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
        </Paper>

        {filtered.length > 0 && (
          <Group justify="space-between" wrap="wrap">
            <Text size="xs" c="dimmed">
              {t('users.pagination', { from, to, total: filtered.length })}
            </Text>
            <Pagination
              total={totalPages}
              value={Math.min(page, totalPages)}
              onChange={setPage}
              size="sm"
              color="primary"
            />
          </Group>
        )}

        {total > everyone.length && (
          <Text size="xs" c="dimmed">
            {t('users.truncated', { shown: everyone.length, total })}
          </Text>
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
    </Paper>
  );
}
