import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatIDR } from '../../domain/saleFormat';
import type { ReturnApplication, SaleReturn } from '../../domain/saleReturn';
import { ApplyCreditDialog } from '../components/returns/ApplyCreditDialog';
import { RefundDialog } from '../components/returns/RefundDialog';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { ReasonModal } from '../components/shared/ReasonModal';
import {
  useApplyReturnCredit,
  useCancelReturn,
  useCancelReturnApplication,
  useCancelReturnRefund,
  useDeleteReturn,
  useIssueReturn,
  useRefundReturn,
} from './useReturnMutations';

type Kind = 'delete' | 'issue' | 'cancel' | 'apply' | 'refund' | 'cancelRefund';

export interface ReturnHandlers {
  onView: (ret: SaleReturn) => void;
  onEdit: (ret: SaleReturn) => void;
  onIssue: (ret: SaleReturn) => void;
  onCancel: (ret: SaleReturn) => void;
  onDelete: (ret: SaleReturn) => void;
  onApplyCredit: (ret: SaleReturn) => void;
  onRefund: (ret: SaleReturn) => void;
  onCancelRefund: (ret: SaleReturn) => void;
  onCancelApplication: (ret: SaleReturn, application: ReturnApplication) => void;
  onViewInvoice: (ret: SaleReturn) => void;
}

export const returnDetailPath = (id: string) => routes.sales.returnDetail.replace(':id', id);
const editPath = (id: string) => routes.sales.returnEdit.replace(':id', id);

/**
 * The actions of a return with the dialogs they need, for the list rows and the detail page
 * alike. `onDeleted` lets a page that is open on the return leave it once it is gone.
 */
export function useReturnActions(options: { onDeleted?: () => void } = {}): {
  handlers: ReturnHandlers;
  dialogs: ReactNode;
} {
  const navigate = useNavigate();
  const { t } = useTranslation('salesReturns');
  const [pending, setPending] = useState<{ kind: Kind; ret: SaleReturn } | null>(null);
  const [application, setApplication] = useState<{
    ret: SaleReturn;
    application: ReturnApplication;
  } | null>(null);
  const close = () => setPending(null);

  const deleteMutation = useDeleteReturn();
  const issueMutation = useIssueReturn();
  const cancelMutation = useCancelReturn();
  const applyMutation = useApplyReturnCredit();
  const refundMutation = useRefundReturn();
  const cancelRefundMutation = useCancelReturnRefund();
  const cancelApplicationMutation = useCancelReturnApplication();

  const open = (kind: Kind) => (ret: SaleReturn) => setPending({ kind, ret });
  const ret = pending?.ret ?? null;
  const number = ret?.transactionNumber ?? '';
  const run = async (action: Promise<unknown>) => {
    await action.catch(() => undefined);
    close();
  };

  const handlers: ReturnHandlers = {
    onView: (r) => navigate(returnDetailPath(r.id)),
    onEdit: (r) => navigate(editPath(r.id)),
    onIssue: open('issue'),
    onCancel: open('cancel'),
    onDelete: open('delete'),
    onApplyCredit: open('apply'),
    onRefund: open('refund'),
    onCancelRefund: open('cancelRefund'),
    onCancelApplication: (r, a) => setApplication({ ret: r, application: a }),
    onViewInvoice: (r) => r.sale && navigate(routes.sales.detail.replace(':id', r.sale)),
  };

  const dialogs = (
    <>
      <ConfirmModal
        opened={pending?.kind === 'delete'}
        tone="danger"
        loading={deleteMutation.isPending}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage', { number })}
        confirmLabel={t('confirm.deleteConfirm')}
        onClose={close}
        onConfirm={() =>
          ret &&
          run(
            deleteMutation.mutateAsync(ret.id).then(() => {
              options.onDeleted?.();
            })
          )
        }
      />
      <ConfirmModal
        opened={pending?.kind === 'issue'}
        loading={issueMutation.isPending}
        title={t('confirm.issueTitle', { number })}
        message={t('confirm.issueMessage')}
        confirmLabel={t('confirm.issueConfirm')}
        onClose={close}
        onConfirm={() => ret && run(issueMutation.mutateAsync(ret.id))}
      />
      <ReasonModal
        opened={pending?.kind === 'cancel'}
        loading={cancelMutation.isPending}
        title={t('confirm.cancelTitle', { number })}
        description={t('confirm.cancelDescription')}
        confirmLabel={t('confirm.cancelConfirm')}
        onClose={close}
        onConfirm={(reason) => ret && run(cancelMutation.mutateAsync({ id: ret.id, reason }))}
      />
      <ConfirmModal
        opened={pending?.kind === 'cancelRefund'}
        loading={cancelRefundMutation.isPending}
        title={t('confirm.cancelRefundTitle')}
        message={t('confirm.cancelRefundMessage')}
        confirmLabel={t('confirm.cancelRefundConfirm')}
        onClose={close}
        onConfirm={() => ret && run(cancelRefundMutation.mutateAsync(ret.id))}
      />
      <ConfirmModal
        opened={application !== null}
        loading={cancelApplicationMutation.isPending}
        title={t('confirm.cancelApplicationTitle')}
        message={t('confirm.cancelApplicationMessage', {
          invoice: application?.application.saleNumber ?? '',
          amount: formatIDR(application?.application.amount),
        })}
        confirmLabel={t('confirm.cancelApplicationConfirm')}
        onClose={() => setApplication(null)}
        onConfirm={async () => {
          if (!application) return;
          await cancelApplicationMutation
            .mutateAsync({ id: application.ret.id, applicationId: application.application.id })
            .catch(() => undefined);
          setApplication(null);
        }}
      />
      {pending?.kind === 'apply' && (
        <ApplyCreditDialog
          key={pending.ret.id}
          ret={pending.ret}
          loading={applyMutation.isPending}
          onClose={close}
          onSubmit={(input) => run(applyMutation.mutateAsync({ id: pending.ret.id, input }))}
        />
      )}
      {pending?.kind === 'refund' && (
        <RefundDialog
          key={pending.ret.id}
          ret={pending.ret}
          loading={refundMutation.isPending}
          onClose={close}
          onSubmit={(input) => run(refundMutation.mutateAsync({ id: pending.ret.id, input }))}
        />
      )}
    </>
  );

  return { handlers, dialogs };
}
