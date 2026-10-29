import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconClock,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import {
  useCreatePaymentTerm,
  useDeletePaymentTerm,
  usePaymentTerms,
  useUpdatePaymentTerm,
} from '../hooks/useSettingQueries';
import type { PaymentTerm } from '../services/settingApi';

export default function PaymentTermPage() {
  const { data: terms = [], isLoading, refetch } = usePaymentTerms();
  const createMutation = useCreatePaymentTerm();
  const updateMutation = useUpdatePaymentTerm();
  const deleteMutation = useDeletePaymentTerm();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingTerm, setDeletingTerm] = useState<PaymentTerm | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      days: 30,
    },
    validate: {
      name: (val) => (!val.trim() ? 'Nama termin wajib diisi' : null),
      days: (val) => (val === undefined || val < 0 ? 'Hari jatuh tempo harus >= 0' : null),
    },
  });

  const handleOpenAdd = () => {
    setEditingTerm(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (term: PaymentTerm) => {
    setEditingTerm(term);
    form.setValues({
      name: term.name,
      days: term.days,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (editingTerm) {
      await updateMutation.mutateAsync({
        id: editingTerm.id,
        payload: {
          name: values.name,
          days: values.days,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        days: values.days,
      });
    }
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTerm) return;
    await deleteMutation.mutateAsync(deletingTerm.id);
    closeDeleteModal();
  };

  const filteredTerms = terms.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      String(t.days).includes(search)
  );

  return (
    <SettingsLayout
      title="Syarat Pembayaran / Termin (Payment Terms)"
      description="Konfigurasi jangka waktu jatuh tempo faktur penjualan dan pembelian seperti Cash on Delivery (H+0), Net 15, Net 30, atau Net 60."
      action={
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={() => refetch()}>
            Segarkan
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Tambah Termin Baru
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <ThemeIcon size={28} radius="md" color="orange" variant="light">
                <IconClock size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="dark.8">
                Daftar Termin Pembayaran ({terms.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari nama termin atau hari..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              w={{ base: '100%', sm: 260 }}
              radius="md"
            />
          </Group>
        </Paper>

        {isLoading ? (
          <Card withBorder radius="md" p="xl" bg="white">
            <Stack gap="md">
              <Skeleton height={40} radius="md" />
              <Skeleton height={40} radius="md" />
            </Stack>
          </Card>
        ) : filteredTerms.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="orange" variant="light" mx="auto" mb="sm">
              <IconClock size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Syarat Pembayaran
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              Tambahkan termin pembayaran untuk secara otomatis menghitung tanggal jatuh tempo faktur penjualan dan pembelian.
            </Text>
            <Button mt="md" color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
              Tambah Termin
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '40%' }}>Nama Termin</Table.Th>
                  <Table.Th style={{ width: '25%' }}>Jatuh Tempo (Hari)</Table.Th>
                  <Table.Th style={{ width: '20%' }}>Status Bawaan</Table.Th>
                  <Table.Th style={{ width: '15%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTerms.map((term) => (
                  <Table.Tr key={term.id}>
                    <Table.Td>
                      <Text fw={600} size="sm" c="dark.8">
                        {term.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="orange" variant="light" size="md">
                        {term.days === 0 ? 'H+0 (Hari Ini / COD)' : `H+${term.days} Hari`}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {term.isDefault ? (
                        <Badge color="teal" variant="filled" size="xs">
                          Default
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">
                          Reguler
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label="Edit Termin">
                          <ActionIcon variant="subtle" color="primary" onClick={() => handleOpenEdit(term)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Termin">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setDeletingTerm(term);
                              openDeleteModal();
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      {/* Form Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="orange" variant="light">
              <IconClock size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingTerm ? 'Edit Termin Pembayaran' : 'Tambah Termin Pembayaran Baru'}
            </Text>
          </Group>
        }
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nama Termin"
              placeholder="Contoh: Net 30, Cash on Delivery, Net 14..."
              required
              {...form.getInputProps('name')}
            />

            <NumberInput
              label="Jangka Waktu Jatuh Tempo (Hari)"
              description="Jumlah hari setelah tanggal transaksi (0 = Cash on Delivery)"
              placeholder="30"
              min={0}
              max={365}
              required
              {...form.getInputProps('days')}
            />

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeModal}>
                Batal
              </Button>
              <Button
                type="submit"
                color="primary"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingTerm ? 'Simpan Perubahan' : 'Buat Termin'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Termin Pembayaran</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus termin pembayaran <strong>{deletingTerm?.name}</strong>?
          </Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={closeDeleteModal}>
              Batal
            </Button>
            <Button color="red" onClick={handleConfirmDelete} loading={deleteMutation.isPending}>
              Ya, Hapus
            </Button>
          </Group>
        </Stack>
      </Modal>
    </SettingsLayout>
  );
}
