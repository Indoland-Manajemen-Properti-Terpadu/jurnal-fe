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
import {
  useCreateTag,
  useDeleteTag,
  useTags,
  useUpdateTag,
} from '@/module/settings/presentation/hooks/useTags';
import type { Tag } from '@/module/settings/domain/settingTypes';

import { validateTagName, type SettingValidationKey } from '@/module/settings/domain/settingRules';
import { useTranslation } from '@/i18n';

import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';

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
  const { t: st } = useTranslation('settings');
  const [search, setSearch] = useState('');
  const { data: tags = [], isLoading, refetch } = useTags({ search: search || undefined });
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);

  const msg = (key: SettingValidationKey | null) => (key ? st(key) : null);
  const form = useForm({
    initialValues: {
      name: '',
      color: '#3B82F6',
    },
    validate: {
      name: (val) => msg(validateTagName(val)),
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
      title={st('tag.title')}
      description={st('tag.description')}
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
          >
            {st('common.refresh')}
          </Button>
          <Button color="primary" leftSection={<IconPlus size={16} />} onClick={handleOpenAdd}>
            {st('tag.addNew')}
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
                {st('tag.listPrefix')}
                {tags.length})
              </Text>
            </Group>
            <TextInput
              placeholder={st('tag.search')}
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
              {st('tag.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              {st('tag.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              {st('tag.addTag')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '45%' }}>{st('tag.colName')}</Table.Th>
                  <Table.Th style={{ width: '35%' }}>{st('tag.colBadge')}</Table.Th>
                  <Table.Th style={{ width: '20%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
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
                        <Tooltip label={st('tag.edit')}>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenEdit(tag)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={st('tag.delete')}>
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
              {editingTag ? st('tag.modalEdit') : st('tag.modalAdd')}
            </Text>
          </Group>
        }
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={st('tag.colName')}
              placeholder={st('tag.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />

            <div>
              <Text size="sm" fw={500} c="dark.8" mb={6}>
                {st('tag.colorLabel')}
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
                {st('tag.previewLabel')}
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
                {form.values.name || st('tag.sample')}
              </Badge>
            </Paper>

            <Divider />

            <Group justify="flex-end" gap="xs">
              <Button variant="default" onClick={closeModal}>
                {st('common.cancel')}
              </Button>
              <Button
                type="submit"
                color="primary"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingTag ? st('common.saveChanges') : st('tag.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={st('tag.deleteTitle')}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      >
        {st('tag.deleteConfirm')} <strong>{deletingTag?.name}</strong>?
      </DeleteConfirmModal>
    </SettingsLayout>
  );
}
