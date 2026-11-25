import { Grid, Stack } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { paymentRequestActions } from '@/module/purchases/domain/paymentRequest';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentRequestActionBar } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestActionBar';
import {
  PaymentRequestInfoCard,
  PaymentRequestItemsCard,
  PaymentRequestSummaryCard,
} from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestDetailCards';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { DocumentApprovalLog } from '@/module/purchases/presentation/components/shared/DocumentApprovalLog';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApprovePaymentRequest,
  useRejectPaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { usePaymentRequest } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.payments;

export default function PaymentRequestDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
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
    <DocumentFrame
      icon={IconCoins}
      number={doc.number}
      badges={<StatusBadge status={doc.status} label={doc.statusLabel} />}
      date={formatDay(doc.date, currentLanguage)}
      backTo={BACK}
      backLabel={t('paymentRequests.detail.backToList')}
      actions={<PaymentRequestActionBar doc={doc} />}
      waiting={
        doc.status === 'PENDING_APPROVAL' && !paymentRequestActions(doc).decide
          ? t('paymentRequests.detail.waitingApproval', {
              level: doc.approval.pending[0]?.name ?? '',
            })
          : doc.status === 'APPROVED' && !can(PURCHASE_MENU.payments, 'create')
            ? t('paymentRequests.detail.waitingVoucher')
            : undefined
      }
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <PaymentRequestInfoCard doc={doc} />
            <PaymentRequestItemsCard doc={doc} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <PaymentRequestSummaryCard doc={doc} />
            <ApprovalPanel
              approval={doc.approval}
              status={doc.status}
              canApprove={can(PURCHASE_MENU.approvePayment, 'update')}
              busy={approve.isPending || reject.isPending}
              onApprove={(note) => approve.mutate({ id: doc.id, note })}
              onReject={(reason) => reject.mutate({ id: doc.id, reason })}
            />
            <DocumentApprovalLog kind="paymentRequest" id={doc.id} />
            <DocumentJourney steps={journey.steps} />
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
