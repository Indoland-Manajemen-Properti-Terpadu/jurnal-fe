import { useState, type ReactNode } from 'react';
import { Alert, Anchor, Button, Group, Progress, Stack, Text } from '@mantine/core';
import { IconClockHour4, IconCoins, IconX } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  advanceStepProgress,
  canCancelAdvanceRequest,
} from '@/module/purchases/domain/orderAdvance';
import type { AdvanceDocRef, OrderAdvanceState } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { routes } from '@/router/routes';

interface DocRowProps {
  label: string;
  doc: AdvanceDocRef | undefined;
  route: string;
  action?: ReactNode;
}

/** One document of the advance: its number as a link with its status, or a plain "Belum ada". */
const DocRow = ({ label, doc, route, action }: Readonly<DocRowProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Group justify="space-between" wrap="wrap" px="lg" py="sm">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {doc ? (
        <Group gap="sm" wrap="nowrap">
          <Anchor component={Link} to={route.replace(':id', doc.id)} size="sm" fw={700}>
            {doc.number}
          </Anchor>
          <StatusBadge status={doc.status as PurchaseStatus} />
        </Group>
      ) : (
        <Text size="sm" c="dimmed">
          {t('orders.detail.dp.none')}
        </Text>
      )}
      {action}
    </Group>
  );
};

interface OrderAdvanceCardProps {
  advance: OrderAdvanceState;
  orderId?: string;
  canCancelAdvance?: boolean;
  isCancelPending?: boolean;
  onCancelAdvance?: (requestId: string, reason: string) => Promise<unknown>;
}

/** The advance (DP) of an order: its amount, status and linked documents. */
export const OrderAdvanceCard = ({
  advance,
  orderId,
  canCancelAdvance = false,
  isCancelPending = false,
  onCancelAdvance,
}: Readonly<OrderAdvanceCardProps>) => {
  const { t } = useTranslation('purchases');
  const [cancelingRequest, setCancelingRequest] = useState<AdvanceDocRef | null>(null);
  const progress = advanceStepProgress(advance.mode, advance.step);
  const waiting = !advance.receiptAllowed;
  // Request-only advances may have several DP requests; the other flows show their latest reference.
  const last = (docs: AdvanceDocRef[]) => docs[docs.length - 1];
  const requestDocs =
    advance.mode === 'REQUEST'
      ? advance.paymentRequests
      : [last(advance.paymentRequests)].filter((doc): doc is AdvanceDocRef => Boolean(doc));

  return (
    <SectionCard
      icon={IconCoins}
      flush
      title={t('orders.detail.dp.title')}
      subtitle={t('orders.detail.dp.subtitle')}
    >
      <Stack gap="xs" px="lg" py="md">
        <Group justify="space-between" align="baseline" wrap="nowrap">
          <Text fw={700} fz="lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatAmount(advance.amount)}
          </Text>
          <Text size="sm" fw={600} c={progress.done ? 'green.8' : 'primary.7'}>
            {advance.stepLabel}
          </Text>
        </Group>
        <Progress
          value={((progress.index + (progress.done ? 0 : 0.5)) / progress.total) * 100}
          size="sm"
          radius="xl"
          color={progress.done ? 'green' : 'primary'}
          aria-label={t('orders.detail.dp.progress', {
            step: progress.index + 1,
            total: progress.total,
          })}
        />
        {advance.postedAmount > 0 && (
          <Text size="sm" c="dimmed">
            {t('orders.detail.dp.left', {
              held: formatAmount(advance.heldAmount),
              total: formatAmount(advance.postedAmount),
            })}
          </Text>
        )}
      </Stack>
      <div style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}>
        {advance.mode === 'BILL' && (
          <DocRow
            label={t('orders.detail.dp.bill')}
            doc={last(advance.bills)}
            route={routes.purchases.billDetail}
          />
        )}
        {requestDocs.length > 0 ? (
          requestDocs.map((request) => {
            const canCancel =
              canCancelAdvance &&
              Boolean(orderId) &&
              Boolean(onCancelAdvance) &&
              canCancelAdvanceRequest(advance, request);
            return (
              <DocRow
                key={request.id}
                label={t('orders.detail.dp.request')}
                doc={request}
                route={routes.purchases.paymentRequestDetail}
                action={
                  canCancel ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconX size={14} />}
                      onClick={() => setCancelingRequest(request)}
                    >
                      {t('orders.detail.dp.cancel')}
                    </Button>
                  ) : undefined
                }
              />
            );
          })
        ) : (
          <DocRow
            label={t('orders.detail.dp.request')}
            doc={undefined}
            route={routes.purchases.paymentRequestDetail}
          />
        )}
        <DocRow
          label={t('orders.detail.dp.voucher')}
          doc={last(advance.paymentVouchers)}
          route={routes.purchases.paymentDetail}
        />
      </div>
      {waiting && advance.receiptBlockReason && (
        <Alert
          m="lg"
          mt="xs"
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconClockHour4 size={18} />}
        >
          <Text size="sm">{advance.receiptBlockReason}</Text>
        </Alert>
      )}
      <ReasonModal
        opened={Boolean(cancelingRequest)}
        title={t('orders.detail.dp.cancelTitle')}
        description={t('orders.detail.dp.cancelDescription')}
        confirmLabel={t('orders.detail.dp.cancel')}
        label={t('orders.detail.dp.cancelReasonLabel')}
        placeholder={t('orders.detail.dp.cancelReasonPlaceholder')}
        minLength={1}
        maxLength={500}
        loading={isCancelPending}
        onClose={() => setCancelingRequest(null)}
        onConfirm={(reason) => {
          if (!cancelingRequest || !onCancelAdvance) return;
          onCancelAdvance(cancelingRequest.id, reason)
            .then(() => setCancelingRequest(null))
            .catch(() => undefined);
        }}
      />
    </SectionCard>
  );
};
