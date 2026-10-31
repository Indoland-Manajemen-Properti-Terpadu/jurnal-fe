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
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useCreateTax,
  useDeleteTax,
  useTaxes,
  useUpdateTax,
} from '@/module/settings/presentation/hooks/useTaxes';
import type { AccountRef, Tax } from '@/module/settings/domain/settingTypes';

import {
  buildTaxPayload,
  DEFAULT_TAX_RATE,
  validateTaxName,
  validateTaxRate,
  type SettingValidationKey,
} from '@/module/settings/domain/settingRules';
import { useTranslation } from '@/i18n';

import { useAccountOptions } from '@/module/settings/presentation/hooks/useAccountOptions';
import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';

export default function TaxSettingPage() {
  const { t: st } = useTranslation('settings');
  const { data: taxes = [], isLoading, refetch } = useTaxes();
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const deleteMutation = useDeleteTax();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingTax, setDeletingTax] = useState<Tax | null>(null);

  const { accounts } = useAccountOptions();

  const msg = (key: SettingValidationKey | null) => (key ? st(key) : null);
  const form = useForm({
    initialValues: {
      name: '',
      rate: DEFAULT_TAX_RATE,
      salesAccount: '',
      purchaseAccount: '',
    },
    validate: {
      name: (val) => msg(validateTaxName(val)),
      rate: (val) => msg(validateTaxRate(val)),
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
        payload: buildTaxPayload(values),
      });
    } else {
      await createMutation.mutateAsync(buildTaxPayload(values));
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

  const getAccountLabel = (accVal: AccountRef | undefined) => {
    if (!accVal) return '—';
    if (typeof accVal === 'object') {
      return `${accVal.accountNumber ? `${accVal.accountNumber} - ` : ''}${accVal.name}`;
    }
    const found = accounts.find((a) => a.value === accVal);
    return found ? found.label : accVal;
  };

  return (
    <SettingsLayout
      title={st('tax.title')}
      description={st('tax.description')}
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
            {st('tax.addNew')}
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
                {st('tax.listPrefix')}
                {taxes.length})
              </Text>
            </Group>
            <TextInput
              placeholder={st('tax.search')}
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
              {st('tax.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              {st('tax.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              {st('tax.addTax')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '25%' }}>{st('tax.colName')}</Table.Th>
                  <Table.Th style={{ width: '15%' }}>{st('tax.colRate')}</Table.Th>
                  <Table.Th style={{ width: '25%' }}>{st('tax.colSalesAccount')}</Table.Th>
                  <Table.Th style={{ width: '25%' }}>{st('tax.colPurchaseAccount')}</Table.Th>
                  <Table.Th style={{ width: '10%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
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
                        <Tooltip label={st('tax.edit')}>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            onClick={() => handleOpenEdit(tax)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={st('tax.delete')}>
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
              {editingTax ? st('tax.modalEdit') : st('tax.modalAdd')}
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
                  label={st('tax.colName')}
                  placeholder={st('tax.namePlaceholder')}
                  required
                  {...form.getInputProps('name')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label={st('tax.colRate')}
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
              label={st('tax.salesAccountLabel')}
              placeholder={st('tax.salesAccountPlaceholder')}
              description={st('tax.salesAccountHint')}
              data={accounts}
              searchable
              clearable
              {...form.getInputProps('salesAccount')}
            />

            <Select
              label={st('tax.purchaseAccountLabel')}
              placeholder={st('tax.purchaseAccountPlaceholder')}
              description={st('tax.purchaseAccountHint')}
              data={accounts}
              searchable
              clearable
              {...form.getInputProps('purchaseAccount')}
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
                {editingTax ? st('common.saveChanges') : st('tax.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={st('tax.deleteTitle')}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      >
        {st('tax.deleteConfirm')} <strong>{deletingTax?.name}</strong>
        {st('tax.deleteNote')}
      </DeleteConfirmModal>
    </SettingsLayout>
  );
}
