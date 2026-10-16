import React from 'react';
import { ActionIcon, Alert, Box, Button, Group, Menu, Paper, Stack, Tooltip } from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowUpRight,
  IconBuildingBank,
  IconChevronDown,
  IconFileSpreadsheet,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import ModuleHeader from '@/components/ModuleHeader/ModuleHeader';
import BankAndCashLayout from './Layout';
import StatsBankCashGrid from '../components/StatsBankCashGrid/StatsBankCashGrid';
import TableBankCash from '../components/Table/TableBankCash';
import { useJournalAccounts } from '@/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts';
import { useTranslation } from '@/i18n';

export function BankAndCashMainPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('journal');
  const { accounts, isLoading, isError, refetch } = useJournalAccounts();

  return (
    <BankAndCashLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Canonical Module Header */}
          <ModuleHeader
            icon={IconBuildingBank}
            title={t('cashBankTitle')}
            description={t('cashBankSubtitle')}
            actions={
              <Group gap="sm" wrap="wrap">
                <Tooltip label={t('refresh')} withArrow>
                  <ActionIcon
                    variant="default"
                    size="lg"
                    radius="md"
                    onClick={() => refetch()}
                    loading={isLoading}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>

                {/* Dropdown Catat Transaksi */}
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

                {/* Primary Button: Tambah Akun Kas/Bank */}
                <Button
                  variant="gradient"
                  gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
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
              Gagal memuat data akun kas & bank. Silakan coba segarkan kembali.
            </Alert>
          )}

          {/* Quick Metrics KPI Stats Grid */}
          <StatsBankCashGrid accounts={accounts} loading={isLoading} />

          {/* Main Content Container with Table */}
          <Paper withBorder radius="lg" p="md" bg="white">
            <TableBankCash accounts={accounts} loading={isLoading} onRefresh={() => refetch()} />
          </Paper>
        </Stack>
      </Box>
    </BankAndCashLayout>
  );
}

export default BankAndCashMainPage;
