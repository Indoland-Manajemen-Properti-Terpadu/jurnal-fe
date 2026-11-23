import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { ActionIcon, Badge, Group, Menu, Radio, Table, Text, Tooltip } from '@mantine/core';
import { IconDots, IconEdit, IconEye, IconPaperclip, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Procurement, Quote } from '@/module/purchases/domain/procurement';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';

interface QuotesTableProps {
  procurement: Procurement;
  editable: boolean;
  /** The winner can be chosen only on the bidding route; a single vendor wins by default. */
  canChoose: boolean;
  busy: boolean;
  onChoose: (quote: Quote) => void;
  onView: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onRemove: (quote: Quote) => void;
}

/** The quotes side by side: vendor, term, lead time, score, total, with the winner marked. */
export const QuotesTable = ({
  procurement,
  editable,
  canChoose,
  busy,
  onChoose,
  onView,
  onEdit,
  onRemove,
}: Readonly<QuotesTableProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const { route, totals, cheapestVendorId, winnerId } = procurement;
  const bidding = route !== 'SINGLE';

  return (
    <Table.ScrollContainer type="native" minWidth={760}>
      <Table className={tableClasses.table} verticalSpacing="sm" highlightOnHover>
        <Table.Thead bg="var(--jurnal-color-surface-hover)">
          <Table.Tr>
            {canChoose && <Table.Th w={44} />}
            {['vendor', 'term', 'lead', 'warranty'].map((key) => (
              <Table.Th key={key}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t(`procurement.col.${key}`)}
                </Text>
              </Table.Th>
            ))}
            {bidding && (
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('procurement.col.score')}
                </Text>
              </Table.Th>
            )}
            <Table.Th ta="right">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                {t('procurement.col.total')}
              </Text>
            </Table.Th>
            <Table.Th w={96} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {procurement.quotes.map((quote) => {
            const amounts = totals[quote.id];
            // Before the quotes are enough there is nothing to have won.
            const isWinner = winnerId === quote.vendor.id && (!bidding || canChoose || !editable);
            const cheapest = cheapestVendorId === quote.vendor.id && procurement.quotes.length > 1;
            const expired = Boolean(quote.validUntil) && (quote.validUntil as string) < todayKey();
            return (
              <Table.Tr key={quote.id} bg={isWinner ? 'var(--mantine-color-primary-0)' : undefined}>
                {canChoose && (
                  <Table.Td>
                    <Radio
                      checked={isWinner}
                      disabled={!editable || busy || !amounts?.complete}
                      aria-label={t('procurement.chooseAria', { vendor: quote.vendor.name })}
                      onChange={() => onChoose(quote)}
                    />
                  </Table.Td>
                )}
                <Table.Td>
                  <Group gap={6} wrap="wrap">
                    <Text size="sm" fw={600}>
                      {quote.vendor.name}
                    </Text>
                    {isWinner && (
                      <Badge size="xs" radius="sm" color="primary">
                        {t('procurement.winner')}
                      </Badge>
                    )}
                    {cheapest && (
                      <Text size="xs" c="green.7" fw={600}>
                        {t('procurement.cheapest')}
                      </Text>
                    )}
                    {amounts && !amounts.complete && (
                      <Badge size="xs" radius="sm" variant="light" color="yellow">
                        {t('procurement.incomplete')}
                      </Badge>
                    )}
                    {expired && (
                      <Badge size="xs" radius="sm" variant="light" color="red">
                        {t('procurement.expired')}
                      </Badge>
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    {[
                      quote.number,
                      amounts && amounts.vendorOrders > 0
                        ? t('procurement.vendorOld', { count: amounts.vendorOrders })
                        : t('procurement.vendorNew'),
                      quote.validUntil
                        ? t('procurement.validUntilShort', {
                            date: formatDay(quote.validUntil, currentLanguage),
                          })
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{quote.term?.name ?? '-'}</Text>
                </Table.Td>
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  <Text size="sm">
                    {quote.leadDays === null
                      ? '-'
                      : t('procurement.days', { count: quote.leadDays })}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{quote.warranty || '-'}</Text>
                </Table.Td>
                {bidding && (
                  <Table.Td ta="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    <Text size="sm">
                      {amounts?.score === null || !amounts ? '-' : amounts.score.toFixed(2)}
                    </Text>
                  </Table.Td>
                )}
                <Table.Td
                  ta="right"
                  style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                >
                  <Text size="sm" fw={600}>
                    {amounts ? formatAmount(amounts.total) : '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={2} justify="flex-end" wrap="nowrap">
                    {quote.attachments.length > 0 && (
                      <Tooltip label={t('procurement.files', { count: quote.attachments.length })}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          component="a"
                          href={quote.attachments[0].url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={t('procurement.openFile', { vendor: quote.vendor.name })}
                        >
                          <IconPaperclip size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Menu position="bottom-end" withinPortal shadow="md" radius="md">
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          disabled={busy}
                          aria-label={t('procurement.menuAria', { vendor: quote.vendor.name })}
                        >
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => onView(quote)}
                        >
                          {t('procurement.menu.view')}
                        </Menu.Item>
                        {editable && (
                          <>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => onEdit(quote)}
                            >
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
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

const todayKey = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};
