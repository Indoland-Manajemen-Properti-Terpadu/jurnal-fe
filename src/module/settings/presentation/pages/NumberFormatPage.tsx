import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
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
} from '@/module/settings/presentation/hooks/useNumberFormats';
import type { NumberFormat } from '@/module/settings/domain/settingTypes';

import {
  previewNumber,
  validateNumberFormatPrefix,
  validateStartNumber,
  type SettingValidationKey,
} from '@/module/settings/domain/settingRules';
import { useTranslation } from '@/i18n';
import {
  NumberFormatFormModal,
  type NumberFormatFormValues,
} from '@/module/settings/presentation/components/NumberFormatFormModal';

import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';

export default function NumberFormatPage() {
  const { t: st } = useTranslation('settings');
  const { data: formats = [], isLoading, refetch } = useNumberFormats();
  const createMutation = useCreateNumberFormat();
  const updateMutation = useUpdateNumberFormat();
  const deleteMutation = useDeleteNumberFormat();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingFormat, setEditingFormat] = useState<NumberFormat | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingFormat, setDeletingFormat] = useState<NumberFormat | null>(null);

  const msg = (key: SettingValidationKey | null) => (key ? st(key) : null);
  const form = useForm<NumberFormatFormValues>({
    initialValues: {
      type: 'invoice',
      prefix: 'PRO/INV',
      suffix: '',
      startNumber: 1,
      status: 'active',
    },
    validate: {
      prefix: (val) => msg(validateNumberFormatPrefix(val)),
      startNumber: (val) => msg(validateStartNumber(val)),
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

  return (
    <SettingsLayout
      title={st('numberFormat.title')}
      description={st('numberFormat.description')}
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
            {st('numberFormat.addNew')}
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
                {st('numberFormat.listPrefix')}
                {formats.length})
              </Text>
            </Group>
            <TextInput
              placeholder={st('numberFormat.search')}
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
              {st('numberFormat.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={420} mx="auto">
              {st('numberFormat.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              {st('numberFormat.addFormat')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '18%' }}>{st('numberFormat.colType')}</Table.Th>
                  <Table.Th style={{ width: '18%' }}>{st('numberFormat.colAffix')}</Table.Th>
                  <Table.Th style={{ width: '28%' }}>{st('numberFormat.colPreview')}</Table.Th>
                  <Table.Th style={{ width: '12%' }}>{st('numberFormat.colLast')}</Table.Th>
                  <Table.Th style={{ width: '12%' }}>{st('numberFormat.colStatus')}</Table.Th>
                  <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
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
                        {nf.type === 'invoice'
                          ? st('numberFormat.typeInvoice')
                          : st('numberFormat.typeTransaction')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={600} c="dark.8">
                        {nf.prefix || '—'}
                      </Text>
                      {nf.suffix && (
                        <Text size="xs" c="dimmed">
                          {st('numberFormat.suffixLabel')} {nf.suffix}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={700} ff="monospace" c="primary.9">
                        {previewNumber(nf.prefix, nf.currentNumber || nf.startNumber, nf.suffix)}
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
                        {nf.status === 'active'
                          ? st('numberFormat.statusActive')
                          : st('numberFormat.statusInactive')}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label={st('numberFormat.edit')}>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenEdit(nf)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={st('numberFormat.delete')}>
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
      <NumberFormatFormModal
        opened={modalOpened}
        onClose={closeModal}
        isEditing={Boolean(editingFormat)}
        form={form}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={st('numberFormat.deleteTitle')}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      >
        {st('numberFormat.deleteConfirm')} <strong>{deletingFormat?.prefix}</strong>?
      </DeleteConfirmModal>
    </SettingsLayout>
  );
}
