import { useTranslation } from '@/i18n';
import { DecisionDialog } from '@/module/petty-cash/presentation/components/DecisionDialog';

export type VoucherDialogKind = 'approve' | 'reject' | 'void';

interface Props {
  kind: VoucherDialogKind | null;
  voucherNumber: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

/** Confirms approve, and asks for a reason before reject or void (both are recorded in the audit log). */
export function VoucherActionDialog({
  kind,
  voucherNumber,
  loading,
  onClose,
  onConfirm,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');

  return (
    <DecisionDialog
      opened={kind !== null}
      title={kind ? t(`actions.${kind}Title`, { number: voucherNumber }) : ''}
      body={
        kind === 'approve'
          ? t('actions.approveBody')
          : kind === 'void'
            ? t('actions.voidBody')
            : undefined
      }
      reasonLabel={
        kind === 'reject'
          ? t('actions.rejectReason')
          : kind === 'void'
            ? t('actions.voidReason')
            : undefined
      }
      reasonPlaceholder={
        kind === 'reject'
          ? t('actions.rejectReasonPlaceholder')
          : kind === 'void'
            ? t('actions.voidReasonPlaceholder')
            : undefined
      }
      confirmLabel={kind ? t(`actions.${kind}`) : ''}
      confirmColor={kind === 'approve' ? 'primary' : 'red'}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
