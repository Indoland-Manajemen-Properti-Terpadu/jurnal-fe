import { Grid, Stack } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { IconCoins } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { fetchContact } from '@/module/contacts';
import {
  hasVendorBankAccount,
  paymentRequestActions,
  paymentRequestAmountsVisible,
} from '@/module/purchases/domain/paymentRequest';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentRequestVendorsCard } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestVendorsCard';
import { PaymentRequestActionBar } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestActionBar';
import {
  PaymentRequestInfoCard,
  PaymentRequestItemsCard,
  PaymentRequestSummaryCard,
  PaymentRequestVoucherCard,
} from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestDetailCards';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalCard } from '@/module/purchases/presentation/components/shared/ApprovalCard';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { isClosedStatus } from '@/module/purchases/domain/documentChain';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useApprovePaymentRequest,
  useRejectPaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import {
  usePayment,
  usePaymentRequest,
  useOrder,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.payments;

export default function PaymentRequestDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const request = usePaymentRequest(id);
  const voucherDetail = usePayment(request.data?.voucher?.id);
  const { accounts: paymentAccounts } = useSimpleAccounts(
    { isBankAndCash: true },
    Boolean(request.data?.voucher?.id)
  );
  const order = useOrder(request.data?.kind === 'DP' ? request.data.order?.id : undefined);
  const visibleValues = request.data
    ? paymentRequestAmountsVisible(request.data.status, request.data.approval)
    : false;
  const vendorId =
    request.data && !request.data.isMultiVendor && visibleValues
      ? request.data.vendor?.id
      : undefined;
  const vendor = useQuery({
    queryKey: ['purchase-vendor-bank', vendorId ?? ''],
    queryFn: () => fetchContact(vendorId as string),
    enabled: Boolean(vendorId),
    staleTime: 5 * 60 * 1000,
  });
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
  const depositAccount = voucherDetail.data?.depositAccountId
    ? paymentAccounts.find((account) => account.id === voucherDetail.data?.depositAccountId)
    : undefined;
  const depositAccountLabel = depositAccount
    ? `${depositAccount.accountNumber} · ${depositAccount.name}`
    : undefined;
  const vendorBankAccounts = (vendor.data?.bankAccounts ?? []).filter((account) =>
    hasVendorBankAccount([account])
  );
  const vendorBankLabel =
    vendorBankAccounts.length === 1
      ? `${vendorBankAccounts[0].bankName} ${vendorBankAccounts[0].accountNumber} a.n. ${vendorBankAccounts[0].accountHolder}`
      : undefined;
  const paymentTermName = order.data?.paymentTermName ?? undefined;
  const relatedOrders = (journey.chain?.purchaseOrders ?? [])
    .filter((purchaseOrder) => !isClosedStatus(purchaseOrder.status))
    .map(({ id: orderId, number }) => ({ id: orderId, number }));

  return (
    <DocumentFrame
      icon={IconCoins}
      number={doc.number}
      badges={
        <StatusBadge
          status={doc.status}
          label={
            doc.status === 'APPROVED' || doc.status === 'PROCESSED'
              ? t(`paymentRequests.statusLabels.${doc.status}`)
              : doc.statusLabel
          }
          englishLabel={
            doc.status === 'APPROVED' || doc.status === 'PROCESSED'
              ? t(`paymentRequests.statusLabels.${doc.status}`)
              : undefined
          }
        />
      }
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
            <PaymentRequestInfoCard
              doc={doc}
              vendorBankLabel={vendorBankLabel}
              relatedOrders={relatedOrders}
              paymentTermName={paymentTermName}
            />
            {doc.kind === 'DP' && (doc.attachments.length > 0 || doc.status === 'DRAFT') && (
              <AttachmentsCard
                target="paymentRequest"
                documentId={doc.id}
                attachments={doc.attachments}
                canUpload={doc.status === 'DRAFT' && can(PURCHASE_MENU.paymentRequests, 'update')}
                titleKey="paymentRequests.detail.proformaTitle"
              />
            )}
            <PaymentRequestVendorsCard doc={doc} />
            <PaymentRequestItemsCard doc={doc} paymentTermName={paymentTermName} />
            {!doc.isMultiVendor && (
              <PaymentRequestVoucherCard doc={doc} depositAccountLabel={depositAccountLabel} />
            )}
            {!doc.isMultiVendor && doc.voucher?.status === 'PAID' && voucherDetail.data && (
              <AttachmentsCard
                target="payment"
                documentId={voucherDetail.data.id}
                attachments={voucherDetail.data.attachments}
                canUpload={false}
                titleKey="paymentRequests.detail.transferProofTitle"
                subtitleKey="paymentRequests.detail.transferProofSubtitle"
                showCount
                showFileActions
              />
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <PaymentRequestSummaryCard doc={doc} vendorBankLabel={vendorBankLabel} />
            <ApprovalCard
              kind="paymentRequest"
              id={doc.id}
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
    </DocumentFrame>
  );
}
