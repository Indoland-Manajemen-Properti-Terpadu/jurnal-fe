import { Button, Menu } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowUpRight,
  IconChevronDown,
  IconPlus,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { LedgerVariant } from '../../domain/ledgerVariant';

const GRADIENT = { from: 'primary.6', to: 'secondary.6', deg: 135 };

/** Header "create" control: a menu of four cash/bank transactions, or one journal button. */
export const LedgerCreateActions: React.FC<{ variant: LedgerVariant }> = ({ variant }) => {
  const { t } = useTranslation('accountLedger');
  const navigate = useNavigate();

  if (variant === 'nonCashBank') {
    return (
      <Button
        variant="gradient"
        gradient={GRADIENT}
        size="sm"
        leftSection={<IconPlus size={16} />}
        onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
      >
        {t('nonCashBank.create.button')}
      </Button>
    );
  }

  return (
    <Menu position="bottom-end" shadow="md" width={220} withArrow>
      <Menu.Target>
        <Button
          variant="gradient"
          gradient={GRADIENT}
          size="sm"
          leftSection={<IconPlus size={16} />}
          rightSection={<IconChevronDown size={14} />}
        >
          {t('cashBank.create.button')}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('cashBank.create.label')}</Menu.Label>
        <Menu.Item
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
        >
          {t('cashBank.create.journal')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowsExchange size={16} />}
          onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
        >
          {t('cashBank.create.transfer')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowDownRight size={16} />}
          onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
        >
          {t('cashBank.create.receive')}
        </Menu.Item>
        <Menu.Item
          leftSection={<IconArrowUpRight size={16} />}
          onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
        >
          {t('cashBank.create.send')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
