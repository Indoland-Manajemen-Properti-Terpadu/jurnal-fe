import { Divider, Group, Stack, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import { SaleStatusBadge } from '../shared/SaleStatusBadge';
import classes from './PublicInvoice.module.css';

const TotalRow = ({
  label,
  value,
  bold,
}: Readonly<{ label: string; value: string; bold?: boolean }>) => (
  <Group justify="space-between" wrap="nowrap" gap="xl">
    <Text size="sm" c={bold ? 'dark.9' : 'dimmed'} fw={bold ? 700 : 400}>
      {label}
    </Text>
    <Text size="sm" fw={bold ? 700 : 600} className={classes.figure}>
      {value}
    </Text>
  </Group>
);

/** The invoice as a customer sees it from the emailed link: read only, calm, print friendly. */
export function PublicInvoiceView({ sale }: Readonly<{ sale: Sale }>) {
  const { t } = useTranslation('sales');
  const minus = (amount?: number) => (amount && amount > 0 ? `− ${formatIDR(amount)}` : null);

  return (
    <article className={classes.document}>
      <div className={classes.accent} />
      <Stack gap="xl" className={classes.body}>
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <div style={{ minWidth: 0 }}>
            <div className={classes.kicker}>{t('public.title')}</div>
            <div className={classes.number}>{sale.transactionNumber}</div>
          </div>
          <SaleStatusBadge status={sale.displayStatus} />
        </Group>

        <div className={classes.facts}>
          <div>
            <div className={classes.label}>{t('public.billedTo')}</div>
            <div className={classes.value}>{sale.customer?.displayName || '—'}</div>
            {sale.billingAddress && (
              <Text size="sm" c="dimmed" mt={2}>
                {sale.billingAddress}
              </Text>
            )}
          </div>
          <div>
            <div className={classes.label}>{t('public.date')}</div>
            <div className={classes.value}>{formatDate(sale.transactionDate)}</div>
          </div>
          <div>
            <div className={classes.label}>{t('public.due')}</div>
            <div className={classes.value}>{formatDate(sale.dueDate)}</div>
          </div>
        </div>

        <Table.ScrollContainer minWidth={440}>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead className={classes.head}>
              <Table.Tr>
                <Table.Th w={44} className={classes.colNo}>
                  {t('public.colNumber')}
                </Table.Th>
                <Table.Th>{t('public.colItem')}</Table.Th>
                <Table.Th ta="right">{t('public.colQuantity')}</Table.Th>
                <Table.Th ta="right">{t('public.colUnitPrice')}</Table.Th>
                <Table.Th ta="right">{t('public.colAmount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sale.items.map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={item.id ?? index} className={classes.row}>
                  <Table.Td c="dimmed" className={classes.colNo}>
                    {index + 1}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={700}>
                      {item.product?.name || item.description || '—'}
                    </Text>
                    {item.description && item.description !== item.product?.name && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right" className={classes.figure}>
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ''}
                  </Table.Td>
                  <Table.Td ta="right" className={classes.figure}>
                    {formatIDR(item.unitPrice)}
                  </Table.Td>
                  <Table.Td ta="right" fw={700} className={classes.figure}>
                    {formatIDR(item.amount)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <div className={classes.lower}>
          <div>
            {sale.message && (
              <div className={classes.note}>
                <div className={classes.label}>{t('public.message')}</div>
                <Text size="sm" mt={4} style={{ whiteSpace: 'pre-line' }}>
                  {sale.message}
                </Text>
              </div>
            )}
          </div>
          <Stack gap="xs">
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
            <Divider my={2} />
            <TotalRow label={t('public.total')} value={formatIDR(sale.finalAmount)} bold />
            {sale.paidAmount > 0 && (
              <TotalRow label={t('public.paid')} value={formatIDR(sale.paidAmount)} />
            )}
            <div className={classes.balance}>
              <Text size="sm" fw={700} c="primary.9">
                {t('public.remaining')}
              </Text>
              <span className={classes.balanceAmount}>{formatIDR(sale.remainingAmount)}</span>
            </div>
          </Stack>
        </div>
      </Stack>
    </article>
  );
}
