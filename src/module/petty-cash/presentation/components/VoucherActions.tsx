import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { IconCheck, IconPencil, IconSend, IconX } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type {
  PettyCashFund,
  PettyCashVoucherRecord,
} from '@/module/petty-cash/domain/pettyCashEntities';
import {
  VoucherActionDialog,
  type VoucherDialogKind,
} from '@/module/petty-cash/presentation/components/VoucherActionDialog';
import { useAllowedVoucherActions } from '@/module/petty-cash/presentation/hooks/useAllowedVoucherActions';
import { useVoucherDecision } from '@/module/petty-cash/presentation/hooks/useVoucherMutations';

interface Props {
  voucher: PettyCashVoucherRecord;
  fund: PettyCashFund;
  onChanged?: () => void;
}

/**
 * Actions offered for one voucher: only those its status allows, the user's menu rights cover, and
 * segregation of duties permits (a creator cannot approve their own voucher unless the fund allows it).
 */
export function VoucherActions({ voucher, fund, onChanged }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<VoucherDialogKind | null>(null);

  const submit = useVoucherDecision(voucher.id, 'submit');
  const approve = useVoucherDecision(voucher.id, 'approve');
  const reject = useVoucherDecision(voucher.id, 'reject');
  const voidVoucher = useVoucherDecision(voucher.id, 'void');

  const allowed = useAllowedVoucherActions(voucher, fund);
  const has = (action: (typeof allowed)[number]) => allowed.includes(action);
  const busy = submit.isPending || approve.isPending || reject.isPending || voidVoucher.isPending;

  const run = (mutation: typeof approve, reason?: string) =>
    mutation.mutate(
      { reason },
      {
        onSuccess: () => {
          setDialog(null);
          onChanged?.();
        },
      }
    );

  const confirm = (reason?: string) => {
    if (dialog === 'approve') run(approve);
    if (dialog === 'reject') run(reject, reason);
    if (dialog === 'void') run(voidVoucher, reason);
  };

  const dialogLoading =
    (dialog === 'approve' && approve.isPending) ||
    (dialog === 'reject' && reject.isPending) ||
    (dialog === 'void' && voidVoucher.isPending);

  const decisions = allowed.filter((action) => !action.endsWith('Attachment'));
  if (decisions.length === 0) return null;

  return (
    <>
      <Group gap="sm" wrap="wrap">
        {has('submit') && (
          <Button
            leftSection={<IconSend size={16} />}
            loading={submit.isPending}
            disabled={busy}
            onClick={() => run(submit)}
          >
            {t('actions.submit')}
          </Button>
        )}
        {has('approve') && (
          <Button
            leftSection={<IconCheck size={16} />}
            disabled={busy}
            onClick={() => setDialog('approve')}
          >
            {t('actions.approve')}
          </Button>
        )}
        {has('edit') && (
          <Button
            variant="default"
            leftSection={<IconPencil size={16} />}
            disabled={busy}
            onClick={() =>
              navigate(
                routes.pettyCash.voucherEdit
                  .replace(':fundId', fund.id)
                  .replace(':voucherId', voucher.id)
              )
            }
          >
            {t('actions.edit')}
          </Button>
        )}
        {has('reject') && (
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
        {has('void') && (
          <Button variant="subtle" color="red" disabled={busy} onClick={() => setDialog('void')}>
            {t('actions.void')}
          </Button>
        )}
      </Group>
      <VoucherActionDialog
        kind={dialog}
        voucherNumber={voucher.voucherNumber}
        loading={Boolean(dialogLoading)}
        onClose={() => setDialog(null)}
        onConfirm={confirm}
      />
    </>
  );
}
