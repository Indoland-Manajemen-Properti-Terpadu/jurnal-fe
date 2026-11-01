import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import { t } from '@/i18n';
import type { Product, ProductFormValues } from '@/module/products/domain/product';
import {
  formatTaxLabel,
  requiredWhen,
  toInitialValues,
} from '@/module/products/domain/productRules';
import { useAccountOptions, useCategories, useTaxes } from './useProductQueries';

const tp = (key: string) => t(key, undefined, 'products');

export const useProductForm = (product?: Product) => {
  const categories = useCategories();
  const taxes = useTaxes();
  const accounts = useAccountOptions();

  const form = useForm<ProductFormValues>({
    initialValues: toInitialValues(product),
    validate: {
      name: (value) => (value.trim() ? null : tp('form.nameRequired')),
      productCategory: (value) => (value ? null : tp('form.categoryRequired')),
      buyingInfo: {
        unitPrice: (value, values) =>
          requiredWhen(values.buyingInfo.isPurchased, value, tp('form.buyPriceRequired')),
        purchaseAccount: (value, values) =>
          requiredWhen(values.buyingInfo.isPurchased, value, tp('form.purchaseAccountRequired')),
      },
      sellingInfo: {
        unitPrice: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, tp('form.sellPriceRequired')),
        salesAccount: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, tp('form.salesAccountRequired')),
        accountReceivable: (value, values) =>
          requiredWhen(values.sellingInfo.isSold, value, tp('form.receivableAccountRequired')),
      },
      inventoryInfo: {
        inventoryAccount: (value, values) =>
          requiredWhen(values.inventoryInfo.isTracked, value, tp('form.inventoryAccountRequired')),
      },
    },
  });

  // Memoize mapped lookup data so typing doesn't re-iterate thousands of account options
  const accountData = useMemo(
    () => (accounts.data ?? []).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data]
  );

  const taxData = useMemo(
    () => (taxes.data ?? []).map((tax) => ({ value: tax.id, label: formatTaxLabel(tax) })),
    [taxes.data]
  );

  const categoryData = useMemo(
    () => (categories.data?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories.data?.items]
  );

  return { form, accountData, taxData, categoryData, categoriesLoading: categories.isLoading };
};

export type ProductFormApi = ReturnType<typeof useProductForm>['form'];
export type SelectOption = { value: string; label: string };
