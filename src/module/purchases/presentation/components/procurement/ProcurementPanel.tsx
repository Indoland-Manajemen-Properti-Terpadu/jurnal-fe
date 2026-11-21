import { useState } from 'react';
import { Alert, Button, Group, List, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconPlus, IconSend, IconUsers } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  procurementEditable,
  procurementToInput,
  type OrderRef,
  type ProcurementInput,
  type Quote,
  type QuoteInput,
} from '@/module/purchases/domain/procurement';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import { ApprovedDialog } from '@/module/purchases/presentation/components/procurement/ApprovedDialog';
import { OrdersCard } from '@/module/purchases/presentation/components/procurement/OrdersCard';
import {
  neededNotes,
  ProcurementNotes,
  type NotesValues,
} from '@/module/purchases/presentation/components/procurement/ProcurementNotes';
import { ProcurementSteps } from '@/module/purchases/presentation/components/procurement/ProcurementSteps';
import { QuoteModal } from '@/module/purchases/presentation/components/procurement/QuoteModal';
import { QuotesTable } from '@/module/purchases/presentation/components/procurement/QuotesTable';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
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
  const [removing, setRemoving] = useState<Quote | null>(null);
  const [approved, setApproved] = useState<OrderRef[] | null>(null);

  const editable = procurementEditable(procurement) && rights.fill;
  const busy = save.isPending || submit.isPending;
  const bidding = procurement.route !== 'SINGLE';
  const single = procurement.route === 'SINGLE';
  const canAddQuote = editable && (bidding || procurement.quotes.length === 0);
  const canSwitchRoute = editable && procurement.quotes.length <= 1;

  /** Applies one change to the saved procurement and saves the whole of it. */
  const persist = (change: (input: ProcurementInput) => ProcurementInput) =>
    save.mutateAsync({ id: request.id, input: change(procurementToInput(procurement)) });

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
      const stored = saved.procurement.quotes.find((quote) => quote.vendor.id === input.vendor);
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
    persist((body) => {
      const { winner, ...rest } = body;
      const next = { ...rest, quotes: body.quotes.filter((other) => other.id !== quote.id) };
      return winner && winner !== quote.vendor.id ? { ...next, winner } : next;
    }).finally(() => setRemoving(null));

  const { submitErrors } = procurement;
  const needs = neededNotes(procurement);
  const canSubmit = editable && submitErrors.length === 0 && procurement.quotes.length > 0;

  return (
    <Stack gap="lg">
      <ProcurementSteps procurement={procurement} />

      <SectionCard
        icon={IconUsers}
        title={t(`procurement.title.${procurement.route ?? 'BIDDING'}`)}
        subtitle={
          bidding
            ? t('procurement.subtitle.BIDDING', { needed: procurement.minQuotes })
            : t('procurement.subtitle.SINGLE')
        }
        action={
          canAddQuote ? (
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={14} />}
              onClick={() => setEditing({ quote: null })}
            >
              {t('procurement.addQuote')}
            </Button>
          ) : undefined
        }
      >
        {procurement.quotes.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t(`procurement.empty.${procurement.route ?? 'BIDDING'}`)}
          </Text>
        ) : (
          <QuotesTable
            procurement={procurement}
            editable={editable}
            canChoose={bidding}
            busy={busy}
            onChoose={(quote) => persist((body) => ({ ...body, winner: quote.vendor.id }))}
            onEdit={(quote) => setEditing({ quote })}
            onRemove={setRemoving}
          />
        )}
        {editable && (
          <Group gap="xs">
            {(['BIDDING', 'SINGLE'] as const)
              .filter((route) => route !== procurement.route)
              .map((route) => (
                <Button
                  key={route}
                  variant="subtle"
                  size="xs"
                  disabled={!canSwitchRoute || busy}
                  onClick={() => persist((body) => ({ ...body, route }))}
                >
                  {t(`procurement.switchTo.${route}`)}
                </Button>
              ))}
            {!canSwitchRoute && (
              <Text size="xs" c="dimmed">
                {t('procurement.switchBlocked')}
              </Text>
            )}
          </Group>
        )}
      </SectionCard>

      <ProcurementNotes
        procurement={procurement}
        editable={editable}
        saving={save.isPending}
        onSave={(values: NotesValues) => persist((body) => ({ ...body, ...values }))}
      />

      {editable && (
        <SectionCard
          icon={IconSend}
          title={t('procurement.submitTitle')}
          subtitle={t('procurement.submitSubtitle')}
        >
          {submitErrors.length > 0 ? (
            <Alert
              color="yellow"
              variant="light"
              radius="md"
              icon={<IconAlertTriangle size={18} />}
              title={t('procurement.notReady')}
            >
              <List size="sm" spacing={2}>
                {submitErrors.map((message) => (
                  <List.Item key={message}>{message}</List.Item>
                ))}
              </List>
            </Alert>
          ) : (
            <Text size="sm" c="dimmed">
              {t('procurement.ready')}
            </Text>
          )}
          {procurement.approvalPreview.length > 0 && (
            <Text size="xs" c="dimmed">
              {t('procurement.approversPreview', {
                levels: procurement.approvalPreview
                  .map((level) => `${level.name} (${level.roles.join(', ')})`)
                  .join(' → '),
              })}
            </Text>
          )}
          <div>
            <Button
              leftSection={<IconSend size={16} />}
              disabled={!canSubmit}
              loading={submit.isPending}
              onClick={() => submit.mutate({ id: request.id })}
            >
              {procurement.status === 'REJECTED'
                ? t('procurement.resubmit')
                : t('procurement.submit')}
            </Button>
            {needs.single && procurement.singleReason.trim() === '' && (
              <Text size="xs" c="dimmed" mt={6}>
                {t('procurement.fillReasonFirst')}
              </Text>
            )}
          </div>
        </SectionCard>
      )}

      <ApprovalPanel
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
        description={t('procurement.removeDescription', { vendor: removing?.vendor.name ?? '' })}
        confirmLabel={t('procurement.removeConfirm')}
        optional
        label={t('procurement.removeNote')}
        loading={save.isPending}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && removeQuote(removing)}
      />
      <ApprovedDialog orders={approved} onClose={() => setApproved(null)} />
    </Stack>
  );
};
