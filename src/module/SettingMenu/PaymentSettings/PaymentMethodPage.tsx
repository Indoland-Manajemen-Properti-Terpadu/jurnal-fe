import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Divider,
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
  IconCreditCard,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useUpdatePaymentMethod,
} from '../hooks/useSettingQueries';
import type { PaymentMethod } from '../services/settingApi';

export default function PaymentMethodPage() {
  const { data: methods = [], isLoading, refetch } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      adminFee: 0,
    },
    validate: {
      name: (val) => (!val.trim() ? 'Nama metode pembayaran wajib diisi' : null),
      adminFee: (val) => (val === undefined || val < 0 ? 'Biaya admin harus >= 0' : null),
    },
  });

  const handleOpenAdd = () => {
    setEditingMethod(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    form.setValues({
      name: method.name,
      adminFee: method.adminFee || 0,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (editingMethod) {
      await updateMutation.mutateAsync({
        id: editingMethod.id,
        payload: {
          name: values.name,
          adminFee: values.adminFee,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        adminFee: values.adminFee,
      });
    }
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingMethod) return;
    await deleteMutation.mutateAsync(deletingMethod.id);
    closeDeleteModal();
  };

  const filteredMethods = methods.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SettingsLayout
      title="Metode Pembayaran (Payment Methods)"
      description="Konfigurasi opsi penerimaan dan pengeluaran dana seperti Transfer Bank, BCA Virtual Account, Midtrans, atau Tunai beserta biaya admin transaksi."
      action={
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={() => refetch()}>
            Segarkan
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Tambah Metode Baru
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <ThemeIcon size={28} radius="md" color="cyan" variant="light">
                <IconCreditCard size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="dark.8">
                Daftar Metode Pembayaran ({methods.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari metode pembayaran..."
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
        ) : filteredMethods.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="cyan" variant="light" mx="auto" mb="sm">
              <IconCreditCard size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Metode Pembayaran
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              Tambahkan metode pembayaran untuk digunakan saat mencatat penerimaan penjualan dan pembayaran pengeluaran.
            </Text>
            <Button mt="md" color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
              Tambah Metode
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '40%' }}>Nama Metode Pembayaran</Table.Th>
                  <Table.Th style={{ width: '25%' }}>Biaya Admin (Rp)</Table.Th>
                  <Table.Th style={{ width: '20%' }}>Status Bawaan</Table.Th>
                  <Table.Th style={{ width: '15%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMethods.map((method) => (
                  <Table.Tr key={method.id}>
                    <Table.Td>
                      <Text fw={600} size="sm" c="dark.8">
                        {method.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {method.adminFee ? (
                        <Text size="sm" fw={600} c="dark.7">
                          Rp {method.adminFee.toLocaleString('id-ID')}
                        </Text>
                      ) : (
                        <Badge color="gray" variant="light" size="xs">
                          Gratis (Rp 0)
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {method.isDefault ? (
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
                        <Tooltip label="Edit Metode">
                          <ActionIcon variant="subtle" color="primary" onClick={() => handleOpenEdit(method)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Metode">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setDeletingMethod(method);
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
            <ThemeIcon size={28} radius="md" color="cyan" variant="light">
              <IconCreditCard size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
            </Text>
          </Group>
        }
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nama Metode"
              placeholder="Contoh: Midtrans, BCA Virtual Account, Tunai, Bank Transfer..."
              required
              {...form.getInputProps('name')}
            />

            <NumberInput
              label="Biaya Administrasi Transaksi (Rp)"
              description="Biaya per transaksi (masukkan 0 jika bebas biaya admin)"
              placeholder="0"
              thousandSeparator="."
              decimalSeparator=","
              min={0}
              required
              {...form.getInputProps('adminFee')}
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
                {editingMethod ? 'Simpan Perubahan' : 'Buat Metode'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Metode Pembayaran</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus metode pembayaran <strong>{deletingMethod?.name}</strong>?
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
