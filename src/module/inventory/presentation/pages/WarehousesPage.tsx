import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconBuildingWarehouse, IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';
import { generatePath, useNavigate } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import type { Warehouse } from '@/module/inventory/domain/warehouse';
import { WarehouseFormModal } from '@/module/inventory/presentation/components/warehouses/WarehouseFormModal';
import { WarehouseTable } from '@/module/inventory/presentation/components/warehouses/WarehouseTable';
import { WarehouseListMetrics } from '@/module/inventory/presentation/components/warehouses/WarehouseMetrics';
import { useWarehouseActions } from '@/module/inventory/presentation/components/warehouses/useWarehouseActions';
import {
  ALL_ACTIVE_WAREHOUSES,
  useWarehouseList,
  useWarehouseRights,
} from '@/module/inventory/presentation/hooks/useWarehouses';
import { routes } from '@/router/routes';

type StatusFilter = 'active' | 'inactive' | 'all';
const SEARCH_DELAY_MS = 300;
const PAGE_SIZE = 10;

export default function WarehousesPage() {
  const { t } = useTranslation('warehouses');
  const navigate = useNavigate();
  const rights = useWarehouseRights();
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);
  const [status, setStatus] = useState<StatusFilter>('active');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const list = useWarehouseList({
    search,
    status: status === 'all' ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });
  const everyActive = useWarehouseList(ALL_ACTIVE_WAREHOUSES);
  const { request, dialogs, runningId } = useWarehouseActions();

  const hasFilters = search !== '' || status !== 'active';
  const summary = list.data?.summary;

  const openForm = (warehouse: Warehouse | null) => {
    setEditing(warehouse);
    setFormOpen(true);
  };
  const resetFilters = () => {
    setSearchInput('');
    setStatus('active');
    setPage(1);
  };

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconBuildingWarehouse}
            title={t('title')}
            description={t('description')}
            actions={
              <Group gap="xs">
                <Tooltip label={t('refresh')}>
                  <ActionIcon
                    size="lg"
                    variant="default"
                    radius="md"
                    loading={list.isFetching && !list.isLoading}
                    aria-label={t('refresh')}
                    onClick={() => list.refetch()}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                {rights.create && (
                  <Button
                    color="primary"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => openForm(null)}
                  >
                    {t('add')}
                  </Button>
                )}
              </Group>
            }
          />
          {summary && (
            <WarehouseListMetrics summary={summary} warehouses={everyActive.data?.items ?? []} />
          )}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <Group gap="sm" wrap="wrap">
                <TextInput
                  placeholder={t('search')}
                  aria-label={t('search')}
                  leftSection={<IconSearch size={16} />}
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.currentTarget.value);
                    setPage(1);
                  }}
                  w={{ base: '100%', sm: 300 }}
                  radius="md"
                />
                <Select
                  aria-label={t('filterStatus')}
                  data={(['active', 'inactive', 'all'] as const).map((value) => ({
                    value,
                    label: t(`filterOptions.${value}`),
                  }))}
                  value={status}
                  onChange={(value) => {
                    setStatus((value as StatusFilter | null) ?? 'active');
                    setPage(1);
                  }}
                  allowDeselect={false}
                  radius="md"
                  w={{ base: '100%', sm: 170 }}
                />
              </Group>
              <WarehouseTable
                data={list.data}
                loading={list.isLoading}
                failed={list.isError}
                hasFilters={hasFilters}
                rights={rights}
                pendingId={runningId}
                onRetry={() => list.refetch()}
                onResetFilters={resetFilters}
                onAddNew={() => openForm(null)}
                onPageChange={setPage}
                onOpen={(warehouse) =>
                  navigate(generatePath(routes.inventory.warehouseDetail, { id: warehouse.id }))
                }
                onEdit={openForm}
                onMakeDefault={request.makeDefault}
                onDeactivate={request.deactivate}
                onActivate={request.activate}
                onDelete={request.remove}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>
      <WarehouseFormModal
        opened={formOpen}
        warehouse={editing}
        onClose={() => setFormOpen(false)}
      />
      {dialogs}
    </AppShellLayout>
  );
}
