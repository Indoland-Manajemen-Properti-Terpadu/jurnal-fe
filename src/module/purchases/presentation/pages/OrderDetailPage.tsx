import { Grid, Group, Stack } from '@mantine/core';
import { IconCalculator, IconShoppingCart } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { OrderActionBar } from '@/module/purchases/presentation/components/orders/OrderActionBar';
import { OrderSummaryCard } from '@/module/purchases/presentation/components/orders/OrderSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountSummary } from '@/module/purchases/presentation/components/shared/AmountSummary';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { OrderHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.orders;

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const order = useOrder(id);
  const journey = usePurchaseJourney({ orderId: id, current: 'order' });

  if (accessLoading || order.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (order.isError) {
    return order.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          order.refetch();
        }}
      />
    );
  }
  const doc = order.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} label={doc.statusLabel} />
        </Group>
      }
      description={t('orders.detail.subtitle', {
        label: doc.documentLabel,
        vendor: doc.vendor.name,
      })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<OrderActionBar order={doc} />}
    >
      <OrderHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <OrderSummaryCard order={doc} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard icon={IconCalculator} title={t('orders.detail.amountsTitle')}>
              <AmountSummary {...doc} />
            </SectionCard>
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="order"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.documents, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
