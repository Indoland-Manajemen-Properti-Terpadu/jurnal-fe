import { Divider, Grid, Group, Paper, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleQuote } from '@/module/sales/domain/saleQuote';

const Row = ({
  label,
  value,
  bold,
}: Readonly<{ label: string; value: string; bold?: boolean }>) => (
  <Group justify="space-between" wrap="nowrap" gap="md">
    <Text size="sm" c={bold ? 'dark.9' : 'dimmed'} fw={bold ? 700 : 400}>
      {label}
    </Text>
    <Text size="sm" fw={bold ? 700 : 600} style={{ fontVariantNumeric: 'tabular-nums' }}>
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

/** The lines, the totals as the server worked them out, and the notes of a quote. */
export function QuoteLinesCard({ quote }: Readonly<{ quote: SaleQuote }>) {
  const { t } = useTranslation('salesQuotes');
  const head = (key: string, align?: 'right') => (
    <Table.Th ta={align}>
      <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
        {t(`detail.${key}`)}
      </Text>
    </Table.Th>
  );

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="lg">
        <Text fw={700}>{t('detail.linesTitle')}</Text>
        <Table.ScrollContainer minWidth={700}>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {head('colItem')}
                {head('colQuantity', 'right')}
                {head('colUnitPrice', 'right')}
                {head('colTax')}
                {head('colAmount', 'right')}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {quote.items.map((line) => (
                <Table.Tr key={line.id}>
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
                    <Text size="sm">{line.tax?.name ?? t('detail.noTax')}</Text>
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

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Note title={t('detail.termsTitle')} text={quote.terms} />
              <Note title={t('detail.messageTitle')} text={quote.message} />
              <Note title={t('detail.memoTitle')} text={quote.memo} />
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="xs">
              <Row label={t('detail.subtotal')} value={formatIDR(quote.subtotal)} />
              <Row
                label={t('detail.discount')}
                value={
                  quote.discountAmount > 0 ? `− ${formatIDR(quote.discountAmount)}` : formatIDR(0)
                }
              />
              <Row label={t('detail.tax')} value={formatIDR(quote.taxAmount)} />
              <Divider />
              <Row label={t('detail.total')} value={formatIDR(quote.total)} bold />
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}
