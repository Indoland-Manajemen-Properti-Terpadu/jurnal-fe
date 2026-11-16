import { useState } from 'react';
import { Alert, Button, Group, Select, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconUserPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { CONTACTS_MENU_ID, useMenuRight } from '@/module/profile';
import { ContactQuickCreateModal, type Contact } from '@/module/contacts';
import { useVendorContacts } from '@/module/assets/presentation/hooks/useAssetVendors';

export type AssetVendorFieldProps = {
  /** Id of the chosen Supplier contact; empty means no vendor. */
  value: string;
  onChange: (id: string) => void;
  /** Name of the vendor already saved on the asset, shown while the contact list loads. */
  savedName?: string;
  /** The vendor is managed elsewhere (an asset from ProApps) and cannot be changed here. */
  locked?: boolean;
  error?: string;
};

/** Picks the vendor of an asset from the Supplier contacts, or adds a new contact on the spot. */
export function AssetVendorField({
  value,
  onChange,
  savedName,
  locked = false,
  error,
}: Readonly<AssetVendorFieldProps>) {
  const { t } = useTranslation('assets');
  const canAddContact = useMenuRight(CONTACTS_MENU_ID, 'create');
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<Contact | null>(null);
  const suppliers = useVendorContacts(search, !locked);

  const options = new Map<string, { value: string; label: string }>();
  for (const contact of suppliers.data ?? []) {
    options.set(contact.id, { value: contact.id, label: contact.displayName });
  }
  // The chosen vendor stays selectable even when the current search does not list it.
  if (added) options.set(added.id, { value: added.id, label: added.displayName });
  if (value && !options.has(value) && savedName) {
    options.set(value, { value, label: savedName });
  }
  const needsReview =
    (suppliers.data ?? []).find((contact) => contact.id === value)?.needsReview ?? false;

  const handleCreated = (contact: Contact) => {
    setAdded(contact);
    onChange(contact.id);
    setAdding(false);
  };

  return (
    <Stack gap={6}>
      <Select
        label={t('vendorLabel')}
        description={locked ? t('vendorLockedHint') : t('vendorHint')}
        placeholder={t('vendorPlaceholder')}
        data={[...options.values()]}
        value={value || null}
        onChange={(next) => onChange(next ?? '')}
        searchable
        clearable
        size="sm"
        disabled={locked}
        onSearchChange={setSearch}
        filter={({ options: items }) => items}
        nothingFoundMessage={suppliers.isFetching ? t('vendorSearching') : t('vendorNone')}
        error={error}
        comboboxProps={{ withinPortal: true }}
      />
      {needsReview && (
        <Alert
          variant="light"
          color="orange"
          radius="md"
          p="xs"
          icon={<IconAlertCircle size={16} />}
        >
          <Text size="xs">{t('vendorNeedsReview')}</Text>
        </Alert>
      )}
      {!locked && canAddContact && (
        <Group>
          <Button
            variant="subtle"
            size="compact-sm"
            leftSection={<IconUserPlus size={15} />}
            onClick={() => setAdding(true)}
          >
            {t('vendorAdd')}
          </Button>
        </Group>
      )}
      {adding && (
        <ContactQuickCreateModal
          opened
          contactType={['Supplier']}
          onClose={() => setAdding(false)}
          onCreated={handleCreated}
        />
      )}
    </Stack>
  );
}

export default AssetVendorField;
