import { Grid, Group, Stack } from '@mantine/core';
import { IconCalculator, IconReceiptRefund } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { ReturnActionBar } from '@/module/purchases/presentation/components/returns/ReturnActionBar';
import { ReturnInfoCard } from '@/module/purchases/presentation/components/returns/ReturnInfoCard';
import { ReturnLinesCard } from '@/module/purchases/presentation/components/returns/ReturnLinesCard';
import { ReturnSettlementCard } from '@/module/purchases/presentation/components/returns/ReturnSettlementCard';
import { ReturnValueRows } from '@/module/purchases/presentation/components/returns/ReturnValueRows';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { ReturnHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { StatusNote } from '@/module/purchases/presentation/components/shared/StatusNote';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useBill, useReturn } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = `${routes.purchases.main}?tab=returns`;

export default function ReturnDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const doc = useReturn(id);
  const bill = useBill(doc.data?.billId);
  const journey = usePurchaseJourney({
    orderId: bill.data?.purchaseOrderId,
    billId: doc.data?.billId,
    current: 'return',
  });

  if (accessLoading || doc.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (doc.isError) {
    return doc.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          doc.refetch();
        }}
      />
    );
  }
  const { data } = doc;
  if (!data) {
    return <StateFrame kind="loading" />;
  }

  return (
    <PageFrame
      icon={IconReceiptRefund}
      title={
        <Group gap="sm" align="center">
          <span>{data.number}</span>
          <StatusBadge status={data.status} />
        </Group>
      }
      description={t('returns.detail.subtitle', {
        vendor: data.vendor.name,
        bill: bill.data?.number ?? '-',
      })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<ReturnActionBar doc={data} />}
    >
      <ReturnHighlights doc={data} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {data.status === 'DRAFT' && (
              <StatusNote tone="neutral">{t('returns.detail.draftNote')}</StatusNote>
            )}
            <ReturnInfoCard doc={data} billNumber={bill.data?.number ?? null} />
            <ReturnLinesCard items={data.items} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard icon={IconCalculator} title={t('returns.detail.valueTitle')}>
              <ReturnValueRows figures={data} ns="returns.detail" />
            </SectionCard>
            {data.status === 'POSTED' && <ReturnSettlementCard doc={data} />}
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="return"
              documentId={data.id}
              attachments={data.attachments}
              canUpload={can(PURCHASE_MENU.documents, 'update') && data.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
