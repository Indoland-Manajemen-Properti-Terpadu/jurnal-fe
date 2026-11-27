import { useState } from 'react';
import { Anchor, Badge, Button, Group, Paper, Table, Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { TermScheduleTable } from '@/module/purchases/presentation/components/procurement/TermScheduleTable';
import { lineDifference } from '@/module/purchases/domain/biddingScore';
import type { Procurement, Quote } from '@/module/purchases/domain/procurement';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import { RejectedVendorNote } from '@/module/purchases/presentation/components/procurement/RejectedVendorNote';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

interface BiddingWinnerProps {
  procurement: Procurement;
  items: RequestItem[];
  /** Winner can still be picked; false once submitted (only the chosen vendor is shown). */
  editable: boolean;
  busy: boolean;
  onChoose: (quote: Quote) => void;
}

const lineTotal = (quote: Quote, itemId: string, items: RequestItem[]) => {
  const line = quote.lines.find((entry) => entry.requestItemId === itemId);
  const item = items.find((entry) => entry.id === itemId);
  return line && item ? line.unitPrice * item.quantity : 0;
};

/** One card per vendor with its price per item and the gap to the cheapest; one is picked as winner. */
export const BiddingWinner = ({
  procurement,
  items,
  editable,
  busy,
  onChoose,
}: Readonly<BiddingWinnerProps>) => {
  const { t } = useTranslation('purchases');
  const [showOthers, setShowOthers] = useState(false);
  const { totals, cheapestVendorId, winnerId } = procurement;
  const winner = procurement.quotes.find((quote) => quote.vendor.id === winnerId);
  const cheapestTotal = Math.min(
    ...procurement.quotes.map((quote) => totals[quote.id]?.total ?? Infinity)
  );
  // Once decided, only the chosen vendor is open; the others sit behind a link.
  const visible = !editable && winner && !showOthers ? [winner] : procurement.quotes;

  return (
    <>
      {!editable && winner && (
        <Group justify="flex-end">
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => setShowOthers((on) => !on)}
          >
            {showOthers
              ? t('procurement.bidding.hideOthers')
              : t('procurement.bidding.showOthers', { count: procurement.quotes.length - 1 })}
          </Anchor>
        </Group>
      )}
      {visible.map((quote) => {
        const amounts = totals[quote.id];
        const chosen = winnerId === quote.vendor.id;
        const complete = amounts?.complete ?? false;
        const rejected = amounts?.rejected ?? false;
        return (
          <Paper
            key={quote.id}
            withBorder
            radius="md"
            p={0}
            style={{
              overflow: 'hidden',
              borderColor: chosen ? 'var(--mantine-color-primary-4)' : undefined,
            }}
          >
            <Group
              justify="space-between"
              px="md"
              py="sm"
              wrap="nowrap"
              bg={chosen ? 'var(--mantine-color-primary-0)' : undefined}
            >
              <div>
                <Group gap={6}>
                  <Text size="sm" fw={700}>
                    {quote.vendor.name}
                  </Text>
                  {cheapestVendorId === quote.vendor.id && procurement.quotes.length > 1 && (
                    <Badge size="xs" radius="sm" color="green" variant="light">
                      {t('procurement.cheapest')}
                    </Badge>
                  )}
                  {rejected && (
                    <Badge size="xs" radius="sm" color="red" variant="light">
                      {t('procurement.rejected.badge')}
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {[
                    quote.number,
                    quote.term?.name,
                    quote.leadDays === null ? '' : t('procurement.days', { count: quote.leadDays }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed">
                  {t('procurement.bidding.total')}
                </Text>
                <Text fz={18} fw={700}>
                  {amounts ? formatAmount(amounts.total) : '-'}
                </Text>
              </div>
            </Group>
            {rejected && (
              <div style={{ padding: '0 var(--mantine-spacing-md) var(--mantine-spacing-sm)' }}>
                <RejectedVendorNote procurement={procurement} vendorId={quote.vendor.id} />
              </div>
            )}
            <Table.ScrollContainer type="native" minWidth={560}>
              <Table verticalSpacing="xs" withRowBorders>
                <Table.Thead bg="var(--jurnal-color-surface-hover)">
                  <Table.Tr>
                    {['item', 'qty', 'unitPrice', 'lineTotal', 'gap'].map((key) => (
                      <Table.Th key={key} ta={key === 'item' ? 'left' : 'right'}>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                          {t(`procurement.bidding.col.${key}`)}
                        </Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => {
                    const line = quote.lines.find((entry) => entry.requestItemId === item.id);
                    const total = lineTotal(quote, item.id, items);
                    const gap = lineDifference(
                      total,
                      procurement.quotes.map((other) => lineTotal(other, item.id, items))
                    );
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td>
                          <Text size="sm">{item.product?.name ?? item.description}</Text>
                          <Text size="xs" c="dimmed">
                            {line?.specification}
                          </Text>
                        </Table.Td>
                        <Table.Td ta="right">
                          {formatQuantity(item.quantity)} {item.unit?.name ?? ''}
                        </Table.Td>
                        <Table.Td ta="right">{formatAmount(line?.unitPrice ?? 0)}</Table.Td>
                        <Table.Td ta="right">{formatAmount(total)}</Table.Td>
                        <Table.Td ta="right">
                          <Text size="xs" c={gap > 0 ? 'red.7' : 'dimmed'}>
                            {gap > 0 ? `+${formatAmount(gap)}` : formatAmount(0)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                  <Table.Tr bg="var(--jurnal-color-surface-hover)">
                    <Table.Td colSpan={3}>
                      <Text size="sm" fw={700}>
                        {t('procurement.bidding.total')}
                      </Text>
                      {amounts && (
                        <Text size="xs" c="dimmed">
                          {t('procurement.bidding.breakdown', {
                            base: formatAmount(amounts.subtotal - amounts.discountAmount),
                            tax: formatAmount(amounts.taxAmount),
                          })}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={700}>
                        {amounts ? formatAmount(amounts.total) : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text
                        size="xs"
                        c={amounts && amounts.total > cheapestTotal ? 'red.7' : 'dimmed'}
                      >
                        {amounts && amounts.total > cheapestTotal
                          ? `+${formatAmount(amounts.total - cheapestTotal)}`
                          : formatAmount(0)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            {chosen && amounts?.schedule && <TermScheduleTable schedule={amounts.schedule} />}
            <Group justify="space-between" px="md" py="sm" wrap="nowrap">
              <Text size="xs" c="dimmed">
                {amounts?.score == null
                  ? t('procurement.bidding.notScored')
                  : t('procurement.bidding.scoreValue', { score: amounts.score.toFixed(2) })}
              </Text>
              {editable ? (
                <Button
                  size="xs"
                  radius="md"
                  variant={chosen ? 'filled' : 'light'}
                  leftSection={chosen ? <IconCircleCheck size={14} /> : undefined}
                  disabled={busy || !complete || rejected}
                  onClick={() => onChoose(quote)}
                >
                  {rejected
                    ? t('procurement.rejected.notSelectable')
                    : chosen
                      ? t('procurement.bidding.chosen')
                      : t('procurement.bidding.choose')}
                </Button>
              ) : (
                chosen && (
                  <Badge radius="sm" leftSection={<IconCircleCheck size={12} />}>
                    {t('procurement.bidding.chosen')}
                  </Badge>
                )
              )}
            </Group>
          </Paper>
        );
      })}
    </>
  );
};
