import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconEdit,
  IconPlus,
  IconSearch,
  IconUsersGroup,
  IconTrash,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import type { Department } from '@/module/settings/domain/department';
import type { DepartmentPage } from '@/module/settings/infrastructure/departmentApi';

type Props = {
  data?: DepartmentPage;
  loading: boolean;
  failed: boolean;
  hasFilters: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  /** Id of the department whose status is being changed. */
  statusPendingId?: string;
  onRetry: () => void;
  onResetFilters: () => void;
  onAddNew: () => void;
  onPageChange: (page: number) => void;
  onEdit: (department: Department) => void;
  onToggleStatus: (department: Department) => void;
  onDelete: (department: Department) => void;
};

const SKELETON_ROWS = 5;

const header = (label: string, center?: boolean) => (
  <Table.Th ta={center ? 'center' : undefined} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

/** The department table with its loading, empty, error and page footer states. */
export function DepartmentTable({
  data,
  loading,
  failed,
  hasFilters,
  canCreate,
  canUpdate,
  canDelete,
  statusPendingId,
  onRetry,
  onResetFilters,
  onAddNew,
  onPageChange,
  onEdit,
  onToggleStatus,
  onDelete,
}: Readonly<Props>) {
  const { t: st } = useTranslation('settings');
  const items = data?.items ?? [];
  const columnCount = 5;

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={columnCount}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }
    if (failed && items.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columnCount}>
            <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
              <Group justify="space-between" wrap="wrap" gap="sm">
                <Text size="sm">{st('department.loadError')}</Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  {st('department.retry')}
                </Button>
              </Group>
            </Alert>
          </Table.Td>
        </Table.Tr>
      );
    }
    if (items.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columnCount} p={0}>
            {hasFilters ? (
              <EmptyState
                title={st('department.noResultsTitle')}
                description={st('department.noResultsDescription')}
                icon={<IconSearch size={36} stroke={1.5} />}
                actionLabel={st('department.resetFilter')}
                onAction={onResetFilters}
                py={48}
              />
            ) : (
              <EmptyState
                title={st('department.emptyTitle')}
                description={st('department.emptyDescription')}
                icon={<IconUsersGroup size={36} stroke={1.5} />}
                actionLabel={canCreate ? st('department.createFirst') : undefined}
                actionIcon={<IconPlus size={14} />}
                onAction={canCreate ? onAddNew : undefined}
                py={48}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }
    return items.map((department) => (
      <Table.Tr key={department.id}>
        <Table.Td>
          <Text fw={600} size="sm" c="dark.8">
            {department.name}
          </Text>
        </Table.Td>
        <Table.Td style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm" c={department.code ? undefined : 'dimmed'}>
            {department.code || st('department.none')}
          </Text>
        </Table.Td>
        <Table.Td maw={360}>
          <Text size="sm" c={department.description ? undefined : 'dimmed'} lineClamp={2}>
            {department.description || st('department.none')}
          </Text>
        </Table.Td>
        <Table.Td>
          <Stack gap={4} align="flex-start">
            <Switch
              size="sm"
              checked={department.isActive}
              disabled={!canUpdate || statusPendingId === department.id}
              aria-label={st('department.switchStatus', { name: department.name })}
              onChange={() => onToggleStatus(department)}
            />
            {!department.isActive && (
              <Badge variant="light" color="gray" size="sm">
                {st('department.status.inactive')}
              </Badge>
            )}
          </Stack>
        </Table.Td>
        <Table.Td>
          <Group gap={4} justify="center" wrap="nowrap">
            {canUpdate && (
              <Tooltip label={st('department.edit', { name: department.name })}>
                <ActionIcon
                  variant="subtle"
                  color="primary"
                  aria-label={st('department.edit', { name: department.name })}
                  onClick={() => onEdit(department)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip label={st('department.delete', { name: department.name })}>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  aria-label={st('department.delete', { name: department.name })}
                  onClick={() => onDelete(department)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    ));
  };

  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  return (
    <Stack gap="md">
      <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={640}>
          <Table verticalSpacing="sm" horizontalSpacing="sm" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {header(st('department.colName'))}
                {header(st('department.colCode'))}
                {header(st('department.colDescription'))}
                {header(st('department.colStatus'))}
                {header(st('common.actions'), true)}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderBody()}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
      {totalPages > 1 && (
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            {st('department.total', { count: data?.totalResults ?? 0 })}
          </Text>
          <Pagination
            total={totalPages}
            value={data?.page ?? 1}
            onChange={onPageChange}
            size="sm"
            radius="md"
          />
        </Group>
      )}
    </Stack>
  );
}

export default DepartmentTable;
