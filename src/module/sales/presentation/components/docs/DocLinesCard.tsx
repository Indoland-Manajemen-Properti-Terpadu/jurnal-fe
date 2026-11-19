import { Divider, Group, Paper, Stack, Table, Text, ThemeIcon } from '@mantine/core';
import { IconClipboardList } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleDocHeader } from '@/module/sales/domain/saleDocument';

const Row = ({ label, value }: Readonly<{ label: string; value: string }>) => (
  <Group justify="space-between" wrap="nowrap" gap="md">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Text>
  </Group>
);

const Note = ({ title, text }: Readonly<{ title: string; text: string }>) =>
  text ? (
    <Stack gap={2}>
      <Text size="xs" fw={700} c="dimmed">
        {title}
      </Text>
      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Text>
    </Stack>
  ) : null;

/** The lines, the totals as the server worked them out, and the notes of a quote or an order. */
export function DocLinesCard({
  ns,
  doc,
}: Readonly<{ ns: 'salesQuotes' | 'salesOrders'; doc: SaleDocHeader }>) {
  const { t } = useTranslation(ns);
  const head = (key: string, align?: 'right') => (
    <Table.Th ta={align}>
      <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {t(`detail.${key}`)}
      </Text>
    </Table.Th>
  );
  const hasNotes = Boolean(doc.terms || doc.message || doc.memo);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="lg">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="gray">
            <IconClipboardList size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700}>{t('detail.linesTitle')}</Text>
            <Text size="xs" c="dimmed">
              {t('detail.linesCount', { count: doc.items.length })}
            </Text>
          </div>
        </Group>

        <Table.ScrollContainer minWidth={620}>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {head('colNo')}
                {head('colItem')}
                {head('colQuantity', 'right')}
                {head('colUnitPrice', 'right')}
                {head('colTax')}
                {head('colAmount', 'right')}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {doc.items.map((line, index) => (
                <Table.Tr key={line.id || index}>
                  <Table.Td w={48}>
                    <Text size="sm" c="dimmed">
                      {index + 1}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {line.product?.name || line.description}
                    </Text>
                    {line.product && line.description && line.description !== line.product.name && (
                      <Text size="xs" c="dimmed">
                        {line.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm">{line.quantity}</Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(line.unitPrice)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={line.tax ? undefined : 'dimmed'}>
                      {line.tax?.name ?? t('detail.noTax')}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(line.amount)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="flex-end">
          <Paper radius="md" p="md" bg="gray.0" style={{ width: '100%', maxWidth: 360 }}>
            <Stack gap="xs">
              <Row label={t('detail.subtotal')} value={formatIDR(doc.subtotal)} />
              {doc.discountAmount > 0 && (
                <Row label={t('detail.discount')} value={`− ${formatIDR(doc.discountAmount)}`} />
              )}
              {doc.taxAmount > 0 && (
                <Row label={t('detail.tax')} value={formatIDR(doc.taxAmount)} />
              )}
              <Divider />
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Text fw={700} c="primary.8">
                  {t('detail.total')}
                </Text>
                <Text fw={800} fz={18} c="primary.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatIDR(doc.total)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Group>

        {hasNotes && (
          <>
            <Divider />
            <Stack gap="md">
              <Note title={t('detail.termsTitle')} text={doc.terms} />
              <Note title={t('detail.messageTitle')} text={doc.message} />
              <Note title={t('detail.memoTitle')} text={doc.memo} />
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
