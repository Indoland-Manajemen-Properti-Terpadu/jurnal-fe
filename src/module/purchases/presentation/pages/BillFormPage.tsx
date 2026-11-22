import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { billActions } from '@/module/purchases/domain/purchaseActions';
import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import { BillFormBody } from '@/module/purchases/presentation/components/bills/BillFormBody';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useBill } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const detailOf = (id: string) => routes.purchases.billDetail.replace(':id', id);

export default function BillFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const bill = useBill(id);

  if (accessLoading || (id && bill.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!id) {
    if (!can(PURCHASE_MENU.documents, 'create')) return <StateFrame kind="noAccess" />;
    const receipt = params.get('receipt') ?? undefined;
    const order = params.get('order') ?? undefined;
    const initial: BillSource = receipt ? 'RECEIPT' : order ? 'ORDER' : 'RECEIPT';
    return (
      <BillFormBody
        initialSource={initial}
        preselect={{ receipt, order }}
        key={`${receipt}-${order}`}
      />
    );
  }
  if (bill.isError) {
    return bill.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" />
    ) : (
      <StateFrame
        kind="error"
        onRetry={() => {
          bill.refetch();
        }}
      />
    );
  }
  if (!bill.data) return <StateFrame kind="loading" />;
  if (!can(PURCHASE_MENU.documents, 'update')) {
    return <StateFrame kind="noAccess" backTo={detailOf(bill.data.id)} />;
  }
  if (!billActions(bill.data).edit) {
    return (
      <StateFrame
        kind="blocked"
        title={t('bills.form.notEditableTitle')}
        description={t('bills.form.notEditableDescription')}
        backTo={detailOf(bill.data.id)}
      />
    );
  }
  return (
    <BillFormBody
      key={bill.data.id}
      existing={bill.data}
      initialSource={bill.data.source}
      preselect={{}}
    />
  );
}
