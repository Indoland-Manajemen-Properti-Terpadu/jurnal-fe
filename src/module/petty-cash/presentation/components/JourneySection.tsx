import { useTranslation } from '@/i18n';
import type { JourneyStep } from '@/module/petty-cash/domain/documentJourney';
import { DetailSection } from '@/module/petty-cash/presentation/components/DetailKit';
import { HistoryTimeline } from '@/module/petty-cash/presentation/components/HistoryTimeline';
import { useApproverLabel } from '@/module/petty-cash/presentation/components/ApprovalProgress';

type StatusKind = 'advance';

/** "Document journey": what happened and, while it waits, who approves next. Same in every drawer. */
export function JourneySection({
  steps,
  statusKind = 'advance',
}: Readonly<{ steps: JourneyStep[]; statusKind?: StatusKind }>) {
  const { t } = useTranslation('pettyCash');
  const approverLabel = useApproverLabel();
  if (steps.length === 0) return null;

  const titleOf = (step: JourneyStep) => {
    switch (step.title.kind) {
      case 'event':
        return t(`detail.events.${step.title.event}`);
      case 'status':
        return t(`detail.${statusKind}Events.${step.title.status}`);
      default:
        return approverLabel(step.title.approver);
    }
  };

  return (
    <DetailSection title={t('detail.journey')}>
      <HistoryTimeline
        entries={steps.map((step) => ({
          id: step.id,
          title: titleOf(step),
          at: step.at,
          by: step.byName,
          // A system remark that only repeats the step ("Diajukan") adds nothing.
          note:
            step.note && step.note.trim().toLowerCase() !== titleOf(step).toLowerCase()
              ? step.note
              : null,
          state: step.state,
          refused: step.refused,
          hint:
            step.state === 'waiting'
              ? t('detail.waitingApproval')
              : step.state === 'upcoming'
                ? t('detail.afterPrevious')
                : null,
        }))}
      />
    </DetailSection>
  );
}
