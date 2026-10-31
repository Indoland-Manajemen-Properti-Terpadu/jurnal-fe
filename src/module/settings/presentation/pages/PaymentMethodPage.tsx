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
  IconBuildingBank,
  IconCreditCard,
  IconEdit,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useUpdatePaymentMethod,
} from '@/module/settings/presentation/hooks/usePaymentMethods';
import type { AccountRef, PaymentMethod } from '@/module/settings/domain/settingTypes';

import {
  validateAdminFee,
  validateFeeAccount,
  validatePaymentMethodName,
  type SettingValidationKey,
} from '@/module/settings/domain/settingRules';
import { useTranslation } from '@/i18n';
import {
  PaymentMethodFormModal,
  type PaymentMethodFormValues,
} from '@/module/settings/presentation/components/PaymentMethodFormModal';

import { useAccountOptions } from '@/module/settings/presentation/hooks/useAccountOptions';
import { DeleteConfirmModal } from '@/module/settings/presentation/components/DeleteConfirmModal';

export default function PaymentMethodPage() {
  const { t: st } = useTranslation('settings');
  const { data: methods = [], isLoading, refetch } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  // Load COA accounts safely
  const { accounts, isAccountsLoading } = useAccountOptions((account) => {
    const category =
      account.type || account.category?.name || (account.isBankAndCash ? 'Kas & Bank' : '');
    return category ? ` (${category})` : '';
  });

  const msg = (key: SettingValidationKey | null) => (key ? st(key) : null);
  const form = useForm<PaymentMethodFormValues>({
    initialValues: {
      name: '',
      adminFee: 0,
      defaultAccount: null,
      feeAccount: null,
    },
    validate: {
      name: (val) => msg(validatePaymentMethodName(val)),
      adminFee: (val) => msg(validateAdminFee(val)),
      feeAccount: (val, values) => msg(validateFeeAccount(values.adminFee, val)),
    },
  });

  const handleOpenAdd = () => {
    setEditingMethod(null);
    form.reset();
    openModal();
  };

  const handleOpenEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    const defAccId =
      typeof method.defaultAccount === 'object' ? method.defaultAccount?.id : method.defaultAccount;
    const feeAccId =
      typeof method.feeAccount === 'object' ? method.feeAccount?.id : method.feeAccount;

    form.setValues({
      name: method.name,
      adminFee: method.adminFee || 0,
      defaultAccount: defAccId || null,
      feeAccount: feeAccId || null,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    const payload = {
      name: values.name,
      adminFee: values.adminFee,
      defaultAccount: values.defaultAccount || null,
      feeAccount: values.adminFee > 0 ? values.feeAccount || null : values.feeAccount || null,
    };

    if (editingMethod) {
      await updateMutation.mutateAsync({
        id: editingMethod.id,
        payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
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

  const getAccountLabel = (acc: AccountRef | undefined) => {
    if (!acc) return null;
    if (typeof acc === 'object') {
      return `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name}`;
    }
    const found = accounts.find((a) => a.value === acc);
    return found ? found.label : acc;
  };

  return (
    <SettingsLayout
      title={st('paymentMethod.title')}
      description={st('paymentMethod.description')}
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
            {st('paymentMethod.addNew')}
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
                {st('paymentMethod.listPrefix')}
                {methods.length})
              </Text>
            </Group>
            <TextInput
              placeholder={st('paymentMethod.search')}
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
              {st('paymentMethod.emptyTitle')}
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              {st('paymentMethod.emptyDescription')}
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              {st('paymentMethod.addMethod')}
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '25%' }}>{st('paymentMethod.colName')}</Table.Th>
                  <Table.Th style={{ width: '25%' }}>{st('paymentMethod.colAccount')}</Table.Th>
                  <Table.Th style={{ width: '15%' }}>{st('paymentMethod.colFee')}</Table.Th>
                  <Table.Th style={{ width: '23%' }}>{st('paymentMethod.colFeeAccount')}</Table.Th>
                  <Table.Th style={{ width: '12%', textAlign: 'center' }}>
                    {st('common.actions')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredMethods.map((method) => {
                  const defLabel = getAccountLabel(method.defaultAccount);
                  const feeLabel = getAccountLabel(method.feeAccount);

                  return (
                    <Table.Tr key={method.id}>
                      <Table.Td>
                        <Group gap="xs">
                          <Text fw={600} size="sm" c="dark.8">
                            {method.name}
                          </Text>
                          {method.isDefault && (
                            <Badge color="teal" variant="filled" size="xs">
                              {st('common.default')}
                            </Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {defLabel ? (
                          <Group gap={6} align="center">
                            <ThemeIcon size={20} radius="xl" color="teal" variant="light">
                              <IconBuildingBank size={12} />
                            </ThemeIcon>
                            <Text size="xs" fw={500} c="dark.7">
                              {defLabel}
                            </Text>
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed">
                            {st('paymentMethod.notSet')}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {method.adminFee ? (
                          <Text size="sm" fw={700} c="orange.8" ff="monospace">
                            Rp {method.adminFee.toLocaleString('id-ID')}
                          </Text>
                        ) : (
                          <Badge color="gray" variant="light" size="xs">
                            {st('paymentMethod.free')}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {feeLabel ? (
                          <Group gap={6} align="center">
                            <ThemeIcon size={20} radius="xl" color="orange" variant="light">
                              <IconReceipt2 size={12} />
                            </ThemeIcon>
                            <Text size="xs" fw={500} c="dark.7">
                              {feeLabel}
                            </Text>
                          </Group>
                        ) : method.adminFee > 0 ? (
                          <Badge color="red" variant="light" size="xs">
                            {st('paymentMethod.notMapped')}
                          </Badge>
                        ) : (
                          <Text size="xs" c="dimmed">
                            {st('paymentMethod.none')}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group gap={4} justify="center">
                          <Tooltip label={st('paymentMethod.edit')}>
                            <ActionIcon
                              variant="subtle"
                              color="primary"
                              onClick={() => handleOpenEdit(method)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={st('paymentMethod.delete')}>
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
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      {/* Form Modal */}
      <PaymentMethodFormModal
        opened={modalOpened}
        onClose={closeModal}
        isEditing={Boolean(editingMethod)}
        form={form}
        onSubmit={handleSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        accounts={accounts}
        isAccountsLoading={isAccountsLoading}
      />

      <DeleteConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={st('paymentMethod.deleteTitle')}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      >
        {st('paymentMethod.deleteConfirm')} <strong>{deletingMethod?.name}</strong>?
      </DeleteConfirmModal>
    </SettingsLayout>
  );
}
