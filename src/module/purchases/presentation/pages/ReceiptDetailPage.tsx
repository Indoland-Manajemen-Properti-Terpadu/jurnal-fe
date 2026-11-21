import { useState } from 'react';
import { Button, Grid, Group, Stack } from '@mantine/core';
import { IconFileInvoice, IconPackageImport, IconSend, IconX } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { receiptActions } from '@/module/purchases/domain/purchaseActions';
import { ReceiptSummaryCard } from '@/module/purchases/presentation/components/receipts/ReceiptSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { ReceiptHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import {
  useApproveReceipt,
  useRejectReceipt,
  useResubmitReceipt,
  useVoidReceipt,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useReceipt } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.receipts;

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const receipt = useReceipt(id);
  const journey = usePurchaseJourney({
    orderId: receipt.data?.purchaseOrderId,
    current: 'receipt',
  });
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

  return (
    <PageFrame
      icon={IconPackageImport}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} label={doc.statusLabel} />
        </Group>
      }
      description={t('receipts.detail.subtitle', {
        label: doc.documentLabel,
        vendor: doc.vendor.name,
      })}
      backTo={BACK}
      backLabel={t('common.back')}
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
      <ReceiptHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <ReceiptSummaryCard receipt={doc} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <ApprovalPanel
              approval={doc.approval}
              status={doc.status}
              canApprove={can(PURCHASE_MENU.approveReceipt, 'update')}
              busy={approve.isPending || reject.isPending}
              onApprove={(note) => approve.mutate({ id: doc.id, note })}
              onReject={(reason) => reject.mutate({ id: doc.id, reason })}
            />
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="receipt"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.receipts, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
      <ReasonModal
        opened={voiding}
        title={t('receipts.detail.voidTitle', { label: doc.documentLabel })}
        description={t('receipts.detail.voidDescription')}
        confirmLabel={t('receipts.detail.void', { label: doc.documentLabel })}
        loading={voidReceipt.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidReceipt.mutate({ id: doc.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
    </PageFrame>
  );
}
