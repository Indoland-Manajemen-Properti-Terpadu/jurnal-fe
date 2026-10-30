import { useMemo } from 'react';
import { useForm } from '@mantine/form';
import { t } from '@/i18n';
import type { CreateSaleFormValues } from '../../domain/sale';
import { calculateSaleTotals } from '../../domain/saleTotals';
import {
  useDepositAccounts,
  useSaleCustomerOptions,
  useSalePaymentTerms,
  useSaleProductOptions,
  useSaleTaxes,
} from './useSaleQueries';

const tr = (key: string) => t(key, undefined, 'sales');

const emptyItem = () => ({
  productId: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxId: '',
});

export function useCreateSaleForm() {
  const customersQuery = useSaleCustomerOptions();
  const productsQuery = useSaleProductOptions();
  const taxesQuery = useSaleTaxes();
  const paymentTermsQuery = useSalePaymentTerms();
  const accountsQuery = useDepositAccounts();

  const todayStr = new Date().toISOString().split('T')[0];

  const form = useForm<CreateSaleFormValues>({
    initialValues: {
      customer: '',
      emails: [],
      transactionDate: todayStr,
      dueDate: todayStr,
      billingAddress: '',
      transactionNumber: '',
      tags: [],
      customerRefNumber: '',
      paymentTerm: '',
      isPriceIncludeTax: false,
      items: [emptyItem()],
      discountType: 'percentage',
      discountValue: 0,
      withholdingType: 'nominal',
      withholdingValue: 0,
      withholdingAccount: '',
      message: '',
      memo: '',
    },
    validate: {
      customer: (val) => (!val ? tr('validation.customerRequired') : null),
      transactionDate: (val) => (!val ? tr('validation.transactionDateRequired') : null),
      items: {
        productId: (val) => (!val ? tr('validation.productRequired') : null),
        quantity: (val) => (val <= 0 ? tr('validation.quantityMin') : null),
        unitPrice: (val) => (val < 0 ? tr('validation.priceNegative') : null),
      },
    },
  });

  /* Auto-fill address & emails when customer is chosen */
  const handleCustomerChange = (customerId: string | null) => {
    form.setFieldValue('customer', customerId || '');
    if (!customerId) return;
    const selected = (customersQuery.data || []).find((c) => c.value === customerId);
    if (selected) {
      if (selected.billingAddress) {
        form.setFieldValue('billingAddress', selected.billingAddress);
      }
      if (selected.emails && selected.emails.length > 0) {
        form.setFieldValue('emails', selected.emails);
      }
    }
  };

  const addItemRow = () => {
    form.insertListItem('items', emptyItem());
  };

  /* When product is picked, autofill price */
  const handleProductSelect = (index: number, productId: string | null) => {
    form.setFieldValue(`items.${index}.productId`, productId || '');
    if (!productId) return;
    const prod = (productsQuery.data || []).find((p) => p.value === productId);
    if (prod) {
      form.setFieldValue(`items.${index}.unitPrice`, prod.price || 0);
      form.setFieldValue(`items.${index}.description`, prod.name || '');
    }
  };

  const taxMap = useMemo(() => {
    const map = new Map<string, number>();
    (taxesQuery.data || []).forEach((tax) => map.set(tax.id, tax.rate || 0));
    return map;
  }, [taxesQuery.data]);

  const { items, discountType, discountValue, withholdingType, withholdingValue } = form.values;
  const totals = useMemo(
    () =>
      calculateSaleTotals({
        lines: items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxId ? taxMap.get(item.taxId) || 0 : 0,
        })),
        discountType,
        discountValue,
        withholdingType,
        withholdingValue,
      }),
    [items, discountType, discountValue, withholdingType, withholdingValue, taxMap]
  );

  return {
    form,
    totals,
    handleCustomerChange,
    addItemRow,
    handleProductSelect,
    customerOptions: (customersQuery.data || []).map((c) => ({ value: c.value, label: c.label })),
    productOptions: (productsQuery.data || []).map((p) => ({
      value: p.value,
      label: `${p.name} (${p.code || tr('create.noCode')})`,
    })),
    taxOptions: (taxesQuery.data || []).map((tax) => ({
      value: tax.id,
      label: `${tax.name} (${tax.rate}%)`,
    })),
    paymentTermOptions: (paymentTermsQuery.data || []).map((term) => ({
      value: term.id,
      label: term.name,
    })),
    accountOptions: (accountsQuery.data || []).map((acc) => ({
      value: acc.value,
      label: acc.label,
    })),
  };
}

export type CreateSaleFormApi = ReturnType<typeof useCreateSaleForm>;
