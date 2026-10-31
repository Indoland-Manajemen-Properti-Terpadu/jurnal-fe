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
  Select,
  Skeleton,
  Stack,
  Switch,
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
  IconHash,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useCreateNumberFormat,
  useDeleteNumberFormat,
  useNumberFormats,
  useUpdateNumberFormat,
} from '@/module/settings/presentation/hooks/useSettingQueries';
import type { NumberFormat, NumberFormatType } from '@/module/settings/infrastructure/settingApi';

export default function NumberFormatPage() {
  const { data: formats = [], isLoading, refetch } = useNumberFormats();
  const createMutation = useCreateNumberFormat();
  const updateMutation = useUpdateNumberFormat();
  const deleteMutation = useDeleteNumberFormat();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingFormat, setEditingFormat] = useState<NumberFormat | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingFormat, setDeletingFormat] = useState<NumberFormat | null>(null);

  const form = useForm<{
    type: NumberFormatType;
    prefix: string;
    suffix: string;
    startNumber: number;
    status: 'active' | 'inactive';
  }>({
    initialValues: {
      type: 'invoice',
      prefix: 'PRO/INV',
      suffix: '',
      startNumber: 1,
      status: 'active',
    },
    validate: {
      prefix: (val) => (!val.trim() ? 'Prefix nomor wajib diisi' : null),
      startNumber: (val) => (val === undefined || val < 1 ? 'Nomor awal minimal 1' : null),
    },
  });

  const handleOpenAdd = () => {
    setEditingFormat(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (nf: NumberFormat) => {
    setEditingFormat(nf);
    form.setValues({
      type: nf.type,
      prefix: nf.prefix || '',
      suffix: nf.suffix || '',
      startNumber: nf.startNumber || 1,
      status: nf.status || 'active',
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (editingFormat) {
      await updateMutation.mutateAsync({
        id: editingFormat.id,
        payload: {
          prefix: values.prefix,
          suffix: values.suffix,
          startNumber: values.startNumber,
          status: values.status,
        },
      });
    } else {
      await createMutation.mutateAsync({
        type: values.type,
        prefix: values.prefix,
        suffix: values.suffix,
        startNumber: values.startNumber,
      });
    }
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingFormat) return;
    await deleteMutation.mutateAsync(deletingFormat.id);
    closeDeleteModal();
  };

  const filteredFormats = formats.filter(
    (f) =>
      f.type.toLowerCase().includes(search.toLowerCase()) ||
      f.prefix.toLowerCase().includes(search.toLowerCase()) ||
      f.suffix.toLowerCase().includes(search.toLowerCase())
  );

  const getPreviewNumber = (prefix: string, num: number, suffix: string) => {
    const formattedNum = String(num).padStart(6, '0');
    return `${prefix ? `${prefix}/` : ''}${formattedNum}${suffix ? `/${suffix}` : ''}`;
  };

  return (
    <SettingsLayout
      title="Format Nomor Dokumen (Number Formats)"
      description="Atur format dan awalan penomoran otomatis untuk Faktur Penjualan (Invoice) dan Transaksi Jurnal Umum."
      action={
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={() => refetch()}>
            Segarkan
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Tambah Format Baru
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <ThemeIcon size={28} radius="md" color="blue" variant="light">
                <IconHash size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="dark.8">
                Daftar Penomoran Dokumen ({formats.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari tipe atau prefix..."
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
        ) : filteredFormats.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="blue" variant="light" mx="auto" mb="sm">
              <IconHash size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Format Penomoran
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={420} mx="auto">
              Konfigurasikan format penomoran untuk faktur penjualan dan jurnal transaksi agar terstruktur dan otomatis bertambah.
            </Text>
            <Button mt="md" color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
              Tambah Format Penomoran
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '18%' }}>Tipe Dokumen</Table.Th>
                  <Table.Th style={{ width: '18%' }}>Prefix / Suffix</Table.Th>
                  <Table.Th style={{ width: '28%' }}>Pratinjau Nomor (Preview)</Table.Th>
                  <Table.Th style={{ width: '12%' }}>No. Terakhir</Table.Th>
                  <Table.Th style={{ width: '12%' }}>Status</Table.Th>
                  <Table.Th style={{ width: '12%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredFormats.map((nf) => (
                  <Table.Tr key={nf.id}>
                    <Table.Td>
                      <Badge
                        color={nf.type === 'invoice' ? 'blue' : 'violet'}
                        variant="light"
                        size="sm"
                        tt="capitalize"
                      >
                        {nf.type === 'invoice' ? 'Faktur (Invoice)' : 'Jurnal / Transaksi'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600} c="dark.8">
                        {nf.prefix || '—'}
                      </Text>
                      {nf.suffix && (
                        <Text size="xs" c="dimmed">
                          Suffix: {nf.suffix}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700} ff="monospace" c="primary.9">
                        {getPreviewNumber(nf.prefix, nf.currentNumber || nf.startNumber, nf.suffix)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" fw={600} c="dark.7">
                        {nf.currentNumber || nf.startNumber}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={nf.status === 'active' ? 'teal' : 'gray'}
                        variant={nf.status === 'active' ? 'filled' : 'light'}
                        size="xs"
                      >
                        {nf.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label="Edit Format">
                          <ActionIcon variant="subtle" color="primary" onClick={() => handleOpenEdit(nf)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Format">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setDeletingFormat(nf);
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
            <ThemeIcon size={28} radius="md" color="blue" variant="light">
              <IconHash size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingFormat ? 'Edit Format Penomoran' : 'Tambah Format Penomoran Baru'}
            </Text>
          </Group>
        }
        radius="md"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Tipe Dokumen"
              data={[
                { label: 'Faktur Penjualan (Invoice)', value: 'invoice' },
                { label: 'Jurnal Transaksi (Transaction)', value: 'transaction' },
              ]}
              disabled={Boolean(editingFormat)}
              required
              {...form.getInputProps('type')}
            />

            <Grid gutter="sm">
              <Grid.Col span={8}>
                <TextInput
                  label="Prefix (Awalan)"
                  placeholder="Contoh: PRO/INV, TRX/GL..."
                  required
                  {...form.getInputProps('prefix')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Suffix (Akhiran)"
                  placeholder="Opsional"
                  {...form.getInputProps('suffix')}
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label="Nomor Awal (Start Number)"
              placeholder="1"
              min={1}
              required
              {...form.getInputProps('startNumber')}
            />

            {editingFormat && (
              <Switch
                label="Status Format Penomoran Aktif"
                checked={form.values.status === 'active'}
                onChange={(e) =>
                  form.setFieldValue('status', e.currentTarget.checked ? 'active' : 'inactive')
                }
              />
            )}

            {/* Live Preview Box */}
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Pratinjau Hasil Nomor:
              </Text>
              <Text size="md" fw={700} c="primary.9" ff="monospace" mt={2}>
                {getPreviewNumber(form.values.prefix, form.values.startNumber || 1, form.values.suffix)}
              </Text>
            </Paper>

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
                {editingFormat ? 'Simpan Perubahan' : 'Buat Format'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Format Penomoran</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus format penomoran dengan prefix{' '}
            <strong>{deletingFormat?.prefix}</strong>?
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
