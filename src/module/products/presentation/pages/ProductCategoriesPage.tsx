import { IconCategory } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { MasterDataPanel } from '@/module/products/presentation/components/MasterDataPanel';
import {
  useCategories,
  useCategoryMutations,
} from '@/module/products/presentation/hooks/useProductQueries';
import { ProductMasterDataFrame } from './ProductMasterDataFrame';

/** Settings-like master list of the product catalog: categories. */
export function ProductCategoriesPage() {
  const { t } = useTranslation('products');
  const query = useCategories();
  const { createMutation, updateMutation, deleteMutation } = useCategoryMutations();

  return (
    <ProductMasterDataFrame
      icon={IconCategory}
      title={t('masterData.categoriesTitle')}
      description={t('masterData.categoriesDescription')}
      isFetching={query.isFetching}
      onRefresh={() => query.refetch()}
    >
      <MasterDataPanel
        icon={IconCategory}
        entityLabel={t('masterData.category')}
        helperText={t('masterData.categoryHelper')}
        namePlaceholder={t('masterData.categoryPlaceholder')}
        items={query.data?.items ?? []}
        isLoading={query.isLoading}
        isCreating={createMutation.isPending}
        isUpdating={updateMutation.isPending}
        isDeleting={deleteMutation.isPending}
        onCreate={(input) => createMutation.mutateAsync(input)}
        onUpdate={(id, input) => updateMutation.mutateAsync({ id, input })}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
      />
    </ProductMasterDataFrame>
  );
}

export default ProductCategoriesPage;
