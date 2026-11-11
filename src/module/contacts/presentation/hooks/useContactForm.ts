import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { Contact, ContactFormValues } from '@/module/contacts/domain/contact';
import {
  contactToFormValues,
  emptyContactForm,
  isValidEmail,
} from '@/module/contacts/domain/contactForm';
import {
  validateBankAccount,
  validateIdentityNumber,
  validateMobile,
  validateNpwp,
  validateTelephone,
  validateZipCode,
} from '@/module/contacts/domain/contactInput';

/** Mantine form for the contact modal: loads the contact when the modal opens, resets for a new one. */
export function useContactForm(opened: boolean, contact?: Contact) {
  const { t } = useTranslation('contacts');

  const issue = (key: string | null) => (key ? t(`form.validation.${key}`) : null);
  const bankIndex = (path: string) => Number(path.split('.')[1]);

  const form = useForm<ContactFormValues>({
    initialValues: emptyContactForm(),
    validate: {
      displayName: (value) => (!value.trim() ? t('form.validation.displayName') : null),
      contactType: (value) => (value.length === 0 ? t('form.validation.contactType') : null),
      emails: (value) => {
        const email = value[0] ?? '';
        if (!email.trim()) return t('form.validation.emailRequired');
        return isValidEmail(email) ? null : t('form.validation.emailInvalid');
      },
      identity: {
        number: (value, values) => issue(validateIdentityNumber(value ?? '', values.identity.type)),
      },
      npwp: (value) => issue(validateNpwp(value)),
      phones: {
        mobile: (value) => issue(validateMobile(value)),
        telephone: (value) => issue(validateTelephone(value)),
      },
      addresses: {
        billing: { detail: { zipCode: (value) => issue(validateZipCode(value)) } },
        shipping: {
          detail: {
            zipCode: (value, values) =>
              values.addresses.shipping.isSameAsBilling ? null : issue(validateZipCode(value)),
          },
        },
      },
      bankAccounts: {
        bankName: (_, values, path) =>
          issue(validateBankAccount(values.bankAccounts[bankIndex(path)]).bankName),
        accountNumber: (_, values, path) =>
          issue(validateBankAccount(values.bankAccounts[bankIndex(path)]).accountNumber),
      },
    },
  });

  useEffect(() => {
    if (!opened) return;
    if (contact) {
      form.setValues(contactToFormValues(contact));
    } else {
      form.reset();
    }
  }, [opened, contact]);

  return form;
}
