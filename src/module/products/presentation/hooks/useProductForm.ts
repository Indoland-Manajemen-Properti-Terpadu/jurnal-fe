import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import { t } from '@/i18n';
import type { Product, ProductFormValues } from '@/module/products/domain/product';
import {
  filterAccountsByNormalBalance,
  formatTaxLabel,
  requiredWhen,
  toInitialValues,
} from '@/module/products/domain/productRules';
import { useAccountOptions, useCategories, useTaxes, useUnits } from './useProductQueries';

const tp = (key: string) => t(key, undefined, 'products');

export const useProductForm = (product?: Product) => {
  const categories = useCategories();
  const taxes = useTaxes();
  const accounts = useAccountOptions();
  const units = useUnits();

  const form = useForm<ProductFormValues>({
    initialValues: toInitialValues(product),
    validate: {
      name: (value) => (value.trim() ? null : tp('form.nameRequired')),
      productCategory: (value) => (value ? null : tp('form.categoryRequired')),
      unit: (value) => (value ? null : tp('form.unitRequired')),
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

  // Purchase and inventory accounts are debit-side too (cost or asset); the account the
  // product already uses stays selectable.
  const purchaseAccountData = useMemo(
    () =>
      filterAccountsByNormalBalance(
        accounts.data ?? [],
        'debit',
        product?.buyingInfo.purchaseAccount
      ).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data, product?.buyingInfo.purchaseAccount]
  );

  const inventoryAccountData = useMemo(
    () =>
      filterAccountsByNormalBalance(
        accounts.data ?? [],
        'debit',
        product?.inventoryInfo.inventoryAccount
      ).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data, product?.inventoryInfo.inventoryAccount]
  );

  // Sales accounts are credit-side and receivables debit-side, so each list only offers
  // accounts that fit; the account already saved on the product always stays available.
  const salesAccountData = useMemo(
    () =>
      filterAccountsByNormalBalance(
        accounts.data ?? [],
        'credit',
        product?.sellingInfo.salesAccount
      ).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data, product?.sellingInfo.salesAccount]
  );

  const receivableAccountData = useMemo(
    () =>
      filterAccountsByNormalBalance(
        accounts.data ?? [],
        'debit',
        product?.sellingInfo.accountReceivable
      ).map((a) => ({ value: a.id, label: a.label })),
    [accounts.data, product?.sellingInfo.accountReceivable]
  );

  const unitData = useMemo(
    () => (units.data?.items ?? []).map((u) => ({ value: u.id, label: u.name })),
    [units.data?.items]
  );

  const taxData = useMemo(
    () => (taxes.data ?? []).map((tax) => ({ value: tax.id, label: formatTaxLabel(tax) })),
    [taxes.data]
  );

  const categoryData = useMemo(
    () => (categories.data?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories.data?.items]
  );

  return {
    form,
    purchaseAccountData,
    inventoryAccountData,
    salesAccountData,
    receivableAccountData,
    unitData,
    unitsLoading: units.isLoading,
    taxData,
    categoryData,
    categoriesLoading: categories.isLoading,
  };
};

export type ProductFormApi = ReturnType<typeof useProductForm>['form'];
export type SelectOption = { value: string; label: string };
