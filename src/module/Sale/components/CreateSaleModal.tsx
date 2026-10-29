import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconCalendar,
  IconFileDescription,
  IconFilePlus,
  IconPlus,
  IconReceipt2,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import type { CreateSaleFormValues, DiscountType, WithholdingType } from '../types/sale';
import {
  useDepositAccounts,
  useSaleCustomerOptions,
  useSalePaymentTerms,
  useSaleProductOptions,
  useSaleTaxes,
} from '../hooks/useSaleQueries';
import { formatIDR } from '../utils/saleFormat';

type CreateSaleModalProps = {
  opened: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSaleFormValues) => Promise<void>;
};

export function CreateSaleModal({
  opened,
  isSubmitting,
  onClose,
  onSubmit,
}: Readonly<CreateSaleModalProps>) {
  const [activeTab, setActiveTab] = useState<string | null>('general');

  const customersQuery = useSaleCustomerOptions();
  const productsQuery = useSaleProductOptions();
  const taxesQuery = useSaleTaxes();
  const paymentTermsQuery = useSalePaymentTerms();
  const accountsQuery = useDepositAccounts();

  const todayStr = new Date().toISOString().split('T')[0];

  const form = useForm<CreateSaleFormValues>({
    initialValues: {
      customer: '',
      emails: [],
      transactionDate: todayStr,
      dueDate: todayStr,
      billingAddress: '',
      transactionNumber: '',
      tags: [],
      customerRefNumber: '',
      paymentTerm: '',
      isPriceIncludeTax: false,
      items: [
        {
          productId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxId: '',
        },
      ],
      discountType: 'percentage',
      discountValue: 0,
      withholdingType: 'nominal',
      withholdingValue: 0,
      withholdingAccount: '',
      message: '',
      memo: '',
    },
    validate: {
      customer: (val) => (!val ? 'Pelanggan wajib dipilih' : null),
      transactionDate: (val) => (!val ? 'Tanggal transaksi wajib diisi' : null),
      items: {
        productId: (val) => (!val ? 'Pilih produk' : null),
        quantity: (val) => (val <= 0 ? 'Jumlah minimal 1' : null),
        unitPrice: (val) => (val < 0 ? 'Harga tidak boleh negatif' : null),
      },
    },
  });

  /* Auto-fill address & emails when customer is chosen */
  const handleCustomerChange = (customerId: string | null) => {
    form.setFieldValue('customer', customerId || '');
    if (!customerId) return;
    const selected = (customersQuery.data || []).find((c) => c.value === customerId);
    if (selected) {
      if (selected.billingAddress) {
        form.setFieldValue('billingAddress', selected.billingAddress);
      }
      if (selected.emails && selected.emails.length > 0) {
        form.setFieldValue('emails', selected.emails);
      }
    }
  };

  /* Add item row */
  const addItemRow = () => {
    form.insertListItem('items', {
      productId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxId: '',
    });
  };

  /* When product is picked, autofill price */
  const handleProductSelect = (index: number, productId: string | null) => {
    form.setFieldValue(`items.${index}.productId`, productId || '');
    if (!productId) return;
    const prod = (productsQuery.data || []).find((p) => p.value === productId);
    if (prod) {
      form.setFieldValue(`items.${index}.unitPrice`, prod.price || 0);
      form.setFieldValue(`items.${index}.description`, prod.name || '');
    }
  };

  /* Calculations */
  const taxMap = useMemo(() => {
    const map = new Map<string, number>();
    (taxesQuery.data || []).forEach((t) => map.set(t.id, t.rate || 0));
    return map;
  }, [taxesQuery.data]);

  const calculations = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    form.values.items.forEach((item) => {
      const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
      subtotal += lineTotal;
      if (item.taxId) {
        const rate = taxMap.get(item.taxId) || 0;
        taxTotal += (lineTotal * rate) / 100;
      }
    });

    let discountAmount = 0;
    if (form.values.discountValue > 0) {
      if (form.values.discountType === 'percentage') {
        discountAmount = (subtotal * form.values.discountValue) / 100;
      } else {
        discountAmount = form.values.discountValue;
      }
    }

    let withholdingAmount = 0;
    if (form.values.withholdingValue > 0) {
      if (form.values.withholdingType === 'percentage') {
        withholdingAmount = (subtotal * form.values.withholdingValue) / 100;
      } else {
        withholdingAmount = form.values.withholdingValue;
      }
    }

    const total = subtotal - discountAmount + taxTotal;
    const finalAmount = total - withholdingAmount;

    return {
      subtotal,
      discountAmount,
      taxTotal,
      total,
      withholdingAmount,
      finalAmount: Math.max(0, finalAmount),
    };
  }, [form.values.items, form.values.discountType, form.values.discountValue, form.values.withholdingType, form.values.withholdingValue, taxMap]);

  const handleSubmit = async (values: CreateSaleFormValues) => {
    await onSubmit(values);
  };

  const customerOptions = (customersQuery.data || []).map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const productOptions = (productsQuery.data || []).map((p) => ({
    value: p.value,
    label: p.label,
  }));

  const taxOptions = (taxesQuery.data || []).map((t) => ({
    value: t.id,
    label: `${t.name} (${t.rate}%)`,
  }));

  const paymentTermOptions = (paymentTermsQuery.data || []).map((term) => ({
    value: term.id,
    label: term.name,
  }));

  const accountOptions = (accountsQuery.data || []).map((acc) => ({
    value: acc.value,
    label: acc.label,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" color="primary" variant="light">
            <IconFilePlus size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} c="primary.9">
              Buat Faktur Penjualan Baru
            </Text>
            <Text size="xs" c="dimmed">
              Catat tagihan invoice pelanggan atau penghuni properti
            </Text>
          </Box>
        </Group>
      }
      size="xl"
      radius="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs value={activeTab} onChange={setActiveTab} color="primary" variant="pills" radius="md">
          <Tabs.List mb="md">
            <Tabs.Tab value="general" leftSection={<IconUser size={15} />}>
              Informasi Umum
            </Tabs.Tab>
            <Tabs.Tab value="items" leftSection={<IconReceipt2 size={15} />}>
              Rincian Produk & Jasa ({form.values.items.length})
            </Tabs.Tab>
            <Tabs.Tab value="additional" leftSection={<IconFileDescription size={15} />}>
              Diskon & Tambahan
            </Tabs.Tab>
          </Tabs.List>

          {/* TAB 1: General Info */}
          <Tabs.Panel value="general">
            <Stack gap="sm">
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Pelanggan / Unit"
                    placeholder="Pilih kontak pelanggan..."
                    data={customerOptions}
                    searchable
                    clearable
                    required
                    value={form.values.customer}
                    onChange={handleCustomerChange}
                    error={form.errors.customer}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nomor Faktur"
                    placeholder="Kosongkan untuk nomor otomatis"
                    {...form.getInputProps('transactionNumber')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    type="date"
                    label="Tanggal Transaksi"
                    leftSection={<IconCalendar size={16} />}
                    required
                    {...form.getInputProps('transactionDate')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    type="date"
                    label="Tanggal Jatuh Tempo"
                    leftSection={<IconCalendar size={16} />}
                    required
                    {...form.getInputProps('dueDate')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Syarat Pembayaran"
                    placeholder="Pilih termin (COD, Net 30, dll)..."
                    data={paymentTermOptions}
                    searchable
                    clearable
                    {...form.getInputProps('paymentTerm')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nomor Referensi Pelanggan (PO / Ref)"
                    placeholder="Misal: PO-2026/05"
                    {...form.getInputProps('customerRefNumber')}
                  />
                </Grid.Col>
              </Grid>

              <Textarea
                label="Alamat Penagihan (Billing)"
                placeholder="Alamat penagihan lengkap..."
                minRows={2}
                {...form.getInputProps('billingAddress')}
              />

              <Switch
                label="Harga sudah termasuk pajak (Tax Inclusive)"
                mt="xs"
                {...form.getInputProps('isPriceIncludeTax', { type: 'checkbox' })}
              />
            </Stack>
          </Tabs.Panel>

          {/* TAB 2: Items Table */}
          <Tabs.Panel value="items">
            <Stack gap="sm">
              <Table.ScrollContainer minWidth={700}>
                <Table verticalSpacing="xs">
                  <Table.Thead bg="gray.0">
                    <Table.Tr>
                      <Table.Th style={{ width: '32%' }}>
                        <Text size="xs" fw={700} c="dimmed">
                          Produk / Jasa
                        </Text>
                      </Table.Th>
                      <Table.Th style={{ width: '15%' }}>
                        <Text size="xs" fw={700} c="dimmed">
                          Jumlah
                        </Text>
                      </Table.Th>
                      <Table.Th style={{ width: '22%' }}>
                        <Text size="xs" fw={700} c="dimmed">
                          Harga Satuan (Rp)
                        </Text>
                      </Table.Th>
                      <Table.Th style={{ width: '20%' }}>
                        <Text size="xs" fw={700} c="dimmed">
                          Pajak
                        </Text>
                      </Table.Th>
                      <Table.Th style={{ width: '11%' }} ta="center">
                        <Text size="xs" fw={700} c="dimmed">
                          Hapus
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {form.values.items.map((item, idx) => (
                      <Table.Tr key={`item-${idx}`}>
                        <Table.Td>
                          <Select
                            placeholder="Pilih produk..."
                            data={productOptions}
                            searchable
                            size="xs"
                            value={item.productId}
                            onChange={(val) => handleProductSelect(idx, val)}
                            error={form.errors[`items.${idx}.productId`]}
                          />
                          <TextInput
                            placeholder="Deskripsi baris..."
                            size="xs"
                            mt={4}
                            {...form.getInputProps(`items.${idx}.description`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            size="xs"
                            min={1}
                            {...form.getInputProps(`items.${idx}.quantity`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <NumberInput
                            size="xs"
                            thousandSeparator="."
                            decimalSeparator=","
                            min={0}
                            {...form.getInputProps(`items.${idx}.unitPrice`)}
                          />
                        </Table.Td>
                        <Table.Td>
                          <Select
                            placeholder="Pajak..."
                            data={taxOptions}
                            clearable
                            size="xs"
                            {...form.getInputProps(`items.${idx}.taxId`)}
                          />
                        </Table.Td>
                        <Table.Td ta="center">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            disabled={form.values.items.length === 1}
                            onClick={() => form.removeListItem('items', idx)}
                          >
                            <IconTrash size={15} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>

              <Button
                variant="light"
                color="primary"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={addItemRow}
                style={{ alignSelf: 'flex-start' }}
              >
                Tambah Baris Produk
              </Button>
            </Stack>
          </Tabs.Panel>

          {/* TAB 3: Additional & Totals */}
          <Tabs.Panel value="additional">
            <Stack gap="sm">
              <Grid gutter="sm">
                <Grid.Col span={4}>
                  <Select
                    label="Tipe Diskon"
                    data={[
                      { value: 'percentage', label: 'Persentase (%)' },
                      { value: 'nominal', label: 'Nominal (Rp)' },
                    ]}
                    {...form.getInputProps('discountType')}
                  />
                </Grid.Col>
                <Grid.Col span={8}>
                  <NumberInput
                    label="Nilai Diskon"
                    min={0}
                    thousandSeparator="."
                    decimalSeparator=","
                    {...form.getInputProps('discountValue')}
                  />
                </Grid.Col>
              </Grid>

              <Grid gutter="sm">
                <Grid.Col span={4}>
                  <Select
                    label="Tipe Potongan (Withholding)"
                    data={[
                      { value: 'nominal', label: 'Nominal (Rp)' },
                      { value: 'percentage', label: 'Persentase (%)' },
                    ]}
                    {...form.getInputProps('withholdingType')}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <NumberInput
                    label="Nilai Potongan"
                    min={0}
                    thousandSeparator="."
                    decimalSeparator=","
                    {...form.getInputProps('withholdingValue')}
                  />
                </Grid.Col>
                <Grid.Col span={4}>
                  <Select
                    label="Akun Potongan"
                    placeholder="Pilih akun..."
                    data={accountOptions}
                    searchable
                    clearable
                    {...form.getInputProps('withholdingAccount')}
                  />
                </Grid.Col>
              </Grid>

              <Textarea
                label="Pesan di Faktur"
                placeholder="Terima kasih atas kerja sama Anda..."
                minRows={2}
                {...form.getInputProps('message')}
              />

              <Textarea
                label="Memo Internal"
                placeholder="Catatan internal yang tidak terlihat oleh pelanggan..."
                minRows={2}
                {...form.getInputProps('memo')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Live Calculation Summary Banner */}
        <Paper withBorder p="md" radius="md" mt="md" bg="gray.0">
          <Grid gutter="xs">
            <Grid.Col span={6}>
              <Text size="xs" c="dimmed">
                Subtotal
              </Text>
              <Text size="sm" fw={600} c="dark.8">
                {formatIDR(calculations.subtotal)}
              </Text>
            </Grid.Col>
            <Grid.Col span={6} ta="right">
              <Text size="xs" c="dimmed">
                Pajak (PPN)
              </Text>
              <Text size="sm" fw={600} c="dark.8">
                +{formatIDR(calculations.taxTotal)}
              </Text>
            </Grid.Col>
            {calculations.discountAmount > 0 && (
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">
                  Diskon
                </Text>
                <Text size="sm" fw={600} c="red.7">
                  -{formatIDR(calculations.discountAmount)}
                </Text>
              </Grid.Col>
            )}
            {calculations.withholdingAmount > 0 && (
              <Grid.Col span={6} ta="right">
                <Text size="xs" c="dimmed">
                  Potongan
                </Text>
                <Text size="sm" fw={600} c="red.7">
                  -{formatIDR(calculations.withholdingAmount)}
                </Text>
              </Grid.Col>
            )}
            <Grid.Col span={12}>
              <Divider my={4} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Text size="sm" fw={800} c="primary.9">
                Total Tagihan Akhir
              </Text>
            </Grid.Col>
            <Grid.Col span={6} ta="right">
              <Text size="md" fw={800} c="primary.9">
                {formatIDR(calculations.finalAmount)}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        <Divider my="md" />

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button type="submit" color="primary" loading={isSubmitting}>
            Simpan Faktur Penjualan
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export default CreateSaleModal;

