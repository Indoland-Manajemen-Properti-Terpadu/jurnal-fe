import { Grid, Stack } from '@mantine/core';
import { IconFileInvoice, IconReceiptRefund, IconWallet } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { BillActionBar } from '@/module/purchases/presentation/components/bills/BillActionBar';
import { BillInfoCard } from '@/module/purchases/presentation/components/bills/BillInfoCard';
import { BillItemsCard } from '@/module/purchases/presentation/components/bills/BillItemsCard';
import { BillVariancesCard } from '@/module/purchases/presentation/components/bills/BillVariancesCard';
import { CreditApplicationsCard } from '@/module/purchases/presentation/components/bills/CreditApplicationsCard';
import { useBillExtras } from '@/module/purchases/presentation/components/bills/billExtras';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { AmountsCard } from '@/module/purchases/presentation/components/shared/AmountsCard';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { DocumentJournalsCard } from '@/module/purchases/presentation/components/shared/DocumentJournalsCard';
import { DocumentJourney } from '@/module/purchases/presentation/components/shared/DocumentJourney';
import { DocumentFrame } from '@/module/purchases/presentation/components/shared/DocumentFrame';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { RelatedDocsCard } from '@/module/purchases/presentation/components/shared/RelatedDocsCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useDocumentChain } from '@/module/purchases/presentation/hooks/useDashboard';
import { useBill } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.bills;

export default function BillDetailPage() {
  const { id } = useParams();
  const { t, currentLanguage } = useTranslation('purchases');
  const { can, canRead, isLoading: accessLoading } = usePurchaseAccess();
  const bill = useBill(id);
  const extras = useBillExtras(id);
  const journey = useDocumentChain('purchaseBill', id);

  if (accessLoading || bill.isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!canRead()) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (bill.isError) {
    return bill.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          bill.refetch();
        }}
      />
    );
  }
  const doc = bill.data;
  if (!doc) {
    return <StateFrame kind="loading" />;
  }
  const open = doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID';
  const amountRows = [
    { label: t('bills.detail.payableLabel'), value: formatAmount(doc.finalAmount) },
    ...(doc.returnedAmount > 0
      ? [
          {
            label: t('bills.detail.returnedLabel'),
            value: `-${formatAmount(doc.returnedAmount)}`,
            tone: 'danger' as const,
          },
        ]
      : []),
    ...(doc.creditAppliedAmount > 0
      ? [
          {
            label: t('bills.detail.offset'),
            value: `-${formatAmount(doc.creditAppliedAmount)}`,
            tone: 'danger' as const,
          },
        ]
      : []),
    ...(doc.heldAmount > 0
      ? [{ label: t('bills.detail.held'), value: formatAmount(doc.heldAmount) }]
      : []),
    {
      label: t('bills.detail.paid'),
      value: formatAmount(doc.paidAmount),
      tone: 'success' as const,
    },
  ];

  return (
    <DocumentFrame
      icon={IconFileInvoice}
      number={doc.number}
      badges={<StatusBadge status={doc.status} label={doc.displayStatusLabel || doc.statusLabel} />}
      date={formatDay(doc.date, currentLanguage)}
      backTo={BACK}
      backLabel={t('bills.detail.backToList')}
      actions={<BillActionBar bill={doc} />}
    >
      <BillVariancesCard bill={doc} findings={extras.data?.variances ?? []} />
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <BillInfoCard bill={doc} />
            <BillItemsCard bill={doc} />
            <RelatedDocsCard
              icon={IconWallet}
              title={t('bills.detail.paymentsTitle')}
              subtitle={t('bills.detail.paymentsSubtitle')}
              count={t('bills.detail.docsCount', { count: doc.paymentRequestRefs.length })}
              emptyText={t('bills.detail.paymentsEmpty')}
              docs={doc.paymentRequestRefs.map((ref) => ({
                ...ref,
                to: routes.purchases.paymentRequestDetail.replace(':id', ref.id),
              }))}
            />
            <RelatedDocsCard
              icon={IconReceiptRefund}
              title={t('bills.detail.returnsTitle')}
              subtitle={t('bills.detail.returnsSubtitle')}
              count={t('bills.detail.returnsCount', { count: doc.returnRefs.length })}
              emptyText={t('bills.detail.returnsEmpty')}
              docs={doc.returnRefs.map((ref) => ({
                ...ref,
                to: routes.purchases.returnDetail.replace(':id', ref.id),
              }))}
            />
            <CreditApplicationsCard
              billId={doc.id}
              allocations={extras.data?.allocations ?? []}
              canVoid={open && can(PURCHASE_MENU.payments, 'delete')}
            />
            <DocumentJournalsCard journals={doc.journals} />
            <AttachmentsCard
              target="bill"
              documentId={doc.id}
              attachments={doc.attachments}
              canUpload={can(PURCHASE_MENU.documents, 'update') && doc.status !== 'VOID'}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="lg">
            <AmountsCard
              subtotal={doc.subtotal}
              discountAmount={doc.discountAmount}
              taxAmount={doc.taxAmount}
              withholdingAmount={doc.withholdingAmount}
              extra={amountRows}
              closing={{ label: t('bills.detail.remaining'), value: doc.remainingAmount }}
              subtitle={t('bills.detail.amountsSubtitle')}
            />
            <DocumentJourney steps={journey.steps} />
          </Stack>
        </Grid.Col>
      </Grid>
    </DocumentFrame>
  );
}
