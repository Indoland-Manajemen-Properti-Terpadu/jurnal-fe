import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Menu,
  Pagination,
  Skeleton,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconBuildingWarehouse,
  IconDots,
  IconEdit,
  IconPlayerPlay,
  IconPlayerPause,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import type { Warehouse } from '@/module/inventory/domain/warehouse';
import type { MenuRights } from '@/module/inventory/infrastructure/inventoryRightsApi';
import type { WarehousePage } from '@/module/inventory/infrastructure/warehouseApi';
import { routes } from '@/router/routes';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

type Props = {
  data?: WarehousePage;
  loading: boolean;
  failed: boolean;
  hasFilters: boolean;
  rights: MenuRights;
  /** The id whose action is running, so its menu cannot be fired twice. */
  pendingId?: string;
  onRetry: () => void;
  onResetFilters: () => void;
  onAddNew: () => void;
  onPageChange: (page: number) => void;
  onOpen: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onMakeDefault: (warehouse: Warehouse) => void;
  onDeactivate: (warehouse: Warehouse) => void;
  onActivate: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
};

const SKELETON_ROWS = 5;

const header = (label: string, align?: 'right' | 'center') => (
  <Table.Th ta={align} style={{ whiteSpace: 'nowrap' }}>
    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
      {label}
    </Text>
  </Table.Th>
);

/** The warehouse list with its loading, empty, error and page-footer states. */
export function WarehouseTable({
  data,
  loading,
  failed,
  hasFilters,
  rights,
  pendingId,
  onRetry,
  onResetFilters,
  onAddNew,
  onPageChange,
  onOpen,
  onEdit,
  onMakeDefault,
  onDeactivate,
  onActivate,
  onDelete,
}: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const items = data?.items ?? [];
  const showValue =
    data?.summary.inventoryValue !== null && data?.summary.inventoryValue !== undefined;
  const columnCount = showValue ? 8 : 7;

  const renderMenu = (warehouse: Warehouse) => {
    const canEdit = rights.update;
    const canMakeDefault = rights.update && warehouse.isActive && !warehouse.isDefault;
    const canDeactivate = rights.update && warehouse.isActive && !warehouse.isDefault;
    const canActivate = rights.update && !warehouse.isActive;
    const canDelete = rights.delete && warehouse.canDelete && !warehouse.isDefault;
    if (!(canEdit || canMakeDefault || canDeactivate || canActivate || canDelete)) return null;
    return (
      <Menu position="bottom-end" withinPortal shadow="md" radius="md">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            loading={pendingId === warehouse.id}
            aria-label={t('menu.actions', { name: warehouse.name })}
            onClick={(event) => event.stopPropagation()}
          >
            <IconDots size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
          {canEdit && (
            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(warehouse)}>
              {t('menu.edit')}
            </Menu.Item>
          )}
          {canMakeDefault && (
            <Menu.Item
              leftSection={<IconStar size={16} />}
              onClick={() => onMakeDefault(warehouse)}
            >
              {t('menu.makeDefault')}
            </Menu.Item>
          )}
          {canDeactivate && (
            <Menu.Item
              leftSection={<IconPlayerPause size={16} />}
              onClick={() => onDeactivate(warehouse)}
            >
              {t('menu.deactivate')}
            </Menu.Item>
          )}
          {canActivate && (
            <Menu.Item
              leftSection={<IconPlayerPlay size={16} />}
              onClick={() => onActivate(warehouse)}
            >
              {t('menu.activate')}
            </Menu.Item>
          )}
          {canDelete && (
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={() => onDelete(warehouse)}
            >
              {t('menu.delete')}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    );
  };

  const renderRow = (warehouse: Warehouse) => (
    <Table.Tr
      key={warehouse.id}
      style={{ cursor: 'pointer' }}
      onClick={() => onOpen(warehouse)}
      opacity={warehouse.isActive ? 1 : 0.7}
    >
      <Table.Td style={{ whiteSpace: 'nowrap' }}>
        <Text size="sm" fw={500}>
          {warehouse.code}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={600} c="dark.8">
            {warehouse.name}
          </Text>
          {warehouse.isDefault && (
            <Badge variant="light" color="primary" size="sm">
              {t('table.main')}
            </Badge>
          )}
        </Group>
        {warehouse.runningOpname && (
          <Anchor
            component={Link}
            to={routes.inventory.stockTake}
            size="xs"
            c="dimmed"
            onClick={(event) => event.stopPropagation()}
          >
            {t('table.running', { number: warehouse.runningOpname.number })}
          </Anchor>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={warehouse.city ? undefined : 'dimmed'}>
          {warehouse.city || '-'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c={warehouse.picUser ? undefined : 'dimmed'}>
          {warehouse.picUser?.name ?? t('table.unassigned')}
        </Text>
      </Table.Td>
      <Table.Td ta="right">
        <Text size="sm">{numberFormat(warehouse.itemCount)}</Text>
      </Table.Td>
      {showValue && (
        <Table.Td ta="right" style={{ whiteSpace: 'nowrap' }}>
          <Text size="sm">
            {warehouse.inventoryValue === null ? '-' : formatCurrency(warehouse.inventoryValue)}
          </Text>
        </Table.Td>
      )}
      <Table.Td>
        <Badge variant="light" color={warehouse.isActive ? 'green' : 'gray'} size="sm">
          {t(warehouse.isActive ? 'status.active' : 'status.inactive')}
        </Badge>
      </Table.Td>
      <Table.Td ta="center">{renderMenu(warehouse)}</Table.Td>
    </Table.Tr>
  );

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
                <Text size="sm">{t('loadFailed.title')}</Text>
                <Button size="xs" variant="default" onClick={onRetry}>
                  {t('loadFailed.retry')}
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
                title={t('empty.title')}
                description={t('empty.body')}
                icon={<IconSearch size={36} stroke={1.5} />}
                actionLabel={t('empty.reset')}
                onAction={onResetFilters}
                py={48}
              />
            ) : (
              <EmptyState
                title={t('empty.title')}
                description={t('empty.body')}
                icon={<IconBuildingWarehouse size={36} stroke={1.5} />}
                actionLabel={rights.create ? t('add') : undefined}
                actionIcon={<IconPlus size={14} />}
                onAction={rights.create ? onAddNew : undefined}
                py={48}
              />
            )}
          </Table.Td>
        </Table.Tr>
      );
    }
    return items.map(renderRow);
  };

  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const total = data?.totalResults ?? 0;
  const pageNumber = data?.page ?? 1;
  const pageSize = items.length;
  const from = total === 0 ? 0 : (pageNumber - 1) * 10 + 1;
  const to = total === 0 ? 0 : from + pageSize - 1;

  return (
    <Stack gap="md">
      <DataTableFrame minWidth={760}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {header(t('table.code'))}
            {header(t('table.name'))}
            {header(t('table.city'))}
            {header(t('table.pic'))}
            {header(t('table.items'), 'right')}
            {showValue && header(t('table.value'), 'right')}
            {header(t('table.status'))}
            {header('', 'center')}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{renderBody()}</Table.Tbody>
      </DataTableFrame>
      {!loading && total > 0 && (
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            {t('table.showing', { from, to, total })}
          </Text>
          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              value={pageNumber}
              onChange={onPageChange}
              size="sm"
              radius="md"
            />
          )}
        </Group>
      )}
    </Stack>
  );
}

export default WarehouseTable;
