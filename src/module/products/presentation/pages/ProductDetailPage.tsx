import { useState } from 'react';
import { Box, Grid, Group, LoadingOverlay, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { ProductFormValues } from '@/module/products/domain/product';
import { resolveProductImageUrl } from '@/module/products/infrastructure/productApi';
import { ProductAuditPanel } from '@/module/products/presentation/components/ProductAuditPanel';
import {
  ProductDetailSkeleton,
  ProductNotFound,
} from '@/module/products/presentation/components/ProductDetailStates';
import { ProductDetailHeader } from '@/module/products/presentation/components/ProductDetailHeader';
import { ProductForm } from '@/module/products/presentation/components/ProductForm';
import { ProductSettingsCards } from '@/module/products/presentation/components/ProductSettingsCards';
import {
  useDeleteProduct,
  useProduct,
  useSaveProduct,
} from '@/module/products/presentation/hooks/useProductQueries';
import { useReferenceLabels } from '@/module/products/presentation/hooks/useReferenceLabels';

export function ProductDetailPage() {
  const { t } = useTranslation('products');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const { accountLabel, taxLabel } = useReferenceLabels();

  const saveProductMutation = useSaveProduct(id);
  const deleteProductMutation = useDeleteProduct();

  const goToList = () => navigate(routes.baseModules.products);

  const handleEditSubmit = async (values: ProductFormValues) => {
    await saveProductMutation.mutateAsync(values);
    setEditModalOpened(false);
    refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;
    await deleteProductMutation.mutateAsync(product.id);
    goToList();
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (isError || !product) return <ProductNotFound onBack={goToList} />;

  return (
    <>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ProductDetailHeader
            product={product}
            imageUrl={resolveProductImageUrl(product.image)}
            onBack={goToList}
            onEdit={() => setEditModalOpened(true)}
            onDelete={() => setDeleteConfirmOpened(true)}
          />

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <ProductSettingsCards
                product={product}
                accountLabel={accountLabel}
                taxLabel={taxLabel}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <ProductAuditPanel product={product} />
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size={32} radius="md" color="primary" variant="light">
              <IconEdit size={18} />
            </ThemeIcon>
            <Text fw={700} fz="md" c="primary.9">
              {t('detail.modalEditTitle')}
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
          {editModalOpened && (
            <ProductForm
              product={product}
              isSubmitting={saveProductMutation.isPending}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditModalOpened(false)}
            />
          )}
        </Box>
      </Modal>

      <ConfirmModal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title={t('detail.deleteTitle')}
        message={t('detail.deleteMessage', { name: product.name })}
        helperText={t('detail.deleteHelper')}
        confirmLoading={deleteProductMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

export default ProductDetailPage;
