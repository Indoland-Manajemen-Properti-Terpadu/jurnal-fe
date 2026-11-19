import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { SaleQuote } from '@/module/sales/domain/saleQuote';
import { quoteFilename } from '@/module/sales/domain/saleQuoteFormat';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { ReasonModal } from '../components/shared/ReasonModal';
import { SendQuoteDialog } from '../components/quotes/SendQuoteDialog';
import {
  useAcceptQuote,
  useCancelQuote,
  useDeleteQuote,
  useDownloadQuotePdf,
  useDuplicateQuote,
  useRejectQuote,
  useResendQuote,
  useReviseQuote,
  useSendQuote,
} from './useQuoteMutations';

type Kind = 'delete' | 'accept' | 'revise' | 'reject' | 'cancel' | 'send' | 'resend';

export interface QuoteHandlers {
  onView: (quote: SaleQuote) => void;
  onEdit: (quote: SaleQuote) => void;
  onSend: (quote: SaleQuote) => void;
  onResend: (quote: SaleQuote) => void;
  onAccept: (quote: SaleQuote) => void;
  onReject: (quote: SaleQuote) => void;
  onRevise: (quote: SaleQuote) => void;
  onCancel: (quote: SaleQuote) => void;
  onDelete: (quote: SaleQuote) => void;
  onDuplicate: (quote: SaleQuote) => void;
  onPdf: (quote: SaleQuote) => void;
}

const detailPath = (id: string) => routes.sales.quotationDetail.replace(':id', id);
const editPath = (id: string) => routes.sales.quotationEdit.replace(':id', id);

/**
 * The actions of a quote with the dialogs they need, for the list rows and the detail page alike.
 * `onDeleted` lets a page that is open on the quote leave it once it is gone.
 */
export function useQuoteActions(options: { onDeleted?: () => void } = {}): {
  handlers: QuoteHandlers;
  dialogs: ReactNode;
  busy: boolean;
} {
  const navigate = useNavigate();
  const { t } = useTranslation('salesQuotes');
  const [pending, setPending] = useState<{ kind: Kind; quote: SaleQuote } | null>(null);
  const close = () => setPending(null);

  const deleteMutation = useDeleteQuote();
  const acceptMutation = useAcceptQuote();
  const reviseMutation = useReviseQuote();
  const rejectMutation = useRejectQuote();
  const cancelMutation = useCancelQuote();
  const sendMutation = useSendQuote();
  const resendMutation = useResendQuote();
  const duplicateMutation = useDuplicateQuote();
  const pdfMutation = useDownloadQuotePdf();

  const open = (kind: Kind) => (quote: SaleQuote) => setPending({ kind, quote });
  const quote = pending?.quote ?? null;
  const number = quote?.transactionNumber ?? '';
  const run = async (action: Promise<unknown>) => {
    await action.catch(() => undefined);
    close();
  };

  const handlers: QuoteHandlers = {
    onView: (q) => navigate(detailPath(q.id)),
    onEdit: (q) => navigate(editPath(q.id)),
    onSend: open('send'),
    onResend: open('resend'),
    onAccept: open('accept'),
    onReject: open('reject'),
    onRevise: open('revise'),
    onCancel: open('cancel'),
    onDelete: open('delete'),
    onDuplicate: async (q) => {
      const copy = await duplicateMutation.mutateAsync(q.id).catch(() => null);
      if (copy) navigate(detailPath(copy.id));
    },
    onPdf: (q) => pdfMutation.mutate({ id: q.id, filename: quoteFilename(q.transactionNumber) }),
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
          quote &&
          run(
            deleteMutation.mutateAsync(quote.id).then(() => {
              options.onDeleted?.();
            })
          )
        }
      />
      <ConfirmModal
        opened={pending?.kind === 'accept'}
        loading={acceptMutation.isPending}
        title={t('confirm.acceptTitle', { number })}
        message={t('confirm.acceptMessage')}
        confirmLabel={t('confirm.acceptConfirm')}
        onClose={close}
        onConfirm={() => quote && run(acceptMutation.mutateAsync(quote.id))}
      />
      <ConfirmModal
        opened={pending?.kind === 'revise'}
        loading={reviseMutation.isPending}
        title={t('confirm.reviseTitle', { number })}
        message={t('confirm.reviseMessage')}
        confirmLabel={t('confirm.reviseConfirm')}
        onClose={close}
        onConfirm={() => quote && run(reviseMutation.mutateAsync(quote.id))}
      />
      <ReasonModal
        opened={pending?.kind === 'reject'}
        loading={rejectMutation.isPending}
        title={t('confirm.rejectTitle', { number })}
        description={t('confirm.rejectDescription')}
        confirmLabel={t('confirm.rejectConfirm')}
        onClose={close}
        onConfirm={(reason) => quote && run(rejectMutation.mutateAsync({ id: quote.id, reason }))}
      />
      <ReasonModal
        opened={pending?.kind === 'cancel'}
        loading={cancelMutation.isPending}
        title={t('confirm.cancelTitle', { number })}
        description={t('confirm.cancelDescription')}
        confirmLabel={t('confirm.cancelConfirm')}
        onClose={close}
        onConfirm={(reason) => quote && run(cancelMutation.mutateAsync({ id: quote.id, reason }))}
      />
      {(pending?.kind === 'send' || pending?.kind === 'resend') && (
        <SendQuoteDialog
          key={`${pending.kind}-${pending.quote.id}`}
          opened
          quote={pending.quote}
          resend={pending.kind === 'resend'}
          loading={sendMutation.isPending || resendMutation.isPending}
          onClose={close}
          onSubmit={(input) =>
            run(
              pending.kind === 'send'
                ? sendMutation.mutateAsync({ id: pending.quote.id, input })
                : resendMutation.mutateAsync({ id: pending.quote.id, input })
            )
          }
        />
      )}
    </>
  );

  return {
    handlers,
    dialogs,
    busy: duplicateMutation.isPending || pdfMutation.isPending,
  };
}
