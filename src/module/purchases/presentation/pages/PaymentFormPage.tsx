import { useSearchParams } from 'react-router-dom';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { PaymentFormBody } from '@/module/purchases/presentation/components/payments/PaymentFormBody';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { routes } from '@/router/routes';

/** Issues a Payment Voucher; `?request=` opens it with one approved Payment Request already chosen. */
export default function PaymentFormPage() {
  const [params] = useSearchParams();
  const { can, isLoading } = usePurchaseAccess();

  if (isLoading) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.payments, 'create')) {
    return <StateFrame kind="noAccess" backTo={routes.purchases.payments} />;
  }
  return <PaymentFormBody initialRequest={params.get('request') ?? undefined} />;
}
