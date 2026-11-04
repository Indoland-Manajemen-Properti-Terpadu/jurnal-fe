import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionIcon, Checkbox, Group, Paper, Skeleton, Table, Text, Tooltip } from '@mantine/core';
import {
  IconAlertCircle,
  IconChevronsDown,
  IconChevronsUp,
  IconListTree,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { JournalAccounts } from '../../domain/journalAccount';
import {
  buildAccountTree,
  collectParentIds,
  flattenVisibleRows,
  isFilterActive,
  selectableInSubtree,
  selectableInTree,
  type AccountFilter,
  type AccountNode,
} from '../../domain/accountTree';
import useAccountStore from '../hooks/useAccountStore';
import { AccountTableRow } from './AccountTableRow';

type TableAccountsProps = {
  accounts: JournalAccounts[];
  filter: AccountFilter;
  loading?: boolean;
  error?: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
};

const COLUMN_COUNT = 9;
const SKELETON_ROWS = 6;

const TableAccounts = ({
  accounts,
  filter,
  loading,
  error,
  onRetry,
  onResetFilters,
}: TableAccountsProps) => {
  const { t } = useTranslation('chartOfAccounts');
  const { selectedRecords, setSelectedRecords } = useAccountStore();

  const tree = useMemo(() => buildAccountTree(accounts, filter), [accounts, filter]);
  const parentIds = useMemo(() => collectParentIds(tree), [tree]);
  const selectable = useMemo(() => selectableInTree(tree), [tree]);
  const selectedIds = useMemo(
    () => new Set(selectedRecords.map((record) => record.id)),
    [selectedRecords]
  );

  // A filter opens every parent so matches are never hidden; the user's own toggles apply
  // only until the filter changes.
  const filterKey = `${filter.tab}|${filter.category ?? ''}|${filter.search.trim()}`;
  const filterActive = isFilterActive(filter);
  const [toggles, setToggles] = useState({ key: filterKey, byId: new Map<string, boolean>() });
  const byId = toggles.key === filterKey ? toggles.byId : new Map<string, boolean>();
  const expandedIds = useMemo(
    () => new Set(parentIds.filter((id) => byId.get(id) ?? filterActive)),
    [parentIds, byId, filterActive]
  );
  const rows = useMemo(() => flattenVisibleRows(tree, expandedIds), [tree, expandedIds]);

  // Selection never outlives what the table lists, so a hidden account cannot be deleted.
  useEffect(() => {
    const allowed = new Set(selectable.map((account) => account.id));
    const kept = selectedRecords.filter((record) => allowed.has(record.id));
    if (kept.length !== selectedRecords.length) setSelectedRecords(kept);
  }, [selectable, selectedRecords, setSelectedRecords]);

  const setExpansion = useCallback(
    (entries: [string, boolean][]) =>
      setToggles({ key: filterKey, byId: new Map([...byId, ...entries]) }),
    [filterKey, byId]
  );

  const toggleExpand = (id: string) => setExpansion([[id, !expandedIds.has(id)]]);
  const allExpanded = parentIds.length > 0 && parentIds.every((id) => expandedIds.has(id));
  const toggleExpandAll = () => setExpansion(parentIds.map((id) => [id, !allExpanded]));

  const toggleSelectNode = (node: AccountNode, checked: boolean) => {
    const targets = selectableInSubtree(node);
    const targetIds = new Set(targets.map((account) => account.id));
    const rest = selectedRecords.filter((record) => !targetIds.has(record.id));
    setSelectedRecords(checked ? [...rest, ...targets] : rest);
  };

  const selectedInTable = selectable.filter((account) => selectedIds.has(account.id)).length;
  const allSelected = selectable.length > 0 && selectedInTable === selectable.length;
  const toggleSelectAll = (checked: boolean) => setSelectedRecords(checked ? selectable : []);

  const rowSelection = (node: AccountNode) => {
    const targets = selectableInSubtree(node);
    return {
      selectable: targets.length,
      selected: targets.filter((account) => selectedIds.has(account.id)).length,
    };
  };

  const headerLabel = (label: string, minWidth: number, right?: boolean) => (
    <Table.Th ta={right ? 'right' : undefined} miw={minWidth} style={{ whiteSpace: 'nowrap' }}>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase">
        {label}
      </Text>
    </Table.Th>
  );

  const renderBody = () => {
    if (loading) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Table.Tr key={`skeleton-${index}`}>
          <Table.Td colSpan={COLUMN_COUNT}>
            <Skeleton height={16} radius="sm" />
          </Table.Td>
        </Table.Tr>
      ));
    }

    if (error) {
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT} p={0}>
            <EmptyState
              icon={<IconAlertCircle size={32} stroke={1.6} />}
              color="red"
              title={t('table.errorTitle')}
              description={t('table.errorDescription')}
              actionLabel={t('table.retry')}
              onAction={onRetry}
            />
          </Table.Td>
        </Table.Tr>
      );
    }

    if (rows.length === 0) {
      const noAccounts = accounts.length === 0;
      return (
        <Table.Tr>
          <Table.Td colSpan={COLUMN_COUNT} p={0}>
            <EmptyState
              icon={<IconListTree size={32} stroke={1.6} />}
              title={noAccounts ? t('table.emptyNoDataTitle') : t('table.emptyTitle')}
              description={
                noAccounts ? t('table.emptyNoDataDescription') : t('table.emptyDescription')
              }
              actionLabel={!noAccounts && filterActive ? t('table.emptyAction') : undefined}
              onAction={onResetFilters}
            />
          </Table.Td>
        </Table.Tr>
      );
    }

    return rows.map(({ node, depth }) => (
      <AccountTableRow
        key={node.account.id}
        node={node}
        depth={depth}
        expanded={expandedIds.has(node.account.id)}
        selection={rowSelection(node)}
        onToggleExpand={toggleExpand}
        onToggleSelect={toggleSelectNode}
      />
    ));
  };

  return (
    <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={1280}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th w={48}>
                <Checkbox
                  aria-label={t('table.selectAll')}
                  checked={allSelected}
                  indeterminate={selectedInTable > 0 && !allSelected}
                  disabled={selectable.length === 0}
                  onChange={(event) => toggleSelectAll(event.currentTarget.checked)}
                />
              </Table.Th>
              <Table.Th w={210}>
                <Group gap={4} wrap="nowrap">
                  {parentIds.length > 0 ? (
                    <Tooltip label={allExpanded ? t('table.collapseAll') : t('table.expandAll')}>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label={allExpanded ? t('table.collapseAll') : t('table.expandAll')}
                        onClick={toggleExpandAll}
                      >
                        {allExpanded ? (
                          <IconChevronsUp size={16} />
                        ) : (
                          <IconChevronsDown size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  ) : null}
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t('table.code')}
                  </Text>
                </Group>
              </Table.Th>
              {headerLabel(t('table.name'), 260)}
              {headerLabel(t('table.category'), 150)}
              {headerLabel(t('table.normalBalance'), 130)}
              {headerLabel(t('table.status'), 80)}
              {headerLabel(t('table.access'), 150)}
              {headerLabel(t('table.tax'), 80)}
              {headerLabel(t('table.endingBalance'), 180, true)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderBody()}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};

export default TableAccounts;
