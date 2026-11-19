import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import {
  DEFAULT_PAYMENT_TERM_FORM,
  toPaymentTermFormValues,
  validatePaymentTermForm,
  type PaymentTerm,
  type PaymentTermFormValues,
} from '@/module/settings/domain/paymentTerm';

export type PaymentTermForm = ReturnType<typeof usePaymentTermForm>;

/** Form state of the add and edit page; the messages come from the domain rules, in the current language. */
export const usePaymentTermForm = (term: PaymentTerm | null) => {
  const { t: st } = useTranslation('settings');

  return useForm<PaymentTermFormValues>({
    initialValues: term ? toPaymentTermFormValues(term) : DEFAULT_PAYMENT_TERM_FORM,
    validate: (values) =>
      Object.fromEntries(
        Object.entries(validatePaymentTermForm(values)).map(([field, key]) => [field, st(key)])
      ),
  });
};
