import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconSearch, IconTrash, type Icon } from '@tabler/icons-react';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import type { MasterDataInput } from '../types/product';
import { formatDate } from '../utils/productFormat';

type MasterDataItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  code?: string;
};

type MasterDataPanelProps = {
  icon: Icon;
  entityLabel: string;
  helperText: string;
  namePlaceholder: string;
  items: MasterDataItem[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  onCreate: (input: MasterDataInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

export function MasterDataFormModal({
  opened,
  onClose,
  entityLabel,
  namePlaceholder,
  isSubmitting,
  onSubmit,
}: Readonly<{
  opened: boolean;
  onClose: () => void;
  entityLabel: string;
  namePlaceholder: string;
  isSubmitting: boolean;
  onSubmit: (input: MasterDataInput) => Promise<unknown>;
}>) {
  const form = useForm({
    initialValues: { name: '', description: '' },
    validate: {
      name: (value) => (value.trim() ? null : `Nama ${entityLabel.toLowerCase()} wajib diisi`),
    },
  });

  const close = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
    });
    close();
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} c="primary.9">
          Tambah {entityLabel}
        </Text>
      }
      centered
      radius="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label={`Nama ${entityLabel.toLowerCase()}`}
            placeholder={namePlaceholder}
            withAsterisk
            data-autofocus
            {...form.getInputProps('name')}
          />
          <Textarea
            label="Deskripsi"
            description="Opsional, membantu tim memahami penggunaannya."
            autosize
            minRows={2}
            {...form.getInputProps('description')}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={close} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" color="primary" loading={isSubmitting}>
              Simpan
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

/** List + create/delete for simple product master data (categories, units). */
export function MasterDataPanel({
  icon: EntityIcon,
  entityLabel,
  helperText,
  namePlaceholder,
  items,
  isLoading,
  isCreating,
  isDeleting,
  onCreate,
  onDelete,
}: Readonly<MasterDataPanelProps>) {
  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MasterDataItem | null>(null);

  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? items.filter((item) => item.name.toLowerCase().includes(keyword))
    : items;

  return (
    <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
      <Group justify="space-between" p="md" gap="sm" wrap="wrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" color="primary" radius="md" size={36}>
            <EntityIcon size={18} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm" c="dark.8">
              {items.length} {entityLabel.toLowerCase()} terdaftar
            </Text>
            <Text size="xs" c="dimmed">
              {helperText}
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <TextInput
            placeholder={`Cari ${entityLabel.toLowerCase()}...`}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: '100%', xs: 240 }}
          />
          <Button
            color="primary"
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Tambah {entityLabel}
          </Button>
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {['Nama', 'Deskripsi', 'Dibuat'].map((label) => (
                <Table.Th key={label}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.4}>
                    {label}
                  </Text>
                </Table.Th>
              ))}
              <Table.Th w={64} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Table.Tr key={i}>
                    {Array.from({ length: 4 }, (__, j) => (
                      <Table.Td key={j}>
                        <Skeleton height={14} width="60%" />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              : filtered.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="sm" fw={600} c="primary.9">
                        {item.name}
                      </Text>
                      {item.code && (
                        <Text size="xs" c="dimmed" ff="monospace">
                          {item.code}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={item.description ? undefined : 'dimmed'} lineClamp={2}>
                        {item.description || 'Tidak ada deskripsi'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(item.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={`Hapus ${entityLabel.toLowerCase()}`}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label={`Hapus ${item.name}`}
                          onClick={() => setPendingDelete(item)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
          </Table.Tbody>
        </Table>
        {!isLoading && filtered.length === 0 && (
          <Stack align="center" gap={4} py={48}>
            <Text fw={600} c="dark.8">
              {keyword ? 'Tidak ada hasil' : `Belum ada ${entityLabel.toLowerCase()}`}
            </Text>
            <Text size="sm" c="dimmed">
              {keyword
                ? 'Coba gunakan kata kunci lain.'
                : `Tambahkan ${entityLabel.toLowerCase()} pertama Anda.`}
            </Text>
          </Stack>
        )}
      </Table.ScrollContainer>

      <MasterDataFormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        entityLabel={entityLabel}
        namePlaceholder={namePlaceholder}
        isSubmitting={isCreating}
        onSubmit={onCreate}
      />

      <ConfirmModal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={`Hapus ${entityLabel.toLowerCase()}?`}
        message={`${entityLabel} "${pendingDelete?.name ?? ''}" akan dihapus.`}
        helperText="Pastikan tidak ada produk yang masih menggunakannya."
        confirmLoading={isDeleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Paper>
  );
}
