import { IconRuler } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { MasterDataPanel } from '@/module/products/presentation/components/MasterDataPanel';
import { useUnits, useUnitMutations } from '@/module/products/presentation/hooks/useProductQueries';
import { ProductMasterDataFrame } from './ProductMasterDataFrame';

/** Settings-like master list of the product catalog: units. */
export function ProductUnitsPage() {
  const { t } = useTranslation('products');
  const query = useUnits();
  const { createMutation, updateMutation, deleteMutation } = useUnitMutations();

  return (
    <ProductMasterDataFrame
      icon={IconRuler}
      title={t('masterData.unitsTitle')}
      description={t('masterData.unitsDescription')}
      isFetching={query.isFetching}
      onRefresh={() => query.refetch()}
    >
      <MasterDataPanel
        icon={IconRuler}
        entityLabel={t('masterData.unit')}
        helperText={t('masterData.unitHelper')}
        namePlaceholder={t('masterData.unitPlaceholder')}
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

export default ProductUnitsPage;
