import { Grid, Stack } from '@mantine/core';
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
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { useBill, useReturn } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.returns;

export default function ReturnDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const doc = useReturn(id);
  const bill = useBill(doc.data?.billId);
  const journey = useDocumentChain('purchaseReturn', id);

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
    <DocumentFrame
      icon={IconReceiptRefund}
      number={data.number}
      badges={<StatusBadge status={data.status} label={data.statusLabel} />}
      date={formatDay(data.date, currentLanguage)}
      backTo={BACK}
      backLabel={t('returns.detail.backToList')}
      actions={<ReturnActionBar doc={data} />}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <ReturnInfoCard doc={data} billNumber={bill.data?.number ?? null} />
            <ReturnLinesCard items={data.items} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <SectionCard icon={IconCalculator} label title={t('returns.detail.valueTitle')}>
              <ReturnValueRows figures={data} ns="returns.detail" />
            </SectionCard>
            {data.status === 'POSTED' && <ReturnSettlementCard doc={data} />}
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="return"
              documentId={data.id}
              attachments={data.attachments}
              canUpload={can(PURCHASE_MENU.returns, 'update') && data.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
