import React from 'react';
import { ActionIcon, Badge, Box, Group, Menu, Table, Text, Tooltip } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowsExchange,
  IconArrowsShuffle,
  IconArrowUpRight,
  IconDots,
  IconPencil,
  IconPlugConnected,
  IconReceipt2,
  IconReceiptRefund,
  IconWallet,
  IconCashBanknote,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { canEditAccount } from '@/module/chart-of-accounts';
import { withAccountPrefill } from '@/module/bank-cash/domain/accountPrefill';
import type { CashBankAccount, TransactionBlock } from '@/module/bank-cash/domain/cashBankAccounts';
import { useTranslation } from '@/i18n';
import {
  CONNECTION_STATUSES,
  ConnectionStatusPill,
  type ConnectionStatus,
} from '@/module/bank-connection';
import classes from '@/module/bank-cash/presentation/components/accounts-table/TableBankCash.module.css';

export type BankCashAccountRowProps = {
  account: CashBankAccount;
  /** Show the bank balance and connection columns (only when some account is connected). */
  showConnection?: boolean;
  block: TransactionBlock;
  /** The petty cash fund that owns the account, when `block` is `pettyCash`. */
  fundId?: string;
};

export const BankCashAccountRow: React.FC<BankCashAccountRowProps> = ({
  account,
  block,
  fundId,
  showConnection = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('journal');
  const { t: tb } = useTranslation('bankCash');
  const { t: tc } = useTranslation('bankConnection');

  const ledgerPath = routes.accountLedger.cashBank.replace(':idAccount', account.id);
  const kind =
    block === 'pettyCash'
      ? { label: tb('list.pettyCashBadge'), icon: <IconCashBanknote size={18} /> }
      : { label: tb('list.plainAccount'), icon: <IconWallet size={18} /> };
  const amount = Number(account.amount) || 0;
  const isOverdraft = amount < 0;
  const connection = account.bankConnection;
  const connectionStatus = CONNECTION_STATUSES.includes(connection?.status as ConnectionStatus)
    ? (connection?.status as ConnectionStatus)
    : undefined;
  const connectionPath = connection
    ? routes.bankConnection.detail.replace(':connectionId', connection.id)
    : `${routes.bankConnection.main}?accountId=${account.id}`;

  return (
    <Table.Tr onClick={() => navigate(ledgerPath)} className={classes.row}>
      <Table.Td>
        <Text size="sm" c="dimmed" ff="monospace">
          {account.accountNumber || '—'}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Tooltip label={kind.label} withArrow>
            <Box className={classes.accountIcon} role="img" aria-label={kind.label}>
              {kind.icon}
            </Box>
          </Tooltip>
          <Text size="sm" fw={600} c="dark.8" className={classes.accountName}>
            {account.name}
          </Text>
          {account.isArchived && (
            <Badge size="xs" variant="filled" color="gray" radius="sm">
              {tb('list.archivedBadge')}
            </Badge>
          )}
        </Group>
      </Table.Td>

      <Table.Td style={{ textAlign: 'right' }}>
        <Text
          fw={700}
          size="sm"
          c={isOverdraft ? 'red.7' : 'dark.8'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(amount)}
        </Text>
        {isOverdraft && (
          <Text size="xs" c="red.6">
            {t('overdraftWarning')}
          </Text>
        )}
      </Table.Td>

      {showConnection && (
        <>
          <Table.Td style={{ textAlign: 'right' }}>
            {typeof connection?.statementBalance === 'number' ? (
              <Text fw={600} size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(connection.statementBalance)}
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                —
              </Text>
            )}
          </Table.Td>
          <Table.Td>
            {connectionStatus ? (
              <ConnectionStatusPill status={connectionStatus} />
            ) : (
              <Text size="sm" c="dimmed">
                {tc('list.notConnected')}
              </Text>
            )}
          </Table.Td>
        </>
      )}

      <Table.Td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <Menu position="bottom-end" shadow="md" width={240} withArrow>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="md"
              aria-label={tb('list.actionsLabel')}
            >
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{tb('list.actionsLabel')}</Menu.Label>
            <Menu.Item
              leftSection={<IconReceipt2 size={15} />}
              onClick={() => navigate(ledgerPath)}
            >
              {t('viewDetailAndMutation')}
            </Menu.Item>

            {block === null && (
              <>
                <Menu.Item
                  leftSection={<IconArrowsShuffle size={15} />}
                  onClick={() => navigate(`${ledgerPath}?tab=reconciliation`)}
                >
                  {t('reconcileBank')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPlugConnected size={15} />}
                  onClick={() => navigate(connectionPath)}
                >
                  {connection ? tc('list.manage') : tc('list.connect')}
                </Menu.Item>
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
                    navigate(
                      withAccountPrefill(routes.bankCash.addReceive, 'toAccountId', account.id)
                    )
                  }
                >
                  {t('receiveToThis')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconArrowUpRight size={15} />}
                  onClick={() =>
                    navigate(
                      withAccountPrefill(routes.bankCash.addSent, 'fromAccountId', account.id)
                    )
                  }
                >
                  {t('sendFromThis')}
                </Menu.Item>
              </>
            )}

            {block === 'pettyCash' && fundId && (
              <>
                <Menu.Divider />
                <Menu.Label>{tb('list.pettyCashHint')}</Menu.Label>
                <Menu.Item
                  leftSection={<IconWallet size={15} />}
                  onClick={() => navigate(routes.pettyCash.detail.replace(':fundId', fundId))}
                >
                  {tb('list.openPettyCash')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconReceipt2 size={15} />}
                  onClick={() => navigate(routes.pettyCash.voucherAdd.replace(':fundId', fundId))}
                >
                  {tb('list.recordVoucher')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconReceiptRefund size={15} />}
                  onClick={() =>
                    navigate(routes.pettyCash.replenishmentAdd.replace(':fundId', fundId))
                  }
                >
                  {tb('list.requestReplenishment')}
                </Menu.Item>
              </>
            )}

            {block !== 'archived' && canEditAccount(account) && (
              <>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconPencil size={15} />}
                  onClick={() =>
                    navigate(routes.chartOfAccounts.edit.replace(':idAccount', account.id))
                  }
                >
                  {t('editAccount')}
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
};

export default BankCashAccountRow;
