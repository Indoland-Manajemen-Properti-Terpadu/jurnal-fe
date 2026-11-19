import { Group, List, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconPointFilled } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatDate } from '@/module/sales/domain/saleFormat';

export interface SaleReview {
  /** Step names that still block issuing the invoice. */
  missing: string[];
  customerName: string;
  dueDate: string;
  lineCount: number;
}

/** On the last step: who is billed, for how much work and when, and what still blocks issuing. */
export function SaleReviewNote({ review }: Readonly<{ review: SaleReview }>) {
  const { t } = useTranslation('sales');

  return (
    <Stack gap={6}>
      <Text fw={600} size="sm">
        {t('form.summary.reviewTitle')}
      </Text>
      <Text size="xs" c="dimmed">
        {review.customerName || '–'} · {t('form.summary.reviewLines', { count: review.lineCount })}
        {review.dueDate
          ? ` · ${t('form.summary.reviewDue', { date: formatDate(review.dueDate) })}`
          : ''}
      </Text>
      {review.missing.length === 0 ? (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={20} radius="xl" color="green" variant="light">
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
    </Stack>
  );
}
