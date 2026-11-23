import { Anchor, Button, Divider, Group, Stack, Table, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { Procurement, Quote } from '@/module/purchases/domain/procurement';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import {
  formatAmount,
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

interface QuoteDetailModalProps {
  /** The quote to show; null closes the dialog. */
  quote: Quote | null;
  procurement: Procurement;
  items: RequestItem[];
  onClose: () => void;
}

const fact = (label: string, value: string) => (
  <div>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={600}>
      {value || '-'}
    </Text>
  </div>
);

/**
 * Everything a vendor quoted, readable at any time, also once the procurement is locked for
 * approval: who, when it is valid, the terms, each item with its price, tax and specification, the
 * amounts the service worked out, and the files.
 */
export const QuoteDetailModal = ({
  quote,
  procurement,
  items,
  onClose,
}: Readonly<QuoteDetailModalProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const totals = quote ? procurement.totals[quote.id] : undefined;
  const single = procurement.route === 'SINGLE';
  const itemOf = (id: string) => items.find((item) => item.id === id);
  const labelOf = (id: string) => {
    const item = itemOf(id);
    return item ? (item.product?.name ?? item.description) : '-';
  };

  return (
    <ModalFrame
      opened={quote !== null}
      onClose={onClose}
      size="min(820px, 94vw)"
      scrollBody
      title={t('procurement.detail.title')}
      description={quote?.vendor.name}
      footer={<Button onClick={onClose}>{t('procurement.detail.close')}</Button>}
    >
      {quote && (
        <Stack gap="md">
          <Group grow align="flex-start" wrap="wrap">
            {fact(t('procurement.detail.number'), quote.number)}
            {fact(
              t('procurement.detail.validUntil'),
              quote.validUntil ? formatDay(quote.validUntil, currentLanguage) : ''
            )}
            {fact(t('procurement.detail.term'), quote.term?.name ?? '')}
          </Group>
          <Group grow align="flex-start" wrap="wrap">
            {fact(
              t('procurement.detail.lead'),
              quote.leadDays === null ? '' : t('procurement.days', { count: quote.leadDays })
            )}
            {fact(t('procurement.detail.warranty'), quote.warranty)}
            {fact(
              t('procurement.detail.includesTax'),
              quote.isPriceIncludeTax ? t('procurement.detail.yes') : t('procurement.detail.no')
            )}
          </Group>
          {quote.description && fact(t('procurement.detail.description'), quote.description)}

          <Divider />
          <Table.ScrollContainer type="native" minWidth={560}>
            <Table verticalSpacing="xs" withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  {['item', 'qty', 'unitPrice', 'tax', 'specification'].map((key) => (
                    <Table.Th
                      key={key}
                      ta={key === 'qty' || key === 'unitPrice' ? 'right' : 'left'}
                    >
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                        {t(`procurement.detail.${key}`)}
                      </Text>
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {quote.lines.map((line) => {
                  const item = itemOf(line.requestItemId);
                  return (
                    <Table.Tr key={line.requestItemId}>
                      <Table.Td>
                        <Text size="sm">{labelOf(line.requestItemId)}</Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm">
                          {item ? `${formatQuantity(item.quantity)} ${item.unit?.name ?? ''}` : '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm">{formatAmount(line.unitPrice)}</Text>
                        {single && line.finalPrice !== null && (
                          <Text size="xs" c="dimmed">
                            {t('procurement.detail.finalPrice', {
                              amount: formatAmount(line.finalPrice),
                            })}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{line.taxName || t('procurement.detail.noTax')}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{line.specification || '-'}</Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {totals && (
            <Stack gap={4} ml="auto" w={{ base: '100%', sm: 320 }}>
              {[
                ['subtotal', totals.subtotal],
                ...(totals.discountAmount > 0
                  ? [
                      [
                        quote.discountType === 'percentage' ? 'discountPercent' : 'discount',
                        -totals.discountAmount,
                      ],
                    ]
                  : []),
                ...(totals.taxAmount > 0 ? [['taxAmount', totals.taxAmount]] : []),
                ...(totals.shippingAmount > 0 ? [['shipping', totals.shippingAmount]] : []),
              ].map(([key, amount]) => (
                <Group key={key as string} justify="space-between">
                  <Text size="sm" c="dimmed">
                    {t(`procurement.detail.${key}`, { percent: quote.discountValue })}
                  </Text>
                  <Text size="sm">{formatAmount(amount as number)}</Text>
                </Group>
              ))}
              <Group justify="space-between" pt={4}>
                <Text size="sm" fw={700}>
                  {t('procurement.detail.total')}
                </Text>
                <Text size="sm" fw={700}>
                  {formatAmount(totals.total)}
                </Text>
              </Group>
            </Stack>
          )}

          <Divider />
          <div>
            <Text size="xs" c="dimmed" mb={4}>
              {t('procurement.detail.files')}
            </Text>
            {quote.attachments.length === 0 ? (
              <Text size="sm" c="dimmed">
                {t('procurement.detail.noFiles')}
              </Text>
            ) : (
              <Stack gap={4}>
                {quote.attachments.map((file) => (
                  <Anchor
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    size="sm"
                    truncate
                  >
                    {file.name}
                  </Anchor>
                ))}
              </Stack>
            )}
          </div>
        </Stack>
      )}
    </ModalFrame>
  );
};
