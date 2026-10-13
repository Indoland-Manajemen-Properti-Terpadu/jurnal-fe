import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconCategory,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconRuler,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { ModuleHeader } from '../components/ModuleHeader';
import { ProductTable } from '../components/ProductTable';
import { ProductForm } from '../components/ProductForm';
import { ProductDetailDrawer } from '../components/ProductDetailDrawer';
import { MasterDataPanel } from '../components/MasterDataPanel';
import {
  useCategories,
  useCategoryMutations,
  useDeleteProduct,
  useProducts,
  useSaveProduct,
  useUnitMutations,
  useUnits,
} from '../hooks/useProductQueries';
import type { Product, ProductFormValues } from '../types/product';
import AppShellLayout from '@/components/AppShellLayout';

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('products');

  // Search & Pagination state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal / Drawer states
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [selectedDetail, setSelectedDetail] = useState<Product | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  // Queries
  const productsQuery = useProducts({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  const categoriesQuery = useCategories();
  const unitsQuery = useUnits();

  // Mutations
  const saveProductMutation = useSaveProduct(editingProduct?.id);
  const deleteProductMutation = useDeleteProduct();
  const { createMutation: createCat, deleteMutation: deleteCat } = useCategoryMutations();
  const { createMutation: createUnit, deleteMutation: deleteUnit } = useUnitMutations();

  const handleOpenCreate = () => {
    setEditingProduct(undefined);
    setFormModalOpened(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormModalOpened(true);
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    await saveProductMutation.mutateAsync(values);
    setFormModalOpened(false);
    setEditingProduct(undefined);
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedDetail(product);
    setDetailOpened(true);
  };

  const handleDeleteProductConfirm = async () => {
    if (!deleteProductTarget) return;
    await deleteProductMutation.mutateAsync(deleteProductTarget.id);
    setDeleteProductTarget(null);
    if (selectedDetail?.id === deleteProductTarget.id) {
      setDetailOpened(false);
      setSelectedDetail(null);
    }
  };

  const paginationData = productsQuery.data?.pagination;
  const totalProducts = paginationData?.total ?? 0;
  const totalPages = paginationData?.totalPages ?? 1;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header with Title and Feature Description */}
          <ModuleHeader
            icon={IconPackage}
            title="Daftar Produk & Layanan"
            description="Kelola katalog produk barang fisik maupun jasa layanan. Atur akun default untuk penjualan, pembelian, tarif pajak, serta batas minimum persediaan untuk operasional bisnis yang rapi dan terukur."
            actions={
              <Group gap="xs">
                <Tooltip label="Segarkan Data">
                  <ActionIcon
                    size="lg"
                    variant="light"
                    color="gray"
                    onClick={() => productsQuery.refetch()}
                    loading={productsQuery.isFetching}
                    aria-label="Segarkan Data"
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                >
                  Tambah Produk
                </Button>
              </Group>
            }
          />

          {/* Quick Metrics / Stats Cards */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card withBorder radius="lg" p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Total Produk & Jasa
                  </Text>
                  <Text size="xl" fw={800} c="primary.9" mt={4}>
                    {totalProducts}
                  </Text>
                </div>
                <ThemeIcon size={44} radius="md" variant="light" color="primary">
                  <IconPackage size={22} />
                </ThemeIcon>
              </Group>
            </Card>

            <Card withBorder radius="lg" p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Kategori Terdaftar
                  </Text>
                  <Text size="xl" fw={800} c="primary.9" mt={4}>
                    {categoriesQuery.data?.pagination.total ?? 0}
                  </Text>
                </div>
                <ThemeIcon size={44} radius="md" variant="light" color="secondary.8">
                  <IconCategory size={22} />
                </ThemeIcon>
              </Group>
            </Card>

            <Card withBorder radius="lg" p="md">
              <Group justify="space-between">
                <div>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                    Satuan Unit
                  </Text>
                  <Text size="xl" fw={800} c="primary.9" mt={4}>
                    {unitsQuery.data?.pagination.total ?? 0}
                  </Text>
                </div>
                <ThemeIcon size={44} radius="md" variant="light" color="teal">
                  <IconRuler size={22} />
                </ThemeIcon>
              </Group>
            </Card>
          </SimpleGrid>

          {/* Main Content Tabs */}
          <Paper withBorder radius="lg" p="md">
            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              color="primary"
              variant="pills"
              radius="md"
            >
              <Tabs.List mb="md">
                <Tabs.Tab value="products" leftSection={<IconPackage size={16} />}>
                  Semua Produk
                </Tabs.Tab>
                <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>
                  Kategori Produk
                </Tabs.Tab>
                <Tabs.Tab value="units" leftSection={<IconRuler size={16} />}>
                  Satuan / Unit
                </Tabs.Tab>
              </Tabs.List>

              {/* Tab 1: Products */}
              <Tabs.Panel value="products">
                <Stack gap="md">
                  {/* Filter & Search Bar */}
                  <Group justify="space-between" wrap="wrap" gap="sm">
                    <TextInput
                      placeholder="Cari nama atau SKU produk..."
                      leftSection={<IconSearch size={16} />}
                      rightSection={
                        searchInput ? (
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            color="gray"
                            onClick={() => setSearchInput('')}
                            aria-label="Bersihkan pencarian"
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        ) : null
                      }
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.currentTarget.value);
                        setPage(1);
                      }}
                      w={{ base: '100%', sm: 320 }}
                    />

                    <Group gap="xs">
                      <Select
                        placeholder="Limit per halaman"
                        value={String(limit)}
                        onChange={(v) => {
                          setLimit(Number(v) || 10);
                          setPage(1);
                        }}
                        data={[
                          { value: '10', label: '10 per hal.' },
                          { value: '25', label: '25 per hal.' },
                          { value: '50', label: '50 per hal.' },
                          { value: '100', label: '100 per hal.' },
                        ]}
                        w={140}
                      />
                    </Group>
                  </Group>

                  {/* Table Component */}
                  <ProductTable
                    products={productsQuery.data?.items ?? []}
                    isLoading={productsQuery.isLoading}
                    onView={handleOpenDetail}
                    onEdit={handleOpenEdit}
                    onDelete={(prod) => setDeleteProductTarget(prod)}
                  />

                  {/* Pagination Footer */}
                  <Group justify="space-between" align="center" pt="xs" wrap="wrap" gap="sm">
                    <Text size="xs" c="dimmed">
                      Menampilkan {productsQuery.data?.items.length ?? 0} dari {totalProducts}{' '}
                      produk
                    </Text>
                    {totalPages > 1 && (
                      <Pagination
                        total={totalPages}
                        value={page}
                        onChange={setPage}
                        color="primary"
                        radius="md"
                        size="sm"
                      />
                    )}
                  </Group>
                </Stack>
              </Tabs.Panel>

              {/* Tab 2: Categories */}
              <Tabs.Panel value="categories">
                <MasterDataPanel
                  icon={IconCategory}
                  entityLabel="Kategori"
                  helperText="Kelompokkan produk Anda untuk kemudahan pelaporan dan pencarian."
                  namePlaceholder="Contoh: Utilitas, IPL, Biaya Operasional"
                  items={categoriesQuery.data?.items ?? []}
                  isLoading={categoriesQuery.isLoading}
                  isCreating={createCat.isPending}
                  isDeleting={deleteCat.isPending}
                  onCreate={(input) => createCat.mutateAsync(input)}
                  onDelete={(id) => deleteCat.mutateAsync(id)}
                />
              </Tabs.Panel>

              {/* Tab 3: Units */}
              <Tabs.Panel value="units">
                <MasterDataPanel
                  icon={IconRuler}
                  entityLabel="Satuan Unit"
                  helperText="Satuan ukuran untuk produk dan jasa (misal: pcs, jam, kWh, m3)."
                  namePlaceholder="Contoh: kWh, m3, Unit, Bulan"
                  items={unitsQuery.data?.items ?? []}
                  isLoading={unitsQuery.isLoading}
                  isCreating={createUnit.isPending}
                  isDeleting={deleteUnit.isPending}
                  onCreate={(input) => createUnit.mutateAsync(input)}
                  onDelete={(id) => deleteUnit.mutateAsync(id)}
                />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </Box>

      {/* Modal Create / Edit Product */}
      {/* Modal Create / Edit Product */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          if (!saveProductMutation.isPending) {
            setFormModalOpened(false);
            setEditingProduct(undefined);
          }
        }}
        title={
          <Group gap="xs">
            <ThemeIcon size={32} radius="md" color="primary" variant="light">
              <IconPackage size={18} />
            </ThemeIcon>
            <Text fw={700} fz="md" c="primary.9">
              {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
            </Text>
          </Group>
        }
        size="72rem"
        radius="lg"
        centered
        padding="lg"
      >
        <Box pos="relative">
          <LoadingOverlay
            visible={saveProductMutation.isPending}
            overlayProps={{ radius: 'md', blur: 2 }}
          />
          {formModalOpened && (
            <ProductForm
              product={editingProduct}
              isSubmitting={saveProductMutation.isPending}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setFormModalOpened(false);
                setEditingProduct(undefined);
              }}
            />
          )}
        </Box>
      </Modal>

      {/* Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedDetail}
        opened={detailOpened}
        onClose={() => {
          setDetailOpened(false);
          setSelectedDetail(null);
        }}
        onEdit={(prod) => handleOpenEdit(prod)}
        onDelete={(prod) => {
          setDeleteProductTarget(prod);
        }}
      />

      {/* Delete Product Confirmation */}
      <ConfirmModal
        opened={deleteProductTarget !== null}
        onClose={() => setDeleteProductTarget(null)}
        title="Hapus Produk?"
        message={`Produk "${deleteProductTarget?.name ?? ''}" akan dihapus dari daftar.`}
        helperText="Tindakan ini tidak dapat dibatalkan. Riwayat transaksi jurnal terdahulu akan tetap tersimpan."
        confirmLoading={deleteProductMutation.isPending}
        onConfirm={handleDeleteProductConfirm}
      />
    </AppShellLayout>
  );
}

export default ProductsPage;
