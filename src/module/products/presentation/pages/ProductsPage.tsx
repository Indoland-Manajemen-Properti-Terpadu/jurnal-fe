import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPackage, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { summarizeProducts } from '@/module/products/domain/productRules';
import { ProductTable } from '@/module/products/presentation/components/ProductTable';
import { ProductForm } from '@/module/products/presentation/components/ProductForm';
import { ProductListToolbar } from '@/module/products/presentation/components/ProductListToolbar';
import { ProductStatsCards } from '@/module/products/presentation/components/ProductStatsCards';
import {
  useCategories,
  useAllProducts,
  useDeleteProduct,
  useProducts,
  useSaveProduct,
  useUnits,
} from '@/module/products/presentation/hooks/useProductQueries';
import type { Product, ProductFormValues } from '@/module/products/domain/product';

export function ProductsPage() {
  const { t } = useTranslation('products');
  const navigate = useNavigate();

  // Search & Pagination state
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(10);

  // Modal states
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  // Queries
  const productsQuery = useProducts({
    page,
    limit,
    search: debouncedSearch.trim() || undefined,
  });

  // The summary cards cover the whole catalog; the table pages through its own query.
  const summaryQuery = useAllProducts();
  const categoriesQuery = useCategories();
  const unitsQuery = useUnits();

  // Mutations
  const saveProductMutation = useSaveProduct(editingProduct?.id);
  const deleteProductMutation = useDeleteProduct();

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
    navigate(`/products/${product.id}`);
  };

  const handleDeleteProductConfirm = async () => {
    if (!deleteProductTarget) return;
    await deleteProductMutation.mutateAsync(deleteProductTarget.id);
    setDeleteProductTarget(null);
  };

  const summary = useMemo(
    () =>
      summarizeProducts(summaryQuery.data?.items ?? [], summaryQuery.data?.pagination.total ?? 0),
    [summaryQuery.data]
  );

  const paginationData = productsQuery.data?.pagination;
  const totalProducts = paginationData?.total ?? 0;
  const totalPages = paginationData?.totalPages ?? 1;

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Header with Title and Feature Description */}
          <ModuleHeader
            icon={IconPackage}
            title={t('list.title')}
            description={t('list.description')}
            actions={
              <Group gap="xs">
                <Tooltip label={t('list.refresh')}>
                  <ActionIcon
                    size="lg"
                    variant="default"
                    radius="md"
                    onClick={() => productsQuery.refetch()}
                    loading={productsQuery.isFetching}
                    aria-label={t('list.refresh')}
                  >
                    <IconRefresh size={18} />
                  </ActionIcon>
                </Tooltip>
                <Button
                  color="primary"
                  leftSection={<IconPlus size={18} />}
                  onClick={handleOpenCreate}
                >
                  {t('list.addProduct')}
                </Button>
              </Group>
            }
          />

          <ProductStatsCards
            summary={summary}
            categories={categoriesQuery.data?.pagination.total ?? 0}
            units={unitsQuery.data?.pagination.total ?? 0}
          />

          <Paper withBorder radius="lg" p="md" bg="white">
            <Stack gap="md">
              <ProductListToolbar
                search={searchInput}
                onSearchChange={(value) => {
                  setSearchInput(value);
                  setPage(1);
                }}
                onSearchClear={() => setSearchInput('')}
              />

              <ProductTable
                products={productsQuery.data?.items ?? []}
                isLoading={productsQuery.isLoading}
                isFiltered={debouncedSearch.trim() !== ''}
                page={page}
                totalPages={totalPages}
                total={totalProducts}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
                onView={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={(prod) => setDeleteProductTarget(prod)}
                onCreate={handleOpenCreate}
              />
            </Stack>
          </Paper>
        </Stack>
      </Box>

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
              {editingProduct ? t('list.modalEditTitle') : t('list.modalCreateTitle')}
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

      {/* Delete Product Confirmation */}
      <ConfirmModal
        opened={deleteProductTarget !== null}
        onClose={() => setDeleteProductTarget(null)}
        title={t('list.deleteTitle')}
        message={t('list.deleteMessage', { name: deleteProductTarget?.name ?? '' })}
        helperText={t('list.deleteHelper')}
        confirmLoading={deleteProductMutation.isPending}
        onConfirm={handleDeleteProductConfirm}
      />
    </>
  );
}

export default ProductsPage;
