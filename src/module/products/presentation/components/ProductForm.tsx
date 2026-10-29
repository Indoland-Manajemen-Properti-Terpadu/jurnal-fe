import { memo, useState } from 'react';
import { Button, Grid, Paper, Stack } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { Product, ProductFormValues } from '@/module/products/domain/product';
import { resolveProductImageUrl } from '@/module/products/infrastructure/productApi';
import { useProductForm } from '@/module/products/presentation/hooks/useProductForm';
import { useCategoryMutations } from '@/module/products/presentation/hooks/useProductQueries';
import { MasterDataFormModal } from './MasterDataFormModal';
import { ProductImagePanel } from './ProductImagePanel';
import {
  GeneralSection,
  InventorySection,
  PurchasingSection,
  SalesSection,
} from './ProductFormSections';

type ProductFormProps = {
  product?: Product;
  isSubmitting: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel: () => void;
};

function ProductFormComponent({
  product,
  isSubmitting,
  onSubmit,
  onCancel,
}: Readonly<ProductFormProps>) {
  const { t } = useTranslation('products');
  const { form, accountData, taxData, categoryData, categoriesLoading } = useProductForm(product);
  const { createMutation: createCategory } = useCategoryMutations();
  const [categoryModalOpened, setCategoryModalOpened] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    resolveProductImageUrl(product?.image ?? null)
  );

  const { values } = form;
  const nothingEnabled = !values.buyingInfo.isPurchased && !values.sellingInfo.isSold;

  const handleImage = (file: File | null) => {
    form.setFieldValue('image', file);
    setPreview(file ? URL.createObjectURL(file) : resolveProductImageUrl(product?.image ?? null));
  };

  const handleClearImage = () => {
    form.setFieldValue('image', null);
    setPreview(null);
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Grid gutter="md" align="stretch">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            <GeneralSection
              form={form}
              categoryData={categoryData}
              categoriesLoading={categoriesLoading}
              onCreateCategory={() => setCategoryModalOpened(true)}
            />
            <SalesSection form={form} accountData={accountData} taxData={taxData} />
            <PurchasingSection form={form} accountData={accountData} taxData={taxData} />
            <InventorySection form={form} accountData={accountData} />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" justify="space-between" h="100%">
            <ProductImagePanel
              preview={preview}
              nothingEnabled={nothingEnabled}
              onPick={handleImage}
              onClear={handleClearImage}
            />

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
                  {product ? t('form.submitEdit') : t('form.submitCreate')}
                </Button>
                <Button
                  variant="default"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  fullWidth
                  size="sm"
                  radius="md"
                >
                  {t('form.cancel')}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <MasterDataFormModal
        opened={categoryModalOpened}
        onClose={() => setCategoryModalOpened(false)}
        entityLabel={t('masterData.category')}
        namePlaceholder={t('form.newCategoryPlaceholder')}
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
