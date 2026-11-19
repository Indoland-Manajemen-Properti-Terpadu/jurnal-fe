import { useMemo } from 'react';
import { Box, Button, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconReceipt2 } from '@tabler/icons-react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { saleToFormValues } from '../../domain/saleForm';
import { orderToSaleFormValues } from '../../domain/saleOrderInvoice';
import { SaleFormBody } from '../components/form/SaleFormBody';
import { useOrder } from '../hooks/useOrderQueries';
import { useSaleDetail } from '../hooks/useSaleQueries';

/** Create an invoice, or edit a draft when the route carries an id. */
export function SaleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('sales');
  const { data: sale, isLoading, isError } = useSaleDetail(id);
  // `?order=<id>` starts a new invoice from a confirmed order.
  const [params] = useSearchParams();
  const orderId = id ? undefined : params.get('order') || undefined;
  const orderQuery = useOrder(orderId);
  const order = orderQuery.data;
  const initial = useMemo(() => {
    if (sale) return saleToFormValues(sale);
    if (order) return orderToSaleFormValues(order, new Date().toLocaleDateString('en-CA'));
    return undefined;
  }, [sale, order]);

  const isEdit = Boolean(id);
  const waiting = isEdit ? isLoading : Boolean(orderId) && orderQuery.isLoading;
  const orderPath = (value: string) => routes.sales.orderDetail.replace(':id', value);
  const back = () => {
    if (id) navigate(routes.sales.detail.replace(':id', id));
    else navigate(orderId ? orderPath(orderId) : routes.sales.main);
  };

  if (isEdit && sale && !(sale.displayStatus.code === 'DRAFT' && sale.canEdit)) {
    return <Navigate to={routes.sales.detail.replace(':id', sale.id)} replace />;
  }
  if (isEdit && isError) return <Navigate to={routes.sales.main} replace />;
  // Only a confirmed order can be invoiced; any other opens on its own page.
  if (orderId && order && order.status !== 'CONFIRMED') {
    return <Navigate to={orderPath(order.id)} replace />;
  }
  if (orderId && orderQuery.isError) return <Navigate to={routes.sales.orders} replace />;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconReceipt2}
            title={isEdit ? t('form.titleEdit') : t('form.titleNew')}
            description={isEdit ? t('form.descriptionEdit') : t('form.descriptionNew')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('common.back')}
              </Button>
            }
          />
          {waiting && (
            <Stack align="center" gap="xs" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {t('form.loading')}
              </Text>
            </Stack>
          )}
          {(!(isEdit || orderId) || initial) && (
            <SaleFormBody key={id ?? orderId ?? 'new'} saleId={id} initial={initial} />
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default SaleFormPage;
