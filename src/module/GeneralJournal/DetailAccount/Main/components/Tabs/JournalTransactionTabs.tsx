import React, { useState } from 'react';
import {
  Stack,
  Group,
  TextInput,
  Button,
  ActionIcon,
  Tooltip,
  Text,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconSearch,
  IconCalendar,
  IconTrash,
  IconPlus,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { useNavigate, useParams } from 'react-router-dom';
import TableJournalTransaction from '../../../TransactionJournal/components/TableTransactionJournal/JournalTransactionTable';
import { DeleteTransactionAccounts } from '../../../TransactionJournal/services/DeleteTransactionAccount.service';
import { GetTransactionByAccount } from '../../../TransactionJournal/services/TransactionByAccount.service';
import { TransactionByAccountModel } from '../../../TransactionJournal/types/TransactionByAccountModel';
import useFilterTransaction from '../../store/FilterTransaction';
import { ConfirmModal } from '@/components';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  selectedRecords: TransactionByAccountModel[];
  setSelectedRecords: React.Dispatch<React.SetStateAction<TransactionByAccountModel[]>>;
  noRecordsContent?: React.ReactNode;
}

const JournalTransactionTab: React.FC<Props> = ({
  selectedRecords,
  setSelectedRecords,
  noRecordsContent,
}) => {
  const { idAccount } = useParams<{ idAccount: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = DeleteTransactionAccounts();
  const { data: transaction, isError, isLoading, refetch } = GetTransactionByAccount(idAccount!);

  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate, resetSelection } =
    useFilterTransaction();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteSelected = () => {
    if (!idAccount || selectedRecords.length === 0) return;
    const selectedIds = selectedRecords.map((record) => record.id);
    deleteMutation.mutate(
      { ids: selectedIds, idAccount },
      {
        onSuccess: () => {
          notifications.show({
            color: 'teal',
            title: 'Berhasil Menghapus Transaksi',
            message: `${selectedIds.length} transaksi terpilih telah berhasil dihapus.`,
          });
          setSelectedRecords([]);
          setIsDeleteModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['transaction_by_account', idAccount] });
          queryClient.invalidateQueries({ queryKey: ['detail_account', idAccount] });
        },
        onError: (error: any) => {
          notifications.show({
            color: 'red',
            title: 'Gagal Menghapus Transaksi',
            message:
              error?.response?.data?.message || 'Terjadi kesalahan saat menghapus transaksi.',
          });
        },
      }
    );
  };

  const handleDateChange = (value: string | null) => {
    setSelectedDate(value);
  };

  if (isLoading) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Loader size="md" color="primary.6" />
          <Text size="sm" c="dimmed">
            Memuat transaksi jurnal...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py={60}>
        <Stack align="center" gap="sm">
          <Text size="sm" c="red.6" fw={600}>
            Gagal memuat transaksi jurnal.
          </Text>
          <Button variant="light" size="xs" onClick={() => refetch()}>
            Coba Lagi
          </Button>
        </Stack>
      </Center>
    );
  }

  const hasFilter = !!searchQuery || !!selectedDate;

  return (
    <Stack gap="md">
      {/* Modern Filter & Action Toolbar */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
          <TextInput
            placeholder="Cari no. transaksi, catatan, atau kontak..."
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
            placeholder="Pilih Tanggal"
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
              Reset Filter
            </Button>
          )}

          {selectedRecords.length > 0 && (
            <Button
              size="sm"
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Hapus Terpilih ({selectedRecords.length})
            </Button>
          )}
        </Group>

        <Group gap="xs">
          <Tooltip label="Segarkan Data Transaksi">
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              onClick={() => refetch()}
              aria-label="Refresh"
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>

          <Button
            size="sm"
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate(routes.generalJournal.addTransactionJournal)}
          >
            Buat Transaksi Jurnal
          </Button>
        </Group>
      </Group>

      {/* Transactions Table */}
      <TableJournalTransaction
        selectedRecords={selectedRecords}
        setSelectedRecords={setSelectedRecords}
        data={transaction}
        noRecordsContent={noRecordsContent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSelected}
        title="Hapus Transaksi Jurnal"
        message={
          <>
            Apakah Anda yakin ingin menghapus{' '}
            <strong>{selectedRecords.length} transaksi jurnal</strong> yang dipilih?
          </>
        }
        helperText="Transaksi yang dihapus akan mempengaruhi saldo buku besar dan tidak dapat dipulihkan kembali."
        imageSrc={deleteModalImage}
        confirmLabel={`Hapus ${selectedRecords.length} Transaksi`}
        cancelLabel="Batal"
        confirmLoading={deleteMutation.isPending}
      />
    </Stack>
  );
};

export default JournalTransactionTab;
