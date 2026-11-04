import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconAlertCircle,
  IconCalendar,
  IconFileSpreadsheet,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { DataTable } from 'mantine-datatable';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmModal } from '@/components';
import { EmptyState } from '@/components/EmptyState';
import deleteModalImage from '@/assets/images/illustrations/delete-confirm.svg';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { Result } from '../../domain/bankStatement';
import { sortStatementsNewestFirst, summarizeStatements } from '../../domain/statementSummary';
import { useBankStatement } from '../hooks/useBankStatement';
import { useDeleteBankStatement } from '../hooks/useDeleteBankStatement';
import ImportBankStatementModal from './ImportBankStatementModal';
import StatementStatus from './StatementStatus';

const SKELETON_ROWS = 5;

const amountCell = (amount: number | undefined) => (
  <Text
    fz="var(--jurnal-text-sm)"
    fw={amount ? 600 : 400}
    c={amount ? 'dark.8' : 'dimmed'}
    ta="right"
    style={{ fontVariantNumeric: 'tabular-nums' }}
  >
    {amount ? formatCurrency(amount) : '—'}
  </Text>
);

/** "Rekening Koran" tab of a cash/bank account: the imported rows, with delete for the unmatched ones. */
export default function BankStatementTable() {
  const { t } = useTranslation('bankStatements');
  const { idAccount = '' } = useParams<{ idAccount: string }>();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useBankStatement(idAccount);
  const deleteMutation = useDeleteBankStatement(idAccount);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Result | null>(null);

  const records = useMemo(
    () =>
      sortStatementsNewestFirst(
        (data?.results || data?.resultTransaction || []).filter((row): row is Result =>
          Boolean(row)
        )
      ),
    [data]
  );
  const summary = useMemo(() => summarizeStatements(records), [records]);

  const query = searchQuery.trim().toLowerCase();
  const filtered = records.filter((row) => {
    const matchesText = !query || (row.transactionName || '').toLowerCase().includes(query);
    const matchesDay =
      !selectedDate ||
      (row.transactionDate ? dayjs(row.transactionDate).isSame(selectedDate, 'day') : false);
    return matchesText && matchesDay;
  });
  const hasFilter = Boolean(query) || Boolean(selectedDate);
  const resetFilter = () => {
    setSearchQuery('');
    setSelectedDate(null);
  };

  const importModal = (
    <ImportBankStatementModal
      idAccount={idAccount}
      onContinue={() => queryClient.invalidateQueries({ queryKey: ['bank_statement', idAccount] })}
      isOpen={isImportOpen}
      onClose={() => setIsImportOpen(false)}
    />
  );

  if (isLoading) {
    return (
      <Stack gap="xs" py="md">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={index} height={36} radius="sm" />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<IconAlertCircle size={32} stroke={1.6} />}
        color="red"
        title={t('table.errorTitle')}
        description={t('table.errorDescription')}
        actionLabel={t('table.retry')}
        onAction={() => refetch()}
      />
    );
  }

  if (records.length === 0) {
    return (
      <>
        <EmptyState
          icon={<IconFileSpreadsheet size={32} stroke={1.6} />}
          title={t('table.emptyTitle')}
          description={t('table.emptyDescription')}
          actionLabel={t('table.emptyButton')}
          actionIcon={<IconUpload size={16} />}
          onAction={() => setIsImportOpen(true)}
        />
        {importModal}
      </>
    );
  }

  const columns = [
    {
      accessor: 'transactionDate',
      title: t('table.columns.date'),
      width: 120,
      render: (row: Result) => (
        <Text fz="var(--jurnal-text-sm)" c="dark.7" style={{ whiteSpace: 'nowrap' }}>
          {row.transactionDate ? dateFormatV1(row.transactionDate) : '—'}
        </Text>
      ),
    },
    {
      accessor: 'transactionName',
      title: t('table.columns.description'),
      render: (row: Result) => (
        <Text
          fz="var(--jurnal-text-sm)"
          c="dark.8"
          w={280}
          truncate="end"
          title={row.transactionName}
        >
          {row.transactionName || '—'}
        </Text>
      ),
    },
    {
      accessor: 'receive',
      title: t('table.columns.received'),
      textAlignment: 'right' as const,
      titleStyle: { textAlign: 'right' as const },
      width: 160,
      render: (row: Result) => amountCell(row.debit),
    },
    {
      accessor: 'sent',
      title: t('table.columns.sent'),
      textAlignment: 'right' as const,
      titleStyle: { textAlign: 'right' as const },
      width: 160,
      render: (row: Result) => amountCell(row.credit),
    },
    {
      accessor: 'reconciled',
      title: t('table.columns.status'),
      width: 150,
      render: (row: Result) => <StatementStatus reconciled={Boolean(row.reconciled)} />,
    },
    {
      accessor: 'action',
      title: t('table.columns.action'),
      textAlignment: 'center' as const,
      titleStyle: { textAlign: 'center' as const },
      width: 90,
      render: (row: Result) => (
        <Group justify="center">
          <Tooltip label={row.reconciled ? t('table.deleteBlocked') : t('table.deleteTooltip')}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
              disabled={Boolean(row.reconciled) || !row.id}
              aria-label={t('table.deleteTooltip')}
              onClick={() => setToDelete(row)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 280 }}>
          <TextInput
            placeholder={t('table.searchPlaceholder')}
            size="sm"
            radius="md"
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1, minWidth: 220, maxWidth: 380 }}
          />
          <DatePickerInput
            placeholder={t('table.datePlaceholder')}
            valueFormat="DD/MM/YYYY"
            size="sm"
            radius="md"
            leftSection={<IconCalendar size={16} />}
            clearable
            value={selectedDate}
            onChange={setSelectedDate}
            style={{ width: 170 }}
          />
          {hasFilter && (
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              leftSection={<IconX size={14} />}
              onClick={resetFilter}
            >
              {t('table.resetFilter')}
            </Button>
          )}
        </Group>
        <Group gap="xs">
          <Tooltip label={t('table.refresh')}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label={t('table.refresh')}
              onClick={() => refetch()}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button
            size="sm"
            color="primary"
            leftSection={<IconUpload size={16} />}
            onClick={() => setIsImportOpen(true)}
          >
            {t('table.importButton')}
          </Button>
        </Group>
      </Group>

      <Text fz="var(--jurnal-text-xs)" c="dimmed">
        {t('table.summary', {
          count: summary.count,
          received: formatCurrency(summary.totalReceived),
          sent: formatCurrency(summary.totalSent),
          pending: summary.unreconciledCount,
        })}
      </Text>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={32} stroke={1.6} />}
          title={t('table.noMatchTitle')}
          description={t('table.noMatchDescription')}
          actionLabel={t('table.resetFilter')}
          onAction={resetFilter}
        />
      ) : (
        <DataTable
          withTableBorder
          borderRadius="md"
          highlightOnHover
          verticalSpacing="sm"
          columns={columns}
          records={filtered}
        />
      )}

      <ConfirmModal
        opened={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete?.id) return;
          deleteMutation.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
        }}
        title={t('table.deleteTitle')}
        message={
          <>
            {t('table.deleteConfirmBefore')}
            <strong>{toDelete?.transactionName}</strong>
            {t('table.deleteConfirmAfter')}
          </>
        }
        helperText={t('table.deleteHelper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('table.deleteConfirm')}
        cancelLabel={t('table.cancel')}
        confirmLoading={deleteMutation.isPending}
      />
      {importModal}
    </Stack>
  );
}
