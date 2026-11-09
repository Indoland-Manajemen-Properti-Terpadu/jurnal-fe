import { useEffect, useMemo, useState } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { summarizeProducts } from '@/module/products/domain/productRules';
import { useProductListParams } from '@/module/products/presentation/hooks/useProductListParams';
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
  const location = useLocation();

  // Search & Pagination state
  // Kept in the URL so the list is restored when coming back from a product's detail.
  const { searchInput, setSearchInput, page, setPage, limit, setLimit } = useProductListParams();
  const [debouncedSearch] = useDebouncedValue(searchInput, 400);

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
    navigate(`/products/${product.id}`, { state: { listSearch: location.search } });
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
  // Without a search the whole catalog is already read for the cards, and its count is exact
  // (the service's own total still includes deleted products).
  const unfilteredTotal = summaryQuery.data?.pagination.total;
  const totalProducts =
    debouncedSearch.trim() === '' && unfilteredTotal !== undefined
      ? unfilteredTotal
      : (paginationData?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

  // Deleting the last row of the last page leaves that page empty: step back to the new last one.
  useEffect(() => {
    if (!productsQuery.isFetching && page > totalPages) setPage(totalPages);
  }, [productsQuery.isFetching, page, totalPages, setPage]);

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
                onSearchChange={setSearchInput}
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
                onLimitChange={setLimit}
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
