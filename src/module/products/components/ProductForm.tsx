import { memo, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Collapse,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import {
  IconBuildingWarehouse,
  IconInfoCircle,
  IconPhoto,
  IconPlus,
  IconShoppingCart,
  IconTag,
  IconUpload,
  IconX,
  type Icon,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import type { Product, ProductFormValues } from '../types/product';
import {
  useAccountOptions,
  useCategories,
  useCategoryMutations,
  useTaxes,
} from '../hooks/useProductQueries';
import { resolveProductImageUrl } from '../infrastructure/productApi';
import { MasterDataFormModal } from './MasterDataPanel';

type ProductFormProps = {
  product?: Product;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const toInitialValues = (product?: Product): ProductFormValues => ({
  name: product?.name ?? '',
  sku: product?.sku ?? '',
  productCategory: product?.category?.id ?? null,
  image: null,
  buyingInfo: product?.buyingInfo ?? {
    isPurchased: true,
    unitPrice: null,
    purchaseAccount: null,
    purchaseTax: null,
  },
  sellingInfo: product?.sellingInfo ?? {
    isSold: true,
    unitPrice: null,
    salesAccount: null,
    accountReceivable: null,
    salesTax: null,
  },
  inventoryInfo: product?.inventoryInfo ?? {
    isTracked: false,
    inventoryAccount: null,
    minStock: 0,
  },
});

const requiredWhen = (enabled: boolean, value: unknown, message: string) =>
  enabled && (value === null || value === '') ? message : null;

function FormSection({
  icon: SectionIcon,
  title,
  description,
  toggle,
  children,
}: Readonly<{
  icon: Icon;
  title: string;
  description: string;
  toggle?: ReactNode;
  children: ReactNode;
}>) {
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group justify="space-between" align="center" wrap="nowrap" gap="md">
        <Group align="center" gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="primary" radius="sm" size={32}>
            <SectionIcon size={16} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm" c="primary.9" lh={1.3}>
              {title}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {description}
            </Text>
          </Box>
        </Group>
        {toggle}
      </Group>
      {children}
    </Paper>
  );
}

function ProductFormComponent({
  product,
  isSubmitting,
  onSubmit,
  onCancel,
}: Readonly<ProductFormProps>) {
  const categories = useCategories();
  const taxes = useTaxes();
  const accounts = useAccountOptions();
  const { createMutation: createCategory } = useCategoryMutations();
  const [categoryModalOpened, setCategoryModalOpened] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    resolveProductImageUrl(product?.image ?? null)
  );

  const form = useForm<ProductFormValues>({
    initialValues: toInitialValues(product),
    validate: {
      name: (value) => (value.trim() ? null : 'Nama produk wajib diisi'),
      productCategory: (value) => (value ? null : 'Pilih kategori produk'),
      buyingInfo: {
        unitPrice: (value, values) =>
          requiredWhen(values.buyingInfo.isPurchased, value, 'Harga beli wajib diisi'),
        purchaseAccount: (value, values) =>
          requiredWhen(values.buyingInfo.isPurchased, value, 'Pilih akun pembelian'),
      },
      sellingInfo: {
        unitPrice: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, 'Harga jual wajib diisi'),
        salesAccount: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, 'Pilih akun penjualan'),
        accountReceivable: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, 'Pilih akun piutang'),
      },
      inventoryInfo: {
        inventoryAccount: (value, values) =>
          requiredWhen(values.inventoryInfo.isTracked, value, 'Pilih akun persediaan'),
      },
    },
  });

  // Memoize mapped lookup data so typing doesn't re-iterate thousands of account options
  const accountData = useMemo(
    () => (accounts.data ?? []).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data]
  );

  const taxData = useMemo(
    () => (taxes.data ?? []).map((t) => ({ value: t.id, label: `${t.name} (${t.rate}%)` })),
    [taxes.data]
  );

  const categoryData = useMemo(
    () => (categories.data?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories.data?.items]
  );

  const { values } = form;
  const nothingEnabled = !values.buyingInfo.isPurchased && !values.sellingInfo.isSold;

  const handleImage = (file: File | null) => {
    form.setFieldValue('image', file);
    setPreview(file ? URL.createObjectURL(file) : resolveProductImageUrl(product?.image ?? null));
  };

  const selectProps = {
    searchable: true,
    clearable: true,
    nothingFoundMessage: 'Tidak ditemukan',
    comboboxProps: { withinPortal: true, transitionProps: { duration: 150 } },
    maxDropdownHeight: 240,
    size: 'sm',
  } as const;

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Grid gutter="md" align="stretch">
        {/* Left Column: Form Sections */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {/* General Info */}
            <FormSection
              icon={IconTag}
              title="Informasi Dasar Produk"
              description="Nama produk, kategori, dan identitas SKU."
            >
              <Box mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 7 }}>
                    <TextInput
                      label="Nama produk"
                      placeholder="Contoh: Listrik, Service Charge"
                      withAsterisk
                      size="sm"
                      {...form.getInputProps('name')}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <TextInput
                      label="SKU (Stock Keeping Unit)"
                      placeholder="Dibuat otomatis jika kosong"
                      size="sm"
                      {...form.getInputProps('sku')}
                    />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Group align="flex-end" gap={6} wrap="nowrap">
                      <Select
                        label="Kategori"
                        placeholder={categories.isLoading ? 'Memuat kategori...' : 'Pilih kategori'}
                        withAsterisk
                        data={categoryData}
                        style={{ flex: 1 }}
                        {...selectProps}
                        {...form.getInputProps('productCategory')}
                      />
                      <Tooltip label="Buat kategori baru">
                        <ActionIcon
                          size={36}
                          variant="light"
                          color="primary"
                          aria-label="Buat kategori baru"
                          onClick={() => setCategoryModalOpened(true)}
                          mb={form.errors.productCategory ? 20 : 0}
                        >
                          <IconPlus size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Box>
            </FormSection>

            {/* Sales */}
            <FormSection
              icon={IconTag}
              title="Penjualan"
              description="Aktifkan bila produk ini dijual ke pelanggan."
              toggle={
                <Switch
                  color="primary"
                  size="sm"
                  aria-label="Produk dijual"
                  {...form.getInputProps('sellingInfo.isSold', { type: 'checkbox' })}
                />
              }
            >
              <Collapse in={values.sellingInfo.isSold}>
                <Box mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                  <Grid gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <NumberInput
                        label="Harga jual / unit"
                        prefix="Rp "
                        thousandSeparator="."
                        decimalSeparator=","
                        min={0}
                        withAsterisk
                        hideControls
                        size="sm"
                        {...form.getInputProps('sellingInfo.unitPrice')}
                        onChange={(v) =>
                          form.setFieldValue('sellingInfo.unitPrice', v === '' ? null : Number(v))
                        }
                        value={values.sellingInfo.unitPrice ?? ''}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Pajak penjualan"
                        placeholder="Tanpa pajak"
                        data={taxData}
                        {...selectProps}
                        {...form.getInputProps('sellingInfo.salesTax')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Akun penjualan"
                        placeholder="Pilih akun penjualan"
                        withAsterisk
                        data={accountData}
                        {...selectProps}
                        {...form.getInputProps('sellingInfo.salesAccount')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label="Akun piutang"
                        placeholder="Pilih akun piutang"
                        withAsterisk
                        data={accountData}
                        {...selectProps}
                        {...form.getInputProps('sellingInfo.accountReceivable')}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              </Collapse>
            </FormSection>

            {/* Purchasing */}
            <FormSection
              icon={IconShoppingCart}
              title="Pembelian"
              description="Aktifkan bila produk ini dibeli dari vendor / supplier."
              toggle={
                <Switch
                  color="primary"
                  size="sm"
                  aria-label="Produk dibeli"
                  {...form.getInputProps('buyingInfo.isPurchased', { type: 'checkbox' })}
                />
              }
            >
              <Collapse in={values.buyingInfo.isPurchased}>
                <Box mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                  <Grid gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        label="Harga beli / unit"
                        prefix="Rp "
                        thousandSeparator="."
                        decimalSeparator=","
                        min={0}
                        withAsterisk
                        hideControls
                        size="sm"
                        {...form.getInputProps('buyingInfo.unitPrice')}
                        onChange={(v) =>
                          form.setFieldValue('buyingInfo.unitPrice', v === '' ? null : Number(v))
                        }
                        value={values.buyingInfo.unitPrice ?? ''}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        label="Akun pembelian"
                        placeholder="Pilih akun"
                        withAsterisk
                        data={accountData}
                        {...selectProps}
                        {...form.getInputProps('buyingInfo.purchaseAccount')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        label="Pajak pembelian"
                        placeholder="Tanpa pajak"
                        data={taxData}
                        {...selectProps}
                        {...form.getInputProps('buyingInfo.purchaseTax')}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              </Collapse>
            </FormSection>

            {/* Inventory */}
            <FormSection
              icon={IconBuildingWarehouse}
              title="Persediaan"
              description="Lacak fisik stok. Nonaktifkan bila bertipe jasa / operasional murni."
              toggle={
                <Switch
                  color="primary"
                  size="sm"
                  aria-label="Lacak persediaan"
                  {...form.getInputProps('inventoryInfo.isTracked', { type: 'checkbox' })}
                />
              }
            >
              <Collapse in={values.inventoryInfo.isTracked}>
                <Box mt="sm" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                  <Grid gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 8 }}>
                      <Select
                        label="Akun persediaan"
                        placeholder="Pilih akun"
                        withAsterisk
                        data={accountData}
                        {...selectProps}
                        {...form.getInputProps('inventoryInfo.inventoryAccount')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <NumberInput
                        label="Stok minimum"
                        placeholder="0"
                        min={0}
                        allowDecimal={false}
                        size="sm"
                        {...form.getInputProps('inventoryInfo.minStock')}
                      />
                    </Grid.Col>
                  </Grid>
                </Box>
              </Collapse>
            </FormSection>
          </Stack>
        </Grid.Col>

        {/* Right Column: Image Upload & Action Buttons */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" justify="space-between" h="100%">
            <Paper withBorder radius="md" p="md" bg="white">
              <Group gap="xs" mb="xs">
                <ThemeIcon variant="light" color="primary" radius="sm" size={28}>
                  <IconPhoto size={16} />
                </ThemeIcon>
                <Box>
                  <Text fw={600} size="sm" c="primary.9">
                    Foto / Gambar Produk
                  </Text>
                  <Text size="xs" c="dimmed">
                    Format PNG, JPG, maks. 2 MB
                  </Text>
                </Box>
              </Group>

              {preview ? (
                <Box pos="relative" mt="sm">
                  <Image
                    src={preview}
                    radius="md"
                    h={180}
                    fit="contain"
                    bg="gray.0"
                    alt="Pratinjau produk"
                  />
                  <ActionIcon
                    pos="absolute"
                    top={8}
                    right={8}
                    variant="filled"
                    color="red"
                    radius="xl"
                    size="sm"
                    aria-label="Hapus gambar"
                    onClick={() => {
                      form.setFieldValue('image', null);
                      setPreview(null);
                    }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Box>
              ) : (
                <Dropzone
                  mt="sm"
                  onDrop={(files) => handleImage(files[0] ?? null)}
                  accept={IMAGE_MIME_TYPE}
                  maxSize={MAX_IMAGE_BYTES}
                  maxFiles={1}
                  radius="md"
                  p="md"
                  style={{ borderStyle: 'dashed' }}
                >
                  <Stack align="center" gap={4} py="sm" style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <IconUpload size={28} color="var(--mantine-color-primary-6)" />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX size={28} color="var(--mantine-color-red-6)" />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto size={28} color="var(--mantine-color-gray-5)" />
                    </Dropzone.Idle>
                    <Text size="xs" fw={600} ta="center">
                      Tarik gambar ke sini
                    </Text>
                    <Text size="xs" c="dimmed" ta="center">
                      atau klik untuk unggah berkas
                    </Text>
                  </Stack>
                </Dropzone>
              )}

              {nothingEnabled && (
                <Alert
                  color="yellow"
                  radius="md"
                  icon={<IconInfoCircle size={16} />}
                  p="xs"
                  mt="md"
                  styles={{ message: { fontSize: 12 } }}
                >
                  Produk belum diaktifkan untuk penjualan atau pembelian.
                </Alert>
              )}
            </Paper>

            {/* Bottom Actions Container */}
            <Paper withBorder radius="md" p="md" bg="white">
              <Stack gap="xs">
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  loading={isSubmitting}
                  fullWidth
                  radius="md"
                >
                  {product ? 'Simpan Perubahan' : 'Simpan Produk'}
                </Button>
                <Button
                  variant="default"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  fullWidth
                  size="sm"
                  radius="md"
                >
                  Batal
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <MasterDataFormModal
        opened={categoryModalOpened}
        onClose={() => setCategoryModalOpened(false)}
        entityLabel="Kategori"
        namePlaceholder="Contoh: Utility, IPL, Other Cost"
        isSubmitting={createCategory.isPending}
        onSubmit={async (input) => {
          const created = await createCategory.mutateAsync(input);
          form.setFieldValue('productCategory', created.id);
        }}
      />
    </form>
  );
}

export const ProductForm = memo(ProductFormComponent);
