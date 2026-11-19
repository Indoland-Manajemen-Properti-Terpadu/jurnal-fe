import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import { dueDateFromTerm, emptyLine } from '@/module/sales/domain/saleForm';
import {
  DEFAULT_ORDER_DAYS,
  emptyOrderForm,
  validateOrderStep,
  type OrderFormValues,
  type OrderStepId,
} from '@/module/sales/domain/saleOrderForm';
import { calculateSaleTotals } from '@/module/sales/domain/saleTotals';
import { useSalePaymentTerms, useSaleProductOptions, useSaleTaxes } from './useSaleQueries';

const localToday = (): string => new Date().toLocaleDateString('en-CA');

/** Form state, lookups and the live estimate of one order. */
export function useOrderForm(initial?: OrderFormValues) {
  const { t } = useTranslation('salesOrders');
  const productsQuery = useSaleProductOptions();
  const taxesQuery = useSaleTaxes();
  const termsQuery = useSalePaymentTerms();
  const form = useForm<OrderFormValues>({ initialValues: initial ?? emptyOrderForm(localToday()) });

  /** Picking a product fills its price, description and default tax. */
  const changeProduct = (index: number, productId: string | null) => {
    form.setFieldValue(`items.${index}.productId`, productId || '');
    const product = (productsQuery.data || []).find((p) => p.value === productId);
    if (!product) {
      form.setFieldValue(`items.${index}.unit`, '');
      return;
    }
    form.setFieldValue(`items.${index}.unitPrice`, product.price || 0);
    form.setFieldValue(`items.${index}.description`, product.name || '');
    form.setFieldValue(`items.${index}.unit`, product.unit || '');
    form.setFieldValue(`items.${index}.taxId`, product.taxId || '');
  };

  const changeLine = (index: number, patch: Record<string, unknown>) =>
    Object.entries(patch).forEach(([key, value]) =>
      form.setFieldValue(`items.${index}.${key}`, value)
    );

  /** A new date moves the target along only while it would otherwise fall behind. */
  const changeTransactionDate = (value: string) => {
    form.setFieldValue('transactionDate', value);
    if (value && form.values.targetDate < value) {
      form.setFieldValue('targetDate', dueDateFromTerm(value, DEFAULT_ORDER_DAYS));
    }
  };

  /** Runs one step's validation, shows its messages, and says whether it passed. */
  const checkStep = (step: OrderStepId): boolean => {
    const errors = validateOrderStep(step, form.values);
    form.setErrors(Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, t(v)])));
    return Object.keys(errors).length === 0;
  };

  const taxRates = useMemo(
    () => new Map((taxesQuery.data || []).map((tax) => [tax.id, tax.rate || 0])),
    [taxesQuery.data]
  );
  const { items, discountType, discountValue, isPriceIncludeTax } = form.values;
  const totals = useMemo(
    () =>
      calculateSaleTotals({
        lines: items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxId ? taxRates.get(item.taxId) || 0 : 0,
        })),
        discountType,
        discountValue,
        withholdingType: 'nominal',
        withholdingValue: 0,
        isPriceIncludeTax,
      }),
    [items, discountType, discountValue, isPriceIncludeTax, taxRates]
  );

  return {
    form,
    totals,
    checkStep,
    changeProduct,
    changeLine,
    changeTransactionDate,
    addLine: () => form.insertListItem('items', emptyLine()),
    removeLine: (index: number) => form.removeListItem('items', index),
    productOptions: (productsQuery.data || []).map((p) => ({
      value: p.value,
      label: `${p.name} (${p.code || '-'})`,
    })),
    taxOptions: (taxesQuery.data || []).map((tax) => ({
      value: tax.id,
      label: `${tax.name} (${tax.rate}%)`,
    })),
    termOptions: (termsQuery.data || []).map((term) => ({ value: term.id, label: term.name })),
  };
}

export type OrderFormApi = ReturnType<typeof useOrderForm>;
