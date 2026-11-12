import { useMemo, useState } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { CreateSaleFormValues } from '@/module/sales/domain/sale';
import type { CustomerSummary } from '@/module/sales/domain/saleCustomer';
import {
  dueDateFromTerm,
  emptyLine,
  emptySaleForm,
  validateStep,
  type SaleStepId,
} from '@/module/sales/domain/saleForm';
import { calculateSaleTotals } from '@/module/sales/domain/saleTotals';
import {
  useDepositAccounts,
  useSalePaymentTerms,
  useSaleProductOptions,
  useSaleTaxes,
} from './useSaleQueries';

const localToday = (): string => new Date().toLocaleDateString('en-CA');

/** Form state, lookups, derived fields (due date, unit, price) and the live estimate of one invoice. */
export function useSaleForm(initial?: CreateSaleFormValues) {
  const { t } = useTranslation('sales');
  const productsQuery = useSaleProductOptions();
  const taxesQuery = useSaleTaxes();
  const termsQuery = useSalePaymentTerms();
  const accountsQuery = useDepositAccounts();

  const form = useForm<CreateSaleFormValues>({
    initialValues: initial ?? emptySaleForm(localToday()),
  });

  const termDays = (termId: string): number | null =>
    (termsQuery.data || []).find((term) => term.id === termId)?.days ?? null;

  /** The customer being billed, as far as the form needs it (emails decide what "send" can do). */
  const [customer, setCustomer] = useState<CustomerSummary | null>(null);

  /** Fills the billing address and email from the customer the user picked. */
  const changeCustomer = (customerId: string | null, picked: CustomerSummary | null) => {
    form.setFieldValue('customer', customerId || '');
    if (!picked) return;
    if (picked.billingAddress) form.setFieldValue('billingAddress', picked.billingAddress);
    if (picked.emails.length) form.setFieldValue('emails', picked.emails);
  };

  /** Whether an email can go out: the invoice's own addresses, else the customer's. */
  const canEmail =
    form.values.emails.some((email) => email.trim()) || Boolean(customer?.emails.length);

  const applyTerm = (termId: string, transactionDate: string) => {
    const days = termDays(termId);
    if (days !== null && transactionDate) {
      form.setFieldValue('dueDate', dueDateFromTerm(transactionDate, days));
    }
  };

  const changeTerm = (termId: string | null) => {
    form.setFieldValue('paymentTerm', termId || '');
    if (termId) applyTerm(termId, form.values.transactionDate);
  };

  const changeTransactionDate = (value: string) => {
    form.setFieldValue('transactionDate', value);
    if (form.values.paymentTerm) applyTerm(form.values.paymentTerm, value);
  };

  /** Picking a product fills its price, description, unit and default tax. */
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

  const addLine = () => form.insertListItem('items', emptyLine());
  const removeLine = (index: number) => form.removeListItem('items', index);

  /** Runs one step's validation, shows its messages, and says whether it passed. */
  const checkStep = (step: SaleStepId): boolean => {
    const errors = validateStep(step, form.values);
    const messages = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, t(v)]));
    form.setErrors(messages);
    return Object.keys(errors).length === 0;
  };

  const taxRates = useMemo(
    () => new Map((taxesQuery.data || []).map((tax) => [tax.id, tax.rate || 0])),
    [taxesQuery.data]
  );

  const { items, discountType, discountValue, withholdingType, withholdingValue } = form.values;
  const { isPriceIncludeTax } = form.values;
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
        withholdingType,
        withholdingValue,
        isPriceIncludeTax,
      }),
    [
      items,
      discountType,
      discountValue,
      withholdingType,
      withholdingValue,
      isPriceIncludeTax,
      taxRates,
    ]
  );

  return {
    form,
    totals,
    checkStep,
    changeCustomer,
    customer,
    setCustomer,
    canEmail,
    changeTerm,
    changeTransactionDate,
    changeProduct,
    addLine,
    removeLine,
    isLoadingLookups: productsQuery.isLoading,
    productOptions: (productsQuery.data || []).map((p) => ({
      value: p.value,
      label: `${p.name} (${p.code || t('form.lines.noCode')})`,
    })),
    taxOptions: (taxesQuery.data || []).map((tax) => ({
      value: tax.id,
      label: `${tax.name} (${tax.rate}%)`,
    })),
    termOptions: (termsQuery.data || []).map((term) => ({ value: term.id, label: term.name })),
    accountOptions: (accountsQuery.data || []).map((acc) => ({
      value: acc.value,
      label: acc.label,
    })),
  };
}

export type SaleFormApi = ReturnType<typeof useSaleForm>;
