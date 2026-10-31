import React from 'react';
import { ActionIcon, Badge, Box, Group, Menu, Table, Text } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowsShuffle,
  IconArrowUpRight,
  IconBuildingBank,
  IconDots,
  IconLock,
  IconPencil,
  IconReceipt2,
  IconWallet,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { JournalAccounts } from '@/module/chart-of-accounts';
import { withAccountPrefill } from '@/module/bank-cash/domain/accountPrefill';
import { isBankAccount } from '@/module/bank-cash/domain/bankCashSummary';
import { useTranslation } from '@/i18n';
import classes from '@/module/bank-cash/presentation/components/accounts-table/TableBankCash.module.css';

export const BankCashAccountRow: React.FC<{ account: JournalAccounts }> = ({ account }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('journal');

  const handleRowClick = (accountId: string) => {
    navigate(routes.accountLedger.cashBank.replace(':idAccount', accountId));
  };

  const isBank = isBankAccount(account);
  const amount = Number(account.amount) || 0;
  const isOverdraft = amount < 0;

  return (
    <Table.Tr
      onClick={() => handleRowClick(account.id)}
      style={{
        cursor: 'pointer',
        transition: 'background-color 150ms ease',
      }}
    >
      {/* Account Name & Code */}
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Box className={classes.accountIcon} aria-hidden="true">
            {isBank ? <IconBuildingBank size={18} /> : <IconWallet size={18} />}
          </Box>

          <Box style={{ minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap" align="center">
              <Text
                size="sm"
                fw={600}
                c="dark.8"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {account.name}
              </Text>

              {account.isArchived && (
                <Badge size="xs" variant="filled" color="gray" radius="sm">
                  {t('archived')}
                </Badge>
              )}
              {account.isLocked && (
                <Badge
                  size="xs"
                  variant="light"
                  color="blue"
                  radius="sm"
                  leftSection={<IconLock size={10} />}
                >
                  {t('locked')}
                </Badge>
              )}
            </Group>

            <Group gap={6} mt={2} align="center">
              <Text size="xs" c="dimmed" ff="monospace">
                {account.accountNumber || '—'}
              </Text>

              {account.category?.name && account.category.name !== 'Kas & Bank' && (
                <Text size="xs" c="dimmed">
                  • {account.category.name}
                </Text>
              )}
            </Group>
          </Box>
        </Group>
      </Table.Td>

      {/* Account Type */}
      <Table.Td>
        <Text size="sm" c="dark.7">
          {isBank ? t('accountTypeBank') : t('accountTypeCash')}
        </Text>
      </Table.Td>

      {/* Ledger Balance */}
      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          fw={700}
          size="sm"
          c={isOverdraft ? 'red.7' : 'dark.8'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(amount)}
        </Text>
        <Text size="xs" c={isOverdraft ? 'red.6' : 'dimmed'}>
          {isOverdraft ? t('overdraftWarning') : t('normalBalancePositive')}
        </Text>
      </Table.Td>

      {/* Reconciliation Status */}
      <Table.Td style={{ textAlign: 'center' }}>
        <Group gap={7} justify="center" wrap="nowrap">
          <span
            className={classes.statusDot}
            data-tone={isBank ? 'ready' : 'neutral'}
            aria-hidden="true"
          />
          <Text size="xs" c="gray.7" fw={550}>
            {isBank ? t('reconciledReady') : t('notApplicable')}
          </Text>
        </Group>
      </Table.Td>

      {/* Quick Action Menu */}
      <Table.Td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <Menu position="bottom-end" shadow="md" width={220} withArrow>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" radius="md">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{t('actions')}</Menu.Label>

            <Menu.Item
              leftSection={<IconReceipt2 size={15} />}
              onClick={() =>
                navigate(routes.accountLedger.cashBank.replace(':idAccount', account.id))
              }
            >
              {t('viewDetailAndMutation')}
            </Menu.Item>

            {isBank && (
              <Menu.Item
                leftSection={<IconArrowsShuffle size={15} />}
                onClick={() =>
                  navigate(
                    `${routes.accountLedger.cashBank.replace(':idAccount', account.id)}?tab=reconciliation`
                  )
                }
              >
                {t('reconcileBank')}
              </Menu.Item>
            )}

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconArrowsExchange size={15} />}
              onClick={() =>
                navigate(
                  withAccountPrefill(routes.bankCash.addTransfer, 'fromAccountId', account.id)
                )
              }
            >
              {t('transferFromThis')}
            </Menu.Item>

            <Menu.Item
              leftSection={<IconArrowDownRight size={15} />}
              onClick={() =>
                navigate(withAccountPrefill(routes.bankCash.addReceive, 'toAccountId', account.id))
              }
            >
              {t('receiveToThis')}
            </Menu.Item>

            <Menu.Item
              leftSection={<IconArrowUpRight size={15} />}
              onClick={() =>
                navigate(withAccountPrefill(routes.bankCash.addSent, 'fromAccountId', account.id))
              }
            >
              {t('sendFromThis')}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconPencil size={15} />}
              onClick={() =>
                navigate(routes.chartOfAccounts.edit.replace(':idAccount', account.id))
              }
            >
              {t('editAccount')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
};

export default BankCashAccountRow;
