import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ConfirmModal } from '@/components';
import { JournalEmptyState } from '@/components/EmptyState/JournalEmptyState';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import {
  JournalEntriesTable,
  useDeleteJournalEntries,
  useFilterTransaction,
  type JournalEntryByAccount,
} from '@/module/journal-entries';
import type { LedgerVariant } from '../../domain/ledgerVariant';
import { serverMessage } from '../../domain/serverMessage';

interface EntriesQuery {
  data: JournalEntryByAccount[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
}

interface LedgerTransactionsPanelProps {
  variant: LedgerVariant;
  idAccount: string;
  entries: EntriesQuery;
  selectedRecords: JournalEntryByAccount[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<JournalEntryByAccount[]>>;
}

/**
 * Filter toolbar, journal rows of the account and the bulk delete of the selected rows. The
 * cash/bank ledger shows its own loading and error state here; the other ledger already waits
 * for the entries before it renders the page.
 */
export const LedgerTransactionsPanel: React.FC<LedgerTransactionsPanelProps> = ({
  variant,
  idAccount,
  entries,
  selectedRecords,
  setSelectedRecords,
}) => {
  const { t } = useTranslation('accountLedger');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteJournalEntries();
  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate, resetSelection } =
    useFilterTransaction();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const count = selectedRecords.length;
  const goToCreate = () => navigate(routes.generalJournal.addTransactionJournal);

  const handleDeleteSelected = () => {
    if (!idAccount || count === 0) return;
    const ids = selectedRecords.map((record) => record.id);
    deleteMutation.mutate(
      { ids, idAccount },
      {
        onSuccess: () => {
          notifications.show({
            color: 'teal',
            title: t(`entries.${variant}.deleteOkTitle`),
            message: t(`entries.${variant}.deleteOkMessage`, { count: ids.length }),
          });
          setSelectedRecords([]);
          setIsDeleteModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['transaction_by_account', idAccount] });
          queryClient.invalidateQueries({ queryKey: ['detail_account', idAccount] });
        },
        onError: (error: unknown) => {
          notifications.show({
            color: 'red',
            title: t('entries.deleteFailTitle'),
            message: serverMessage(error) || t('entries.deleteFailFallback'),
          });
        },
      }
    );
  };

  if (variant === 'cashBank' && entries.isLoading) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Loader size="md" color="primary.6" />
          <Text size="sm" c="dimmed">
            {t('entries.loading')}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (variant === 'cashBank' && entries.isError) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Text size="sm" c="red.6" fw={600}>
            {t('entries.loadFailed')}
          </Text>
          <Button variant="light" size="xs" onClick={() => entries.refetch()}>
            {t('entries.retry')}
          </Button>
        </Stack>
      </Center>
    );
  }

  const hasFilter = !!searchQuery || !!selectedDate;

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
          <TextInput
            placeholder={t(`entries.${variant}.searchPlaceholder`)}
            size="sm"
            radius="md"
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon variant="subtle" size="xs" onClick={() => setSearchQuery('')}>
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 220, maxWidth: 380 }}
          />

          <DatePickerInput
            placeholder={t('entries.datePlaceholder')}
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
              onClick={resetSelection}
              leftSection={<IconX size={14} />}
            >
              {t('entries.resetFilter')}
            </Button>
          )}

          {count > 0 && (
            <Button
              size="sm"
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {t('entries.deleteSelected', { count })}
            </Button>
          )}
        </Group>

        <Group gap="xs">
          <Tooltip label={t(`entries.${variant}.refreshTooltip`)}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() => entries.refetch()}
              aria-label={t('entries.refreshAria')}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>

          <Button
            size="sm"
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            leftSection={<IconPlus size={16} />}
            onClick={goToCreate}
          >
            {t(`entries.${variant}.createButton`)}
          </Button>
        </Group>
      </Group>

      <JournalEntriesTable
        selectedRecords={selectedRecords}
        setSelectedRecords={setSelectedRecords}
        data={entries.data}
        noRecordsContent={<JournalEmptyState onButtonClick={goToCreate} />}
      />

      <ConfirmModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title={t('entries.deleteTitle')}
        message={
          <>
            {t('entries.deleteConfirmBefore')}
            <strong>{t('entries.deleteConfirmStrong', { count })}</strong>
            {t('entries.deleteConfirmAfter')}
          </>
        }
        helperText={t('entries.deleteHelper')}
        imageSrc={deleteModalImage}
        confirmLabel={t('entries.deleteConfirmLabel', { count })}
        cancelLabel={t('common.cancel')}
        confirmLoading={deleteMutation.isPending}
      />
    </Stack>
  );
};
