import { Group, Paper, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Procurement } from '@/module/purchases/domain/procurement';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const fact = (label: string, value: string) => (
  <Group justify="space-between" wrap="nowrap" gap="md" px="md" py={8}>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={600} ta="right">
      {value || '-'}
    </Text>
  </Group>
);

/** The identity of the bidding: its number, date, kind of purchase, who approves, what is bought. */
export const BiddingHeader = ({
  request,
  procurement,
}: Readonly<{ request: PurchaseRequest; procurement: Procurement }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const goods = request.items.some((item) => item.kind === 'GOODS');
  const service = request.items.some((item) => item.kind !== 'GOODS');
  const kind = goods && service ? 'mixed' : service ? 'service' : 'goods';
  const approvers = procurement.approvalPreview.map((level) => level.name).join(', ');

  return (
    <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
      <Group align="stretch" gap={0} wrap="wrap">
        <div style={{ flex: '1 1 260px', padding: 16 }}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {t('procurement.bidding.number')}
          </Text>
          <Text fz={20} fw={700}>
            {procurement.biddingNumber || '-'}
          </Text>
          <Group gap={6} mt={8}>
            {request.items.map((item) => (
              <Text key={item.id} size="xs" bg="var(--jurnal-color-surface-hover)" px={8} py={2}>
                {item.product?.name ?? item.description}{' '}
                <Text span c="dimmed" size="xs">
                  {formatQuantity(item.quantity)} {item.unit?.name ?? ''}
                </Text>
              </Text>
            ))}
          </Group>
        </div>
        <div
          style={{
            flex: '1 1 240px',
            borderInlineStart: '1px solid var(--mantine-color-gray-2)',
          }}
        >
          {fact(t('procurement.bidding.date'), formatDay(request.date, currentLanguage))}
          {fact(t('procurement.bidding.kind'), t(`procurement.bidding.kinds.${kind}`))}
          {fact(t('procurement.bidding.approver'), approvers)}
        </div>
      </Group>
    </Paper>
  );
};
