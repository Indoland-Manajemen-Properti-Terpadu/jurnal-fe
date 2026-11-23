import { useState } from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconPlus, IconUsers } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  procurementEditable,
  procurementToInput,
  quotesNeeded,
  type OrderRef,
  type ProcurementInput,
  type Quote,
  type QuoteInput,
  type ScoreKey,
} from '@/module/purchases/domain/procurement';
import { removalImpact, withoutQuote } from '@/module/purchases/domain/quoteRemoval';
import { type NotesValues } from '@/module/purchases/domain/procurementNotes';
import type { ProcurementRoute, PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { ApprovedDialog } from '@/module/purchases/presentation/components/procurement/ApprovedDialog';
import { BiddingForm } from '@/module/purchases/presentation/components/procurement/BiddingForm';
import { SwitchToSingleDialog } from '@/module/purchases/presentation/components/procurement/SwitchToSingleDialog';
import { ProcurementSubmit } from '@/module/purchases/presentation/components/procurement/ProcurementSubmit';
import { SingleVendorForm } from '@/module/purchases/presentation/components/procurement/SingleVendorForm';
import { OrdersCard } from '@/module/purchases/presentation/components/procurement/OrdersCard';
import { ProcurementNotes } from '@/module/purchases/presentation/components/procurement/ProcurementNotes';
import { ProcurementRouteCard } from '@/module/purchases/presentation/components/procurement/ProcurementRouteCard';
import { ProcurementSteps } from '@/module/purchases/presentation/components/procurement/ProcurementSteps';
import { QuoteDetailModal } from '@/module/purchases/presentation/components/procurement/QuoteDetailModal';
import { QuoteModal } from '@/module/purchases/presentation/components/procurement/QuoteModal';
import { QuotesTable } from '@/module/purchases/presentation/components/procurement/QuotesTable';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { AttachmentsCard } from '@/module/purchases/presentation/components/shared/AttachmentsCard';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  useApproveProcurement,
  useCreateOrdersFromProcurement,
  useRejectProcurement,
  useSaveProcurement,
  useSubmitProcurement,
  useUploadAttachments,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';

export interface ProcurementRights {
  /** Fills in the quotes (update on the purchasing menu). */
  fill: boolean;
  /** Creates the order by hand when none was made (create on the purchasing menu). */
  createOrder: boolean;
  /** Holds the procurement approval menu. */
  approve: boolean;
}

interface ProcurementPanelProps {
  request: PurchaseRequest;
  rights: ProcurementRights;
}

/** The procurement of an FPPBJ: quotes, winner, reasons, submit and approval. */
export const ProcurementPanel = ({ request, rights }: Readonly<ProcurementPanelProps>) => {
  const { t } = useTranslation('purchases');
  const { procurement } = request;
  const save = useSaveProcurement();
  const submit = useSubmitProcurement();
  const approve = useApproveProcurement();
  const reject = useRejectProcurement();
  const upload = useUploadAttachments();
  const createOrders = useCreateOrdersFromProcurement();
  const [editing, setEditing] = useState<{ quote: Quote | null } | null>(null);
  const [viewing, setViewing] = useState<Quote | null>(null);
  const [removing, setRemoving] = useState<Quote | null>(null);
  const [approved, setApproved] = useState<OrderRef[] | null>(null);
  const [discarding, setDiscarding] = useState(false);

  const editable = procurementEditable(procurement) && rights.fill;
  const busy = save.isPending || submit.isPending;
  const bidding = procurement.route !== 'SINGLE';
  const single = procurement.route === 'SINGLE';
  const canAddQuote = editable && (bidding || procurement.quotes.length === 0);
  // The route can be changed until the procurement is submitted; the quotes stay saved either way.
  const canSwitchRoute = editable;

  /** Applies one change to the saved procurement and saves the whole of it. */
  const persist = (change: (input: ProcurementInput) => ProcurementInput) =>
    save.mutateAsync({ id: request.id, input: change(procurementToInput(procurement)) });

  const changeRoute = (route: ProcurementRoute, discardQuotes = false) =>
    persist((body) =>
      // A winner left from the single-vendor route is not a bidding result: clear it on the
      // service (omitting it would keep it) so the person picks again.
      route === 'BIDDING'
        ? { ...body, route, winner: null }
        : discardQuotes
          ? { ...body, route, quotes: [], winner: null }
          : {
              ...body,
              route,
              // A single vendor wins by default: keep the winner, else the first quote's vendor.
              ...(body.winner || body.quotes.length === 0 ? {} : { winner: body.quotes[0].vendor }),
            }
    );

  const saveQuote = async (input: QuoteInput, files: File[]) => {
    const existing = editing?.quote ?? null;
    try {
      const saved = await persist((body) => ({
        ...body,
        quotes: existing
          ? body.quotes.map((quote) => (quote.id === existing.id ? input : quote))
          : [...body.quotes, input],
        // A single vendor has one quote; it is the winner without a separate choice.
        ...(single && !existing ? { winner: input.vendor } : {}),
      }));
      // The save's answer does not carry the vendor ids, so the quote is found by the number the
      // vendor gave it (one per quote of a procurement is enough to tell them apart).
      const stored =
        saved.procurement.quotes.find((quote) => quote.number === input.quotationNumber) ??
        saved.procurement.quotes.find((quote) => quote.vendor.id === input.vendor);
      if (files.length > 0 && stored) {
        await upload
          .mutateAsync({
            target: 'request',
            id: request.id,
            files,
            requestFile: 'quote',
            quoteId: stored.id,
          })
          .catch(() => undefined);
      }
      setEditing(null);
    } catch {
      // The refusal is already shown; the dialog stays open so nothing typed is lost.
    }
  };

  const removeQuote = (quote: Quote) =>
    persist((body) => withoutQuote(body, quote)).finally(() => setRemoving(null));

  const impact = removing ? removalImpact(procurement, removing) : null;
  const removeDescription =
    removing && impact
      ? [
          t('procurement.removeDescription', {
            vendor: removing.vendor.name,
            total: impact.total === null ? '-' : formatAmount(impact.total),
          }),
          impact.isWinner ? t('procurement.removeWinner') : '',
          bidding && impact.short > 0
            ? t('procurement.removeShort', { remaining: impact.remaining, needed: impact.needed })
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

  const complete = Object.values(procurement.totals).filter((totals) => totals.complete).length;
  const needed = quotesNeeded(procurement);
  const shortBy = Math.max(0, needed - complete);
  // Reasons and submission come once the quotes are in, as the steps do.
  const quotesIn = procurement.quotes.length > 0 && (single || shortBy === 0);
  // The service refuses a quote without its file on submit but does not list it in its own
  // checks, so the missing files are named here and block the button.
  const filesMissing = procurement.quotes
    .filter((quote) => quote.attachments.length === 0)
    .map((quote) => t('procurement.bidding.quoteFileMissing', { vendor: quote.vendor.name }));
  const ready =
    editable &&
    procurement.submitErrors.length === 0 &&
    filesMissing.length === 0 &&
    procurement.quotes.length > 0;
  const showForm = quotesIn || !editable;

  const setScore = (quote: Quote, key: ScoreKey, value: number) =>
    persist((body) => ({
      ...body,
      quotes: body.quotes.map((entry) =>
        entry.id === quote.id ? { ...entry, scores: { ...entry.scores, [key]: value } } : entry
      ),
    }));
  const setFinalPrice = (quote: Quote, requestItemId: string, finalPrice: number | null) =>
    persist((body) => ({
      ...body,
      quotes: body.quotes.map((entry) =>
        entry.id === quote.id
          ? {
              ...entry,
              lines: entry.lines.map((line) =>
                line.requestItem === requestItemId ? { ...line, finalPrice } : line
              ),
            }
          : entry
      ),
    }));

  /** The reasons, the evidence, submit and approval: the lower part of both forms. */
  const formBody = (
    <Stack gap="md">
      <ProcurementNotes
        bare
        procurement={procurement}
        editable={editable}
        saving={save.isPending}
        onSave={(values: NotesValues) => persist((body) => ({ ...body, ...values }))}
      />
      <AttachmentsCard
        bare
        target="request"
        documentId={request.id}
        attachments={procurement.negotiationAttachments}
        canUpload={editable}
        requestFile="negotiation"
        titleKey="procurement.notes.evidenceTitle"
      />
      {procurement.approvalPreview.length > 0 && editable && (
        <Text size="xs" c="dimmed">
          {t('procurement.approversPreview', {
            levels: procurement.approvalPreview
              .map((level) => `${level.name} (${level.roles.join(', ')})`)
              .join(' → '),
          })}
        </Text>
      )}
      {editable && (
        <ProcurementSubmit
          procurement={procurement}
          ready={ready}
          extraErrors={filesMissing}
          loading={submit.isPending}
          onSubmit={() => submit.mutate({ id: request.id })}
        />
      )}
      <ApprovalPanel
        bare
        approval={procurement.approval}
        status={procurement.status}
        waitingStatus="SUBMITTED"
        canApprove={rights.approve}
        busy={approve.isPending || reject.isPending}
        onApprove={(note) =>
          approve.mutate(
            { id: request.id, note },
            { onSuccess: (doc) => doc.orders.length > 0 && setApproved(doc.orders) }
          )
        }
        onReject={(reason) => reject.mutate({ id: request.id, reason })}
      />
    </Stack>
  );

  return (
    <Stack gap="lg">
      {editable && (
        <ProcurementRouteCard
          route={procurement.route}
          canChange={canSwitchRoute}
          quoteCount={procurement.quotes.length}
          busy={busy}
          onChange={(route) => {
            // One vendor means one quote: with several bidding quotes entered, the change throws
            // them away, so the person confirms it first.
            if (route === 'SINGLE' && procurement.quotes.length > 1) setDiscarding(true);
            else changeRoute(route);
          }}
        />
      )}
      <ProcurementSteps procurement={procurement} />

      {bidding && (
        <SectionCard
          icon={IconUsers}
          title={t(`procurement.title.${procurement.route ?? 'BIDDING'}`)}
          subtitle={
            shortBy > 0
              ? t('procurement.quotesShort', { count: shortBy, needed })
              : t('procurement.subtitle.BIDDING', { needed })
          }
          action={
            <Group gap="sm" wrap="nowrap">
              <Text size="sm" fw={600} c={shortBy > 0 ? 'orange.8' : 'green.7'}>
                {t('procurement.quotesCount', { count: complete, needed })}
              </Text>
              {canAddQuote && (
                <Button
                  size="sm"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setEditing({ quote: null })}
                >
                  {t('procurement.addQuote')}
                </Button>
              )}
            </Group>
          }
        >
          {procurement.quotes.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t('procurement.empty.BIDDING')}
            </Text>
          ) : (
            <QuotesTable
              procurement={procurement}
              editable={editable}
              busy={busy}
              onView={setViewing}
              onEdit={(quote) => setEditing({ quote })}
              onRemove={setRemoving}
            />
          )}
          {shortBy > 0 && (
            <Alert
              color="yellow"
              variant="light"
              radius="md"
              icon={<IconAlertTriangle size={18} />}
            >
              {t('procurement.biddingMinimum', { needed })}
            </Alert>
          )}
        </SectionCard>
      )}

      {bidding && showForm && (
        <BiddingForm
          request={request}
          procurement={procurement}
          editable={editable}
          busy={busy}
          onScore={setScore}
          onChoose={(quote) => persist((body) => ({ ...body, winner: quote.vendor.id }))}
        >
          {formBody}
        </BiddingForm>
      )}

      {single && (
        <SingleVendorForm
          procurement={procurement}
          items={request.items}
          editable={editable}
          busy={busy}
          onAdd={() => setEditing({ quote: null })}
          onEdit={(quote) => setEditing({ quote })}
          onView={setViewing}
          onRemove={setRemoving}
          onFinalPrice={setFinalPrice}
        >
          {formBody}
        </SingleVendorForm>
      )}

      <OrdersCard orders={request.orders} />

      {request.readyForOrder && rights.createOrder && (
        <Alert color="blue" variant="light" radius="md" title={t('procurement.noOrderTitle')}>
          <Stack gap="xs" align="flex-start">
            <Text size="sm">{t('procurement.noOrderBody')}</Text>
            <Button
              size="xs"
              loading={createOrders.isPending}
              onClick={() => createOrders.mutate({ id: request.id })}
            >
              {t('procurement.createOrder')}
            </Button>
          </Stack>
        </Alert>
      )}

      <QuoteModal
        opened={editing !== null}
        quote={editing?.quote ?? null}
        procurement={procurement}
        items={request.items}
        saving={save.isPending || upload.isPending}
        onClose={() => setEditing(null)}
        onSave={saveQuote}
      />
      <ReasonModal
        opened={removing !== null}
        title={t('procurement.removeTitle')}
        description={removeDescription}
        confirmLabel={t('procurement.removeConfirm')}
        optional
        label={t('procurement.removeNote')}
        loading={save.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && removeQuote(removing)}
      />
      <QuoteDetailModal
        quote={viewing}
        procurement={procurement}
        items={request.items}
        onClose={() => setViewing(null)}
      />
      <SwitchToSingleDialog
        opened={discarding}
        quoteCount={procurement.quotes.length}
        hasWinner={procurement.winnerId !== null}
        loading={save.isPending}
        onClose={() => setDiscarding(false)}
        onConfirm={() =>
          changeRoute('SINGLE', true)
            .then(() => setDiscarding(false))
            .catch(() => undefined)
        }
      />
      <ApprovedDialog orders={approved} onClose={() => setApproved(null)} />
    </Stack>
  );
};
