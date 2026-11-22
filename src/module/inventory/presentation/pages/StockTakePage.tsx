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
import { IconClipboardCheck, IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { OPNAME_STEPS, type OpnameStatus } from '@/module/inventory/domain/stockOpname';
import { DateField } from '@/module/inventory/presentation/components/shared/DateField';
import { stockTakeNewPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { OpnameMetrics } from '@/module/inventory/presentation/components/stockTake/OpnameMetrics';
import { OpnameTable } from '@/module/inventory/presentation/components/stockTake/OpnameTable';
import { useOpnameRights, useOpnames } from '@/module/inventory/presentation/hooks/useOpnames';
import {
  ALL_ACTIVE_WAREHOUSES,
  useWarehouseList,
} from '@/module/inventory/presentation/hooks/useWarehouses';

const PAGE_SIZE = 10;
const SEARCH_DELAY_MS = 300;
const STATUSES: OpnameStatus[] = [...OPNAME_STEPS, 'cancelled'];

const asStatus = (value: string | null): OpnameStatus | undefined =>
  STATUSES.includes(value as OpnameStatus) ? (value as OpnameStatus) : undefined;

const asPage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

/** The stock counts: what is running, what waits for approval, and every document so far. */
export default function StockTakePage() {
  const { t } = useTranslation('stockTake');
  const navigate = useNavigate();
  const rights = useOpnameRights();
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);

  const warehouse = params.get('warehouse') ?? '';
  const status = asStatus(params.get('status'));
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const page = asPage(params.get('page'));

  const setFilter = (patch: Record<string, string>) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(patch).forEach(([key, value]) => {
          if (value) next.set(key, value);
          else next.delete(key);
        });
        if (!('page' in patch)) next.delete('page');
        return next;
      },
      { replace: true }
    );

  const list = useOpnames({
    q: search,
    warehouse: warehouse || undefined,
    status,
    startDate: from || undefined,
    endDate: to || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const warehouses = useWarehouseList(ALL_ACTIVE_WAREHOUSES);

  const filtered =
    search !== '' || warehouse !== '' || status !== undefined || from !== '' || to !== '';
  const canCreate = rights.count || rights.review;
  const goCreate = () => navigate(stockTakeNewPath({ warehouse: warehouse || undefined }));

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconClipboardCheck}
            title={t('title')}
            description={t('description')}
            actions={
              <Group gap="xs">
                <Tooltip label={t('loadFailed.retry')}>
                  <ActionIcon
                    size="lg"
                    variant="default"
                    radius="md"
                    loading={list.isFetching && !list.isLoading}
                    aria-label={t('loadFailed.retry')}
                    onClick={() => list.refetch()}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                {canCreate && (
                  <Button color="primary" leftSection={<IconPlus size={16} />} onClick={goCreate}>
                    {t('create')}
                  </Button>
                )}
              </Group>
            }
          />
          {list.data && <OpnameMetrics page={list.data} />}
          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <Group gap="sm" wrap="wrap">
                <TextInput
                  placeholder={t('list.search')}
                  aria-label={t('list.search')}
                  leftSection={<IconSearch size={16} />}
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.currentTarget.value);
                    setFilter({ q: event.currentTarget.value.trim() });
                  }}
                  w={{ base: '100%', sm: 260 }}
                  radius="md"
                />
                <Select
                  aria-label={t('list.warehouse')}
                  placeholder={t('list.allWarehouses')}
                  data={(warehouses.data?.items ?? []).map((item) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  value={warehouse || null}
                  onChange={(value) => setFilter({ warehouse: value ?? '' })}
                  clearable
                  searchable
                  radius="md"
                  w={{ base: '100%', sm: 200 }}
                />
                <Select
                  aria-label={t('list.status')}
                  placeholder={t('list.allStatuses')}
                  data={STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
                  value={status ?? null}
                  onChange={(value) => setFilter({ status: value ?? '' })}
                  clearable
                  radius="md"
                  w={{ base: '100%', sm: 200 }}
                />
                <DateField
                  aria-label={t('list.from')}
                  placeholder={t('list.from')}
                  value={from}
                  maxDate={to || undefined}
                  clearable
                  onChange={(value) => setFilter({ from: value })}
                  w={{ base: '100%', sm: 160 }}
                />
                <DateField
                  aria-label={t('list.to')}
                  placeholder={t('list.to')}
                  value={to}
                  minDate={from || undefined}
                  clearable
                  onChange={(value) => setFilter({ to: value })}
                  w={{ base: '100%', sm: 160 }}
                />
              </Group>
              <OpnameTable
                data={list.data}
                pageSize={PAGE_SIZE}
                loading={list.isLoading}
                failed={list.isError}
                filtered={filtered}
                canCreate={canCreate}
                onRetry={() => list.refetch()}
                onCreate={goCreate}
                onPageChange={(next) => setFilter({ page: next > 1 ? String(next) : '' })}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
