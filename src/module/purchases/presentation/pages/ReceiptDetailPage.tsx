import { useState } from 'react';
import { Button, Grid, Group, Stack } from '@mantine/core';
import { IconPackageImport, IconX } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { receiptActions } from '@/module/purchases/domain/purchaseActions';
import { ReceiptSummaryCard } from '@/module/purchases/presentation/components/receipts/ReceiptSummaryCard';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { ReceiptHighlights } from '@/module/purchases/presentation/components/shared/DocumentHighlights';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseJourney } from '@/module/purchases/presentation/hooks/usePurchaseJourney';
import { useVoidReceipt } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useOrder, useReceipt } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.receipts;

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const receipt = useReceipt(id);
  const order = useOrder(receipt.data?.purchaseOrderId);
  const journey = usePurchaseJourney({
    orderId: receipt.data?.purchaseOrderId,
    current: 'receipt',
  });
  const voidReceipt = useVoidReceipt();
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
  const canVoid = receiptActions(doc).void && can(PURCHASE_MENU.documents, 'delete');

  return (
    <PageFrame
      icon={IconPackageImport}
      title={
        <Group gap="sm" align="center">
          <span>{doc.number}</span>
          <StatusBadge status={doc.status} />
        </Group>
      }
      description={t('receipts.detail.subtitle', { vendor: doc.vendor.name })}
      backTo={BACK}
      backLabel={t('common.back')}
      actions={
        canVoid ? (
          <Button
            variant="default"
            color="red"
            radius="md"
            leftSection={<IconX size={16} />}
            onClick={() => setVoiding(true)}
          >
            {t('receipts.detail.void')}
          </Button>
        ) : undefined
      }
    >
      <ReceiptHighlights doc={doc} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <ReceiptSummaryCard receipt={doc} orderNumber={order.data?.number ?? null} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="receipt"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.documents, 'update') && doc.status === 'POSTED'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
      <ReasonModal
        opened={voiding}
        title={t('receipts.detail.voidTitle')}
        description={t('receipts.detail.voidDescription')}
        confirmLabel={t('receipts.detail.void')}
        loading={voidReceipt.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidReceipt.mutate({ id: doc.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
    </PageFrame>
  );
}
