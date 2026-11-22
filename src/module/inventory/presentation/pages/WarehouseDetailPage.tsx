import { useMemo, useState } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconArrowsLeftRight,
  IconBuildingWarehouse,
  IconDots,
  IconEdit,
  IconHistory,
  IconInfoCircle,
  IconPackage,
  IconPlayerPause,
  IconPlayerPlay,
  IconStar,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import type { WarehouseStockItem } from '@/module/inventory/domain/warehouse';
import { MinStockDialog } from '@/module/inventory/presentation/components/warehouses/MinStockDialog';
import { WarehouseAuditTab } from '@/module/inventory/presentation/components/warehouses/WarehouseAuditTab';
import { WarehouseFormModal } from '@/module/inventory/presentation/components/warehouses/WarehouseFormModal';
import { WarehouseInfoCard } from '@/module/inventory/presentation/components/warehouses/WarehouseInfoCard';
import { WarehouseDetailMetrics } from '@/module/inventory/presentation/components/warehouses/WarehouseMetrics';
import { WarehouseMovesTab } from '@/module/inventory/presentation/components/warehouses/WarehouseMovesTab';
import { WarehouseStockTab } from '@/module/inventory/presentation/components/warehouses/WarehouseStockTab';
import { useWarehouseActions } from '@/module/inventory/presentation/components/warehouses/useWarehouseActions';
import {
  usePicOptions,
  useWarehouse,
  useWarehouseAudit,
  useWarehouseErrorMessage,
  useWarehouseMoves,
  useWarehouseMutations,
  useWarehouseRights,
  useWarehouseStock,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import { routes } from '@/router/routes';

type TabKey = 'stock' | 'moves' | 'audit';

export default function WarehouseDetailPage() {
  const { t } = useTranslation('warehouses');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rights = useWarehouseRights();
  const describe = useWarehouseErrorMessage();
  const [tab, setTab] = useState<TabKey>('stock');
  const [formOpen, setFormOpen] = useState(false);
  const [minItem, setMinItem] = useState<WarehouseStockItem | null>(null);

  const warehouseQuery = useWarehouse(id);
  const stockQuery = useWarehouseStock(id);
  const movesQuery = useWarehouseMoves(id, tab === 'moves');
  const auditQuery = useWarehouseAudit(id, tab === 'audit');
  const people = usePicOptions(tab === 'audit');
  const { setMinStock } = useWarehouseMutations();
  const { request, dialogs } = useWarehouseActions({
    onOwnPage: true,
    onDeleted: () => navigate(routes.inventory.warehouses),
  });

  const warehouse = warehouseQuery.data;
  const stockItems = stockQuery.data ?? [];

  const peopleById = useMemo(
    () => Object.fromEntries((people.data ?? []).map((person) => [person.id, person.name])),
    [people.data]
  );
  const productsById = useMemo(
    () => Object.fromEntries(stockItems.map((item) => [item.productId, item.name])),
    [stockItems]
  );

  const back = (
    <Button
      variant="default"
      component={Link}
      to={routes.inventory.warehouses}
      leftSection={<IconArrowLeft size={16} />}
    >
      {t('detail.back')}
    </Button>
  );

  const frame = (content: React.ReactNode) => (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">{content}</Stack>
      </Box>
    </AppShellLayout>
  );

  if (warehouseQuery.isLoading) {
    return frame(
      <>
        <Skeleton height={96} radius="lg" />
        <Skeleton height={72} radius="lg" />
        <Skeleton height={240} radius="lg" />
      </>
    );
  }

  if (!warehouse) {
    const missing =
      warehouseQuery.error instanceof ApiError && warehouseQuery.error.kind === 'notFound';
    return frame(
      <Paper withBorder radius="lg" bg="white">
        <EmptyState
          title={t(missing ? 'detail.notFound' : 'detail.loadFailed')}
          description={missing ? t('detail.notFoundBody') : describe(warehouseQuery.error)}
          icon={<IconBuildingWarehouse size={36} stroke={1.5} />}
          actionLabel={missing ? t('detail.back') : t('loadFailed.retry')}
          onAction={missing ? () => navigate(routes.inventory.warehouses) : warehouseQuery.refetch}
        />
      </Paper>
    );
  }

  const showValue = warehouse.inventoryValue !== null;
  const canMakeDefault = rights.update && warehouse.isActive && !warehouse.isDefault;
  const canDeactivate = rights.update && warehouse.isActive && !warehouse.isDefault;
  const canActivate = rights.update && !warehouse.isActive;
  const canDelete = rights.delete && warehouse.canDelete && !warehouse.isDefault;
  const hasMenu = canMakeDefault || canDeactivate || canActivate || canDelete;

  const saveMinStock = (minQty: number) => {
    if (!id || !minItem) return;
    setMinStock.mutate(
      { id, productId: minItem.productId, minQty },
      {
        onSuccess: () => {
          setMinItem(null);
          notifications.show({ color: 'green', message: t('notify.minSaved') });
        },
        onError: (error) => {
          setMinItem(null);
          notifications.show({
            color: 'orange',
            title: t('notify.failedTitle'),
            message: describe(error),
          });
        },
      }
    );
  };

  return frame(
    <>
      <ModuleHeader
        icon={IconBuildingWarehouse}
        title={warehouse.name}
        description={
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {[warehouse.code, warehouse.city].filter(Boolean).join(' · ')}
            </Text>
            {warehouse.isDefault && (
              <Badge variant="light" color="primary" size="sm">
                {t('table.main')}
              </Badge>
            )}
            {!warehouse.isActive && (
              <Badge variant="light" color="gray" size="sm">
                {t('status.inactive')}
              </Badge>
            )}
          </Group>
        }
        actions={
          <Group gap="xs">
            {back}
            {rights.update && (
              <Button
                variant="default"
                leftSection={<IconEdit size={16} />}
                onClick={() => setFormOpen(true)}
              >
                {t('menu.edit')}
              </Button>
            )}
            {hasMenu && (
              <Menu position="bottom-end" withinPortal shadow="md" radius="md">
                <Menu.Target>
                  <Button
                    variant="default"
                    px="xs"
                    aria-label={t('menu.actions', { name: warehouse.name })}
                  >
                    <IconDots size={18} />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  {canMakeDefault && (
                    <Menu.Item
                      leftSection={<IconStar size={16} />}
                      onClick={() => request.makeDefault(warehouse)}
                    >
                      {t('menu.makeDefault')}
                    </Menu.Item>
                  )}
                  {canDeactivate && (
                    <Menu.Item
                      leftSection={<IconPlayerPause size={16} />}
                      onClick={() => request.deactivate(warehouse)}
                    >
                      {t('menu.deactivate')}
                    </Menu.Item>
                  )}
                  {canActivate && (
                    <Menu.Item
                      leftSection={<IconPlayerPlay size={16} />}
                      onClick={() => request.activate(warehouse)}
                    >
                      {t('menu.activate')}
                    </Menu.Item>
                  )}
                  {canDelete && (
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => request.remove(warehouse)}
                    >
                      {t('menu.delete')}
                    </Menu.Item>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        }
      />

      {warehouse.runningOpname && (
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">
              {t('detail.runningBanner', { number: warehouse.runningOpname.number })}
            </Text>
            <Anchor component={Link} to={routes.inventory.stockTake} size="sm" fw={600}>
              {t('blocked.openOpname')}
            </Anchor>
          </Group>
        </Alert>
      )}

      <WarehouseInfoCard warehouse={warehouse} />
      <WarehouseDetailMetrics
        warehouse={warehouse}
        stock={stockItems}
        stockReady={!stockQuery.isLoading && !stockQuery.isError}
      />

      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          <Box>
            <Text fw={700} fz={15} c="dark.9">
              {t('detail.contentTitle')}
            </Text>
            <Text fz={12} c="dimmed">
              {t('detail.contentSubtitle')}
            </Text>
          </Box>
          <Tabs
            value={tab}
            onChange={(value) => setTab((value as TabKey | null) ?? 'stock')}
            color="primary"
            variant="pills"
            radius="md"
          >
            <Tabs.List>
              <Tabs.Tab value="stock" leftSection={<IconPackage size={16} />}>
                {t('detail.tabs.stock')}
              </Tabs.Tab>
              <Tabs.Tab value="moves" leftSection={<IconArrowsLeftRight size={16} />}>
                {t('detail.tabs.moves')}
              </Tabs.Tab>
              <Tabs.Tab value="audit" leftSection={<IconHistory size={16} />}>
                {t('detail.tabs.audit')}
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
          {tab === 'stock' && (
            <WarehouseStockTab
              items={stockItems}
              loading={stockQuery.isLoading}
              failed={stockQuery.isError}
              showValue={showValue}
              totalValue={warehouse.inventoryValue}
              canUpdate={rights.update}
              onSetMin={setMinItem}
              onRetry={() => stockQuery.refetch()}
            />
          )}
          {tab === 'moves' && (
            <WarehouseMovesTab
              moves={movesQuery.data ?? []}
              loading={movesQuery.isLoading}
              failed={movesQuery.isError}
              showValue={showValue}
              onRetry={() => movesQuery.refetch()}
            />
          )}
          {tab === 'audit' && (
            <WarehouseAuditTab
              entries={auditQuery.data ?? []}
              loading={auditQuery.isLoading}
              failed={auditQuery.isError}
              people={peopleById}
              products={productsById}
              onRetry={() => auditQuery.refetch()}
            />
          )}
        </Stack>
      </Paper>

      <WarehouseFormModal
        opened={formOpen}
        warehouse={warehouse}
        onClose={() => setFormOpen(false)}
      />
      <MinStockDialog
        item={minItem}
        warehouseName={warehouse.name}
        saving={setMinStock.isPending}
        onSave={saveMinStock}
        onClose={() => setMinItem(null)}
      />
      {dialogs}
    </>
  );
}
