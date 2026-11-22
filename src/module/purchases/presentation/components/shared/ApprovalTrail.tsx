import { Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconClock, IconMinus, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';

type TrailState = 'approved' | 'waiting' | 'upcoming' | 'rejected';

interface TrailStep {
  name: string;
  state: TrailState;
  date: string | null;
}

/**
 * One step per approval level, in order: done (with the date of the last signature), the one being
 * waited for, rejected, or not its turn yet. The number of levels is whatever Alur Persetujuan set.
 */
export const trailSteps = (approval: ApprovalState, status: string): TrailStep[] => {
  const waitingLevels = new Set(approval.pending.map((level) => level.level));
  const firstWaiting = approval.pending[0]?.level;
  const rejected = status === 'REJECTED' && Boolean(approval.rejectionReason);
  return approval.plan.map((level, index) => {
    const signed = approval.entries.filter((entry) => entry.level === index);
    const date =
      signed.length > 0
        ? (signed
            .map((entry) => entry.at)
            .sort()
            .at(-1) ?? null)
        : null;
    let state: TrailState = 'upcoming';
    if (!waitingLevels.has(index) && signed.length > 0) {
      state = 'approved';
    } else if (rejected && index === (firstWaiting ?? signed.length)) {
      state = 'rejected';
    } else if (index === firstWaiting && status === 'PENDING_APPROVAL') {
      state = 'waiting';
    }
    return { name: level.name, state, date: state === 'rejected' ? approval.rejectedAt : date };
  });
};

const ICON = {
  approved: { icon: IconCheck, color: 'green' },
  waiting: { icon: IconClock, color: 'yellow' },
  rejected: { icon: IconX, color: 'red' },
  upcoming: { icon: IconMinus, color: 'gray' },
} as const;

interface ApprovalTrailProps {
  approval: ApprovalState;
  status: string;
  /** The caller already shows why it was rejected. */
  hideReason?: boolean;
}

/** The approval of a document as one connected row inside its information card. */
export const ApprovalTrail = ({ approval, status, hideReason }: Readonly<ApprovalTrailProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const steps = trailSteps(approval, status);
  return (
    <div>
      <ol style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
        {steps.map((step, index) => {
          const { icon: StepIcon, color } = ICON[step.state];
          const last = index === steps.length - 1;
          return (
            <li
              key={`${step.name}-${index}`}
              style={{
                position: 'relative',
                display: 'flex',
                gap: 12,
                paddingBottom: last ? 0 : 16,
              }}
            >
              {!last && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 15,
                    top: 34,
                    bottom: 2,
                    width: 2,
                    background:
                      step.state === 'approved'
                        ? 'var(--mantine-color-green-5)'
                        : 'var(--mantine-color-gray-3)',
                  }}
                />
              )}
              <ThemeIcon
                size={32}
                radius="xl"
                variant={step.state === 'upcoming' ? 'default' : 'light'}
                color={color}
                style={{ flexShrink: 0 }}
              >
                <StepIcon size={16} stroke={2.2} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={700} lh={1.3}>
                  {step.name}
                </Text>
                <Text size="xs" c={step.state === 'rejected' ? 'red.7' : 'dimmed'}>
                  {t(`approval.trail.${step.state}`, {
                    date: step.date ? formatDay(step.date.slice(0, 10), currentLanguage) : '',
                  })}
                </Text>
              </div>
            </li>
          );
        })}
      </ol>
      {!hideReason && approval.rejectionReason && status === 'REJECTED' && (
        <Text size="xs" c="red.7" mt="xs">
          {approval.rejectionReason}
        </Text>
      )}
    </div>
  );
};
