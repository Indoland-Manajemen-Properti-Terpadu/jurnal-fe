import type { ReactNode } from 'react';
import { Divider, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatDate, formatDateTime } from '@/module/sales/domain/saleFormat';
import type { SaleQuote } from '@/module/sales/domain/saleQuote';
import { QuoteStatusBadge } from './QuoteStatusBadge';

const Field = ({ label, value }: Readonly<{ label: string; value: string }>) => (
  <Stack gap={2}>
    <Text size="xs" fw={700} c="dimmed">
      {label}
    </Text>
    <Text size="sm">{value || '–'}</Text>
  </Stack>
);

/** The quote's number and status, who it is for, its dates, and the actions that fit its state. */
export function QuoteOverviewCard({
  quote,
  actions,
}: Readonly<{ quote: SaleQuote; actions: ReactNode }>) {
  const { t } = useTranslation('salesQuotes');

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={6}>
            <Group gap="sm">
              <Title order={3} fz={22}>
                {quote.transactionNumber}
              </Title>
              <QuoteStatusBadge status={quote.displayStatus} />
            </Group>
            <Text size="sm" c="dimmed">
              {quote.customer?.displayName || '–'}
            </Text>
          </Stack>
          {actions}
        </Group>
        <Divider />
        <Grid gutter="lg">
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Field label={t('detail.date')} value={formatDate(quote.transactionDate)} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Field label={t('detail.validUntil')} value={formatDate(quote.validUntil)} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Field label={t('detail.paymentTerm')} value={quote.paymentTerm?.name ?? ''} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <Field label={t('detail.reference')} value={quote.customerRefNumber} />
          </Grid.Col>
          {quote.unitTower && (
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Field label={t('detail.unitTower')} value={quote.unitTower} />
            </Grid.Col>
          )}
          {quote.sentAt && (
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Field label={t('detail.sentAt')} value={formatDateTime(quote.sentAt)} />
            </Grid.Col>
          )}
          {quote.acceptedAt && (
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Field label={t('detail.acceptedAt')} value={formatDateTime(quote.acceptedAt)} />
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Paper>
  );
}
