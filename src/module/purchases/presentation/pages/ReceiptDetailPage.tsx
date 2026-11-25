import { useState } from 'react';
import { Button, Grid, Stack } from '@mantine/core';
import {
  IconCalculator,
  IconFileInvoice,
  IconPackageImport,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { receiptActions } from '@/module/purchases/domain/purchaseActions';
import { OpnameBlockAlert } from '@/module/purchases/presentation/components/receipts/OpnameBlockAlert';
import { ReceiptSummaryCard } from '@/module/purchases/presentation/components/receipts/ReceiptSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentApprovalLog } from '@/module/purchases/presentation/components/shared/DocumentApprovalLog';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import {
  formatAmount,
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { BillsTableCard } from '@/module/purchases/presentation/components/shared/BillsTableCard';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatGrid } from '@/module/purchases/presentation/components/shared/StatGrid';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { ReceiptStatusBadge } from '@/module/purchases/presentation/components/receipts/ReceiptStatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import {
  useApproveReceipt,
  useRejectReceipt,
  useResubmitReceipt,
  useVoidReceipt,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useBills, useReceipt } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { toApiError } from '@/lib/http/apiError';
import { routes } from '@/router/routes';

const BACK = routes.purchases.receipts;

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const receipt = useReceipt(id);
  const journey = useDocumentChain('goodsReceipt', id);
  const orderBills = useBills(
    { purchaseOrder: receipt.data?.purchaseOrderId, limit: 50 },
    Boolean(receipt.data?.purchaseOrderId)
  );
  const voidReceipt = useVoidReceipt();
  const approve = useApproveReceipt();
  const reject = useRejectReceipt();
  const resubmit = useResubmitReceipt();
  const [voiding, setVoiding] = useState(false);

  if (accessLoading || receipt.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (receipt.isError) {
    return receipt.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          receipt.refetch();
        }}
      />
    );
  }
  const doc = receipt.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }
  const actions = receiptActions(doc);
  const canVoid = actions.void && can(PURCHASE_MENU.receipts, 'delete');
  const canBill = doc.status === 'POSTED' && can(PURCHASE_MENU.documents, 'create');
  const canResubmit = actions.resubmit && can(PURCHASE_MENU.receipts, 'update');

  const totalReceived = doc.items.reduce((sum, item) => sum + item.receivedQty, 0);
  const totalRejected = doc.items.reduce((sum, item) => sum + item.rejectedQty, 0);

  return (
    <DocumentFrame
      icon={IconPackageImport}
      number={doc.number}
      badges={<ReceiptStatusBadge receipt={doc} />}
      date={`${doc.documentLabel} · ${formatDay(doc.date, currentLanguage)}`}
      backTo={BACK}
      backLabel={t('receipts.detail.backToList')}
      actions={
        <>
          {canBill && (
            <Button
              radius="md"
              leftSection={<IconFileInvoice size={16} />}
              onClick={() => navigate(`${routes.purchases.billAdd}?receipt=${doc.id}`)}
            >
              {t('receipts.detail.createBill')}
            </Button>
          )}
          {canResubmit && (
            <Button
              radius="md"
              leftSection={<IconSend size={16} />}
              loading={resubmit.isPending}
              onClick={() => resubmit.mutate({ id: doc.id })}
            >
              {t('receipts.detail.resubmit')}
            </Button>
          )}
          {canVoid && (
            <Button
              variant="default"
              color="red"
              radius="md"
              leftSection={<IconX size={16} />}
              onClick={() => setVoiding(true)}
            >
              {t('receipts.detail.void', { label: doc.documentLabel })}
            </Button>
          )}
        </>
      }
    >
      <Stack gap="lg">
        <OpnameBlockAlert error={voidReceipt.error} />
        <Grid gutter="lg" align="flex-start">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              <ReceiptSummaryCard receipt={doc} />
              <BillsTableCard
                title={t('receipts.detail.billsTitle')}
                subtitle={t('receipts.detail.billsSubtitle')}
                bills={(orderBills.data?.items ?? []).filter((bill) =>
                  doc.billRefs.some((ref) => ref.id === bill.id)
                )}
                emptyText={t('receipts.detail.billsEmpty')}
              />
              <AttachmentsCard
                target="receipt"
                documentId={doc.id}
                attachments={doc.attachments}
                canUpload={can(PURCHASE_MENU.receipts, 'update') && doc.status !== 'VOID'}
              />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="lg">
              <SectionCard
                icon={IconCalculator}
                label
                flush
                title={t('receipts.detail.summaryTitle')}
                subtitle={t('receipts.detail.summarySubtitle')}
              >
                <StatGrid
                  items={[
                    { label: t('receipts.detail.totalItems'), value: String(doc.items.length) },
                    {
                      label: t('receipts.detail.totalReceived'),
                      value: formatQuantity(totalReceived),
                    },
                    ...(doc.kind === 'GOODS'
                      ? [
                          {
                            label: t('receipts.detail.totalRejected'),
                            value: formatQuantity(totalRejected),
                          },
                        ]
                      : []),
                    { label: t('receipts.detail.totalAccrual'), value: formatAmount(doc.amount) },
                  ]}
                />
              </SectionCard>
              <ApprovalPanel
                approval={doc.approval}
                status={doc.status}
                canApprove={can(PURCHASE_MENU.approveReceipt, 'update')}
                busy={approve.isPending || reject.isPending}
                onApprove={(note) => approve.mutate({ id: doc.id, note })}
                onReject={(reason) => reject.mutate({ id: doc.id, reason })}
              />
              <DocumentApprovalLog kind="receipt" id={doc.id} />
              <DocumentJourney steps={journey.steps} />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
      <ReasonModal
        opened={voiding}
        title={t('receipts.detail.voidTitle', { label: doc.documentLabel })}
        description={t('receipts.detail.voidDescription')}
        confirmLabel={t('receipts.detail.void', { label: doc.documentLabel })}
        loading={voidReceipt.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidReceipt.mutate(
            { id: doc.id, reason },
            {
              onSuccess: () => setVoiding(false),
              // The reason in the dialog does not matter once a count blocks it; the page explains why.
              onError: (error) => {
                if (toApiError(error).blockingOpname) setVoiding(false);
              },
            }
          )
        }
      />
    </DocumentFrame>
  );
}
