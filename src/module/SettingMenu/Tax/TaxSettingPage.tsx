import { useEffect, useState } from 'react';
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
  Select,
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
  IconEdit,
  IconPercentage,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import { useCreateTax, useDeleteTax, useTaxes, useUpdateTax } from '../hooks/useSettingQueries';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type { Tax } from '../services/settingApi';

export default function TaxSettingPage() {
  const { data: taxes = [], isLoading, refetch } = useTaxes();
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const deleteMutation = useDeleteTax();

  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([]);

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingTax, setDeletingTax] = useState<Tax | null>(null);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await getJournalAccounts();
        if (Array.isArray(res)) {
          const uniqueMap = new Map<string, { value: string; label: string }>();
          res.forEach((acc: any) => {
            if (acc?.id && !uniqueMap.has(acc.id)) {
              uniqueMap.set(acc.id, {
                value: acc.id,
                label: `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name}`,
              });
            }
          });
          setAccounts(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error('Failed to load accounts for taxes:', err);
      }
    };
    loadAccounts();
  }, []);

  const form = useForm({
    initialValues: {
      name: '',
      rate: 11,
      salesAccount: '',
      purchaseAccount: '',
    },
    validate: {
      name: (val) => (!val.trim() ? 'Nama pajak wajib diisi' : null),
      rate: (val) => (val === undefined || val < 0 ? 'Tarif harus >= 0%' : null),
    },
  });

  const handleOpenAdd = () => {
    setEditingTax(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (tax: Tax) => {
    setEditingTax(tax);
    form.setValues({
      name: tax.name,
      rate: Number(tax.rate) || 0,
      salesAccount:
        typeof tax.salesAccount === 'object' ? tax.salesAccount?.id : tax.salesAccount || '',
      purchaseAccount:
        typeof tax.purchaseAccount === 'object'
          ? tax.purchaseAccount?.id
          : tax.purchaseAccount || '',
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (editingTax) {
      await updateMutation.mutateAsync({
        id: editingTax.id,
        payload: {
          name: values.name,
          rate: values.rate,
          salesAccount: values.salesAccount || undefined,
          purchaseAccount: values.purchaseAccount || undefined,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        rate: values.rate,
        salesAccount: values.salesAccount || undefined,
        purchaseAccount: values.purchaseAccount || undefined,
      });
    }
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTax) return;
    await deleteMutation.mutateAsync(deletingTax.id);
    closeDeleteModal();
  };

  const filteredTaxes = taxes.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || String(t.rate).includes(search)
  );

  const getAccountLabel = (accVal: any) => {
    if (!accVal) return '—';
    if (typeof accVal === 'object') {
      return `${accVal.accountNumber ? `${accVal.accountNumber} - ` : ''}${accVal.name}`;
    }
    const found = accounts.find((a) => a.value === accVal);
    return found ? found.label : accVal;
  };

  return (
    <SettingsLayout
      title="Pengaturan Pajak (Taxes)"
      description="Konfigurasi tarif pajak pertambahan nilai (PPN), pajak penghasilan (PPh), serta akun penampung pajak keluaran dan masukan."
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
          >
            Segarkan
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Tambah Pajak Baru
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <ThemeIcon size={28} radius="md" color="teal" variant="light">
                <IconPercentage size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="dark.8">
                Daftar Master Tarif Pajak ({taxes.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari nama atau tarif pajak..."
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
        ) : filteredTaxes.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="teal" variant="light" mx="auto" mb="sm">
              <IconPercentage size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Tarif Pajak
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              Tambahkan tarif pajak seperti PPN 11% atau PPh untuk digunakan saat membuat faktur
              penjualan dan pembelian.
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              Tambah Pajak
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '25%' }}>Nama Pajak</Table.Th>
                  <Table.Th style={{ width: '15%' }}>Tarif (%)</Table.Th>
                  <Table.Th style={{ width: '25%' }}>Akun Pajak Penjualan (Keluaran)</Table.Th>
                  <Table.Th style={{ width: '25%' }}>Akun Pajak Pembelian (Masukan)</Table.Th>
                  <Table.Th style={{ width: '10%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTaxes.map((tax) => (
                  <Table.Tr key={tax.id}>
                    <Table.Td>
                      <Text fw={600} size="sm" c="dark.8">
                        {tax.name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="teal" variant="light" size="md">
                        {tax.rate}%
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dark.7">
                        {getAccountLabel(tax.salesAccount)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dark.7">
                        {getAccountLabel(tax.purchaseAccount)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label="Edit Pajak">
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenEdit(tax)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Pajak">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setDeletingTax(tax);
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
            <ThemeIcon size={28} radius="md" color="teal" variant="light">
              <IconPercentage size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingTax ? 'Edit Tarif Pajak' : 'Tambah Tarif Pajak Baru'}
            </Text>
          </Group>
        }
        radius="md"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid gutter="sm">
              <Grid.Col span={8}>
                <TextInput
                  label="Nama Pajak"
                  placeholder="Contoh: PPN 11%, PPh 23..."
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Tarif (%)"
                  placeholder="11"
                  min={0}
                  max={100}
                  decimalScale={2}
                  required
                  {...form.getInputProps('rate')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Akun Pajak Penjualan (Hutang Pajak / Keluaran)"
              placeholder="Pilih akun penampung PPN Keluaran..."
              description="Digunakan otomatis saat menerbitkan faktur penjualan"
              data={accounts}
              searchable
              clearable
              {...form.getInputProps('salesAccount')}
            />

            <Select
              label="Akun Pajak Pembelian (Piutang Pajak / Masukan)"
              placeholder="Pilih akun penampung PPN Masukan..."
              description="Digunakan otomatis saat mencatat tagihan pembelian"
              data={accounts}
              searchable
              clearable
              {...form.getInputProps('purchaseAccount')}
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
                {editingTax ? 'Simpan Perubahan' : 'Buat Pajak'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Tarif Pajak</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus tarif pajak <strong>{deletingTax?.name}</strong>?
            Transaksi yang sudah menggunakan pajak ini sebelumnya tidak akan terpengaruh.
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
