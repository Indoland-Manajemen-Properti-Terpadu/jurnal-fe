import { Button, Group, Paper, Select, Skeleton, Stack } from '@mantine/core';
import {
  IconDownload,
  IconHistory,
  IconPackage,
  IconPackageExport,
  IconPackageImport,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { ApiError } from '@/lib/http/apiError';
import { DateRangeField } from '@/module/inventory/presentation/components/shared/DateRangeField';
import {
  DetailFrame,
  PageFrame,
} from '@/module/inventory/presentation/components/shared/DetailFrame';
import {
  MetricCard,
  MetricGrid,
} from '@/module/inventory/presentation/components/metrics/MetricCard';
import { StockCardTable } from '@/module/inventory/presentation/components/stock/StockCardTable';
import { useStockExport } from '@/module/inventory/presentation/hooks/useStockExport';
import {
  useStockCard,
  useStockErrorMessage,
  useStockRights,
} from '@/module/inventory/presentation/hooks/useStockQueries';
import { useWarehouseList } from '@/module/inventory/presentation/hooks/useWarehouses';
import { routes } from '@/router/routes';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

/** The stock card of one product: opening balance, movements in order, and closing balance. */
export default function StockCardPage() {
  const { t } = useTranslation('stockMovements');
  const { productId = '' } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const describe = useStockErrorMessage();
  const { card: rights, value: valueRights } = useStockRights();
  const exporter = useStockExport();
  const [params, setParams] = useSearchParams();

  const today = dayjs().format('YYYY-MM-DD');
  const warehouse = params.get('warehouse') ?? '';
  const from = params.get('from') ?? `${today.slice(0, 4)}-01-01`;
  const to = params.get('to') ?? today;
  const patch = (key: string, value: string) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );

  const query = useStockCard({
    product: productId,
    warehouse: warehouse || undefined,
    startDate: from,
    endDate: to,
  });
  const warehouses = useWarehouseList({ limit: 100 });
  const { data } = query;

  // Back goes where the person came from (Warehouse or Stock Movements); a direct link goes to the list.
  const goBack = () =>
    location.key === 'default' ? navigate(routes.inventory.stockMovements) : navigate(-1);

  const frame = (content: React.ReactNode) => (
    <PageFrame backTo={routes.inventory.stockMovements} backLabel={t('card.back')} onBack={goBack}>
      {content}
    </PageFrame>
  );

  if (query.isLoading) {
    return frame(
      <>
        <Skeleton height={96} radius="lg" />
        <Skeleton height={72} radius="lg" />
        <Skeleton height={260} radius="lg" />
      </>
    );
  }

  if (!data) {
    const missing = query.error instanceof ApiError && query.error.kind === 'notFound';
    return frame(
      <Paper withBorder radius="lg" bg="white">
        <EmptyState
          title={t(missing ? 'card.notFound' : 'card.loadFailed')}
          description={missing ? t('card.notFoundBody') : describe(query.error)}
          icon={<IconPackage size={36} stroke={1.5} />}
        />
      </Paper>
    );
  }

  const { product } = data;
  const showValue = data.closing.value !== null;
  const withUnit = (qty: number) => `${numberFormat(qty)} ${product.unit}`.trim();
  const worth = (value: number | null) => (value === null ? undefined : formatCurrency(value));
  const warehouseOptions = (warehouses.data?.items ?? []).map((item) => ({
    value: item.id,
    label: `${item.code} · ${item.name}`,
  }));

  return (
    <DetailFrame
      icon={IconPackage}
      title={product.name}
      subtitle={[product.sku, product.unit, product.category].filter(Boolean).join(' · ')}
      backTo={routes.inventory.stockMovements}
      backLabel={t('card.back')}
      onBack={goBack}
      actions={
        rights.read && valueRights.read ? (
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            loading={exporter.loading}
            onClick={() =>
              exporter.run(
                'movements',
                {
                  product: productId,
                  warehouse: warehouse || undefined,
                  startDate: from,
                  endDate: to,
                },
                today
              )
            }
          >
            {t('export')}
          </Button>
        ) : undefined
      }
    >
      <MetricGrid columns={4}>
        <MetricCard
          icon={IconHistory}
          label={t('card.opening')}
          value={withUnit(data.opening.quantity)}
          hint={worth(data.opening.value)}
        />
        <MetricCard
          icon={IconPackageImport}
          label={t('card.totalIn')}
          value={withUnit(data.totalIn)}
          hint={data.transfersExcluded ? t('card.transfersNote') : undefined}
        />
        <MetricCard
          icon={IconPackageExport}
          label={t('card.totalOut')}
          value={withUnit(data.totalOut)}
          hint={data.transfersExcluded ? t('card.transfersNote') : undefined}
        />
        <MetricCard
          icon={IconPackage}
          label={t('card.closing')}
          value={withUnit(data.closing.quantity)}
          hint={worth(data.closing.value)}
        />
      </MetricGrid>
      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          <Group gap="sm" wrap="wrap">
            <Select
              aria-label={t('history.warehouse')}
              placeholder={t('card.allWarehouses')}
              data={warehouseOptions}
              value={warehouse || null}
              onChange={(value) => patch('warehouse', value ?? '')}
              clearable
              searchable
              radius="md"
              w={{ base: '100%', sm: 250 }}
            />
            <DateRangeField
              aria-label={t('history.period')}
              from={from}
              to={to}
              maxDate={today}
              onChange={(start, end) =>
                setParams(
                  (current) => {
                    const next = new URLSearchParams(current);
                    next.set('from', start);
                    next.set('to', end);
                    return next;
                  },
                  { replace: true }
                )
              }
              w={{ base: '100%', sm: 250 }}
            />
          </Group>
          <StockCardTable card={data} showValue={showValue} today={today} />
        </Stack>
      </Paper>
    </DetailFrame>
  );
}
