import type { Contact, ContactType } from '@/module/contacts/domain/contact';
import { useSaveContact } from '@/module/contacts/presentation/hooks/useContactQueries';
import { ContactFormModal } from './ContactFormModal';

export type ContactQuickCreateModalProps = {
  opened: boolean;
  /** Type preselected in the form, e.g. `['Supplier']` when a vendor is being added. */
  contactType: ContactType[];
  onClose: () => void;
  /** Called with the saved contact once the API accepted it. */
  onCreated: (contact: Contact) => void;
};

/** The full contact form for another feature that needs to add a contact on the spot. */
export function ContactQuickCreateModal({
  opened,
  contactType,
  onClose,
  onCreated,
}: Readonly<ContactQuickCreateModalProps>) {
  const save = useSaveContact();

  const handleSubmit = async (values: Parameters<typeof save.mutateAsync>[0]) => {
    try {
      onCreated(await save.mutateAsync(values));
    } catch {
      // The mutation already shows the failure; the form stays open with the entered values.
    }
  };

  return (
    <ContactFormModal
      opened={opened}
      initialContactType={contactType}
      isSubmitting={save.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}

export default ContactQuickCreateModal;
