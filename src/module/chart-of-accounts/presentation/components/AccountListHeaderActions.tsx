import React from 'react';
import { ActionIcon, Button, Group, Menu, Tooltip } from '@mantine/core';
import {
  IconChevronDown,
  IconDotsVertical,
  IconKey,
  IconPlus,
  IconRefresh,
  IconReportMoney,
  IconSettings,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';

interface AccountListHeaderActionsProps {
  isLoading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenBeginningBalance: () => void;
  onOpenPeriodLock: () => void;
}

/** Refresh button, "more actions" menu and the add-account button of the list header. */
export const AccountListHeaderActions: React.FC<AccountListHeaderActionsProps> = ({
  isLoading,
  onRefresh,
  onOpenSettings,
  onOpenBeginningBalance,
  onOpenPeriodLock,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('chartOfAccounts');

  return (
    <Group gap="xs" wrap="wrap">
      <Tooltip label={t('list.refreshTooltip')} withArrow position="top">
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          onClick={onRefresh}
          loading={isLoading}
          aria-label={t('list.refreshAria')}
        >
          <IconRefresh size={18} />
        </ActionIcon>
      </Tooltip>

      <Menu width={240} position="bottom-end" shadow="md" radius="md" withinPortal>
        <Menu.Target>
          <Button
            variant="default"
            size="md"
            radius="md"
            rightSection={<IconChevronDown size={14} />}
            leftSection={<IconDotsVertical size={16} />}
          >
            {t('list.moreActions')}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{t('list.menuTransactions')}</Menu.Label>
          <Menu.Item
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.journalEntries.add)}
          >
            {t('list.addJournalTransaction')}
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>{t('list.menuLedgerConfig')}</Menu.Label>
          <Menu.Item leftSection={<IconSettings size={16} />} onClick={onOpenSettings}>
            {t('list.standardAccounts')}
          </Menu.Item>
          <Menu.Item leftSection={<IconReportMoney size={16} />} onClick={onOpenBeginningBalance}>
            {t('list.beginningBalance')}
          </Menu.Item>
          <Menu.Item leftSection={<IconKey size={16} />} onClick={onOpenPeriodLock}>
            {t('list.periodLock')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Button
        color="primary"
        size="md"
        radius="md"
        leftSection={<IconPlus size={18} />}
        onClick={() => navigate(routes.chartOfAccounts.add)}
      >
        {t('list.addAccount')}
      </Button>
    </Group>
  );
};
