import {
  Anchor,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconArrowUpRight, IconNotebook, IconReceipt2 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { routes } from '@/router/routes';
import type { Sale, SaleItem } from '@/module/sales/domain/sale';
import type { SaleDisplay } from '../../hooks/useSaleDisplay';
import { AmountRow } from './AmountRow';
import { formatSignedAmount } from './formatSignedAmount';
import classes from './SaleDetail.module.css';

export function SaleItemsCard({ sale, display }: Readonly<{ sale: Sale; display: SaleDisplay }>) {
  const { t, money, number } = display;
  const itemContent = (item: SaleItem) => {
    const journalId =
      item.journalTransaction ||
      item.journalId ||
      item.transactionId ||
      sale.journalId ||
      sale.transactionId;
    return (
      <Stack gap={2}>
        {item.product?.id ? (
          <Anchor
            component={Link}
            to={routes.baseModules.productDetail.replace(':id', item.product.id)}
            size="sm"
            fw={700}
            c="primary.9"
            className={classes.inlineLink}
          >
            {item.product.name}
            <IconArrowUpRight size={14} aria-hidden="true" />
          </Anchor>
        ) : (
          <Text size="sm" fw={700}>
            {item.product?.name || item.description || '—'}
          </Text>
        )}
        {item.product?.productCode && (
          <Text size="xs" c="dimmed">
            {item.product.productCode}
          </Text>
        )}
        {item.description && item.product?.name && (
          <Text size="xs" c="dimmed">
            {item.description}
          </Text>
        )}
        {journalId && (
          <Anchor
            component={Link}
            to={routes.generalJournal.detailTransactionJournal.replace(':idTransaction', journalId)}
            size="xs"
            fw={600}
            className={classes.inlineLink}
          >
            <IconNotebook size={14} aria-hidden="true" />
            {t('viewJournal')}
          </Anchor>
        )}
      </Stack>
    );
  };

  const hasAdjustedAmount =
    (sale.adjustedAmount !== undefined && sale.adjustedAmount !== 0) ||
    sale.items.some((item) => item.adjustedAmount !== undefined && item.adjustedAmount !== 0);

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'lg' }} bg="white">
      <Group justify="space-between" mb="lg" align="center">
        <Box>
          <Title order={3} size="md">
            {t('itemsTitle')}
          </Title>
          <Text size="xs" c="dimmed" mt={3}>
            {t('itemsCount', { count: sale.items.length })}
          </Text>
        </Box>
        <ThemeIcon size={36} radius="md" color="primary" variant="light">
          <IconReceipt2 size={19} />
        </ThemeIcon>
      </Group>
      <div className={classes.desktopItems}>
        <Table.ScrollContainer minWidth={620}>
          <Table verticalSpacing="md" horizontalSpacing="sm">
            <Table.Thead className={classes.tableHead}>
              <Table.Tr>
                <Table.Th>{t('item')}</Table.Th>
                <Table.Th ta="right">{t('quantity')}</Table.Th>
                <Table.Th ta="right">{t('unitPrice')}</Table.Th>
                <Table.Th>{t('tax')}</Table.Th>
                {hasAdjustedAmount && <Table.Th ta="right">{t('adjustedAmount')}</Table.Th>}
                <Table.Th ta="right">{t('amount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sale.items.length ? (
                sale.items.map((item, index) => (
                  <Table.Tr key={item.id || item._id || index}>
                    <Table.Td>{itemContent(item)}</Table.Td>
                    <Table.Td ta="right" className={classes.amount}>
                      {number(item.quantity)}
                    </Table.Td>
                    <Table.Td ta="right" className={classes.amount}>
                      {money(item.unitPrice)}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{item.tax?.name || '—'}</Text>
                    </Table.Td>
                    {hasAdjustedAmount && (
                      <Table.Td ta="right" className={classes.amount}>
                        {item.adjustedAmount !== undefined &&
                        item.adjustedAmount !== null &&
                        item.adjustedAmount !== 0 ? (
                          <Text
                            component="span"
                            size="sm"
                            fw={600}
                            c={item.adjustedAmount > 0 ? 'teal.7' : 'red.7'}
                          >
                            {formatSignedAmount(item.adjustedAmount, money)}
                          </Text>
                        ) : (
                          <Text component="span" size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </Table.Td>
                    )}
                    <Table.Td ta="right" fw={700} className={classes.amount}>
                      {money(item.amount)}
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={hasAdjustedAmount ? 6 : 5}>
                    <Text ta="center" c="dimmed" py="xl">
                      {t('noItems')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
      <Stack gap={0} className={classes.mobileItems}>
        {sale.items.length ? (
          sale.items.map((item, index) => (
            <Box key={item.id || item._id || index} className={classes.mobileItem}>
              {itemContent(item)}
              <Group justify="space-between" align="end" mt="sm" gap="xs">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed">
                    {number(item.quantity)} × {money(item.unitPrice)}
                    {item.tax?.name ? ` · ${item.tax.name}` : ''}
                  </Text>
                  {item.adjustedAmount !== undefined && item.adjustedAmount !== 0 && (
                    <Text size="xs" c={item.adjustedAmount > 0 ? 'teal.7' : 'red.7'} fw={600}>
                      {t('adjustedAmount')}: {formatSignedAmount(item.adjustedAmount, money)}
                    </Text>
                  )}
                </Stack>
                <Text size="sm" fw={700} className={classes.amount}>
                  {money(item.amount)}
                </Text>
              </Group>
            </Box>
          ))
        ) : (
          <Text ta="center" c="dimmed" py="xl">
            {t('noItems')}
          </Text>
        )}
      </Stack>
      <Divider my="lg" />
      <Box className={classes.totals}>
        <AmountRow label={t('subtotal')} amount={money(sale.subtotal)} />
        {!!sale.discountAmount && sale.discountAmount > 0 && (
          <AmountRow
            label={`${t('discount')}${sale.discountType === 'percentage' ? ` (${sale.discountValue}%)` : ''}`}
            amount={`−${money(sale.discountAmount)}`}
          />
        )}
        {!!sale.taxAmount && sale.taxAmount > 0 && (
          <AmountRow label={t('taxTotal')} amount={`+${money(sale.taxAmount)}`} />
        )}
        {sale.adjustedAmount !== undefined && sale.adjustedAmount !== 0 && (
          <AmountRow
            label={t('adjustedAmountTotal')}
            amount={formatSignedAmount(sale.adjustedAmount, money)}
            color={sale.adjustedAmount > 0 ? 'teal.7' : 'red.7'}
          />
        )}
        {!!sale.lateFeeAmount && sale.lateFeeAmount > 0 && (
          <AmountRow label={t('lateFee')} amount={`+${money(sale.lateFeeAmount)}`} />
        )}
        {!!sale.withholdingAmount && sale.withholdingAmount > 0 && (
          <AmountRow
            label={`${t('withholding')}${sale.withholdingAccount?.name ? ` · ${sale.withholdingAccount.name}` : ''}`}
            amount={`−${money(sale.withholdingAmount)}`}
          />
        )}
        <Divider my="xs" />
        <AmountRow label={t('invoiceTotal')} amount={money(sale.finalAmount)} emphasis />
        <AmountRow label={t('paid')} amount={money(sale.paidAmount)} />
        <AmountRow label={t('remaining')} amount={money(sale.remainingAmount)} emphasis />
      </Box>
    </Paper>
  );
}
