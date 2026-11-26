import { Group, Stack, Text } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { type ActivityKind, activityTone } from '@/module/purchases/domain/activityLog';
import { ApprovalPanel } from '@/module/purchases/presentation/components/shared/ApprovalPanel';
import {
  ApprovalTrail,
  trailSteps,
} from '@/module/purchases/presentation/components/shared/ApprovalTrail';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  Timeline,
  type TimelineItem,
} from '@/module/purchases/presentation/components/shared/Timeline';
import { useActivity } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { dateFormatV1 } from '@/utils/formatDate';

/** Approving reads green; refusing, sending back or cancelling reads red; the rest stays neutral. */
const LABEL_COLOR = { positive: 'green.8', warning: 'orange.8', negative: 'red.8' } as const;

type PanelProps = Omit<Parameters<typeof ApprovalPanel>[0], 'bare' | 'actionsOnly'>;

/**
 * The approval of a document as one list: what already happened (sent, approved, rejected, with
 * who and when), then the approvals still ahead, then the buttons when it is your turn.
 */
export const ApprovalCard = ({
  kind,
  id,
  ...panel
}: Readonly<PanelProps & { kind: ActivityKind; id: string }>) => {
  const { t } = useTranslation('purchases');
  const activity = useActivity(kind, id);
  const entries = activity.data ?? [];
  // Steps still ahead matter only while the document waits; after a refusal the approval is over.
  const lastEntry = entries.at(-1);
  const lastTone = lastEntry ? activityTone(lastEntry.action) : undefined;
  const refused = lastTone === 'negative' || lastTone === 'warning';
  const waiting = !refused && panel.status === (panel.waitingStatus ?? 'PENDING_APPROVAL');
  const ahead = waiting
    ? trailSteps(panel.approval, panel.status).filter(
        (step) => step.state === 'waiting' || step.state === 'upcoming'
      )
    : [];

  const done: TimelineItem[] = entries.map((entry, index) => {
    const tone = activityTone(entry.action);
    return {
      id: entry.id,
      state: index === entries.length - 1 && ahead.length === 0 ? 'latest' : 'done',
      tone,
      children: (
        <>
          <Group gap="xs" wrap="wrap">
            <Text size="sm" fw={700} c={tone ? LABEL_COLOR[tone] : undefined}>
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
    };
  });
  const next: TimelineItem[] = ahead.map((step, index) => ({
    id: `ahead-${index}-${step.name}`,
    state: step.state === 'waiting' ? 'waiting' : 'upcoming',
    children: (
      <>
        <Text size="sm" fw={700} c={step.state === 'upcoming' ? 'dimmed' : undefined}>
          {step.name}
        </Text>
        <Text size="xs" c="dimmed">
          {t(`approval.trail.${step.state}`)}
        </Text>
      </>
    ),
  }));

  const list = () => {
    // Without the service's log, the approval steps alone still say where the document stands.
    if (activity.isError) return <ApprovalTrail approval={panel.approval} status={panel.status} />;
    if (activity.isLoading) return null;
    if (done.length + next.length === 0) {
      return (
        <Text size="sm" c="dimmed">
          {t('approval.log.empty')}
        </Text>
      );
    }
    return <Timeline items={[...done, ...next]} />;
  };

  return (
    <SectionCard
      icon={IconShieldCheck}
      title={t('approval.log.title')}
      subtitle={t('approval.log.subtitle')}
    >
      <Stack gap="md">
        {list()}
        <ApprovalPanel {...panel} bare actionsOnly />
      </Stack>
    </SectionCard>
  );
};
