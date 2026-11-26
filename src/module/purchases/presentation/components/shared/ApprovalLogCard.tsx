import { Group, Text } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { type ActivityEntry, activityTone } from '@/module/purchases/domain/activityLog';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { Timeline } from '@/module/purchases/presentation/components/shared/Timeline';
import { dateFormatV1 } from '@/utils/formatDate';

const LABEL_COLOR = { positive: 'green.8', negative: 'red.8', neutral: undefined } as const;

/** Who did what to the document, in the order it happened: made, sent, approved, rejected, cancelled. */
export const ApprovalLogCard = ({ entries }: Readonly<{ entries: ActivityEntry[] }>) => {
  const { t } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconHistory}
      title={t('approval.log.title')}
      subtitle={t('approval.log.subtitle')}
    >
      {entries.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('approval.log.empty')}
        </Text>
      ) : (
        <Timeline
          items={entries.map((entry, index) => ({
            id: entry.id,
            state: index === entries.length - 1 ? 'latest' : 'done',
            tone: activityTone(entry.action),
            children: (
              <>
                <Group gap="xs" wrap="wrap">
                  <Text size="sm" fw={700} c={LABEL_COLOR[activityTone(entry.action) ?? 'neutral']}>
                    {entry.label}
                  </Text>
                  {entry.step !== null && entry.totalSteps !== null && (
                    <Text size="xs" c="dimmed">
                      {t('approval.log.step', { step: entry.step, total: entry.totalSteps })}
                    </Text>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {[entry.byName, entry.roleName, entry.stageLabel].filter(Boolean).join(' · ')}
                  {entry.at ? ` · ${dateFormatV1(entry.at, 'D MMM YYYY, HH:mm')}` : ''}
                </Text>
                {entry.note && (
                  <Text size="sm" mt={2}>
                    {entry.note}
                  </Text>
                )}
              </>
            ),
          }))}
        />
      )}
    </SectionCard>
  );
};
