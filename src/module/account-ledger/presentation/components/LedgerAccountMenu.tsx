import { ActionIcon, Menu } from '@mantine/core';
import { IconArchive, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { canArchiveAccount, canDeleteAccount } from '@/module/chart-of-accounts';

interface LedgerAccountMenuProps {
  account: { isLocked?: boolean; isArchived?: boolean };
  isArchiving: boolean;
  onArchive: () => void;
  onDelete: () => void;
}

/** "More" menu of the header. I7: a locked account offers neither archive nor delete. */
export const LedgerAccountMenu: React.FC<LedgerAccountMenuProps> = ({
  account,
  isArchiving,
  onArchive,
  onDelete,
}) => {
  const { t } = useTranslation('accountLedger');
  const showArchive = canArchiveAccount(account);
  const showDelete = canDeleteAccount(account);

  return (
    <Menu position="bottom-end" shadow="md" width={200} withArrow>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" radius="md" aria-label={t('common.actionMenu')}>
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
          <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
            {t('common.deleteAction')}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
