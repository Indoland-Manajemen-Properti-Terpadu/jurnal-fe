import { useEffect, useState, type ReactNode } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Menu,
  NumberInput,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconDots,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { TermScheduleTable } from '@/module/purchases/presentation/components/procurement/TermScheduleTable';
import type { Procurement, Quote } from '@/module/purchases/domain/procurement';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';
import { RejectedVendorNote } from '@/module/purchases/presentation/components/procurement/RejectedVendorNote';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const MONEY = {
  decimalScale: 2,
  thousandSeparator: '.',
  decimalSeparator: ',',
  hideControls: true,
} as const;

const STATUS_COLOR = {
  DRAFT: 'gray',
  SUBMITTED: 'orange',
  APPROVED: 'cyan',
  REJECTED: 'red',
} as const;

interface SingleVendorFormProps {
  procurement: Procurement;
  items: RequestItem[];
  editable: boolean;
  busy: boolean;
  onAdd: () => void;
  onEdit: (quote: Quote) => void;
  onView: (quote: Quote) => void;
  onRemove: (quote: Quote) => void;
  /** Saves the final price of one item; null means the quoted price stands. */
  onFinalPrice: (quote: Quote, requestItemId: string, finalPrice: number | null) => void;
  /** Reasons, evidence, submit and approval, inside the same card. */
  children?: ReactNode;
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
 * The single-vendor procurement as the reference draws it: one card that starts with "upload the
 * quote", then shows the vendor, the price per item with the final price to set, the amounts, and
 * carries the notes and submit below.
 */
export const SingleVendorForm = ({
  procurement,
  items,
  editable,
  busy,
  onAdd,
  onEdit,
  onView,
  onRemove,
  onFinalPrice,
  children,
}: Readonly<SingleVendorFormProps>) => {
  const { t } = useTranslation('purchases');
  // The quote of the chosen vendor; before one is chosen, the first quote entered.
  const quote =
    procurement.quotes.find((entry) => entry.vendor.id === procurement.winnerId) ??
    procurement.quotes[0] ??
    null;
  const totals = quote ? procurement.totals[quote.id] : undefined;
  const [drafts, setDrafts] = useState<Record<string, number | ''>>({});

  // A refreshed quote replaces what was typed: the saved final price is the truth.
  useEffect(() => {
    if (!quote) return;
    setDrafts(
      Object.fromEntries(
        quote.lines.map((line) => [line.requestItemId, line.finalPrice ?? line.unitPrice])
      )
    );
  }, [quote]);

  const header = quote ? (
    <Group gap="xs" wrap="nowrap">
      <Badge variant="light" radius="sm" color={STATUS_COLOR[procurement.status]}>
        {t(`procurement.bidding.status.${procurement.status}`)}
      </Badge>
      {editable && (
        <Button size="xs" variant="default" radius="md" onClick={() => onEdit(quote)}>
          {t('procurement.single.edit')}
        </Button>
      )}
      <Menu position="bottom-end" withinPortal shadow="md" radius="md">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={t('procurement.menuAria', { vendor: quote.vendor.name })}
          >
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconEye size={14} />} onClick={() => onView(quote)}>
            {t('procurement.menu.view')}
          </Menu.Item>
          {editable && (
            <>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit(quote)}>
                {t('procurement.menu.edit')}
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onRemove(quote)}
              >
                {t('procurement.menu.remove')}
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </Group>
  ) : (
    editable && (
      <Button size="sm" leftSection={<IconPlus size={14} />} onClick={onAdd}>
        {t('procurement.single.upload')}
      </Button>
    )
  );

  return (
    <SectionCard
      icon={IconBuildingStore}
      title={t('procurement.single.title')}
      subtitle={t(quote ? 'procurement.single.subtitle' : 'procurement.single.subtitleEmpty')}
      action={header || undefined}
    >
      {!quote ? (
        <Text size="sm" c="dimmed">
          {t('procurement.empty.SINGLE')}
        </Text>
      ) : (
        <Stack gap="md">
          {totals?.rejected && (
            <RejectedVendorNote procurement={procurement} vendorId={quote.vendor.id} />
          )}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {fact(t('procurement.detail.vendorLabel'), quote.vendor.name)}
            {fact(t('procurement.detail.number'), quote.number)}
            {fact(t('procurement.detail.term'), quote.term?.name ?? '')}
            {fact(
              t('procurement.single.lead'),
              quote.leadDays === null ? '' : t('procurement.days', { count: quote.leadDays })
            )}
          </SimpleGrid>

          <Table.ScrollContainer type="native" minWidth={520}>
            <Table verticalSpacing="xs" withTableBorder>
              <Table.Thead bg="var(--jurnal-color-surface-hover)">
                <Table.Tr>
                  <Table.Th>{t('procurement.detail.item')}</Table.Th>
                  <Table.Th ta="right">{t('procurement.single.quotedPrice')}</Table.Th>
                  <Table.Th ta="right" w={200}>
                    {t('procurement.single.finalPrice')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {quote.lines.map((line) => {
                  const item = items.find((entry) => entry.id === line.requestItemId);
                  return (
                    <Table.Tr key={line.requestItemId}>
                      <Table.Td>
                        <Text size="sm">
                          {item ? (item.product?.name ?? item.description) : '-'}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {item ? `${formatQuantity(item.quantity)} ${item.unit?.name ?? ''}` : ''}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" fw={600}>
                          {formatAmount(line.unitPrice)}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {line.taxName
                            ? t('procurement.single.beforeTax')
                            : t('procurement.detail.noTax')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <NumberInput
                          size="xs"
                          radius="md"
                          prefix="Rp "
                          min={0}
                          allowNegative={false}
                          {...MONEY}
                          disabled={!editable || busy}
                          aria-label={t('procurement.single.finalPriceAria')}
                          value={drafts[line.requestItemId] ?? ''}
                          onChange={(value) =>
                            setDrafts((current) => ({
                              ...current,
                              [line.requestItemId]: value === '' ? '' : Number(value),
                            }))
                          }
                          onBlur={() => {
                            const draft = drafts[line.requestItemId];
                            const next = draft === '' || draft === undefined ? null : draft;
                            const current = line.finalPrice ?? line.unitPrice;
                            if (next !== null && next !== current) {
                              onFinalPrice(
                                quote,
                                line.requestItemId,
                                next === line.unitPrice ? null : next
                              );
                            }
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {totals?.schedule && <TermScheduleTable schedule={totals.schedule} />}

          {totals && (
            <Stack gap={4} ml="auto" w={{ base: '100%', sm: 320 }}>
              {[
                [t('procurement.detail.subtotal'), totals.subtotal],
                ...(totals.taxAmount > 0
                  ? [[t('procurement.detail.taxAmount'), totals.taxAmount]]
                  : []),
              ].map(([label, amount]) => (
                <Group key={label as string} justify="space-between">
                  <Text size="sm" c="dimmed">
                    {label}
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

          {children && (
            <>
              <Divider />
              {children}
            </>
          )}
        </Stack>
      )}
    </SectionCard>
  );
};
