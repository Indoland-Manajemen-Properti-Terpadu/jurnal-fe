import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  ColorSwatch,
  Divider,
  Group,
  Modal,
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
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import { useCreateTag, useDeleteTag, useTags, useUpdateTag } from '@/module/settings/presentation/hooks/useSettingQueries';
import type { Tag } from '@/module/settings/domain/settingTypes';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#64748B', // Slate
];

export default function TagSettingPage() {
  const [search, setSearch] = useState('');
  const { data: tags = [], isLoading, refetch } = useTags({ search: search || undefined });
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      color: '#3B82F6',
    },
    validate: {
      name: (val) => (!val.trim() ? 'Nama tag wajib diisi' : null),
    },
  });

  const handleOpenAdd = () => {
    setEditingTag(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (tag: Tag) => {
    setEditingTag(tag);
    form.setValues({
      name: tag.name,
      color: tag.color || '#3B82F6',
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (editingTag) {
      await updateMutation.mutateAsync({
        id: editingTag.id,
        payload: {
          name: values.name,
          color: values.color,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        color: values.color,
      });
    }
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTag) return;
    await deleteMutation.mutateAsync(deletingTag.id);
    closeDeleteModal();
  };

  return (
    <SettingsLayout
      title="Tag Transaksi (Transaction Tags)"
      description="Kelola label dan penanda analitis untuk mengkategorikan transaksi lintas modul (Faktur Penjualan, Jurnal, Kontak, Biaya)."
      action={
        <Group gap="xs">
          <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={() => refetch()}>
            Segarkan
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            Tambah Tag Baru
          </Button>
        </Group>
      }
    >
      <Stack gap="lg">
        <Paper withBorder p="md" radius="md" bg="white">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="xs">
              <ThemeIcon size={28} radius="md" color="pink" variant="light">
                <IconTag size={16} />
              </ThemeIcon>
              <Text fw={600} size="sm" c="dark.8">
                Daftar Tag Transaksi ({tags.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari nama tag..."
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
        ) : tags.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="white">
            <ThemeIcon size={48} radius="xl" color="pink" variant="light" mx="auto" mb="sm">
              <IconTag size={24} />
            </ThemeIcon>
            <Title order={4} c="dark.8">
              Belum Ada Tag Transaksi
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              Buat tag seperti &quot;Monthly&quot;, &quot;Project A&quot;, atau &quot;Cabang Barat&quot; untuk mempermudah filter dan pelaporan transaksi.
            </Text>
            <Button mt="md" color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
              Tambah Tag
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '45%' }}>Nama Tag</Table.Th>
                  <Table.Th style={{ width: '35%' }}>Tampilan Badge</Table.Th>
                  <Table.Th style={{ width: '20%', textAlign: 'center' }}>Aksi</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tags.map((tag) => (
                  <Table.Tr key={tag.id}>
                    <Table.Td>
                      <Group gap="xs">
                        <ColorSwatch color={tag.color || '#3B82F6'} size={14} />
                        <Text fw={600} size="sm" c="dark.8">
                          {tag.name}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        styles={{
                          root: {
                            backgroundColor: `${tag.color || '#3B82F6'}1A`,
                            color: tag.color || '#3B82F6',
                            border: `1px solid ${tag.color || '#3B82F6'}4D`,
                          },
                        }}
                        size="md"
                      >
                        {tag.name}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label="Edit Tag">
                          <ActionIcon variant="subtle" color="primary" onClick={() => handleOpenEdit(tag)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Hapus Tag">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              setDeletingTag(tag);
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
            <ThemeIcon size={28} radius="md" color="pink" variant="light">
              <IconTag size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingTag ? 'Edit Tag Transaksi' : 'Tambah Tag Transaksi Baru'}
            </Text>
          </Group>
        }
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nama Tag"
              placeholder="Contoh: Monthly, Project Alpha, Cabang Bali..."
              required
              {...form.getInputProps('name')}
            />

            <div>
              <Text size="sm" fw={500} c="dark.8" mb={6}>
                Pilihan Warna Label
              </Text>
              <Group gap="xs">
                {PRESET_COLORS.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    size={28}
                    style={{
                      cursor: 'pointer',
                      border: form.values.color === color ? '2px solid #0F172A' : 'none',
                    }}
                    onClick={() => form.setFieldValue('color', color)}
                  />
                ))}
              </Group>
            </div>

            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Pratinjau Badge:
              </Text>
              <Badge
                mt={4}
                styles={{
                  root: {
                    backgroundColor: `${form.values.color || '#3B82F6'}1A`,
                    color: form.values.color || '#3B82F6',
                    border: `1px solid ${form.values.color || '#3B82F6'}4D`,
                  },
                }}
                size="md"
              >
                {form.values.name || 'Contoh Tag'}
              </Badge>
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
                {editingTag ? 'Simpan Perubahan' : 'Buat Tag'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Tag Transaksi</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus tag <strong>{deletingTag?.name}</strong>?
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
