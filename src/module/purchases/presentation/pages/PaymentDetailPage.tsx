import { Grid, Stack } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentActionBar } from '@/module/purchases/presentation/components/payments/PaymentActionBar';
import {
  PaymentAmountsCard,
  PaymentInfoCard,
  PaymentItemsCard,
} from '@/module/purchases/presentation/components/payments/PaymentDetailCards';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePayment } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.payments;

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const voucher = usePayment(id);
  const journey = useDocumentChain('purchasePayment', id);

  if (accessLoading || voucher.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.payments, 'read')) {
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

  return (
    <DocumentFrame
      icon={IconWallet}
      number={doc.number}
      badges={<StatusBadge status={doc.status} label={doc.statusLabel} />}
      date={formatDay(doc.date, currentLanguage)}
      backTo={BACK}
      backLabel={t('payments.detail.backToList')}
      actions={<PaymentActionBar doc={doc} />}
    >
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <PaymentInfoCard doc={doc} />
            <PaymentItemsCard doc={doc} />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <PaymentAmountsCard doc={doc} />
            <DocumentJourney steps={journey.steps} />
            <AttachmentsCard
              target="payment"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.payments, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
