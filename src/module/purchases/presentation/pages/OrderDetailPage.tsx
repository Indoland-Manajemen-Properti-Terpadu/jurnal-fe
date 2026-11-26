import { Grid, Stack } from '@mantine/core';
import { IconShoppingCart, IconTruckDelivery, IconWallet } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { OrderActionBar } from '@/module/purchases/presentation/components/orders/OrderActionBar';
import { OrderRetentionCard } from '@/module/purchases/presentation/components/orders/OrderRetentionCard';
import { OrderSummaryCard } from '@/module/purchases/presentation/components/orders/OrderSummaryCard';
import { orderStatusLabelKey } from '@/module/purchases/presentation/components/orders/orderStatusLabel';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountsCard } from '@/module/purchases/presentation/components/shared/AmountsCard';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { BillsTableCard } from '@/module/purchases/presentation/components/shared/BillsTableCard';
import { RelatedDocsCard } from '@/module/purchases/presentation/components/shared/RelatedDocsCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import {
  useBills,
  useOrder,
  useReceipts,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.orders;

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const order = useOrder(id);
  const journey = useDocumentChain('purchaseOrder', id);
  const orderReceipts = useReceipts({ purchaseOrder: id, limit: 50 }, Boolean(id));
  const orderBills = useBills({ purchaseOrder: id, limit: 50 }, Boolean(id));

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

  const { chain } = journey;
  const docsOf = (
    list: { id: string; number: string; status: string }[] | undefined,
    route: string
  ) => (list ?? []).map((ref) => ({ ...ref, to: route.replace(':id', ref.id) }));
  const receiptById = new Map(
    (orderReceipts.data?.items ?? []).map((receipt) => [receipt.id, receipt])
  );
  const receiptDocs = (chain?.goodsReceipts ?? []).map((ref) => {
    const receipt = receiptById.get(ref.id);
    return {
      ...ref,
      status: receipt?.displayStatus ?? ref.status,
      statusLabel: receipt?.statusLabel,
      to: routes.purchases.receiptDetail.replace(':id', ref.id),
    };
  });

  return (
    <DocumentFrame
      icon={IconShoppingCart}
      number={doc.number}
      badges={
        <StatusBadge
          status={doc.status}
          label={doc.statusLabel}
          englishLabel={
            orderStatusLabelKey(doc.status, doc.isService)
              ? t(orderStatusLabelKey(doc.status, doc.isService) as string)
              : undefined
          }
        />
      }
      date={`${doc.documentLabel} · ${formatDay(doc.date, currentLanguage)}`}
      backTo={BACK}
      backLabel={t('orders.detail.backToList')}
      actions={<OrderActionBar order={doc} />}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <OrderSummaryCard order={doc} />
            <RelatedDocsCard
              icon={IconTruckDelivery}
              title={t('orders.detail.receiptsTitle')}
              subtitle={t('orders.detail.receiptsSubtitle')}
              count={t('bills.detail.docsCount', {
                count: orderReceipts.data?.totalResults ?? chain?.goodsReceipts.length ?? 0,
              })}
              emptyText={t('orders.detail.receiptsEmpty')}
              docs={receiptDocs}
            />
            {doc.retention && (
              <OrderRetentionCard
                orderId={doc.id}
                retention={doc.retention}
                isService={doc.isService}
                bills={orderBills.data?.items ?? []}
                canRelease={can(PURCHASE_MENU.retentionRelease, 'create')}
              />
            )}
            <BillsTableCard
              title={t('orders.detail.billsTitle')}
              subtitle={t('orders.detail.billsSubtitle')}
              bills={(orderBills.data?.items ?? []).filter(
                (bill) => bill.status !== 'VOID' && bill.kind !== 'RETENTION_RELEASE'
              )}
              emptyText={t('orders.detail.billsEmpty')}
            />
            <RelatedDocsCard
              icon={IconWallet}
              title={t('orders.detail.requestsTitle')}
              subtitle={t('orders.detail.requestsSubtitle')}
              count={t('bills.detail.docsCount', { count: chain?.paymentRequests.length ?? 0 })}
              emptyText={t('orders.detail.requestsEmpty')}
              docs={docsOf(chain?.paymentRequests, routes.purchases.paymentRequestDetail)}
            />
            <AttachmentsCard
              target="order"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.documents, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <AmountsCard
              subtotal={doc.subtotal}
              discountAmount={doc.discountAmount}
              taxAmount={doc.taxAmount}
              withholdingAmount={doc.withholdingAmount}
              closing={{ label: t('orders.detail.total'), value: doc.finalAmount }}
              subtitle={t('orders.detail.amountsSubtitle')}
            />
            <DocumentJourney steps={journey.steps} />
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
