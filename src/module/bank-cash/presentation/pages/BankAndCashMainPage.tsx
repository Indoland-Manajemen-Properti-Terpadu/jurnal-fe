import React from 'react';
import { Alert, Box, Button, Group, Menu, Paper, Stack } from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowUpRight,
  IconBuildingBank,
  IconChevronDown,
  IconFileSpreadsheet,
  IconPlus,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import AppShellLayout from '@/components/AppShellLayout';
import StatsBankCashGrid from '@/module/bank-cash/presentation/components/stats/StatsBankCashGrid';
import { TableBankCash } from '@/module/bank-cash/presentation/components/accounts-table/TableBankCash';
import { useJournalAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import classes from '@/module/bank-cash/presentation/pages/BankAndCashMainPage.module.css';

export function BankAndCashMainPage() {
  const { t: tb } = useTranslation('bankCash');
  const navigate = useNavigate();
  const { t } = useTranslation('journal');
  const { accounts, isLoading, isError, refetch } = useJournalAccounts();

  return (
    <AppShellLayout withFooter>
      <Box className={classes.page} p={{ base: 'md', sm: 'xl' }}>
        <Stack className={classes.workspace} gap="lg">
          <ModuleHeader
            icon={IconBuildingBank}
            title={t('cashBankTitle')}
            description={t('cashBankSubtitle')}
            actions={
              <Group gap="sm" wrap="wrap">
                <Menu position="bottom-end" shadow="md" width={240} withArrow>
                  <Menu.Target>
                    <Button
                      variant="default"
                      size="sm"
                      radius="md"
                      rightSection={<IconChevronDown size={14} />}
                    >
                      {t('recordTransaction')}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconArrowsExchange size={16} />}
                      onClick={() => navigate(routes.BankAndCash.AddTransferMoney)}
                    >
                      {t('transferMoney')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconArrowDownRight size={16} />}
                      onClick={() => navigate(routes.BankAndCash.AddReceiveMoney)}
                    >
                      {t('receiveMoney')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconArrowUpRight size={16} />}
                      onClick={() => navigate(routes.BankAndCash.AddSentMoney)}
                    >
                      {t('sendMoney')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<IconFileSpreadsheet size={16} />}
                      onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
                    >
                      {t('manualJournalEntry')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <Button
                  color="primary"
                  size="sm"
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => navigate(routes.generalJournal.addAccountJournal)}
                >
                  {t('addCashBankAccount')}
                </Button>
              </Group>
            }
          />

          {isError && (
            <Alert icon={<IconAlertCircle size={16} />} title={t('error')} color="red" radius="md">
              {tb('main.loadError')}
            </Alert>
          )}

          <StatsBankCashGrid accounts={accounts} loading={isLoading} />

          <Paper className={classes.accounts} withBorder radius="lg" p={{ base: 'md', sm: 'lg' }}>
            <TableBankCash accounts={accounts} loading={isLoading} onRefresh={() => refetch()} />
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

export default BankAndCashMainPage;
