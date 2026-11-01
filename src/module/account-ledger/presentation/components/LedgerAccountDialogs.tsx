import { IconArchive } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/images/illustrations/delete-confirm.svg';
import arsipkanIcon from '@/assets/images/illustrations/archive.svg';
import type { LedgerVariant } from '../../domain/ledgerVariant';

interface LedgerAccountDialogsProps {
  variant: LedgerVariant;
  account: { name?: string; accountNumber?: string; isArchived?: boolean };
  isDeleteOpen: boolean;
  isArchiveOpen: boolean;
  isDeleting: boolean;
  isArchiving: boolean;
  onCloseDelete: () => void;
  onCloseArchive: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

/** Confirm modals of the delete and archive/restore actions of the account. */
export const LedgerAccountDialogs: React.FC<LedgerAccountDialogsProps> = ({
  variant,
  account,
  isDeleteOpen,
  isArchiveOpen,
  isDeleting,
  isArchiving,
  onCloseDelete,
  onCloseArchive,
  onDelete,
  onArchive,
}) => {
  const { t } = useTranslation('accountLedger');
  const archiveLabel = t(account.isArchived ? 'common.restoreAction' : 'common.archiveAction');

  return (
    <>
      <ConfirmModal
        opened={isDeleteOpen}
        onClose={onCloseDelete}
        onConfirm={onDelete}
        title={t(`${variant}.deleteTitle`)}
        message={
          <>
            {t('common.deleteConfirmBefore')}
            <strong>{account.name}</strong>
            {t('common.deleteConfirmAfter', { number: account.accountNumber ?? '' })}
          </>
        }
        helperText={t('common.deleteHelper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('common.deleteAction')}
        cancelLabel={t('common.cancel')}
        confirmLoading={isDeleting}
      />

      <ConfirmModal
        opened={isArchiveOpen}
        onClose={onCloseArchive}
        onConfirm={onArchive}
        title={t(account.isArchived ? `${variant}.restoreTitle` : `${variant}.archiveTitle`)}
        message={
          <>
            {t(account.isArchived ? 'common.restoreConfirmBefore' : 'common.archiveConfirmBefore')}
            <strong>{account.name}</strong>
            {t(account.isArchived ? 'common.restoreConfirmAfter' : 'common.archiveConfirmAfter')}
          </>
        }
        helperText={t(account.isArchived ? `${variant}.restoreHelper` : 'common.archiveHelper')}
        imageSrc={arsipkanIcon}
        confirmLabel={archiveLabel}
        cancelLabel={t('common.cancel')}
        confirmLoading={isArchiving}
        confirmButtonProps={{
          color: account.isArchived ? 'primary' : 'var(--mantine-color-slate-5)',
          leftSection: <IconArchive size={18} />,
        }}
      />
    </>
  );
};
