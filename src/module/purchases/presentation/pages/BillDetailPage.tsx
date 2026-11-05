import { Grid, Group, Stack } from '@mantine/core';
import { IconFileInvoice, IconCalculator } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { BillActionBar } from '@/module/purchases/presentation/components/bills/BillActionBar';
import { BillInfoCard } from '@/module/purchases/presentation/components/bills/BillInfoCard';
import { BillItemsCard } from '@/module/purchases/presentation/components/bills/BillItemsCard';
import { BillSettlementCard } from '@/module/purchases/presentation/components/bills/BillSettlementCard';
import { BillVariancesCard } from '@/module/purchases/presentation/components/bills/BillVariancesCard';
import { CreditApplicationsCard } from '@/module/purchases/presentation/components/bills/CreditApplicationsCard';
import { useBillExtras } from '@/module/purchases/presentation/components/bills/billExtras';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountSummary } from '@/module/purchases/presentation/components/shared/AmountSummary';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { BillHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useBill, useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = `${routes.purchases.main}?tab=bills`;

export default function BillDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const bill = useBill(id);
  const extras = useBillExtras(id);
  const order = useOrder(bill.data?.purchaseOrderId);
  const journey = usePurchaseJourney({
    orderId: bill.data?.purchaseOrderId,
    billId: id,
    current: 'bill',
  });

  if (accessLoading || bill.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (bill.isError) {
    return bill.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          bill.refetch();
        }}
      />
    );
  }
  const doc = bill.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }
  const open = doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID';

  return (
    <PageFrame
      icon={IconFileInvoice}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} />
        </Group>
      }
      description={t('bills.detail.subtitle', { vendor: doc.vendor.name })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<BillActionBar bill={doc} />}
    >
      <BillHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <BillVariancesCard bill={doc} findings={extras.data?.variances ?? []} />
            <BillInfoCard bill={doc} orderNumber={order.data?.number ?? null} />
            <BillItemsCard bill={doc} />
            <CreditApplicationsCard
              billId={doc.id}
              allocations={extras.data?.allocations ?? []}
              canVoid={open && can(PURCHASE_MENU.payments, 'delete')}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard icon={IconCalculator} title={t('bills.detail.amountsTitle')}>
              <AmountSummary {...doc} />
            </SectionCard>
            {doc.status !== 'DRAFT' && <BillSettlementCard bill={doc} />}
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="bill"
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
