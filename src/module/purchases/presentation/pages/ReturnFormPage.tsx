import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  canReturn,
  emptyReturnForm,
  returnFormFromReturn,
} from '@/module/purchases/domain/returnForm';
import { ReturnFormBody } from '@/module/purchases/presentation/components/returns/ReturnFormBody';
import { StateFrame } from '@/module/purchases/presentation/components/requests/StateFrame';
import { todayIso } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { useBill, useReturn } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

const BACK = routes.purchases.returns;

/** Creates a return from a bill (`?bill=`) or changes a draft return. */
export default function ReturnFormPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation('purchases');
  const { can, isLoading: accessLoading } = usePurchaseAccess();
  const draft = useReturn(id);
  const billId = id ? draft.data?.billId : (params.get('bill') ?? undefined);
  const bill = useBill(billId);

  if (accessLoading || (id && draft.isLoading) || (billId && bill.isLoading)) {
    return <StateFrame kind="loading" />;
  }
  if (!can(PURCHASE_MENU.documents, id ? 'update' : 'create')) {
    return <StateFrame kind="noAccess" backTo={BACK} />;
  }
  if (id && draft.isError) {
    return draft.error?.kind === 'notFound' ? (
      <StateFrame kind="notFound" backTo={BACK} />
    ) : (
      <StateFrame
        kind="error"
        backTo={BACK}
        onRetry={() => {
          draft.refetch();
        }}
      />
    );
  }
  if (!id && !billId) {
    return (
      <StateFrame
        kind="blocked"
        title={t('returns.form.noBillTitle')}
        description={t('returns.form.noBillDescription')}
        backTo={routes.purchases.bills}
      />
    );
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
  if (!bill.data || (id && !draft.data)) {
    return <StateFrame kind="loading" />;
  }

  const billDoc = bill.data;
  const back = routes.purchases.billDetail.replace(':id', billDoc.id);

  if (id && draft.data) {
    if (draft.data.status !== 'DRAFT') {
      return (
        <StateFrame
          kind="blocked"
          title={t('returns.form.notEditableTitle')}
          description={t('returns.form.notEditableDescription')}
          backTo={routes.purchases.returnDetail.replace(':id', id)}
        />
      );
    }
    return (
      <ReturnFormBody
        key={draft.data.id}
        bill={billDoc}
        initial={returnFormFromReturn(draft.data)}
        editing={draft.data}
      />
    );
  }

  if (!canReturn(billDoc)) {
    return (
      <StateFrame
        kind="blocked"
        title={t('returns.form.notReadyTitle')}
        description={t('returns.form.notReadyDescription')}
        backTo={back}
      />
    );
  }
  const today = todayIso();
  return (
    <ReturnFormBody
      key={billDoc.id}
      bill={billDoc}
      initial={emptyReturnForm(today > billDoc.date ? today : billDoc.date)}
    />
  );
}
