import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { archiveAccount, useDeleteAccount } from '@/module/chart-of-accounts';
import type { LedgerVariant } from '../../domain/ledgerVariant';
import { serverMessage } from '../../domain/serverMessage';

interface Options {
  idAccount: string;
  variant: LedgerVariant;
  isArchived?: boolean;
}

/** Archive/restore and delete of the open account, with the confirm modal state. */
export const useLedgerAccountActions = ({ idAccount, variant, isArchived }: Options) => {
  const { t } = useTranslation('accountLedger');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleArchive = async () => {
    if (!idAccount) return;
    setIsArchiving(true);
    try {
      await archiveAccount(idAccount);
      notifications.show({
        color: 'teal',
        autoClose: 3000,
        title: t('common.archiveOkTitle'),
        message: t(isArchived ? `${variant}.restoreOkMessage` : `${variant}.archiveOkMessage`),
      });
      await queryClient.refetchQueries({ queryKey: ['detail_account', idAccount] });
      setIsArchiveModalOpen(false);
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        autoClose: 3000,
        title: t('common.archiveFailTitle'),
        message: serverMessage(error) || t('common.archiveFailFallback'),
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = () => {
    if (!idAccount) return;
    deleteAccount(
      { accountIds: [idAccount] },
      {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          navigate(routes.generalJournal.main);
        },
      }
    );
  };

  return {
    isArchiving,
    isDeleting,
    isArchiveModalOpen,
    isDeleteModalOpen,
    openArchiveModal: () => setIsArchiveModalOpen(true),
    closeArchiveModal: () => setIsArchiveModalOpen(false),
    openDeleteModal: () => setIsDeleteModalOpen(true),
    closeDeleteModal: () => setIsDeleteModalOpen(false),
    handleArchive,
    handleDelete,
  };
};
