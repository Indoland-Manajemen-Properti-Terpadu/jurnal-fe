import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { IconCheck, IconSend, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CountRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useCountDecision } from '@/module/petty-cash/presentation/hooks/useCountMutations';

interface Props {
  count: CountRecord;
  onChanged?: () => void;
}

/** What the signed-in user may do with a count: the counter submits a draft, an independent approver decides. */
export function CountActions({ count, onChanged }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null);
  const submit = useCountDecision(count.id, 'submit');
  const approve = useCountDecision(count.id, 'approve');
  const reject = useCountDecision(count.id, 'reject');

  const actions = access.countActions({
    status: count.status,
    countedById: count.countedBy?.id ?? null,
    custodianId: count.fund.custodianId,
    pendingApprovers: count.pendingApprovers,
  });
  if (actions.length === 0) return null;

  const done = () => {
    setDialog(null);
    onChanged?.();
  };
  const busy = submit.isPending || approve.isPending || reject.isPending;

  return (
    <>
      <Group gap="sm" wrap="wrap">
        {actions.includes('submit') && (
          <Button
            leftSection={<IconSend size={16} />}
            loading={submit.isPending}
            disabled={busy}
            onClick={() =>
              submit.mutate({ reason: count.reason ?? undefined }, { onSuccess: done })
            }
          >
            {t('countForm.submit')}
          </Button>
        )}
        {actions.includes('approve') && (
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={busy}
            onClick={() => setDialog('approve')}
          >
            {t('actions.approve')}
          </Button>
        )}
        {actions.includes('reject') && (
          <Button
            variant="default"
            color="red"
            leftSection={<IconX size={16} />}
            disabled={busy}
            onClick={() => setDialog('reject')}
          >
            {t('actions.reject')}
          </Button>
        )}
      </Group>
      <DecisionDialog
        opened={dialog === 'approve'}
        title={t('decisions.approveCountTitle', { number: count.countNumber })}
        body={t('decisions.approveCountBody')}
        confirmLabel={t('actions.approve')}
        loading={approve.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => approve.mutate({}, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'reject'}
        title={t('decisions.rejectCountTitle', { number: count.countNumber })}
        reasonLabel={t('decisions.rejectCountReason')}
        reasonPlaceholder={t('decisions.rejectCountPlaceholder')}
        confirmLabel={t('actions.reject')}
        confirmColor="red"
        loading={reject.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => reject.mutate({ reason }, { onSuccess: done })}
      />
    </>
  );
}
