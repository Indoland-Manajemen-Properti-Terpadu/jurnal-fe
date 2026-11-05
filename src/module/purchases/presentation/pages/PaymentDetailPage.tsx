import { Grid, Group, Stack } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentActionBar } from '@/module/purchases/presentation/components/payments/PaymentActionBar';
import { PaymentAmountsCard } from '@/module/purchases/presentation/components/payments/PaymentAmountsCard';
import { PaymentBillsCard } from '@/module/purchases/presentation/components/payments/PaymentBillsCard';
import { PaymentInfoCard } from '@/module/purchases/presentation/components/payments/PaymentInfoCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { PaymentHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import {
  StatusNote,
  type NoteTone,
} from '@/module/purchases/presentation/components/shared/StatusNote';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApprovePayment,
  useRejectPayment,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useBill, usePayment } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = `${routes.purchases.main}?tab=payments`;

const NOTE_TONE: Record<string, NoteTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  PAID: 'info',
  REJECTED: 'danger',
  VOID: 'danger',
};

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const voucher = usePayment(id);
  const firstBillId = voucher.data?.lines[0]?.billId;
  const bill = useBill(voucher.data?.type === 'BILL' ? firstBillId : undefined);
  const journey = usePurchaseJourney({
    orderId: bill.data?.purchaseOrderId,
    billId: firstBillId && voucher.data?.type === 'BILL' ? firstBillId : undefined,
    current: 'payment',
  });
  const approve = useApprovePayment();
  const reject = useRejectPayment();

  if (accessLoading || voucher.isLoading) {
    return <StateFrame kind="loading" />;
  }
  const canRead = can(PURCHASE_MENU.payments, 'read') || can(PURCHASE_MENU.approvePayment, 'read');
  if (!canRead) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (voucher.isError) {
    return voucher.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          voucher.refetch();
        }}
      />
    );
  }
  const doc = voucher.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }
  const isAdvance = doc.type === 'ADVANCE';

  return (
    <PageFrame
      icon={IconWallet}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} />
        </Group>
      }
      description={t('payments.detail.subtitle', {
        type: t(`payments.detail.type${doc.type}`),
        vendor: doc.vendor.name,
      })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<PaymentActionBar doc={doc} />}
    >
      <PaymentHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <StatusNote tone={NOTE_TONE[doc.status] ?? 'neutral'}>
              {t(`payments.detail.note.${doc.status}`)}
            </StatusNote>
            <PaymentInfoCard doc={doc} />
            {!isAdvance && <PaymentBillsCard lines={doc.lines} />}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <PaymentAmountsCard doc={doc} />
            <ApprovalPanel
              approval={doc.approval}
              status={doc.status}
              canApprove={can(PURCHASE_MENU.approvePayment, 'update')}
              busy={approve.isPending || reject.isPending}
              onApprove={(note) => approve.mutate({ id: doc.id, note })}
              onReject={(reason) => reject.mutate({ id: doc.id, reason })}
            />
            {!isAdvance && <DocumentJourney steps={journey.steps} />}
            <AttachmentsCard
              target="payment"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.payments, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
