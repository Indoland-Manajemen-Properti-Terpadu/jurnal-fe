import { Anchor, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconReceipt2 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleOrder } from '@/module/sales/domain/saleOrder';

/** The invoices made from an order, and what they bill against what is left. */
export function OrderInvoicesCard({ order }: Readonly<{ order: SaleOrder }>) {
  const { t } = useTranslation('salesOrders');
  if (order.invoices.length === 0) return null;
  const figures = [
    { label: t('detail.invoicedAmount'), value: order.invoicedAmount },
    { label: t('detail.remainingAmount'), value: order.remainingAmount },
  ].filter((figure) => figure.value !== null);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="gray">
            <IconReceipt2 size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700}>{t('detail.invoicesTitle')}</Text>
            <Text size="xs" c="dimmed">
              {t('detail.invoicesSubtitle', { count: order.invoices.length })}
            </Text>
          </div>
        </Group>
        <Stack gap="sm">
          {order.invoices.map((invoice) => (
            <Group key={invoice.id} justify="space-between" wrap="nowrap" align="center">
              <Stack gap={0} style={{ minWidth: 0 }}>
                <Anchor
                  component={Link}
                  to={routes.sales.detail.replace(':id', invoice.id)}
                  size="sm"
                  fw={700}
                >
                  {invoice.number}
                </Anchor>
                <Text size="xs" c="dimmed">
                  {formatDate(invoice.date)}
                </Text>
              </Stack>
              <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatIDR(invoice.amount)}
              </Text>
            </Group>
          ))}
        </Stack>
        {figures.length > 0 && <Divider />}
        {figures.map((figure) => (
          <Group key={figure.label} justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              {figure.label}
            </Text>
            <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatIDR(figure.value)}
            </Text>
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}
