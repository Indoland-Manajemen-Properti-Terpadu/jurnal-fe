import { Fragment, useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Collapse,
  Group,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  VisuallyHidden,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  AUDIT_ACTIONS,
  isKnownAction,
  type AuditAction,
  type AuditFilters,
  type AuditTargetType,
} from '@/module/user-management/domain/auditLog';
import { flattenMenus } from '@/module/user-management/domain/rolePermissions';
import { useAuditLog } from '@/module/user-management/presentation/hooks/useAuditLog';
import { useRoleMenus } from '@/module/user-management/presentation/hooks/useRoleMenus';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import { isForbidden } from '@/module/user-management/infrastructure/apiError';
import { AuditDetail } from './AuditDetail';
import { formatDateTime } from './formatters';
import { TableBody } from './TableBody';

const COLUMNS = 5;
const ALL = 'all';

export default function HistoryTab() {
  const { t } = useTranslation('userManagement');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [open, setOpen] = useState<string | null>(null);

  const log = useAuditLog(page, filters);
  const menus = useRoleMenus();
  const roles = useRoles();

  const menuNames = useMemo(
    () => new Map(flattenMenus(menus.data ?? []).map((menu) => [menu.menuId, menu.name])),
    [menus.data]
  );
  const roleNames = useMemo(
    () => new Map((roles.data ?? []).map((role) => [role.id, role.name])),
    [roles.data]
  );
  const lookups = {
    menuName: (menuId: string) => menuNames.get(menuId) ?? menuId,
    roleName: (roleId: string) => roleNames.get(roleId) ?? t('common.unnamed'),
  };

  const update = (next: AuditFilters) => {
    setFilters(next);
    setPage(1);
    setOpen(null);
  };

  const results = log.data?.results ?? [];
  const filtered = Boolean(filters.action || filters.targetType);
  const actionLabel = (action: string) =>
    t(`history.action.${isKnownAction(action) ? action : 'unknown'}`);

  return (
    <Stack gap="md">
      <Group gap="md" align="flex-end">
        <Select
          label={t('history.filterType')}
          value={filters.targetType ?? ALL}
          allowDeselect={false}
          data={[
            { value: ALL, label: t('history.all') },
            { value: 'User', label: t('history.type.User') },
            { value: 'AccessRole', label: t('history.type.AccessRole') },
          ]}
          onChange={(value) =>
            update({
              ...filters,
              targetType: value === ALL ? undefined : (value as AuditTargetType),
            })
          }
        />
        <Select
          label={t('history.filterAction')}
          value={filters.action ?? ALL}
          allowDeselect={false}
          data={[
            { value: ALL, label: t('history.all') },
            ...AUDIT_ACTIONS.map((action) => ({
              value: action,
              label: t(`history.action.${action}`),
            })),
          ]}
          onChange={(value) =>
            update({ ...filters, action: value === ALL ? undefined : (value as AuditAction) })
          }
        />
      </Group>

      <Table.ScrollContainer minWidth={480}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={44}>
                <VisuallyHidden>{t('history.column.what')}</VisuallyHidden>
              </Table.Th>
              <Table.Th>{t('history.column.when')}</Table.Th>
              <Table.Th>{t('history.column.what')}</Table.Th>
              <Table.Th visibleFrom="sm">{t('history.column.target')}</Table.Th>
              <Table.Th visibleFrom="md">{t('history.column.who')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <TableBody
            colSpan={COLUMNS}
            isLoading={log.isLoading}
            isError={log.isError}
            isForbidden={isForbidden(log.error)}
            isEmpty={results.length === 0}
            onRetry={() => log.refetch()}
            empty={
              filtered
                ? {
                    title: t('history.emptyFiltered.title'),
                    description: t('history.emptyFiltered.description'),
                    actionLabel: t('history.emptyFiltered.reset'),
                    onAction: () => update({}),
                  }
                : { title: t('history.empty.title'), description: t('history.empty.description') }
            }
          >
            {results.map((entry) => {
              const expanded = open === entry.id;
              const name = entry.targetName || t('common.unnamed');
              return (
                <Fragment key={entry.id}>
                  <Table.Tr>
                    <Table.Td>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-expanded={expanded}
                        aria-label={t(expanded ? 'history.hideDetail' : 'history.showDetail', {
                          name,
                        })}
                        onClick={() => setOpen(expanded ? null : entry.id)}
                      >
                        {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                      </ActionIcon>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDateTime(entry.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {actionLabel(entry.action)}
                      </Text>
                      <Text size="xs" c="dimmed" hiddenFrom="sm">
                        {name}
                      </Text>
                    </Table.Td>
                    <Table.Td visibleFrom="sm">
                      <Text size="sm">{name}</Text>
                    </Table.Td>
                    <Table.Td visibleFrom="md">
                      <Text size="sm">{entry.actorName}</Text>
                    </Table.Td>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Td
                      colSpan={COLUMNS}
                      p={0}
                      style={{ borderBottom: expanded ? undefined : 0 }}
                    >
                      <Collapse in={expanded}>
                        <Box p="md" bg="var(--mantine-color-gray-0)">
                          <AuditDetail entry={entry} lookups={lookups} />
                          {entry.action === 'USER_PASSWORD_CHANGE' && (
                            <Text size="xs" c="dimmed" mt="xs">
                              {t('history.passwordNote')}
                            </Text>
                          )}
                        </Box>
                      </Collapse>
                    </Table.Td>
                  </Table.Tr>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Table.ScrollContainer>

      {(log.data?.totalPages ?? 1) > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('history.pagination', { page, total: log.data?.totalPages ?? 1 })}
          </Text>
          <Pagination
            total={log.data?.totalPages ?? 1}
            value={page}
            onChange={(next) => {
              setPage(next);
              setOpen(null);
            }}
            size="sm"
            color="primary"
          />
        </Group>
      )}
    </Stack>
  );
}
