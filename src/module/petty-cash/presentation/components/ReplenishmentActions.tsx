import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCash, IconCheck, IconX } from '@tabler/icons-react';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import type { ReimbursementRecord } from '@/module/petty-cash/domain/pettyCashEntities';
import { isDisbursementDateValid } from '@/module/petty-cash/domain/replenishment';
import { PocketSelect } from '@/module/petty-cash/presentation/components/PocketSelect';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { usePettyCashFund } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useReplenishmentDecision } from '@/module/petty-cash/presentation/hooks/useReplenishmentMutations';

type Dialog = 'approve' | 'reject' | 'cancel' | 'disburse' | null;

interface Props {
  record: ReimbursementRecord;
  onChanged?: () => void;
}

/**
 * Approve and reject by an approver other than the submitter; cancel before the payout; pay out an
 * approved request by someone who neither submitted nor approved it (separation of duties).
 */
export function ReplenishmentActions({ record, onChanged }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const today = todayWib();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [date, setDate] = useState(today);
  const fund = usePettyCashFund(record.fund.id, dialog === 'disburse');
  const [pocket, setPocket] = useState<string | null>(null);
  const approve = useReplenishmentDecision(record.id, 'approve');
  const reject = useReplenishmentDecision(record.id, 'reject');
  const cancel = useReplenishmentDecision(record.id, 'cancel');
  const disburse = useReplenishmentDecision(record.id, 'disburse');

  const actions = access.reimbursementActions({
    status: record.status,
    submittedById: record.submittedBy?.id ?? null,
    approvedById: record.approvedBy?.id ?? null,
    pendingApprovers: record.pendingApprovers,
  });
  if (actions.length === 0) return null;

  const done = () => {
    setDialog(null);
    onChanged?.();
  };
  const busy = approve.isPending || reject.isPending || cancel.isPending || disburse.isPending;
  const number = record.reimbursementNumber;

  return (
    <>
      <Group gap="sm" wrap="wrap">
        {actions.includes('disburse') && (
          <Button
            leftSection={<IconCash size={16} />}
            disabled={busy}
            onClick={() => setDialog('disburse')}
          >
            {t('actions.disburse')}
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
            leftSection={<IconX size={16} />}
            disabled={busy}
            onClick={() => setDialog('reject')}
          >
            {t('actions.reject')}
          </Button>
        )}
        {actions.includes('cancel') && (
          <Button variant="subtle" color="red" disabled={busy} onClick={() => setDialog('cancel')}>
            {t('actions.cancelReplenishment')}
          </Button>
        )}
      </Group>

      <DecisionDialog
        opened={dialog === 'approve'}
        title={t('decisions.approveReplenishmentTitle', { number })}
        body={t('decisions.approveReplenishmentBody')}
        confirmLabel={t('actions.approve')}
        loading={approve.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => approve.mutate({}, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'reject'}
        title={t('decisions.rejectReplenishmentTitle', { number })}
        reasonLabel={t('decisions.rejectReplenishmentReason')}
        reasonPlaceholder={t('decisions.rejectReplenishmentPlaceholder')}
        confirmLabel={t('actions.reject')}
        confirmColor="red"
        loading={reject.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => reject.mutate({ reason }, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'cancel'}
        title={t('decisions.cancelReplenishmentTitle', { number })}
        body={t('decisions.cancelReplenishmentBody')}
        reasonLabel={t('decisions.cancelReplenishmentReason')}
        reasonPlaceholder={t('decisions.cancelReplenishmentPlaceholder')}
        confirmLabel={t('actions.cancelReplenishment')}
        confirmColor="red"
        loading={cancel.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => cancel.mutate({ reason }, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'disburse'}
        title={t('decisions.disburseTitle', { number })}
        body={t('decisions.disburseBody')}
        confirmLabel={t('actions.disburse')}
        confirmDisabled={!isDisbursementDateValid(date, today)}
        loading={disburse.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          disburse.mutate(
            { disbursementDate: date, pocket: pocket ?? record.pocket ?? undefined },
            { onSuccess: done }
          )
        }
      >
        <PocketSelect
          pockets={fund.data?.pockets ?? []}
          value={pocket ?? record.pocket ?? ''}
          onChange={setPocket}
          label={t('pocketAdmin.receivedIn')}
          showBalance={false}
        />
        <DatePickerInput
          label={t('decisions.disburseDate')}
          description={t('decisions.disburseDateHint')}
          value={date || null}
          onChange={(value) => setDate(value ?? '')}
          maxDate={today}
          valueFormat="DD/MM/YYYY"
          required
        />
      </DecisionDialog>
    </>
  );
}
