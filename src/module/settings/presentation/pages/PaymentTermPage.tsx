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
  IconClock,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useCreatePaymentTerm,
  useDeletePaymentTerm,
  usePaymentTerms,
  useUpdatePaymentTerm,
} from '@/module/settings/presentation/hooks/usePaymentTerms';
import type { PaymentTerm } from '@/module/settings/domain/settingTypes';

import {
  validatePaymentTermDays,
  validatePaymentTermName,
  type SettingValidationKey,
} from '@/module/settings/domain/settingRules';
import { useTranslation } from '@/i18n';

import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';

export default function PaymentTermPage() {
  const { t: st } = useTranslation('settings');
  const { data: terms = [], isLoading, refetch } = usePaymentTerms();
  const createMutation = useCreatePaymentTerm();
  const updateMutation = useUpdatePaymentTerm();
  const deleteMutation = useDeletePaymentTerm();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingTerm, setDeletingTerm] = useState<PaymentTerm | null>(null);

  const msg = (key: SettingValidationKey | null) => (key ? st(key) : null);
  const form = useForm({
    initialValues: {
      name: '',
      days: 30,
    },
    validate: {
      name: (val) => msg(validatePaymentTermName(val)),
      days: (val) => msg(validatePaymentTermDays(val)),
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
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || String(t.days).includes(search)
  );

  return (
    <SettingsLayout
      title={st('paymentTerm.title')}
      description={st('paymentTerm.description')}
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
            {st('paymentTerm.addNew')}
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
                {st('paymentTerm.listPrefix')}
                {terms.length})
              </Text>
            </Group>
            <TextInput
              placeholder={st('paymentTerm.search')}
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
              {st('paymentTerm.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              {st('paymentTerm.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              {st('paymentTerm.addTerm')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '40%' }}>{st('paymentTerm.colName')}</Table.Th>
                  <Table.Th style={{ width: '25%' }}>{st('paymentTerm.colDays')}</Table.Th>
                  <Table.Th style={{ width: '20%' }}>{st('paymentTerm.colStatus')}</Table.Th>
                  <Table.Th style={{ width: '15%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
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
                        {term.days === 0
                          ? st('paymentTerm.today')
                          : st('paymentTerm.days', { days: term.days })}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {term.isDefault ? (
                        <Badge color="teal" variant="filled" size="xs">
                          {st('common.default')}
                        </Badge>
                      ) : (
                        <Text size="xs" c="dimmed">
                          {st('paymentTerm.regular')}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap={4} justify="center">
                        <Tooltip label={st('paymentTerm.edit')}>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenEdit(term)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={st('paymentTerm.delete')}>
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
              {editingTerm ? st('paymentTerm.modalEdit') : st('paymentTerm.modalAdd')}
            </Text>
          </Group>
        }
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={st('paymentTerm.colName')}
              placeholder={st('paymentTerm.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />

            <NumberInput
              label={st('paymentTerm.daysLabel')}
              description={st('paymentTerm.daysHint')}
              placeholder="30"
              min={0}
              max={365}
              required
              {...form.getInputProps('days')}
            />

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
                {editingTerm ? st('common.saveChanges') : st('paymentTerm.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={st('paymentTerm.deleteTitle')}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      >
        {st('paymentTerm.deleteConfirm')} <strong>{deletingTerm?.name}</strong>?
      </DeleteConfirmModal>
    </SettingsLayout>
  );
}
