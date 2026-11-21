import { Grid, Group, Stack } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentRequestActionBar } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestActionBar';
import {
  PaymentRequestInfoCard,
  PaymentRequestItemsCard,
} from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestDetailCards';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import {
  StatusNote,
  type NoteTone,
} from '@/module/purchases/presentation/components/shared/StatusNote';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApprovePaymentRequest,
  useRejectPaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePaymentRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.paymentRequests;

const NOTE_TONE: Record<string, NoteTone> = {
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  REJECTED: 'danger',
  PROCESSED: 'info',
  PAID: 'info',
  CANCELLED: 'danger',
};

export default function PaymentRequestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const request = usePaymentRequest(id);
  const journey = useDocumentChain('paymentRequest', id);
  const approve = useApprovePaymentRequest();
  const reject = useRejectPaymentRequest();

  if (accessLoading || request.isLoading) {
    return <StateFrame kind="loading" />;
  }
  const canRead =
    can(PURCHASE_MENU.paymentRequests, 'read') || can(PURCHASE_MENU.approvePayment, 'read');
  if (!canRead) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (request.isError) {
    return request.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          request.refetch();
        }}
      />
    );
  }
  const doc = request.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }

  return (
    <PageFrame
      icon={IconCoins}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} label={doc.statusLabel} />
        </Group>
      }
      description={t('paymentRequests.detail.subtitle', {
        kind: t(`paymentRequests.kinds.${doc.kind}`),
        vendor: doc.vendor?.name ?? '-',
      })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={<PaymentRequestActionBar doc={doc} />}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <StatusNote tone={NOTE_TONE[doc.status] ?? 'neutral'}>
              {t(`paymentRequests.detail.note.${doc.status}`)}
            </StatusNote>
            <PaymentRequestInfoCard doc={doc} />
            <PaymentRequestItemsCard doc={doc} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <ApprovalPanel
              approval={doc.approval}
              status={doc.status}
              canApprove={can(PURCHASE_MENU.approvePayment, 'update')}
              busy={approve.isPending || reject.isPending}
              onApprove={(note) => approve.mutate({ id: doc.id, note })}
              onReject={(reason) => reject.mutate({ id: doc.id, reason })}
            />
            <DocumentJourney steps={journey.steps} />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageFrame>
  );
}
