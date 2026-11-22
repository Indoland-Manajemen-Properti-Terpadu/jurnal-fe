import { useMemo, useState } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowsLeftRight,
  IconBuildingWarehouse,
  IconEdit,
  IconHistory,
  IconLock,
  IconPackage,
  IconPlayerPause,
  IconPlayerPlay,
  IconStar,
  IconClipboardCheck,
  IconTransfer,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
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
  useWarehouseMutations,
  useWarehouseRights,
  useWarehouseStock,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import { useStockRights } from '@/module/inventory/presentation/hooks/useStockQueries';
import {
  DetailFrame,
  PageFrame,
  type FrameMenuItem,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import {
  stockTakeDetailPath,
  stockTakeNewPath,
  transferNewPath,
} from '@/module/inventory/presentation/components/shared/stockLinks';
import { useOpnameRights } from '@/module/inventory/presentation/hooks/useOpnames';
import { routes } from '@/router/routes';

type TabKey = 'stock' | 'moves' | 'audit';

export default function WarehouseDetailPage() {
  const { t } = useTranslation('warehouses');
  const { t: tt } = useTranslation('stockTake');
  const opnameRights = useOpnameRights();
  const canCount = opnameRights.count || opnameRights.review;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rights = useWarehouseRights();
  const { transfer: transferRights } = useStockRights();
  const describe = useWarehouseErrorMessage();
  const [tab, setTab] = useState<TabKey>('stock');
  const [formOpen, setFormOpen] = useState(false);
  const [minItem, setMinItem] = useState<WarehouseStockItem | null>(null);

  const warehouseQuery = useWarehouse(id);
  const stockQuery = useWarehouseStock(id);
  const auditQuery = useWarehouseAudit(id, tab === 'audit');
  const people = usePicOptions(tab === 'audit');
  const { setMinStock } = useWarehouseMutations();
  const { request, dialogs } = useWarehouseActions({
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

  const frame = (content: React.ReactNode) => (
    <PageFrame backTo={routes.inventory.warehouses} backLabel={t('detail.back')}>
      {content}
    </PageFrame>
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

  const menu: FrameMenuItem[] = [
    ...(rights.update
      ? [{ label: t('menu.edit'), icon: IconEdit, onClick: () => setFormOpen(true) }]
      : []),
    ...(canMakeDefault
      ? [
          {
            label: t('menu.makeDefault'),
            icon: IconStar,
            onClick: () => request.makeDefault(warehouse),
          },
        ]
      : []),
    ...(canDeactivate
      ? [
          {
            label: t('menu.deactivate'),
            icon: IconPlayerPause,
            onClick: () => request.deactivate(warehouse),
          },
        ]
      : []),
    ...(canActivate
      ? [
          {
            label: t('menu.activate'),
            icon: IconPlayerPlay,
            onClick: () => request.activate(warehouse),
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: t('menu.delete'),
            icon: IconTrash,
            onClick: () => request.remove(warehouse),
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <DetailFrame
      icon={IconBuildingWarehouse}
      title={warehouse.name}
      badges={
        <>
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
        </>
      }
      subtitle={[warehouse.code, warehouse.city].filter(Boolean).join(' · ')}
      backTo={routes.inventory.warehouses}
      backLabel={t('detail.back')}
      menu={menu}
      actions={
        <>
          {canCount && warehouse.isActive && !warehouse.runningOpname && (
            <Button
              variant="default"
              leftSection={<IconClipboardCheck size={16} />}
              onClick={() => navigate(stockTakeNewPath({ warehouse: warehouse.id }))}
            >
              {tt('frozen.create')}
            </Button>
          )}
          {transferRights.create && warehouse.isActive && (
            <Button
              leftSection={<IconTransfer size={16} />}
              onClick={() => navigate(transferNewPath({ from: warehouse.id }))}
            >
              {t('detail.transfer')}
            </Button>
          )}
        </>
      }
    >
      {warehouse.runningOpname && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconLock size={18} />}
          title={tt('frozen.title')}
        >
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Text size="sm">{tt('frozen.banner', { number: warehouse.runningOpname.number })}</Text>
            <Anchor
              component={Link}
              to={stockTakeDetailPath(warehouse.runningOpname.id)}
              size="sm"
              fw={600}
            >
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
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={36} radius="md" variant="light" color="primary">
              <IconBuildingWarehouse size={18} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Text fw={700} fz="md" lh={1.3}>
                {t('detail.contentTitle')}
              </Text>
              <Text fz="xs" c="dimmed">
                {t('detail.contentSubtitle')}
              </Text>
            </Box>
          </Group>
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
              warehouseId={warehouse.id}
              canUpdate={rights.update}
              onSetMin={setMinItem}
              onRetry={() => stockQuery.refetch()}
            />
          )}
          {tab === 'moves' && (
            <WarehouseMovesTab warehouseId={warehouse.id} showValue={showValue} />
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
    </DetailFrame>
  );
}
