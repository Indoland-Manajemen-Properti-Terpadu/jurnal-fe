import { Paper, Text, Timeline } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatDateTime } from '@/module/sales/domain/saleFormat';
import type { SaleReturn } from '@/module/sales/domain/saleReturn';

interface Entry {
  key: string;
  title: string;
  at: string | null;
}

/** What happened to the return and when, newest first; built from the dates the API gives. */
export function ReturnActivityCard({ ret }: Readonly<{ ret: SaleReturn }>) {
  const { t } = useTranslation('salesReturns');
  const entries: Entry[] = [
    { key: 'created', title: t('detail.activityCreated'), at: ret.createdAt },
    ...(ret.postedAt
      ? [{ key: 'issued', title: t('detail.activityIssued'), at: ret.postedAt }]
      : []),
    ...ret.applications
      .filter((application) => !application.voided)
      .map((application) => ({
        key: `apply-${application.id}`,
        title: t('detail.activityCredit', { invoice: application.saleNumber || '–' }),
        at: application.appliedAt,
      })),
  ].sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fw={700} mb="md">
        {t('detail.activityTitle')}
      </Text>
      <Timeline active={entries.length} bulletSize={14} lineWidth={2} color="primary">
        {entries.map((entry) => (
          <Timeline.Item key={entry.key} title={entry.title}>
            <Text size="xs" c="dimmed">
              {formatDateTime(entry.at)}
            </Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </Paper>
  );
}
