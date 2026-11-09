import { memo, useState } from 'react';
import { Alert, Button, Grid, Paper, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Product, ProductFormValues } from '@/module/products/domain/product';
import { resolveProductImageUrl } from '@/module/products/infrastructure/productApi';
import { useProductForm } from '@/module/products/presentation/hooks/useProductForm';
import {
  useCategoryMutations,
  useUnitMutations,
} from '@/module/products/presentation/hooks/useProductQueries';
import { MasterDataFormModal } from './MasterDataFormModal';
import { ProductImagePanel } from './ProductImagePanel';
import { InventorySection } from './InventorySection';
import { GeneralSection, PurchasingSection, SalesSection } from './ProductFormSections';

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
  const {
    form,
    purchaseAccountData,
    inventoryAccountData,
    salesAccountData,
    receivableAccountData,
    unitData,
    unitsLoading,
    taxData,
    categoryData,
    categoriesLoading,
  } = useProductForm(product);
  const { createMutation: createCategory } = useCategoryMutations();
  const { createMutation: createUnit } = useUnitMutations();
  const [categoryModalOpened, setCategoryModalOpened] = useState(false);
  const [unitModalOpened, setUnitModalOpened] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    resolveProductImageUrl(product?.image ?? null)
  );

  const unitProps = {
    unitData,
    unitsLoading,
    onCreateUnit: () => setUnitModalOpened(true),
  };

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
              unit={nothingEnabled ? unitProps : undefined}
            />
            <SalesSection
              form={form}
              taxData={taxData}
              salesAccountData={salesAccountData}
              receivableAccountData={receivableAccountData}
              {...unitProps}
            />
            <PurchasingSection
              form={form}
              accountData={purchaseAccountData}
              taxData={taxData}
              {...unitProps}
            />
            <InventorySection form={form} accountData={inventoryAccountData} />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" pos="sticky" top={0}>
            <ProductImagePanel preview={preview} onPick={handleImage} onClear={handleClearImage} />

            <Paper withBorder radius="md" p="md" bg="white">
              <Stack gap="xs">
                {nothingEnabled && (
                  <Alert
                    color="yellow"
                    radius="md"
                    icon={<IconInfoCircle size={16} />}
                    p="xs"
                    role="alert"
                    styles={{ message: { fontSize: 'var(--jurnal-text-xs)' } }}
                  >
                    {t('form.nothingEnabled')}
                  </Alert>
                )}
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  loading={isSubmitting}
                  disabled={nothingEnabled}
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

      <MasterDataFormModal
        opened={unitModalOpened}
        onClose={() => setUnitModalOpened(false)}
        entityLabel={t('masterData.unit')}
        namePlaceholder={t('masterData.unitPlaceholder')}
        isSubmitting={createUnit.isPending}
        onSubmit={async (input) => {
          const created = await createUnit.mutateAsync(input);
          form.setFieldValue('unit', created.id);
        }}
      />
    </form>
  );
}

export const ProductForm = memo(ProductFormComponent);
