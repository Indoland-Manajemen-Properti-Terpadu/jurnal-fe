import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  emptyPaymentRequestForm,
  paymentRequestToForm,
  type PaymentRequestFormValues,
} from '@/module/purchases/domain/paymentRequest';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentRequestFormBody } from '@/module/purchases/presentation/components/paymentRequests/PaymentRequestFormBody';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useBill,
  useOrder,
  usePaymentRequest,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.paymentRequests;

/** Creates a Payment Request (blank, or from a bill or an order) or changes a draft one. */
export default function PaymentRequestFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const billId = params.get('bill') ?? undefined;
  const orderId = params.get('order') ?? undefined;
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const request = usePaymentRequest(id);
  const bill = useBill(id ? undefined : billId);
  const order = useOrder(id ? undefined : orderId);

  const waiting =
    accessLoading ||
    (id && request.isLoading) ||
    (billId && !id && bill.isLoading) ||
    (orderId && !id && order.isLoading);
  if (waiting) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.paymentRequests, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }

  const failed = id ? request : billId ? bill : orderId ? order : null;
  if (failed?.isError) {
    return failed.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          failed.refetch();
        }}
      />
    );
  }

  if (id) {
    const doc = request.data;
    if (!doc) return <StateFrame kind="loading" />;
    const back = routes.purchases.paymentRequestDetail.replace(':id', doc.id);
    if (doc.status !== 'DRAFT') {
      return (
        <StateFrame
          kind="blocked"
          title={t('paymentRequests.form.notEditableTitle')}
          description={t('paymentRequests.form.notEditableDescription')}
          backTo={back}
        />
      );
    }
    return (
      <PaymentRequestFormBody
        key={doc.id}
        initial={paymentRequestToForm(doc)}
        initialVendor={doc.vendor}
        editing={doc}
        backTo={back}
      />
    );
  }

  if (billId && bill.data) {
    const doc = bill.data;
    const back = routes.purchases.billDetail.replace(':id', doc.id);
    const open = doc.status === 'VERIFIED' || doc.status === 'PARTIAL_PAID';
    if (!open || doc.requestableAmount <= 0) {
      return (
        <StateFrame
          kind="blocked"
          title={t('paymentRequests.form.notReadyTitle')}
          description={t('paymentRequests.form.notReadyDescription')}
          backTo={back}
        />
      );
    }
    const initial: PaymentRequestFormValues = {
      ...emptyPaymentRequestForm('SETTLEMENT', todayIso()),
      amounts: { [doc.id]: doc.requestableAmount },
    };
    return (
      <PaymentRequestFormBody
        key={doc.id}
        initial={initial}
        initialVendor={doc.vendor}
        backTo={back}
      />
    );
  }

  if (orderId && order.data) {
    const doc = order.data;
    const initial: PaymentRequestFormValues = {
      ...emptyPaymentRequestForm('DP', todayIso()),
      purchaseOrderId: doc.id,
      advanceAmount: doc.advance.available > 0 ? doc.advance.available : '',
    };
    return (
      <PaymentRequestFormBody
        key={doc.id}
        initial={initial}
        initialVendor={doc.vendor}
        backTo={routes.purchases.orderDetail.replace(':id', doc.id)}
      />
    );
  }

  return (
    <PaymentRequestFormBody
      key="blank"
      initial={emptyPaymentRequestForm('SETTLEMENT', todayIso())}
      initialVendor={null}
    />
  );
}
