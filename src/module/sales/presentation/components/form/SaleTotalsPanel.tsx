import { Divider, Group, List, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconPointFilled } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleTotals } from '@/module/sales/domain/saleTotals';

export interface SaleReview {
  /** Step names that still block issuing the invoice. */
  missing: string[];
  customerName: string;
  dueDate: string;
  lineCount: number;
}

interface SaleTotalsPanelProps {
  totals: SaleTotals;
  isPriceIncludeTax: boolean;
  review?: SaleReview;
}

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

/** The breakdown of what is billed, as an estimate, plus (on the last step) a readiness check. */
export function SaleTotalsPanel({
  totals,
  isPriceIncludeTax,
  review,
}: Readonly<SaleTotalsPanelProps>) {
  const { t } = useTranslation('sales');
  const minus = (amount: number) => (amount > 0 ? `− ${formatIDR(amount)}` : formatIDR(0));

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="sm">
        <Text fw={700}>{t('form.summary.title')}</Text>
        <Row label={t('form.summary.subtotal')} value={formatIDR(totals.subtotal)} />
        <Row label={t('form.summary.discount')} value={minus(totals.discountAmount)} />
        <Row
          label={isPriceIncludeTax ? t('form.summary.vatIncluded') : t('form.summary.vat')}
          value={formatIDR(totals.taxTotal)}
        />
        <Row label={t('form.summary.withholding')} value={minus(totals.withholdingAmount)} />
        <Divider />
        <Row label={t('form.summary.final')} value={formatIDR(totals.finalAmount)} bold />
        <Text size="xs" c="dimmed">
          {t('form.summary.estimate')}
        </Text>

        {review && (
          <>
            <Divider />
            <Text fw={600} size="sm">
              {t('form.summary.reviewTitle')}
            </Text>
            <Text size="xs" c="dimmed">
              {review.customerName || '–'} ·{' '}
              {t('form.summary.reviewLines', { count: review.lineCount })}
              {review.dueDate
                ? ` · ${t('form.summary.reviewDue', { date: formatDate(review.dueDate) })}`
                : ''}
            </Text>
            {review.missing.length === 0 ? (
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={20} radius="xl" color="teal" variant="light">
                  <IconCheck size={14} />
                </ThemeIcon>
                <Text size="sm">{t('form.summary.reviewReady')}</Text>
              </Group>
            ) : (
              <>
                <Text size="sm">{t('form.summary.reviewMissing')}</Text>
                <List
                  size="sm"
                  spacing={2}
                  icon={<IconPointFilled size={14} />}
                  styles={{ itemIcon: { color: 'var(--mantine-color-dimmed)' } }}
                >
                  {review.missing.map((name) => (
                    <List.Item key={name}>{name}</List.Item>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
