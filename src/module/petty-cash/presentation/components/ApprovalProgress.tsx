import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { isKnownApprovalLevel, type PendingApprover } from '@/module/petty-cash/domain/approval';

/** Known stages use the app's own wording; an unknown one falls back to the label the server sent. */
export function useApproverLabel() {
  const { t } = useTranslation('pettyCash');
  return (approver: PendingApprover) =>
    isKnownApprovalLevel(approver.level) ? t(`approval.levels.${approver.level}`) : approver.label;
}

/** One quiet line under a status in a list: who is being waited for. The drawer shows the journey. */
export function ApprovalProgress({ pending }: Readonly<{ pending: PendingApprover[] }>) {
  const { t } = useTranslation('pettyCash');
  const labelOf = useApproverLabel();
  const [current] = pending;
  if (!current) return null;
  return (
    <Text size="xs" c="dimmed" mt={2}>
      {t('approval.waitingFor', { name: labelOf(current) })}
    </Text>
  );
}
