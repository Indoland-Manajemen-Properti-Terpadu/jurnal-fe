import { useState } from 'react';
import { Alert, Button, Group, NumberInput, Text } from '@mantine/core';
import {
  IconAlertCircle,
  IconCash,
  IconCheck,
  IconListDetails,
  IconReceipt2,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AdvanceRecord, PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { ConvertAdvanceDialog } from '@/module/petty-cash/presentation/components/ConvertAdvanceDialog';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';
import { SettlementAccountsDialog } from '@/module/petty-cash/presentation/components/SettlementAccountsDialog';
import { SettlementDialog } from '@/module/petty-cash/presentation/components/SettlementDialog';
import {
  useAdvanceDecision,
  type AdvanceDecision,
} from '@/module/petty-cash/presentation/hooks/useAdvanceMutations';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

type Dialog = AdvanceDecision | 'settle' | 'accounts' | 'convert' | null;

interface Props {
  advance: AdvanceRecord;
  fund: PettyCashFund;
  onChanged?: () => void;
}

/** Every step of an advance, offered only to the person who may take it (separation of duties). */
export function AdvanceActions({ advance, fund, onChanged }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [approved, setApproved] = useState<number | ''>(advance.requestedAmount);
  const approve = useAdvanceDecision(advance.id, 'approve');
  const reject = useAdvanceDecision(advance.id, 'reject');
  const cancel = useAdvanceDecision(advance.id, 'cancel');
  const disburse = useAdvanceDecision(advance.id, 'disburse');
  const custodianVerify = useAdvanceDecision(advance.id, 'custodianVerify');
  const custodianReject = useAdvanceDecision(advance.id, 'custodianReject');
  const financeVerify = useAdvanceDecision(advance.id, 'financeVerify');
  const financeReject = useAdvanceDecision(advance.id, 'financeReject');

  const actions = access.advanceActions({
    status: advance.status,
    requesterId: advance.requester.id,
    fundCustodianId: fund.custodian.id,
    singleUserOverride: fund.settings.singleUserOverride,
    custodianVerifiedById: advance.custodianVerifiedBy?.id ?? null,
  });
  if (actions.length === 0) return null;

  const done = () => {
    setDialog(null);
    onChanged?.();
  };
  const number = advance.advanceNumber;
  const busy = [
    approve,
    reject,
    cancel,
    disburse,
    custodianVerify,
    custodianReject,
    financeVerify,
    financeReject,
  ].some((mutation) => mutation.isPending);
  const accountsMissing = advance.settlement.lines.some((line) => !line.expenseAccount);
  const approvedValid = approved !== '' && approved > 0 && approved <= advance.requestedAmount;

  return (
    <>
      <Group gap="sm" wrap="wrap">
        {actions.includes('submitSettlement') && (
          <Button leftSection={<IconReceipt2 size={16} />} onClick={() => setDialog('settle')}>
            {t('advanceActions.settle')}
          </Button>
        )}
        {actions.includes('disburse') && (
          <Button
            leftSection={<IconCash size={16} />}
            disabled={busy}
            onClick={() => setDialog('disburse')}
          >
            {t('advanceActions.disburse')}
          </Button>
        )}
        {actions.includes('approve') && (
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={busy}
            onClick={() => setDialog('approve')}
          >
            {t('advanceActions.approve')}
          </Button>
        )}
        {actions.includes('custodianVerify') && (
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={busy}
            onClick={() => setDialog('custodianVerify')}
          >
            {t('advanceActions.custodianVerify')}
          </Button>
        )}
        {actions.includes('financeVerify') && (
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={busy || accountsMissing}
            onClick={() => setDialog('financeVerify')}
          >
            {t('advanceActions.financeVerify')}
          </Button>
        )}
        {actions.includes('setAccounts') && (
          <Button
            variant="light"
            leftSection={<IconListDetails size={16} />}
            onClick={() => setDialog('accounts')}
          >
            {t('advanceActions.saveAccounts')}
          </Button>
        )}
        {(['reject', 'custodianReject', 'financeReject'] as const).map(
          (action) =>
            actions.includes(action) && (
              <Button
                key={action}
                variant="default"
                leftSection={<IconX size={16} />}
                disabled={busy}
                onClick={() => setDialog(action)}
              >
                {t(`advanceActions.${action}`)}
              </Button>
            )
        )}
        {actions.includes('cancel') && (
          <Button variant="subtle" color="red" disabled={busy} onClick={() => setDialog('cancel')}>
            {t('advanceActions.cancel')}
          </Button>
        )}
        {actions.includes('convert') && (
          <Button variant="subtle" color="red" onClick={() => setDialog('convert')}>
            {t('advanceActions.convert')}
          </Button>
        )}
      </Group>
      {actions.includes('financeVerify') && accountsMissing && (
        <Alert color="orange" icon={<IconAlertCircle size={18} />} radius="md" mt="sm">
          {t('advanceActions.accountsMissing')}
        </Alert>
      )}

      <DecisionDialog
        opened={dialog === 'approve'}
        title={t('advanceActions.approveTitle', { number })}
        body={t('advanceActions.approveBody')}
        confirmLabel={t('advanceActions.approve')}
        confirmDisabled={!approvedValid}
        loading={approve.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() =>
          approve.mutate({ amount: approved === '' ? undefined : approved }, { onSuccess: done })
        }
      >
        <NumberInput
          label={t('advanceActions.approveAmount')}
          value={approved}
          onChange={(value) => setApproved(value === '' ? '' : Number(value))}
          max={advance.requestedAmount}
          thousandSeparator="."
          decimalSeparator=","
          allowNegative={false}
          decimalScale={0}
          leftSection={<Text size="sm">Rp</Text>}
        />
      </DecisionDialog>
      <DecisionDialog
        opened={dialog === 'reject'}
        title={t('advanceActions.rejectTitle', { number })}
        reasonLabel={t('advanceActions.rejectReason')}
        reasonPlaceholder={t('advanceActions.rejectPlaceholder')}
        confirmLabel={t('advanceActions.reject')}
        confirmColor="red"
        loading={reject.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => reject.mutate({ reason }, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'cancel'}
        title={t('advanceActions.cancelTitle', { number })}
        reasonLabel={t('advanceActions.cancelReason')}
        reasonPlaceholder={t('advanceActions.cancelPlaceholder')}
        confirmLabel={t('advanceActions.cancel')}
        confirmColor="red"
        loading={cancel.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => cancel.mutate({ reason }, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'disburse'}
        title={t('advanceActions.disburseTitle', { number })}
        body={t('advanceActions.disburseBody')}
        confirmLabel={t('advanceActions.disburse')}
        loading={disburse.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => disburse.mutate({}, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'custodianVerify'}
        title={t('advanceActions.custodianVerifyTitle', { number })}
        body={t('advanceActions.custodianVerifyBody')}
        confirmLabel={t('advanceActions.custodianVerify')}
        loading={custodianVerify.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => custodianVerify.mutate({}, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'financeVerify'}
        title={t('advanceActions.financeVerifyTitle', { number })}
        body={t('advanceActions.financeVerifyBody')}
        confirmLabel={t('advanceActions.financeVerify')}
        loading={financeVerify.isPending}
        onClose={() => setDialog(null)}
        onConfirm={() => financeVerify.mutate({}, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'custodianReject'}
        title={t('advanceActions.returnTitle', { number })}
        reasonLabel={t('advanceActions.returnReason')}
        reasonPlaceholder={t('advanceActions.returnPlaceholder')}
        confirmLabel={t('advanceActions.custodianReject')}
        confirmColor="red"
        loading={custodianReject.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => custodianReject.mutate({ reason }, { onSuccess: done })}
      />
      <DecisionDialog
        opened={dialog === 'financeReject'}
        title={t('advanceActions.returnTitle', { number })}
        reasonLabel={t('advanceActions.returnReason')}
        reasonPlaceholder={t('advanceActions.returnPlaceholder')}
        confirmLabel={t('advanceActions.financeReject')}
        confirmColor="red"
        loading={financeReject.isPending}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => financeReject.mutate({ reason }, { onSuccess: done })}
      />
      <SettlementDialog
        advance={advance}
        opened={dialog === 'settle'}
        onClose={() => {
          setDialog(null);
          onChanged?.();
        }}
      />
      <SettlementAccountsDialog
        advance={advance}
        opened={dialog === 'accounts'}
        onClose={() => setDialog(null)}
      />
      <ConvertAdvanceDialog
        advance={advance}
        opened={dialog === 'convert'}
        onClose={() => setDialog(null)}
      />
    </>
  );
}
