import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { Contact, ContactFormValues } from '@/module/contacts/domain/contact';
import { contactToFormValues, emptyContactForm } from '@/module/contacts/domain/contactForm';

/** Mantine form for the contact modal: loads the contact when the modal opens, resets for a new one. */
export function useContactForm(opened: boolean, contact?: Contact) {
  const { t } = useTranslation('contacts');

  const form = useForm<ContactFormValues>({
    initialValues: emptyContactForm(),
    validate: {
      displayName: (value) => (!value.trim() ? t('form.validation.displayName') : null),
      contactType: (value) => (value.length === 0 ? t('form.validation.contactType') : null),
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
