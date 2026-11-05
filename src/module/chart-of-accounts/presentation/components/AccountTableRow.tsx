import { ActionIcon, Anchor, Badge, Checkbox, Group, Table, Text, Tooltip } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { routes } from '@/router/routes';
import type { AccountNode } from '../../domain/accountTree';
import { AccountAccessBadge, AccountStatusBadge, NormalBalanceBadge } from './AccountBadges';
import classes from './AccountTable.module.css';

const INDENT_PER_LEVEL = 22;

/** `selectable` is how many accounts this row's checkbox controls: itself plus open sub accounts. */
export interface RowSelection {
  selectable: number;
  selected: number;
}

interface AccountTableRowProps {
  node: AccountNode;
  depth: number;
  expanded: boolean;
  selection: RowSelection;
  onToggleExpand: (id: string) => void;
  onToggleSelect: (node: AccountNode, checked: boolean) => void;
}

const formatBalance = (amount: number): string =>
  amount >= 0 ? formatCurrency(amount) : `(${formatCurrency(Math.abs(amount))})`;

export const AccountTableRow = ({
  node,
  depth,
  expanded,
  selection,
  onToggleExpand,
  onToggleSelect,
}: Readonly<AccountTableRowProps>) => {
  const { t } = useTranslation('chartOfAccounts');
  const { account, children, matched } = node;
  const isParent = children.length > 0;
  const allSelected = selection.selectable > 0 && selection.selected === selection.selectable;
  const partlySelected = selection.selected > 0 && !allSelected;
  const taxName = account.defaultTax?.name;
  const disabledReason = account.isLocked ? t('table.lockedNotSelectable') : t('table.contextRow');
  const ledgerPath = (
    account.isBankAndCash ? routes.accountLedger.cashBank : routes.accountLedger.nonCashBank
  ).replace(':idAccount', account.id);

  return (
    <Table.Tr
      className={classes.row}
      data-parent={isParent}
      data-selected={allSelected}
      data-context={!matched}
      title={matched ? undefined : t('table.contextRow')}
    >
      <Table.Td className={classes.cell}>
        <Tooltip label={disabledReason} disabled={selection.selectable > 0} openDelay={300}>
          <span>
            <Checkbox
              aria-label={t('table.selectRow', { name: account.name })}
              checked={allSelected}
              indeterminate={partlySelected}
              disabled={selection.selectable === 0}
              onChange={(event) => onToggleSelect(node, event.currentTarget.checked)}
            />
          </span>
        </Tooltip>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Group gap={4} wrap="nowrap" pl={depth * INDENT_PER_LEVEL}>
          {isParent ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              aria-expanded={expanded}
              aria-label={t(expanded ? 'table.collapseRow' : 'table.expandRow', {
                name: account.name,
              })}
              onClick={() => onToggleExpand(account.id)}
            >
              <IconChevronRight size={16} className={classes.chevron} data-expanded={expanded} />
            </ActionIcon>
          ) : (
            <span className={classes.chevronSpacer} />
          )}
          <Text
            size="sm"
            fw={isParent ? 600 : 400}
            c="dark.8"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {account.accountNumber ?? '—'}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Group gap="xs" wrap="nowrap">
          <Anchor
            component={Link}
            to={ledgerPath}
            size="sm"
            className={classes.accountLink}
            fw={isParent ? 600 : 500}
          >
            {account.name}
          </Anchor>
          {account.isArchived && (
            <Badge color="gray" variant="filled" size="sm" radius="sm">
              {t('table.archived')}
            </Badge>
          )}
        </Group>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Text size="sm">{account.category?.name || '—'}</Text>
      </Table.Td>

      <Table.Td className={classes.cell}>
        <NormalBalanceBadge isDebit={account.category?.isDebit} />
      </Table.Td>

      <Table.Td className={classes.cell}>
        <AccountStatusBadge locked={Boolean(account.isLocked)} />
      </Table.Td>

      <Table.Td className={classes.cell}>
        <AccountAccessBadge allUsers={Boolean(account.isAllUser)} />
      </Table.Td>

      <Table.Td className={classes.cell}>
        <Text size="sm" c={taxName ? undefined : 'dimmed'}>
          {taxName || '—'}
        </Text>
      </Table.Td>

      <Table.Td className={`${classes.cell} ${classes.amount}`}>
        <Text size="sm" fw={isParent ? 700 : 600} component="span">
          {formatBalance(account.amount ?? 0)}
        </Text>
      </Table.Td>
    </Table.Tr>
  );
};
