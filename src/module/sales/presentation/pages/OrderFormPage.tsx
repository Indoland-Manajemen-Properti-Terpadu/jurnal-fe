import { useMemo } from 'react';
import { Box, Button, Loader, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconClipboardList } from '@tabler/icons-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { orderActions } from '../../domain/saleOrder';
import { orderToFormValues } from '../../domain/saleOrderForm';
import { OrderFormBody } from '../components/orders/OrderFormBody';
import { useOrder } from '../hooks/useOrderQueries';

const detailPath = (id: string) => routes.sales.orderDetail.replace(':id', id);

/** Create a order, or edit a draft when the route carries an id. */
export function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('salesOrders');
  const { data: order, isLoading, isError } = useOrder(id);
  const initial = useMemo(() => (order ? orderToFormValues(order) : undefined), [order]);
  const isEdit = Boolean(id);
  const back = () => navigate(id ? detailPath(id) : routes.sales.orders);

  // Only a draft can be changed; any other order opens on its detail instead.
  if (isEdit && order && !orderActions(order).edit) {
    return <Navigate to={detailPath(order.id)} replace />;
  }
  if (isEdit && isError) return <Navigate to={routes.sales.orders} replace />;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconClipboardList}
            title={isEdit ? t('form.titleEdit') : t('form.titleNew')}
            description={isEdit ? t('form.descriptionEdit') : t('form.descriptionNew')}
            actions={
              <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={back}>
                {t('detail.back')}
              </Button>
            }
          />
          {isEdit && isLoading && (
            <Stack align="center" gap="xs" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                {t('form.loading')}
              </Text>
            </Stack>
          )}
          {(!isEdit || initial) && (
            <OrderFormBody key={id ?? 'new'} orderId={id} initial={initial} />
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default OrderFormPage;
