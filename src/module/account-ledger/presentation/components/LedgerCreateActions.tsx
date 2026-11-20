import { Button, Menu } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowUpRight,
  IconChevronDown,
  IconPlus,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { withAccountPrefill } from '@/module/bank-cash';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { LedgerVariant } from '../../domain/ledgerVariant';

/** Header "create" control: a menu of four cash/bank transactions, or one journal button. */
/** The account is preselected in the posting form, and saving returns here. */
export const LedgerCreateActions: React.FC<{ variant: LedgerVariant; accountId: string }> = ({
  variant,
  accountId,
}) => {
  const { t } = useTranslation('accountLedger');
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const openForm = (path: string, param: 'fromAccountId' | 'toAccountId') =>
    navigate(withAccountPrefill(path, param, accountId, pathname));

  if (variant === 'nonCashBank') {
    return (
      <Button
        color="primary"
        size="md"
        leftSection={<IconPlus size={18} />}
        onClick={() => navigate(routes.journalEntries.add)}
      >
        {t('nonCashBank.create.button')}
      </Button>
    );
  }

  return (
    <Menu position="bottom-end" shadow="md" width={220} withArrow>
      <Menu.Target>
        <Button
          color="primary"
          size="md"
          leftSection={<IconPlus size={18} />}
          rightSection={<IconChevronDown size={14} />}
        >
          {t('cashBank.create.button')}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('cashBank.create.label')}</Menu.Label>
        <Menu.Item
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate(routes.journalEntries.add)}
        >
          {t('cashBank.create.journal')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowsExchange size={16} />}
          onClick={() => openForm(routes.bankCash.addTransfer, 'fromAccountId')}
        >
          {t('cashBank.create.transfer')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowDownRight size={16} />}
          onClick={() => openForm(routes.bankCash.addReceive, 'toAccountId')}
        >
          {t('cashBank.create.receive')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowUpRight size={16} />}
          onClick={() => openForm(routes.bankCash.addSent, 'fromAccountId')}
        >
          {t('cashBank.create.send')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
