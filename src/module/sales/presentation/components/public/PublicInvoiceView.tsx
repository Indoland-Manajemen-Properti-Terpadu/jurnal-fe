import { Divider, Group, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import { SaleStatusBadge } from '../shared/SaleStatusBadge';

const num = { fontVariantNumeric: 'tabular-nums' } as const;

const TotalRow = ({
  label,
  value,
  bold,
}: Readonly<{ label: string; value: string; bold?: boolean }>) => (
  <Group justify="space-between" wrap="nowrap" gap="xl">
    <Text size="sm" c={bold ? 'dark.9' : 'dimmed'} fw={bold ? 700 : 400}>
      {label}
    </Text>
    <Text size="sm" fw={bold ? 700 : 600} style={num}>
      {value}
    </Text>
  </Group>
);

/** The invoice as a customer sees it from the emailed link: read only, calm, print friendly. */
export function PublicInvoiceView({ sale }: Readonly<{ sale: Sale }>) {
  const { t } = useTranslation('sales');
  const minus = (amount?: number) => (amount && amount > 0 ? `− ${formatIDR(amount)}` : null);

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} bg="white">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <div>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.6}>
              {t('public.title')}
            </Text>
            <Title order={2} mt={4} style={{ overflowWrap: 'anywhere' }}>
              {sale.transactionNumber}
            </Title>
          </div>
          <SaleStatusBadge status={sale.displayStatus} />
        </Group>

        <Group gap="xl" align="flex-start" wrap="wrap">
          <div>
            <Text size="xs" c="dimmed">
              {t('public.billedTo')}
            </Text>
            <Text fw={600}>{sale.customer?.displayName || '—'}</Text>
            {sale.billingAddress && (
              <Text size="sm" c="dimmed" maw={360}>
                {sale.billingAddress}
              </Text>
            )}
          </div>
          <div>
            <Text size="xs" c="dimmed">
              {t('public.date')}
            </Text>
            <Text fw={600}>{formatDate(sale.transactionDate)}</Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              {t('public.due')}
            </Text>
            <Text fw={600}>{formatDate(sale.dueDate)}</Text>
          </div>
        </Group>

        <Table.ScrollContainer minWidth={520}>
          <Table verticalSpacing="xs">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('public.colItem')}</Table.Th>
                <Table.Th ta="right">{t('public.colQuantity')}</Table.Th>
                <Table.Th ta="right">{t('public.colUnitPrice')}</Table.Th>
                <Table.Th ta="right">{t('public.colAmount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sale.items.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={item.id ?? index}>
                  <Table.Td>
                    <Text size="sm" fw={600}>
                      {item.product?.name || item.description || '—'}
                    </Text>
                    {item.description && item.description !== item.product?.name && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ''}
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    {formatIDR(item.unitPrice)}
                  </Table.Td>
                  <Table.Td ta="right" style={num}>
                    {formatIDR(item.amount)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Stack gap={6} maw={360} ml="auto" w="100%">
          <TotalRow label={t('public.subtotal')} value={formatIDR(sale.subtotal)} />
          {minus(sale.discountAmount) && (
            <TotalRow label={t('public.discount')} value={minus(sale.discountAmount) as string} />
          )}
          {sale.taxAmount ? (
            <TotalRow label={t('public.vat')} value={formatIDR(sale.taxAmount)} />
          ) : null}
          {minus(sale.withholdingAmount) && (
            <TotalRow
              label={t('public.withholding')}
              value={minus(sale.withholdingAmount) as string}
            />
          )}
          <Divider />
          <TotalRow label={t('public.total')} value={formatIDR(sale.finalAmount)} bold />
          {sale.paidAmount > 0 && (
            <TotalRow label={t('public.paid')} value={formatIDR(sale.paidAmount)} />
          )}
          <TotalRow label={t('public.remaining')} value={formatIDR(sale.remainingAmount)} bold />
        </Stack>

        {sale.message && (
          <div>
            <Text size="xs" c="dimmed">
              {t('public.message')}
            </Text>
            <Text size="sm">{sale.message}</Text>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
