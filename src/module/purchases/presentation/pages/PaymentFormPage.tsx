import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  canEditVoucher,
  emptyPaymentForm,
  paymentFormFromVoucher,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import { PaymentFormBody } from '@/module/purchases/presentation/components/payments/PaymentFormBody';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useBill, usePayment } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = `${routes.purchases.main}?tab=payments`;

/** Creates a voucher (paying one bill from its page, or an advance) or changes a draft one. */
export default function PaymentFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const billId = params.get('bill') ?? undefined;
  const isAdvance = params.get('type') === 'advance';
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const voucher = usePayment(id);
  const bill = useBill(id ? undefined : billId);

  if (accessLoading || (id && voucher.isLoading) || (billId && !id && bill.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.payments, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }

  if (id) {
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
    if (!doc) return <StateFrame kind="loading" />;
    const back = routes.purchases.paymentDetail.replace(':id', doc.id);
    if (!canEditVoucher(doc)) {
      return (
        <StateFrame
          kind="blocked"
          title={t('payments.form.notEditableTitle')}
          description={t('payments.form.notEditableDescription')}
          backTo={back}
        />
      );
    }
    return (
      <PaymentFormBody
        key={doc.id}
        initial={paymentFormFromVoucher(doc)}
        initialVendor={doc.vendor}
        editing={doc}
        backTo={back}
      />
    );
  }

  if (billId) {
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
    if (!doc) return <StateFrame kind="loading" />;
    const back = routes.purchases.billDetail.replace(':id', doc.id);
    const payable =
      (doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID') && doc.remainingAmount > 0;
    if (!payable) {
      return (
        <StateFrame
          kind="blocked"
          title={t('payments.form.notReadyTitle')}
          description={t('payments.form.notReadyDescription')}
          backTo={back}
        />
      );
    }
    const today = todayIso();
    const initial: PaymentFormValues = {
      ...emptyPaymentForm('BILL', today > doc.date ? today : doc.date),
      vendorId: doc.vendor.id,
      amounts: { [doc.id]: doc.remainingAmount },
    };
    return (
      <PaymentFormBody key={doc.id} initial={initial} initialVendor={doc.vendor} backTo={back} />
    );
  }

  return (
    <PaymentFormBody
      key={isAdvance ? 'advance' : 'bills'}
      initial={emptyPaymentForm(isAdvance ? 'ADVANCE' : 'BILL', todayIso())}
      initialVendor={null}
    />
  );
}
