import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconArchive, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { canArchiveAccount, deleteBlockReason } from '@/module/chart-of-accounts';

interface LedgerAccountMenuProps {
  account: { isLocked?: boolean; isArchived?: boolean; subAccount?: unknown[]; amount?: number };
  isArchiving: boolean;
  onArchive: () => void;
  onDelete: () => void;
}

/** "More" menu of the header. I7: a locked account offers neither archive nor delete, so it gets no menu. */
export const LedgerAccountMenu: React.FC<LedgerAccountMenuProps> = ({
  account,
  isArchiving,
  onArchive,
  onDelete,
}) => {
  const { t } = useTranslation('accountLedger');
  const showArchive = canArchiveAccount(account);
  const blockReason = deleteBlockReason(account);
  // A locked account offers no delete; a kept one shows it disabled with the way out (archive).
  const showDelete = blockReason !== 'locked';
  const deleteBlocked = blockReason !== null;

  // A locked account offers neither action; an empty menu would only show its title.
  if (!showArchive && !showDelete) return null;

  return (
    <Menu position="bottom-end" shadow="md" width={260} withArrow>
      <Menu.Target>
        <ActionIcon variant="default" size={42} radius="md" aria-label={t('common.actionMenu')}>
          <IconDotsVertical size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('common.manageAccount')}</Menu.Label>
        {showArchive && (
          <Menu.Item
            leftSection={<IconArchive size={16} />}
            onClick={onArchive}
            disabled={isArchiving}
          >
            {t(account.isArchived ? 'common.restoreAction' : 'common.archiveAction')}
          </Menu.Item>
        )}
        {showArchive && showDelete && <Menu.Divider />}
        {showDelete && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={onDelete}
            disabled={deleteBlocked}
          >
            {t('common.deleteAction')}
          </Menu.Item>
        )}
        {blockReason === 'hasSubAccounts' && (
          <Text fz="xs" c="dimmed" px="sm" py={6}>
            {t('common.deleteBlockedSubAccounts')}
          </Text>
        )}
        {blockReason === 'hasBalance' && (
          <Text fz="xs" c="dimmed" px="sm" py={6}>
            {t('common.deleteBlockedBalance')}
          </Text>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
