import { Alert, Anchor, Group, Progress, Stack, Text } from '@mantine/core';
import { IconClockHour4, IconCoins } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { advanceStepProgress } from '@/module/purchases/domain/orderAdvance';
import type { AdvanceDocRef, OrderAdvanceState } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { routes } from '@/router/routes';

interface DocRowProps {
  label: string;
  doc: AdvanceDocRef | undefined;
  route: string;
}

/** One document of the advance: its number as a link with its status, or a plain "Belum ada". */
const DocRow = ({ label, doc, route }: Readonly<DocRowProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Group justify="space-between" wrap="nowrap" px="lg" py="sm">
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
    </Group>
  );
};

/** The advance (DP) of an order: its amount, where it stands, the three documents that carry it. */
export const OrderAdvanceCard = ({ advance }: Readonly<{ advance: OrderAdvanceState }>) => {
  const { t } = useTranslation('purchases');
  const progress = advanceStepProgress(advance.mode, advance.step);
  const waiting = !advance.receiptAllowed;
  // The last document of each kind is the one that counts, as an advance has one of each.
  const last = (docs: AdvanceDocRef[]) => docs[docs.length - 1];

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
        <DocRow
          label={t('orders.detail.dp.request')}
          doc={last(advance.paymentRequests)}
          route={routes.purchases.paymentRequestDetail}
        />
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
    </SectionCard>
  );
};
