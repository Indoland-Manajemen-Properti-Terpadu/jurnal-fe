import { Group, Paper, Text, Timeline } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatDateTime, formatIDR } from '@/module/sales/domain/saleFormat';
import type { ReturnActivity, SaleReturn } from '@/module/sales/domain/saleReturn';

interface Entry {
  key: string;
  title: string;
  at: string | null;
  by: string;
  amount: number | null;
  voided: boolean;
}

const KNOWN_TYPES = [
  'CREATED',
  'POSTED',
  'CREDIT_APPLIED',
  'CREDIT_UNAPPLIED',
  'REFUNDED',
  'VOIDED',
];

/** What happened to the return and when, newest first. */
export function ReturnActivityCard({ ret }: Readonly<{ ret: SaleReturn }>) {
  const { t } = useTranslation('salesReturns');

  const title = (activity: ReturnActivity) => {
    if (!KNOWN_TYPES.includes(activity.type)) return activity.label || activity.type;
    return t(`detail.activity.${activity.type}`, { invoice: activity.saleNumber || '–' });
  };

  // The server's history wins; an older server sends none, so the dates tell the story.
  const entries: Entry[] = ret.activities.length
    ? ret.activities
        .map((activity, index) => ({
          key: `${activity.type}-${index}`,
          title: title(activity),
          at: activity.at,
          by: activity.by,
          amount: activity.amount,
          voided: activity.voided,
        }))
        .reverse()
    : [
        { key: 'created', title: t('detail.activity.CREATED'), at: ret.createdAt },
        ...(ret.postedAt
          ? [{ key: 'issued', title: t('detail.activity.POSTED'), at: ret.postedAt }]
          : []),
        ...ret.applications
          .filter((application) => !application.voided)
          .map((application) => ({
            key: `apply-${application.id}`,
            title: t('detail.activity.CREDIT_APPLIED', { invoice: application.saleNumber || '–' }),
            at: application.appliedAt,
          })),
      ]
        .map((entry) => ({ by: '', amount: null, voided: false, ...entry }))
        .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Text fw={700} mb="md">
        {t('detail.activityTitle')}
      </Text>
      <Timeline active={entries.length} bulletSize={14} lineWidth={2} color="primary">
        {entries.map((entry) => (
          <Timeline.Item key={entry.key} title={entry.title}>
            <Group gap="xs" wrap="wrap">
              <Text size="xs" c="dimmed">
                {formatDateTime(entry.at)}
                {entry.by ? ` · ${entry.by}` : ''}
              </Text>
              {entry.amount !== null && (
                <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatIDR(entry.amount)}
                </Text>
              )}
              {entry.voided && (
                <Text size="xs" c="dimmed">
                  {t('detail.activityVoided')}
                </Text>
              )}
            </Group>
          </Timeline.Item>
        ))}
      </Timeline>
    </Paper>
  );
}
