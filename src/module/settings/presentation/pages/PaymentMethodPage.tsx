import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
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
  IconAlertCircle,
  IconBuildingBank,
  IconCreditCard,
  IconEdit,
  IconInfoCircle,
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
} from '@/module/settings/presentation/hooks/useSettingQueries';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type { PaymentMethod } from '@/module/settings/infrastructure/settingApi';

export default function PaymentMethodPage() {
  const { data: methods = [], isLoading, refetch } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();
  const deleteMutation = useDeletePaymentMethod();

  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Array<{ value: string; label: string }>>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  // Modal State
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Delete Confirmation State
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  // Load COA accounts safely
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setIsAccountsLoading(true);
        const res = await getJournalAccounts();
        if (Array.isArray(res)) {
          const uniqueMap = new Map<string, { value: string; label: string }>();
          res.forEach((acc: any) => {
            if (acc?.id && !uniqueMap.has(acc.id)) {
              const cat = acc.type || acc.category?.name || (acc.isBankAndCash ? 'Kas & Bank' : '');
              const suffix = cat ? ` (${cat})` : '';
              uniqueMap.set(acc.id, {
                value: acc.id,
                label: `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name}${suffix}`,
              });
            }
          });
          setAccounts(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        console.error('Failed to load accounts for payment methods:', err);
      } finally {
        setIsAccountsLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const form = useForm<{
    name: string;
    adminFee: number;
    defaultAccount: string | null;
    feeAccount: string | null;
  }>({
    initialValues: {
      name: '',
      adminFee: 0,
      defaultAccount: null,
      feeAccount: null,
    },
    validate: {
      name: (val) => (!val.trim() ? 'Nama metode pembayaran wajib diisi' : null),
      adminFee: (val) => (val === undefined || val < 0 ? 'Biaya admin harus >= 0' : null),
      feeAccount: (val, values) => {
        // Accounting Rule: If admin fee is set (> 0), feeAccount must be chosen so the journal knows where to debit the fee
        if (values.adminFee && values.adminFee > 0 && !val) {
          return 'Akun Beban Admin wajib dipilih jika terdapat Biaya Admin';
        }
        return null;
      },
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

  const getAccountLabel = (acc: any) => {
    if (!acc) return null;
    if (typeof acc === 'object') {
      return `${acc.accountNumber ? `${acc.accountNumber} - ` : ''}${acc.name}`;
    }
    const found = accounts.find((a) => a.value === acc);
    return found ? found.label : acc;
  };

  const isFeeRequired = form.values.adminFee > 0;

  return (
    <SettingsLayout
      title="Metode Pembayaran (Payment Methods)"
      description="Konfigurasi opsi penerimaan dan pengeluaran dana seperti Transfer Bank, BCA Virtual Account, Midtrans, atau Tunai beserta akun kas penampung default dan akun beban biaya admin."
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
            Tambah Metode Baru
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
                Daftar Metode Pembayaran ({methods.length})
              </Text>
            </Group>
            <TextInput
              placeholder="Cari metode pembayaran..."
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
              Belum Ada Metode Pembayaran
            </Title>
            <Text size="sm" c="dimmed" mt={4} maw={400} mx="auto">
              Tambahkan metode pembayaran untuk digunakan saat mencatat penerimaan penjualan dan
              pembayaran pengeluaran.
            </Text>
            <Button
              mt="md"
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenAdd}
            >
              Tambah Metode
            </Button>
          </Paper>
        ) : (
          <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th style={{ width: '25%' }}>Nama Metode Pembayaran</Table.Th>
                  <Table.Th style={{ width: '25%' }}>Akun Kas & Bank Default</Table.Th>
                  <Table.Th style={{ width: '15%' }}>Biaya Admin</Table.Th>
                  <Table.Th style={{ width: '23%' }}>Akun Beban Admin (Fee Account)</Table.Th>
                  <Table.Th style={{ width: '12%', textAlign: 'center' }}>Aksi</Table.Th>
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
                              Default
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
                            — Belum diatur —
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
                            Gratis (Rp 0)
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
                            Belum dipetakan!
                          </Badge>
                        ) : (
                          <Text size="xs" c="dimmed">
                            — Tidak ada —
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group gap={4} justify="center">
                          <Tooltip label="Edit Metode">
                            <ActionIcon
                              variant="subtle"
                              color="primary"
                              onClick={() => handleOpenEdit(method)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Hapus Metode">
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
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          <Group gap="xs">
            <ThemeIcon size={28} radius="md" color="cyan" variant="light">
              <IconCreditCard size={16} />
            </ThemeIcon>
            <Text fw={700} c="dark.8">
              {editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran Baru'}
            </Text>
          </Group>
        }
        radius="md"
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nama Metode Pembayaran"
              placeholder="Contoh: Midtrans, BCA Virtual Account, Tunai, Bank Mandiri..."
              required
              {...form.getInputProps('name')}
            />

            <Select
              label="Akun Kas & Bank Default (Default Account)"
              placeholder="Pilih rekening atau akun kas penampung..."
              description="Opsional: otomatis mengisi akun setor saat mencatat pembayaran penjualan"
              data={accounts}
              searchable
              clearable
              disabled={isAccountsLoading}
              leftSection={<IconBuildingBank size={16} />}
              {...form.getInputProps('defaultAccount')}
            />

            <Divider my="xs" />

            <Grid gutter="sm">
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <NumberInput
                  label="Biaya Admin Transaksi (Rp)"
                  description="Opsional: masukkan 0 jika bebas biaya"
                  placeholder="0"
                  thousandSeparator="."
                  decimalSeparator=","
                  min={0}
                  required
                  {...form.getInputProps('adminFee')}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Select
                  label="Akun Beban Biaya Admin (Fee Account)"
                  placeholder={isFeeRequired ? 'Pilih akun beban admin...' : 'Opsional...'}
                  description={
                    isFeeRequired
                      ? 'Wajib diisi karena biaya admin > Rp 0'
                      : 'Opsional: tempat mencatat beban biaya admin bank'
                  }
                  data={accounts}
                  searchable
                  clearable
                  disabled={isAccountsLoading}
                  required={isFeeRequired}
                  leftSection={<IconReceipt2 size={16} />}
                  {...form.getInputProps('feeAccount')}
                />
              </Grid.Col>
            </Grid>

            {isFeeRequired && (
              <Alert icon={<IconInfoCircle size={16} />} color="blue" radius="md" py="xs">
                <Text size="xs">
                  Setiap transaksi pembayaran yang menggunakan metode ini akan otomatis menjurnal
                  biaya admin sebesar{' '}
                  <strong>Rp {form.values.adminFee.toLocaleString('id-ID')}</strong> ke akun beban
                  yang dipilih.
                </Text>
              </Alert>
            )}

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
                {editingMethod ? 'Simpan Perubahan' : 'Buat Metode'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Text fw={700}>Hapus Metode Pembayaran</Text>}
        radius="md"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus metode pembayaran{' '}
            <strong>{deletingMethod?.name}</strong>?
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
