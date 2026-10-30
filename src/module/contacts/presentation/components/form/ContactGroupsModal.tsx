import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconCategory, IconCheck, IconEdit, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import {
  useContactGroups,
  useCreateContactGroup,
  useDeleteContactGroup,
  useUpdateContactGroup,
} from '@/module/contacts/presentation/hooks/useContactQueries';

type ContactGroupsModalProps = {
  opened: boolean;
  onClose: () => void;
};

export function ContactGroupsModal({ opened, onClose }: Readonly<ContactGroupsModalProps>) {
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const groupsQuery = useContactGroups();
  const createMutation = useCreateContactGroup();
  const updateMutation = useUpdateContactGroup();
  const deleteMutation = useDeleteContactGroup();

  const groups = groupsQuery.data ?? [];

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createMutation.mutateAsync(newGroupName.trim());
      setNewGroupName('');
    } catch {
      // Handled by mutation error
    }
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingGroupId(id);
    setEditingGroupName(name);
  };

  const handleSaveEdit = async () => {
    if (!editingGroupId || !editingGroupName.trim()) return;
    try {
      await updateMutation.mutateAsync({
        groupId: editingGroupId,
        name: editingGroupName.trim(),
      });
      setEditingGroupId(null);
      setEditingGroupName('');
    } catch {
      // Handled by mutation error
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Handled by mutation error
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="primary" variant="light">
            <IconCategory size={16} />
          </ThemeIcon>
          <Text fw={700} size="md" c="primary.9">
            Kelola Grup Kontak
          </Text>
        </Group>
      }
      size="md"
      radius="md"
      centered
    >
      <Stack gap="md" pt="xs">
        {/* Create Group Input */}
        <Paper withBorder p="sm" radius="md" bg="gray.0">
          <Text size="xs" fw={700} c="dark.8" mb={6}>
            Tambah Grup Baru
          </Text>
          <Group gap="xs">
            <TextInput
              placeholder="Contoh: Reseller / VIP / Vendor Tetap"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateGroup();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button
              color="primary"
              size="sm"
              leftSection={<IconPlus size={14} />}
              loading={createMutation.isPending}
              disabled={!newGroupName.trim()}
              onClick={handleCreateGroup}
            >
              Tambah
            </Button>
          </Group>
        </Paper>

        <Divider label="Daftar Grup Kontak" labelPosition="left" />

        {/* Group List */}
        {groupsQuery.isLoading ? (
          <Stack gap="xs">
            <Skeleton height={42} radius="md" />
            <Skeleton height={42} radius="md" />
            <Skeleton height={42} radius="md" />
          </Stack>
        ) : groups.length === 0 ? (
          <Paper withBorder p="xl" radius="md" ta="center" bg="gray.0">
            <ThemeIcon size={40} radius="xl" color="gray" variant="light" mx="auto" mb="xs">
              <IconCategory size={20} />
            </ThemeIcon>
            <Text size="sm" fw={600} c="dark.8">
              Belum ada grup kontak
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Buat grup baru di atas untuk mengelompokkan pelanggan atau rekanan bisnis Anda.
            </Text>
          </Paper>
        ) : (
          <Stack gap="xs">
            {groups.map((group) => {
              const isEditing = editingGroupId === group.id;

              return (
                <Paper
                  key={group.id}
                  withBorder
                  p="xs"
                  radius="md"
                  bg="white"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  {isEditing ? (
                    <Group gap="xs" style={{ flex: 1 }}>
                      <TextInput
                        size="xs"
                        value={editingGroupName}
                        onChange={(e) => setEditingGroupName(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit();
                          }
                        }}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <ActionIcon
                        size="sm"
                        color="teal"
                        variant="light"
                        onClick={handleSaveEdit}
                        loading={updateMutation.isPending}
                        aria-label="Simpan perubahan grup"
                      >
                        <IconCheck size={14} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                        color="gray"
                        variant="subtle"
                        onClick={() => setEditingGroupId(null)}
                        aria-label="Batal ubah grup"
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    </Group>
                  ) : (
                    <>
                      <Group gap="xs">
                        <Badge variant="light" color="grape" size="sm">
                          {group.name}
                        </Badge>
                      </Group>

                      <Group gap={4}>
                        <Tooltip label="Ubah nama" withArrow position="top">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => handleStartEdit(group.id, group.name)}
                            aria-label={`Ubah grup ${group.name}`}
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip label="Hapus grup" withArrow position="top">
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(group.id)}
                            loading={
                              deleteMutation.isPending && deleteMutation.variables === group.id
                            }
                            aria-label={`Hapus grup ${group.name}`}
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </>
                  )}
                </Paper>
              );
            })}
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Tutup
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ContactGroupsModal;
